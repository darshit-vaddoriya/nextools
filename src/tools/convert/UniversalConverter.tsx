import React, { useCallback, useState } from 'react';
import JSZip from 'jszip';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { ConversionFlow } from '../../components/conversion/ConversionFlow';
import type { ConversionResult, RunContext } from '../../lib/useConversion';
import {
  CONVERTER_TOOLS, CONV_FORMATS, acceptFor, detectFormat, outputExt, targetsFor,
  type ConvFormat,
} from '../../config/converters';
import { TOOLS } from '../../config/tools';
// The engines themselves are small; the heavy decoders and encoders they use
// (libheif, LAME, UTIF, pdf.js, pdf-lib) are imported inside them on demand.
import { DEFAULT_IMAGE_OPTIONS, convertImage, type ImageOptions } from './engines/image';
import { DEFAULT_AUDIO_OPTIONS, SAMPLE_RATES, convertAudio, type AudioOptions } from './engines/audio';
import { DEFAULT_GIF_OPTIONS, MAX_GIF_FRAMES, videoToGif, type GifOptions } from './engines/video';
import { DEFAULT_SHEET_OPTIONS, convertSheet, type SheetOptions } from './engines/sheet';
import { pdfToImages } from './engines/pdf';
import { DEFAULT_DATA_OPTIONS, convertData, type DataOptions } from './engines/data';
import { DEFAULT_DECK_OPTIONS, buildEpub, convertEpub, imagesToPptx, pdfToPptx, svgToPdf, type DeckOptions } from './engines/doc';
import { convertSubtitles } from './engines/subtitle';
import { convertRtf } from './engines/rtf';
import { tiffToPdf } from './engines/image';
import { convertFont } from './engines/font';
import { convertArchive } from './engines/archive';
import { COMPRESSOR_VIDEO_OPTIONS, DEFAULT_VIDEO_OPTIONS, convertMedia, gifToVideo, type VideoOptions } from './engines/media';

/**
 * Illustrator files saved with "Create PDF Compatible File" (the default) are
 * PDFs with extra private data, so the PDF itself is simply the file. Older or
 * PDF-incompatible AI files are PostScript and cannot be read here.
 */
async function aiToPdf(file: File): Promise<Blob> {
  const head = new TextDecoder().decode(await file.slice(0, 1024).arrayBuffer());
  if (!head.includes('%PDF-')) {
    throw new Error(`“${file.name}” was saved without PDF compatibility (or with Illustrator 8 or older), so it is PostScript rather than PDF. Re-save it in Illustrator with “Create PDF Compatible File” ticked.`);
  }
  return new Blob([file], { type: 'application/pdf' });
}

const MEDIA_CONTAINERS = new Set<ConvFormat>(['mp4', 'webm', 'mov', 'mkv', 'ogg', 'm4a', 'flac']);

/**
 * One converter, many pages.
 *
 * "PNG to JPG", "MP4 to MP3" and the open-ended File Converter are the same
 * component reading a different entry in CONVERTER_TOOLS. A pair page has a
 * fixed target; the open converter works out what the dropped files can
 * become and offers exactly that. Codecs load when a conversion starts, so
 * opening an image page never downloads the MP3 encoder.
 */

/** Formats this converter does not handle but a dedicated tool does. */
const ELSEWHERE: Record<string, string[]> = {
  docx: ['docx-to-pdf', 'docx-to-html', 'docx-to-markdown', 'docx-to-txt'],
  doc:  ['docx-to-pdf'],
  md:   ['markdown-to-docx', 'markdown-preview'],
  html: ['html-to-pdf', 'html-to-docx', 'html-markdown'],
  htm:  ['html-to-pdf', 'html-to-docx'],
  txt:  ['text-to-pdf'],
  zip:  ['zip-extractor'],
};

/** Always worth offering beside a PDF, since this page does not do Word output. */
const PDF_ELSEWHERE = ['pdf-to-word', 'pdf-extract-text', 'pdf-ocr'];

const extOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase();
const baseOf = (name: string) => name.replace(/\.[^.]+$/, '') || 'converted';

