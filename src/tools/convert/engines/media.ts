/**
 * MEDIA ENGINE — video conversion, compression, OGG/M4A audio and GIF → video.
 *
 * Built on WebCodecs through Mediabunny, which means the browser's own
 * (usually hardware) encoders do the work: a minute of 1080p converts in
 * seconds rather than the minutes a WebAssembly FFmpeg build would take, and
 * nothing larger than ~200 KB is downloaded to do it.
 *
 * When only the container changes and the codecs are already allowed in the
 * target (an H.264 MOV → MP4), streams are copied without re-encoding at all,
 * which is lossless and near-instant.
 */
import type { ConvFormat } from '../../../config/converters';
import type { RunContext } from '../../../lib/useConversion';

export interface VideoOptions {
  /** Output height in pixels; 0 keeps the source size. */
  height: 0 | 1080 | 720 | 480 | 360;
  quality: 'high' | 'medium' | 'low';
  /** Drop the audio track. */
  mute: boolean;
}

export const DEFAULT_VIDEO_OPTIONS: VideoOptions = { height: 0, quality: 'high', mute: false };
/** The compressor starts from settings that actually shrink the file. */
export const COMPRESSOR_VIDEO_OPTIONS: VideoOptions = { height: 720, quality: 'medium', mute: false };

type MB = typeof import('mediabunny');

function outputFormat(mb: MB, to: ConvFormat) {
  switch (to) {
    case 'mp4': return new mb.Mp4OutputFormat({ fastStart: 'in-memory' });
    case 'm4a': return new mb.Mp4OutputFormat({ fastStart: 'in-memory' });
    case 'mov': return new mb.MovOutputFormat({ fastStart: 'in-memory' });
    case 'webm': return new mb.WebMOutputFormat();
    case 'mkv': return new mb.MkvOutputFormat();
    case 'ogg': return new mb.OggOutputFormat();
    case 'flac': return new mb.FlacOutputFormat();
    default: throw new Error(`Media cannot be converted to ${to.toUpperCase()} here.`);
  }
}

const MIME: Partial<Record<ConvFormat, string>> = {
  mp4: 'video/mp4', m4a: 'audio/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska', ogg: 'audio/ogg', flac: 'audio/flac',
};

function friendlyDiscard(reason: string): string {
  switch (reason) {
    case 'undecodable_source_codec': return 'this browser cannot decode the source codec (HEVC/H.265 video usually needs Safari or hardware support)';
    case 'no_encodable_target_codec': return 'this browser has no encoder for any codec the target format allows';
    case 'unknown_source_codec': return 'the codec in this file is not recognised';
    default: return reason.replace(/_/g, ' ');
  }
}

async function openInput(mb: MB, file: File) {
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  try {
    await input.getFormat();
  } catch (err) {
    throw new Error(`“${file.name}” is not a video or audio file this browser can read. MP4, MOV, WebM, MKV, MP3, WAV, OGG and FLAC are supported; AVI and WMV are not.`, { cause: err });
  }
  return input;
}

/**
 * Hardware video decoders sometimes accept a stream and then fail on the
 * first frame — seen with VA-API on Linux Chrome — where the software decoder
 * works. Mediabunny does not expose the decoder's acceleration setting, so
 * for the retry every VideoDecoder configured in the meantime is asked to
 * prefer software. The patch is removed as soon as the retry settles.
 */
async function withSoftwareDecoding<T>(run: () => Promise<T>): Promise<T> {
  const proto = VideoDecoder.prototype;
  const original = proto.configure;
  proto.configure = function configure(this: VideoDecoder, config: VideoDecoderConfig) {
    return original.call(this, { ...config, hardwareAcceleration: 'prefer-software' });
  };
  try {
    return await run();
  } finally {
    proto.configure = original;
  }
}

/**
 * No browser ships a FLAC encoder, and AAC is missing from Chrome on Linux and
 * from Firefox. Mediabunny's encoder extensions (libFLAC, and libavcodec's AAC,
 * as WebAssembly) fill the gap; each is fetched only the first time a
 * conversion needs it, and only if the browser has no native encoder.
 */
