/**
 * SUBTITLES — SRT ↔ WebVTT.
 *
 * The two formats carry the same cues; they differ in the header, in using a
 * comma or a full stop before the milliseconds, and in what else they allow.
 * VTT adds cue settings (position, alignment), NOTE and STYLE blocks and
 * voice/class tags that SRT players do not understand, so those are dropped
 * on the way to SRT while <i>, <b> and <u> — which both formats use — stay.
 */
import type { ConvFormat } from '../../../config/converters';

interface Cue { start: string; end: string; text: string }

const TIME = /(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}/;

/** "1:02:03.4" or "02:03,400" → "01:02:03.400" (VTT) or "01:02:03,400" (SRT). */
function normalise(t: string, sep: '.' | ','): string {
  const [clock, frac = '0'] = t.trim().split(/[.,]/);
  const parts = clock.split(':').map((p) => p.padStart(2, '0'));
  while (parts.length < 3) parts.unshift('00');
  return `${parts.join(':')}${sep}${frac.padEnd(3, '0').slice(0, 3)}`;
}

function parse(text: string): Cue[] {
  const blocks = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split(/\n{2,}/);
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter((l, i) => i > 0 || l.trim() !== '');
    const timingIndex = lines.findIndex((l) => l.includes('-->'));
    if (timingIndex < 0) continue; // WEBVTT header, NOTE, STYLE, REGION, or a stray number
    const [rawStart, rawRest] = lines[timingIndex].split('-->');
    const start = rawStart.match(TIME)?.[0];
    const end = rawRest?.match(TIME)?.[0];
    if (!start || !end) continue;
    const body = lines.slice(timingIndex + 1).join('\n').trim();
    if (body) cues.push({ start, end, text: body });
  }
  return cues;
}

/** VTT-only markup → the tags SRT players render. */
function toSrtText(text: string): string {
  return text
    .replace(/<v(?:\.[^\s>]+)?\s+([^>]+)>/g, '$1: ') // <v Speaker> becomes "Speaker: "
    .replace(/<\/?(?:c|v|lang|ruby|rt)(?:[.\s][^>]*)?>/g, '')
    .replace(/<\d{1,2}:\d{2}[:.\d]*>/g, '') // karaoke timestamps
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}

/** SRT allows raw "<" and "&"; VTT needs them escaped unless they are tags it understands. */
function toVttText(text: string): string {
  return text
    .replace(/&(?!amp;|lt;|gt;|nbsp;)/g, '&amp;')
    .replace(/<(?!\/?(?:i|b|u|c|v|lang|ruby|rt)\b)/g, '&lt;')
    .replace(/\{\\an?\d\}/g, ''); // SSA-style position codes some SRT files carry
}

export async function convertSubtitles(file: File, to: ConvFormat): Promise<Blob> {
  const cues = parse(await file.text());
  if (cues.length === 0) throw new Error(`No subtitle cues were found in “${file.name}”.`);
  if (to === 'vtt') {
    const body = cues.map((c) => `${normalise(c.start, '.')} --> ${normalise(c.end, '.')}\n${toVttText(c.text)}`).join('\n\n');
    return new Blob([`WEBVTT\n\n${body}\n`], { type: 'text/vtt;charset=utf-8' });
  }
  if (to === 'srt') {
    const body = cues.map((c, i) => `${i + 1}\n${normalise(c.start, ',')} --> ${normalise(c.end, ',')}\n${toSrtText(c.text)}`).join('\n\n');
    return new Blob([`${body}\n`], { type: 'application/x-subrip;charset=utf-8' });
  }
  throw new Error(`Subtitles cannot be converted to ${to.toUpperCase()}.`);
}