const ToolLinks: React.FC<{ ids: string[] }> = ({ ids }) => (
  <span className="flex flex-wrap gap-2">
    {ids.map((id) => {
      const tool = TOOLS.find((t) => t.id === id);
      if (!tool) return null;
      return (
        <a
          key={id}
          href={`/tool/${id}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1
                     text-sm font-semibold text-primary hover:border-primary/50"
        >
          {tool.name} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      );
    })}
  </span>
);

// ─── Small form primitives ───────────────────────────────────────

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-semibold text-foreground">{label}</span>
    {children}
    {hint && <span className="text-xs leading-relaxed text-muted-foreground">{hint}</span>}
  </div>
);

function Chips<T extends string | number>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const inputClass =
  'w-32 rounded-[var(--radius-md)] border border-border bg-background px-3 py-1.5 text-sm text-foreground '
  + 'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60';

// ─── Target resolution ───────────────────────────────────────────

interface Plan {
  formats: (ConvFormat | null)[];
  available: ConvFormat[];
  unknown: File[];
}

function plan(files: File[], fixed?: ConvFormat[]): Plan {
  const formats = files.map((f) => detectFormat(f));
  const unknown = files.filter((_, i) => formats[i] === null);
  const known = formats.filter((f): f is ConvFormat => f !== null);
  let available: ConvFormat[] = [];
  if (fixed) available = fixed;
  else if (known.length) {
    // Offer only what every dropped file can become, in the first file's order.
    available = targetsFor(known[0]).filter((t) => known.every((k) => k === t || targetsFor(k).includes(t)));
  }
  return { formats, available, unknown };
}

// ─── The converter ───────────────────────────────────────────────

export const UniversalConverter: React.FC<{ toolId: string }> = ({ toolId }) => {
  const spec = CONVERTER_TOOLS[toolId] ?? CONVERTER_TOOLS['file-converter'];
  const tool = TOOLS.find((t) => t.id === toolId);
  const toolName = tool?.name ?? 'File Converter';
  const isHub = !spec.targets;

  const [target, setTarget] = useState<ConvFormat | null>(spec.targets?.[0] ?? null);
  const [image, setImage] = useState<ImageOptions>(DEFAULT_IMAGE_OPTIONS);
  const [audio, setAudio] = useState<AudioOptions>(DEFAULT_AUDIO_OPTIONS);
  const [gif, setGif] = useState<GifOptions>(DEFAULT_GIF_OPTIONS);
  const [sheet, setSheet] = useState<SheetOptions>(DEFAULT_SHEET_OPTIONS);
  const [pdfScale, setPdfScale] = useState(2);
  const [video, setVideo] = useState<VideoOptions>(toolId === 'video-compressor' ? COMPRESSOR_VIDEO_OPTIONS : DEFAULT_VIDEO_OPTIONS);
  const [deck, setDeck] = useState<DeckOptions>(toolId === 'pdf-to-pptx' ? { ...DEFAULT_DECK_OPTIONS, layout: 'match' } : DEFAULT_DECK_OPTIONS);
  const [data, setData] = useState<DataOptions>(DEFAULT_DATA_OPTIONS);

  const resolve = useCallback((files: File[]) => {
    const p = plan(files, spec.targets);
    const to = target && p.available.includes(target) ? target : p.available[0] ?? null;
    return { ...p, to };
  }, [spec.targets, target]);

  const run = useCallback(async (files: File[], ctx: RunContext): Promise<ConversionResult> => {
    const { formats, to, unknown } = resolve(files);
    if (!to) throw new Error('None of these files can be converted here. Check the list of supported formats below.');
    if (unknown.length) throw new Error(`“${unknown[0].name}” is not a format this converter reads. Remove it and try again.`);
    const ext = outputExt(to);
    const outputs: { name: string; blob: Blob }[] = [];
    const known = formats as ConvFormat[];

    // Images → one PowerPoint deck: every file becomes a slide of the same presentation.
    if (to === 'pptx' && known.every((f) => CONV_FORMATS[f].group === 'image')) {
      const blob = await imagesToPptx(files, known, deck, ctx);
      return { blob, filename: `${files.length === 1 ? baseOf(files[0].name) : 'slides'}.pptx` };
    }

    for (let i = 0; i < files.length; i += 1) {
      if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
      const file = files[i];
      const from = known[i];
      const group = CONV_FORMATS[from].group;
      const base = baseOf(file.name);
      const sub: RunContext = {
        signal: ctx.signal,
        onProgress: (p) => ctx.onProgress(((i + (p ?? 0) / 100) / files.length) * 100),
      };
      const one = (blob: Blob, extension = ext) => outputs.push({ name: `${base}.${extension}`, blob });

      if (group === 'image' && from === 'gif' && (to === 'mp4' || to === 'webm')) one(await gifToVideo(file, to, sub));
      else if (group === 'image' && from === 'svg' && to === 'pdf') one(await svgToPdf(file));
      else if (group === 'image' && from === 'tiff' && to === 'pdf') one(await tiffToPdf(file, image.quality));
      else if (group === 'image') one(await convertImage(file, from, to, image));
      else if ((group === 'audio' || group === 'video') && (to === 'mp3' || to === 'wav')) one(await convertAudio(file, to, audio, sub));
      else if (group === 'video' && to === 'gif') one(await videoToGif(file, gif, sub));
      else if ((group === 'audio' || group === 'video') && MEDIA_CONTAINERS.has(to)) {
        one(await convertMedia(file, to, video, sub, { compress: toolId === 'video-compressor' }));
      } else if (from === 'ai' && to === 'pdf') one(await aiToPdf(file));
      else if (group === 'pdf' && to === 'pptx') one(await pdfToPptx(file, deck, sub));
      else if (group === 'pdf' && (to === 'jpg' || to === 'png')) {
        const pages = await pdfToImages(file, to, pdfScale, (p) => sub.onProgress(p), ctx.signal);
        pages.forEach((pg) => outputs.push({ name: pages.length === 1 ? `${base}.${ext}` : `${base}/${pg.name}.${ext}`, blob: pg.blob }));
      } else if (from === 'epub') one(await convertEpub(file, to, sub));
      else if (from === 'rtf') one(await convertRtf(file, to));
      else if (group === 'doc' && to === 'epub') one(await buildEpub(file, from));
      else if (group === 'subtitle') one(await convertSubtitles(file, to));
      else if (group === 'font') { const f = await convertFont(file, to); one(f.blob, f.ext); }
      else if (group === 'archive') one(await convertArchive(file, to, sub));
      else if (group === 'data' && (to === 'json' || to === 'xml' || to === 'yaml')) one(await convertData(file, from, to, data));
      else {
        const parts = await convertSheet(file, from, to, sheet, (p) => sub.onProgress(p), ctx.signal);
        parts.forEach((pt) => outputs.push({ name: pt.name ? `${base} - ${pt.name}.${ext}` : `${base}.${ext}`, blob: pt.blob }));
      }
      sub.onProgress(100);
    }

    if (outputs.length === 1) return { blob: outputs[0].blob, filename: outputs[0].name.split('/').pop()! };

    // Several outputs travel as one ZIP; names are de-duplicated so nothing overwrites.
    const zip = new JSZip();
    const used = new Set<string>();
    for (const o of outputs) {
      let name = o.name;
      for (let k = 2; used.has(name.toLowerCase()); k += 1) name = o.name.replace(/(\.[^.]+)$/, ` (${k})$1`);
      used.add(name.toLowerCase());
      zip.file(name, o.blob);
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    const zipBase = files.length === 1 ? baseOf(files[0].name) : `converted-${ext.replace(/\./g, '-')}`;
    return { blob, filename: `${zipBase}.zip` };
  }, [resolve, image, audio, gif, sheet, pdfScale, video, deck, data, toolId]);

  const options = (files: File[]) => {
    const { formats, available, unknown, to } = resolve(files);
    const known = formats.filter((f): f is ConvFormat => f !== null);
    const groups = new Set(known.map((f) => CONV_FORMATS[f].group));
    const elsewhere = [...new Set(unknown.flatMap((f) => ELSEWHERE[extOf(f.name)] ?? []))];
    const hasPdf = known.some((f) => CONV_FORMATS[f].group === 'pdf');
    const fromLabel = [...new Set(known.map((f) => CONV_FORMATS[f].label))].join(', ');

    return (
      <div className="flex flex-col gap-6">
        {unknown.length > 0 && (
          <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-warning/40 bg-warning/[0.08] p-4">
            <p className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <span>
                {unknown.map((f) => `“${f.name}”`).join(', ')} {unknown.length === 1 ? 'is' : 'are'} not a format this
                converter reads. Remove {unknown.length === 1 ? 'it' : 'them'} to continue
                {elsewhere.length > 0 ? ', or open the tool built for it:' : '.'}
              </span>
            </p>
            {elsewhere.length > 0 && <ToolLinks ids={elsewhere} />}
          </div>
        )}

        {available.length > 0 && (
          <Field
            label={isHub ? `Convert ${fromLabel} to` : 'Output format'}
            hint={available.length === 1 ? undefined : 'Only formats every selected file can be converted into are shown.'}
          >
            {available.length === 1 ? (
              <span className="text-sm text-muted-foreground">
                {fromLabel} <ArrowRight className="inline h-3.5 w-3.5" aria-hidden="true" /> <strong className="text-foreground">{CONV_FORMATS[available[0]].name}</strong>
              </span>
            ) : (
              <Chips
                label="Output format"
                value={to ?? available[0]}
                onChange={(v) => setTarget(v)}
                options={available.map((f) => ({ value: f, label: CONV_FORMATS[f].label }))}
              />
            )}
          </Field>
        )}

        {to && groups.has('image') && to !== 'pptx' && !(to === 'pdf' && known.every((f) => f === 'svg'))
          && !((to === 'mp4' || to === 'webm')) && <ImageSettings to={to} value={image} onChange={setImage} />}
        {to === 'pptx' && <DeckSettings value={deck} onChange={setDeck} fromPdf={hasPdf} />}
        {to && ['mp4', 'webm', 'mov', 'mkv'].includes(to) && groups.has('video') && (
          <VideoSettings value={video} onChange={setVideo} compress={toolId === 'video-compressor'} />
        )}
        {to && (to === 'json' || to === 'xml' || to === 'yaml') && groups.has('data') && <DataSettings value={data} onChange={setData} />}
        {to && (to === 'mp3' || to === 'wav') && (groups.has('audio') || groups.has('video')) && (
          <AudioSettings to={to} value={audio} onChange={setAudio} />
        )}
        {to === 'gif' && groups.has('video') && <GifSettings value={gif} onChange={setGif} />}
        {to && (groups.has('sheet') || (hasPdf && to !== 'pptx') || (groups.has('data') && (to === 'xlsx' || to === 'csv'))) && (
          <SheetSettings to={to} fromXlsx={known.some((f) => f === 'xlsx' || f === 'xls' || f === 'ods')} fromPdf={hasPdf} value={sheet} onChange={setSheet} />
        )}
        {hasPdf && (to === 'jpg' || to === 'png') && (
          <Field label="Resolution" hint="Higher resolutions are sharper when zoomed or printed, and take longer.">
            <Chips
              label="Resolution"
              value={pdfScale}
              onChange={setPdfScale}
              options={[{ value: 1, label: '72 DPI' }, { value: 2, label: '144 DPI' }, { value: 3, label: '216 DPI' }]}
            />
          </Field>
        )}

        {hasPdf && isHub && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Need an editable Word file or plain text from this PDF?</span>
            <ToolLinks ids={PDF_ELSEWHERE} />
          </div>
        )}
      </div>
    );
  };

  const actionLabel = (files: File[]) => {
    const { to } = resolve(files);
    return to ? `Convert to ${CONV_FORMATS[to].label}` : 'Convert';
  };

  const inputs = spec.inputs;
  const primary = CONV_FORMATS[inputs[0]].label;

  return (
    <ConversionFlow
      toolId={toolId}
      toolName={toolName}
      run={run}
      // The open converter accepts anything, so a DOCX dropped here can be pointed at the right tool.
      accept={isHub ? undefined : acceptFor(inputs)}
      multiple
      // Slide order is the file order, so a deck gets reorder controls.
      ordered={Boolean(spec.combine)}
      dropLabel={isHub ? 'Choose files to convert' : `Choose ${primary} files`}
      dropHint={isHub
        ? 'or drop them here: images, video, audio, spreadsheets, PDFs, e-books, fonts or archives'
        : `or drop them here, several at once is fine`}
      options={options}
      actionLabel={actionLabel}
    />
  );
};

// ─── Settings panels ─────────────────────────────────────────────

const ImageSettings: React.FC<{ to: ConvFormat; value: ImageOptions; onChange: (v: ImageOptions) => void }> = ({ to, value, onChange }) => {
  const set = (patch: Partial<ImageOptions>) => onChange({ ...value, ...patch });
  const lossy = to === 'jpg' || to === 'webp' || to === 'avif';
  const opaque = to === 'jpg' || to === 'bmp' || to === 'pdf';
  if (to === 'svg') {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Colours" hint="Logos and icons usually need 2–8. More colours keep more shading but make a larger, busier SVG.">
          <Chips label="Colours" value={value.traceColors} onChange={(traceColors) => set({ traceColors })}
            options={[2, 4, 8, 16].map((c) => ({ value: c as 2 | 4 | 8 | 16, label: `${c}` }))} />
        </Field>
        <Field label="Detail" hint="Smooth removes speckles and rounds edges; Detailed follows every corner of the original.">
          <Chips label="Detail" value={value.traceDetail} onChange={(traceDetail) => set({ traceDetail })}
            options={[{ value: 'smooth', label: 'Smooth' }, { value: 'detailed', label: 'Detailed' }]} />
        </Field>
      </div>
    );
  }
  if (to === 'ico') {
    const all = [16, 24, 32, 48, 64, 128, 256];
    return (
      <Field label="Icon sizes" hint="Every size is packed into the one .ico file. 16, 32 and 48 cover Windows and browser tabs; 256 is used by large Explorer views.">
        <div className="flex flex-wrap gap-2">
          {all.map((s) => {
            const on = value.icoSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => set({ icoSizes: on ? value.icoSizes.filter((x) => x !== s) : [...value.icoSizes, s] })}
                className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-sm font-semibold ${
                  on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground'
                }`}
              >
                {s}×{s}
              </button>
            );
          })}
        </div>
      </Field>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {lossy && (
        <Field label={`Quality: ${Math.round(value.quality * 100)}`} hint="80–90 is visually lossless for photos. Lower means a smaller file.">
          <input
            type="range" min={40} max={100} step={1}
            value={Math.round(value.quality * 100)}
            onChange={(e) => set({ quality: Number(e.target.value) / 100 })}
            className="w-full accent-[rgb(var(--primary))]"
            aria-label="Quality"
          />
        </Field>
      )}
      {opaque && (
        <Field label="Background for transparent areas" hint={`${CONV_FORMATS[to].label} cannot store transparency, so see-through pixels are filled with this colour.`}>
          <div className="flex items-center gap-3">
            <input
              type="color" value={value.background}
              onChange={(e) => set({ background: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-background"
              aria-label="Background colour"
            />
            <span className="font-mono text-sm text-muted-foreground">{value.background}</span>
          </div>
        </Field>
      )}
      <Field label="Width in pixels" hint="Leave empty to keep the original size. Height follows the aspect ratio.">
        <input
          type="number" min={1} max={8192} placeholder="Original"
          value={value.width || ''}
          onChange={(e) => set({ width: Math.max(0, Math.min(8192, Number(e.target.value) || 0)) })}
          className={inputClass}
          aria-label="Output width in pixels"
        />
      </Field>
    </div>
  );
};

const AudioSettings: React.FC<{ to: 'mp3' | 'wav'; value: AudioOptions; onChange: (v: AudioOptions) => void }> = ({ to, value, onChange }) => {
  const set = (patch: Partial<AudioOptions>) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {to === 'mp3' && (
        <Field label="Bitrate" hint="192 kbps is transparent for most listeners. 320 is the MP3 maximum; 128 halves the size for speech.">
          <Chips
            label="Bitrate"
            value={value.bitrate}
            onChange={(bitrate) => set({ bitrate })}
            options={[96, 128, 192, 256, 320].map((b) => ({ value: b, label: `${b}k` }))}
          />
        </Field>
      )}
      <Field label="Channels" hint="Mono mixes left and right together — half the size, ideal for voice recordings.">
        <Chips
          label="Channels"
          value={value.channels}
          onChange={(channels) => set({ channels })}
          options={[{ value: 'keep', label: 'Keep original' }, { value: 'mono', label: 'Mono' }]}
        />
      </Field>
      <Field label="Sample rate" hint="44.1 kHz is CD and music standard, 48 kHz is video standard. 16 kHz is enough for speech recognition.">
        <Chips
          label="Sample rate"
          value={value.sampleRate}
          onChange={(sampleRate) => set({ sampleRate })}
          options={SAMPLE_RATES.map((r) => ({ value: r, label: `${r / 1000} kHz` }))}
        />
      </Field>
    </div>
  );
};

const GifSettings: React.FC<{ value: GifOptions; onChange: (v: GifOptions) => void }> = ({ value, onChange }) => {
  const set = (patch: Partial<GifOptions>) => onChange({ ...value, ...patch });
  const frames = Math.round(value.duration * value.fps);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Start at (seconds)">
        <input
          type="number" min={0} step={0.5} value={value.start}
          onChange={(e) => set({ start: Math.max(0, Number(e.target.value) || 0) })}
          className={inputClass} aria-label="Start time in seconds"
        />
      </Field>
      <Field label="Length (seconds)" hint={frames > MAX_GIF_FRAMES ? `That is ${frames} frames; the GIF will stop at ${MAX_GIF_FRAMES}.` : `${frames} frames.`}>
        <input
          type="number" min={0.5} max={60} step={0.5} value={value.duration}
          onChange={(e) => set({ duration: Math.max(0.5, Math.min(60, Number(e.target.value) || 1)) })}
          className={inputClass} aria-label="Clip length in seconds"
        />
      </Field>
      <Field label="Frames per second" hint="10 fps looks smooth for most clips; 15–20 for fast motion, at a much larger file.">
        <Chips label="Frames per second" value={value.fps} onChange={(fps) => set({ fps })}
          options={[5, 10, 15, 20].map((f) => ({ value: f, label: `${f} fps` }))} />
      </Field>
      <Field label="Width" hint="GIF size grows with the square of the width. 480 px suits chat apps and READMEs.">
        <Chips label="Width" value={value.width} onChange={(width) => set({ width })}
          options={[320, 480, 640, 800].map((w) => ({ value: w, label: `${w}px` }))} />
      </Field>
    </div>
  );
};