const registered = new Set<string>();
async function ensureEncoders(mb: MB, to: ConvFormat): Promise<void> {
  if (to === 'flac' && !registered.has('flac') && !(await mb.canEncodeAudio('flac'))) {
    (await import('@mediabunny/flac-encoder')).registerFlacEncoder();
    registered.add('flac');
  }
  if ((to === 'm4a' || to === 'mp4' || to === 'mov') && !registered.has('aac') && !(await mb.canEncodeAudio('aac'))) {
    (await import('@mediabunny/aac-encoder')).registerAacEncoder();
    registered.add('aac');
  }
}

const isDecodeFailure = (err: unknown) => /decod/i.test(String((err as Error)?.message ?? err));

/** Convert or compress a video, or change an audio file's container/codec. */
export async function convertMedia(
  file: File,
  to: ConvFormat,
  opts: VideoOptions,
  ctx: RunContext,
  { compress = false } = {},
): Promise<Blob> {
  try {
    return await convertMediaOnce(file, to, opts, ctx, compress);
  } catch (err) {
    if (ctx.signal.aborted || typeof VideoDecoder === 'undefined' || !isDecodeFailure(err)) throw err;
    ctx.onProgress(0);
    return withSoftwareDecoding(() => convertMediaOnce(file, to, opts, ctx, compress));
  }
}

async function convertMediaOnce(file: File, to: ConvFormat, opts: VideoOptions, ctx: RunContext, compress: boolean): Promise<Blob> {
  const mb = await import('mediabunny');
  if (typeof VideoEncoder === 'undefined' && typeof AudioEncoder === 'undefined') {
    throw new Error('This browser does not support WebCodecs, which video conversion needs. Use a current Chrome, Edge, Firefox or Safari.');
  }
  const input = await openInput(mb, file);
  await ensureEncoders(mb, to);
  const format = outputFormat(mb, to);
  const target = new mb.BufferTarget();
  const output = new mb.Output({ format, target });
  const audioOnly = to === 'ogg' || to === 'm4a' || to === 'flac';

  const quality = { high: mb.QUALITY_HIGH, medium: mb.QUALITY_MEDIUM, low: mb.QUALITY_LOW }[opts.quality];
  const videoTrack = await input.getPrimaryVideoTrack();
  const resize = !audioOnly && opts.height > 0 && videoTrack && videoTrack.displayHeight > opts.height;
  const transcodeVideo = compress || resize || opts.quality !== 'high';

  // Prefer the codec with the best compatibility for each container that this browser can actually encode.
  const videoPrefs = to === 'webm' ? ['vp9', 'vp8', 'av1'] : ['avc', 'hevc', 'vp9', 'av1'];
  const audioPrefs = to === 'flac' ? ['flac'] : to === 'm4a' ? ['aac'] : to === 'mp4' || to === 'mov' ? ['aac', 'opus'] : ['opus', 'vorbis'];
  const supportedV = format.getSupportedVideoCodecs();
  const supportedA = format.getSupportedAudioCodecs();
  const videoCodec = audioOnly ? null : await mb.getFirstEncodableVideoCodec(
    videoPrefs.filter((c) => supportedV.includes(c as never)) as never,
    resize && videoTrack ? { width: Math.round((videoTrack.displayWidth / videoTrack.displayHeight) * opts.height / 2) * 2, height: opts.height } : undefined,
  );
  const audioCodec = await mb.getFirstEncodableAudioCodec(audioPrefs.filter((c) => supportedA.includes(c as never)) as never);
  if ((to === 'm4a' || to === 'flac') && !audioCodec) {
    throw new Error(`This browser could not load an encoder for ${to.toUpperCase()}. Choose MP3 or WAV instead.`);
  }

  const conversion = await mb.Conversion.init({
    input,
    output,
    showWarnings: false,
    video: audioOnly
      ? { discard: true }
      : {
          ...(resize ? { height: opts.height } : {}),
          ...(videoCodec ? { codec: videoCodec } : {}),
          ...(transcodeVideo ? { quality, forceTranscode: true } : {}),
        },
    audio: opts.mute && !audioOnly
      ? { discard: true }
      : { ...(audioCodec ? { codec: audioCodec } : {}), ...(compress || audioOnly ? { quality: compress ? mb.QUALITY_MEDIUM : mb.QUALITY_HIGH } : {}) },
  });

  if (!conversion.isValid) {
    const why = conversion.discardedTracks.map((d) => `${d.track.type} track: ${friendlyDiscard(d.reason)}`).join('; ');
    throw new Error(`This file cannot be converted to ${to.toUpperCase()} in this browser — ${why || 'no usable tracks'}.`);
  }
  const lostAudio = conversion.discardedTracks.some((d) => d.track.type === 'audio') && !opts.mute;

  conversion.onProgress = (p) => ctx.onProgress(Math.min(99, p * 100));
  const abort = () => { void conversion.cancel(); };
  ctx.signal.addEventListener('abort', abort, { once: true });
  try {
    await conversion.execute();
  } catch (err) {
    if (ctx.signal.aborted) throw new Error('Conversion cancelled.', { cause: err });
    throw new Error(`The conversion stopped: ${(err as Error).message}`, { cause: err });
  } finally {
    ctx.signal.removeEventListener('abort', abort);
  }
  if (!target.buffer) throw new Error('The conversion produced no output.');
  if (lostAudio) console.info('[convert] audio track dropped: no encoder for the target format in this browser');
  return new Blob([target.buffer], { type: MIME[to] ?? 'application/octet-stream' });
}

