/**
 * AUDIO ENGINE
 *
 * The browser's own decoder (decodeAudioData) reads MP3, WAV, AAC/M4A, FLAC,
 * Opus and OGG — and the audio track of MP4, MOV and WebM video, because it
 * demuxes those containers itself. Decoded PCM is then written as WAV by hand
 * or as MP3 through LAME compiled to JavaScript.
 *
 * Encoding runs on the main thread in slices, yielding between them so the
 * page stays responsive and Cancel takes effect within a few milliseconds.
 */
import type { ConvFormat } from '../../../config/converters';
import type { RunContext } from '../../../lib/useConversion';
import { yieldToUi } from './yield';

export interface AudioOptions {
  /** MP3 bitrate in kbps. */
  bitrate: number;
  channels: 'keep' | 'mono';
  /** Output sample rate in Hz. */
  sampleRate: number;
}

export const DEFAULT_AUDIO_OPTIONS: AudioOptions = {
  bitrate: 192,
  channels: 'keep',
  sampleRate: 44100,
};

/** Rates LAME accepts, in the order people usually want them. */
export const SAMPLE_RATES = [44100, 48000, 32000, 22050, 16000];

async function decode(file: File, sampleRate: number): Promise<AudioBuffer> {
  const bytes = await file.arrayBuffer();
  // An offline context decodes straight to the rate we will encode at, so no
  // separate resampling pass is needed.
  const ctx = new OfflineAudioContext(1, 1, sampleRate);
  try {
    return await ctx.decodeAudioData(bytes);
  } catch {
    throw new Error(
      `This browser could not decode the audio in “${file.name}”. `
      + 'The file may have no audio track, or use a codec the browser lacks — '
      + 'Safari cannot read OGG/Opus, and no browser reads AC-3 or DTS.',
    );
  }
}

function channelData(buffer: AudioBuffer, mono: boolean): Float32Array[] {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  if (!mono || channels.length === 1) return channels.slice(0, 2);
  const mixed = new Float32Array(buffer.length);
  for (const ch of channels) for (let i = 0; i < mixed.length; i += 1) mixed[i] += ch[i] / channels.length;
  return [mixed];
}

function toInt16(src: Float32Array, start: number, end: number): Int16Array {
  const out = new Int16Array(end - start);
  for (let i = start; i < end; i += 1) {
    const s = Math.max(-1, Math.min(1, src[i]));
    out[i - start] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

async function encodeMp3(chans: Float32Array[], rate: number, kbps: number, ctx: RunContext): Promise<Blob> {
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const encoder = new Mp3Encoder(chans.length, rate, kbps);
  const parts: BlobPart[] = [];
  const total = chans[0].length;
  const FRAME = 1152;
  const SLICE = FRAME * 200;
  for (let start = 0; start < total; start += SLICE) {
    if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
    const end = Math.min(total, start + SLICE);
    for (let i = start; i < end; i += FRAME) {
      const stop = Math.min(end, i + FRAME);
      const left = toInt16(chans[0], i, stop);
      const chunk = chans.length > 1
        ? encoder.encodeBuffer(left, toInt16(chans[1], i, stop))
        : encoder.encodeBuffer(left);
      if (chunk.length) parts.push(new Uint8Array(chunk));
    }
    ctx.onProgress(20 + (end / total) * 78);
    await yieldToUi();
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(new Uint8Array(tail));
  return new Blob(parts, { type: 'audio/mpeg' });
}

/** 16-bit little-endian PCM in a RIFF container. */
function encodeWav(chans: Float32Array[], rate: number): Blob {
  const frames = chans[0].length;
  const n = chans.length;
  const dataSize = frames * n * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const text = (o: number, s: string) => { for (let i = 0; i < s.length; i += 1) v.setUint8(o + i, s.charCodeAt(i)); };
  text(0, 'RIFF');
  v.setUint32(4, 36 + dataSize, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);           // PCM
  v.setUint16(22, n, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * n * 2, true);
  v.setUint16(32, n * 2, true);
  v.setUint16(34, 16, true);
  text(36, 'data');
  v.setUint32(40, dataSize, true);
  let o = 44;
  for (let i = 0; i < frames; i += 1) {
    for (let c = 0; c < n; c += 1) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}

/** WAV cannot address more than 4 GiB, and a tab holding that much PCM would not survive anyway. */
const WAV_LIMIT = 0xffffffff - 44;

export async function convertAudio(file: File, to: ConvFormat, opts: AudioOptions, ctx: RunContext): Promise<Blob> {
  ctx.onProgress(5);
  const buffer = await decode(file, opts.sampleRate);
  if (buffer.length === 0) throw new Error(`“${file.name}” contains no audio.`);
  ctx.onProgress(20);
  await yieldToUi();
  const chans = channelData(buffer, opts.channels === 'mono');

  if (to === 'mp3') return encodeMp3(chans, opts.sampleRate, opts.bitrate, ctx);
  if (to === 'wav') {
    if (chans[0].length * chans.length * 2 > WAV_LIMIT) {
      throw new Error('That recording is too long for a WAV file (over 4 GB). Convert it to MP3 instead.');
    }
    const blob = encodeWav(chans, opts.sampleRate);
    ctx.onProgress(98);
    return blob;
  }
  throw new Error(`Audio cannot be converted to ${to.toUpperCase()} here.`);
}