const SheetSettings: React.FC<{
  to: ConvFormat; fromXlsx: boolean; fromPdf: boolean; value: SheetOptions; onChange: (v: SheetOptions) => void;
}> = ({ to, fromXlsx, fromPdf, value, onChange }) => {
  const set = (patch: Partial<SheetOptions>) => onChange({ ...value, ...patch });
  const panels: React.ReactNode[] = [];
  if (fromXlsx) {
    panels.push(
      <Field key="sheets" label="Worksheets" hint={to === 'json' ? 'All sheets become one JSON object keyed by sheet name.' : 'CSV holds one sheet, so each sheet becomes its own file in a ZIP.'}>
        <Chips label="Worksheets" value={value.sheets} onChange={(sheets) => set({ sheets })}
          options={[{ value: 'first', label: 'First sheet' }, { value: 'all', label: 'All sheets' }]} />
      </Field>,
    );
  }
  if (fromPdf && (to === 'xlsx' || to === 'csv')) {
    panels.push(
      <Field key="layout" label="Layout" hint="One sheet per page keeps page boundaries; a single sheet stacks every page's rows.">
        <Chips label="Layout" value={value.pdfLayout} onChange={(pdfLayout) => set({ pdfLayout })}
          options={[{ value: 'per-page', label: 'Sheet per page' }, { value: 'single', label: 'One sheet' }]} />
      </Field>,
    );
  }
  if (to === 'csv') {
    panels.push(
      <Field key="delim" label="Separator" hint="Use semicolon if your Excel uses a comma as the decimal mark (most of Europe).">
        <Chips label="Separator" value={value.delimiter} onChange={(delimiter) => set({ delimiter })}
          options={[{ value: ',', label: 'Comma ,' }, { value: ';', label: 'Semicolon ;' }]} />
      </Field>,
    );
  }
  if (to === 'sql') {
    panels.push(
      <Field key="dialect" label="Database" hint="Only identifier quoting differs; column types and INSERT statements work in all of them.">
        <Chips label="Database" value={value.sqlDialect} onChange={(sqlDialect) => set({ sqlDialect })}
          options={[{ value: 'standard', label: 'PostgreSQL / SQLite / SQL Server' }, { value: 'mysql', label: 'MySQL / MariaDB' }]} />
      </Field>,
    );
  }
  if (to === 'json') {
    panels.push(
      <Field key="header" label="Records" hint="With a header row, each row becomes an object keyed by column name. Without, rows are plain arrays.">
        <Chips label="Records" value={value.headerRow ? 'objects' : 'arrays'} onChange={(v) => set({ headerRow: v === 'objects' })}
          options={[{ value: 'objects', label: 'First row is headers' }, { value: 'arrays', label: 'Rows as arrays' }]} />
      </Field>,
    );
  }
  return panels.length ? <div className="grid gap-6 sm:grid-cols-2">{panels}</div> : null;
};