/**
 * Animated GIF → MP4 or WebM. GIF frames are decoded with the browser's
 * ImageDecoder, drawn onto a canvas and encoded as video — usually 5–20×
 * smaller than the GIF, which is why sites convert GIFs on upload.
 */
export async function gifToVideo(file: File, to: ConvFormat, ctx: RunContext): Promise<Blob> {
  if (typeof ImageDecoder === 'undefined') {
    throw new Error('This browser cannot decode GIF frames (ImageDecoder is missing). Use Chrome, Edge or a current Firefox.');
  }
  const mb = await import('mediabunny');
  const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type: 'image/gif' });
  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  if (!track) throw new Error(`“${file.name}” has no image frames.`);
  const frameCount = track.frameCount;

  const first = (await decoder.decode({ frameIndex: 0 })).image;
  // H.264 and VP9 need even dimensions.
  const width = Math.max(2, Math.ceil(first.displayWidth / 2) * 2);
  const height = Math.max(2, Math.ceil(first.displayHeight / 2) * 2);
  first.close();

  const format = outputFormat(mb, to);
  const target = new mb.BufferTarget();
  const output = new mb.Output({ format, target });
  const prefs = to === 'webm' ? ['vp9', 'vp8', 'av1'] : ['avc', 'vp9', 'av1'];
  const codec = await mb.getFirstEncodableVideoCodec(
    prefs.filter((c) => format.getSupportedVideoCodecs().includes(c as never)) as never, { width, height },
  );
  if (!codec) throw new Error(`This browser has no video encoder for ${to.toUpperCase()}.`);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d')!;
  const source = new mb.CanvasSource(canvas, { codec, quality: mb.QUALITY_HIGH });
  output.addVideoTrack(source);
  await output.start();

  let t = 0;
  for (let i = 0; i < frameCount; i += 1) {
    if (ctx.signal.aborted) { await output.cancel(); throw new Error('Conversion cancelled.'); }
    const { image } = await decoder.decode({ frameIndex: i });
    // GIF frame delays below 20 ms are treated as 100 ms by every browser; match that.
    const duration = image.duration && image.duration >= 20000 ? image.duration / 1e6 : 0.1;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, width, height);
    g.drawImage(image, 0, 0);
    image.close();
    await source.add(t, duration);
    t += duration;
    ctx.onProgress(((i + 1) / frameCount) * 95);
  }
  decoder.close();
  source.close();
  await output.finalize();
  return new Blob([target.buffer!], { type: MIME[to] ?? 'video/mp4' });
}
