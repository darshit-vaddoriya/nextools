/**
 * VIDEO → GIF
 *
 * Seeks a <video> element frame by frame, draws each frame to a canvas and
 * hands the pixels to gifenc. Seeking is used instead of playback because it
 * is exact: every frame lands at its timestamp regardless of how fast the
 * machine is, and a slow laptop simply takes longer rather than dropping
 * frames.
 */
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { RunContext } from '../../../lib/useConversion';

export interface GifOptions {
  /** Seconds from the start of the video. */
  start: number;
  /** Clip length in seconds. */
  duration: number;
  fps: number;
  /** Output width in pixels; height follows the aspect ratio. */
  width: number;
}

export const DEFAULT_GIF_OPTIONS: GifOptions = { start: 0, duration: 5, fps: 10, width: 480 };

/** Beyond this a GIF gets so large that nobody can send it anywhere. */
export const MAX_GIF_FRAMES = 400;

function once(el: HTMLVideoElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error('video-error')); };
    const cleanup = () => { el.removeEventListener(event, ok); el.removeEventListener('error', fail); };
    el.addEventListener(event, ok, { once: true });
    el.addEventListener('error', fail, { once: true });
  });
}

export async function videoToGif(file: File, opts: GifOptions, ctx: RunContext): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    try {
      await once(video, 'loadeddata');
    } catch {
      throw new Error(
        `This browser cannot play “${file.name}”. HEVC (H.265) video from recent iPhones only decodes in Safari `
        + 'and on hardware that supports it; H.264 MP4 and WebM work everywhere.',
      );
    }

    const total = video.duration;
    if (!Number.isFinite(total) || total <= 0) throw new Error('Could not read the length of this video.');
    const start = Math.min(Math.max(0, opts.start), Math.max(0, total - 0.05));
    const length = Math.min(Math.max(0.2, opts.duration), total - start);
    const frames = Math.max(1, Math.min(MAX_GIF_FRAMES, Math.round(length * opts.fps)));
    const delay = Math.round(1000 / opts.fps);

    const width = Math.max(16, Math.min(opts.width, video.videoWidth || opts.width));
    const height = Math.max(16, Math.round((video.videoHeight / video.videoWidth) * width) || width);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const draw = canvas.getContext('2d', { willReadFrequently: true });
    if (!draw) throw new Error('Canvas is unavailable in this browser.');

    const gif = GIFEncoder();
    for (let i = 0; i < frames; i += 1) {
      if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
      video.currentTime = start + i / opts.fps;
      await once(video, 'seeked');
      draw.drawImage(video, 0, 0, width, height);
      const { data } = draw.getImageData(0, 0, width, height);
      // A palette per frame keeps colour faithful when the scene changes.
      const palette = quantize(data, 256);
      gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay });
      ctx.onProgress(((i + 1) / frames) * 97);
    }
    gif.finish();
    return new Blob([gif.bytes()], { type: 'image/gif' });
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}