const VideoSettings: React.FC<{ value: VideoOptions; onChange: (v: VideoOptions) => void; compress: boolean }> = ({ value, onChange, compress }) => {
  const set = (patch: Partial<VideoOptions>) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Resolution" hint="Only ever scales down. 720p is plenty for phones, chat apps and most web pages.">
        <Chips
          label="Resolution"
          value={value.height}
          onChange={(height) => set({ height })}
          options={[{ value: 0, label: 'Original' }, { value: 1080, label: '1080p' }, { value: 720, label: '720p' }, { value: 480, label: '480p' }, { value: 360, label: '360p' }]}
        />
      </Field>
      <Field
        label="Quality"
        hint={compress
          ? 'Medium roughly halves the size of a phone video with little visible change; Low is for sending over slow connections.'
          : 'High keeps the picture as it is. When only the container changes, streams are copied without re-encoding.'}
      >
        <Chips
          label="Quality"
          value={value.quality}
          onChange={(quality) => set({ quality })}
          options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]}
        />
      </Field>
      <Field label="Sound">
        <Chips
          label="Sound"
          value={value.mute ? 'mute' : 'keep'}
          onChange={(v) => set({ mute: v === 'mute' })}
          options={[{ value: 'keep', label: 'Keep audio' }, { value: 'mute', label: 'Remove audio' }]}
        />
      </Field>
    </div>
  );
};

const DeckSettings: React.FC<{ value: DeckOptions; onChange: (v: DeckOptions) => void; fromPdf: boolean }> = ({ value, onChange, fromPdf }) => {
  const set = (patch: Partial<DeckOptions>) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field
        label="Slide shape"
        hint={fromPdf ? 'PDF pages keep their own shape, so nothing is cropped or letterboxed.' : 'Pictures are fitted inside each slide without cropping.'}
      >
        <Chips
          label="Slide shape"
          value={value.layout}
          onChange={(layout) => set({ layout })}
          options={fromPdf
            ? [{ value: 'match', label: 'Match the pages' }]
            : [{ value: '16x9', label: '16:9 widescreen' }, { value: '4x3', label: '4:3 classic' }, { value: 'match', label: 'Match first image' }]}
        />
      </Field>
      <Field label="Slide background" hint="Shows around pictures that do not fill the slide.">
        <Chips
          label="Slide background"
          value={value.background}
          onChange={(background) => set({ background })}
          options={[{ value: 'white', label: 'White' }, { value: 'black', label: 'Black' }]}
        />
      </Field>
    </div>
  );
};

const DataSettings: React.FC<{ value: DataOptions; onChange: (v: DataOptions) => void }> = ({ value, onChange }) => (
  <Field label="Indentation" hint="Minified output has no whitespace at all — smallest, but hard to read.">
    <Chips
      label="Indentation"
      value={value.indent}
      onChange={(indent) => onChange({ ...value, indent })}
      options={[{ value: 2, label: '2 spaces' }, { value: 4, label: '4 spaces' }, { value: 0, label: 'Minified' }]}
    />
  </Field>
);
