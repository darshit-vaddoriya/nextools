import React, { useCallback, useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFImage } from 'pdf-lib';
import {
  Minimize2, Stamp, Hash, EyeOff, PenLine, Eraser, UploadIcon,
} from 'lucide-react';
import {
  PdfDropzone, SourceFileBar, usePdfSource, ErrorBox, LoadingBox,
  ActionButton, ResultCard, downloadAll, baseName, Card, FieldLabel,
  textInputClass, getPdfjs,
} from './PdfShared';
import { Select } from '../../components/Select';
import { formatBytes, hexToRgb } from '../image/ImageUtils';
import { useExportProgress } from '../image/ExportProgress';
import { errorMessage } from '../../utils/errorMessage';

async function loadLibDoc(file: File): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e);
    if (/encrypt|password/i.test(msg)) {
      throw new Error('This PDF is password protected. It cannot be edited without the password.', { cause: e });
    }
    throw new Error('Could not read this PDF. It may be corrupted or damaged.', { cause: e });
  }
}

// ─── COMPRESS PDF ───────────────────────────────────────────────
export const PdfCompressTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [stripMeta, setStripMeta] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; original: number } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const compress = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        if (stripMeta) {
          doc.setTitle('');
          doc.setAuthor('');
          doc.setSubject('');
          doc.setKeywords([]);
          doc.setCreator('');
          doc.setProducer('');
        }
        report(40, 'Re-encoding file structure…');
        const bytes = await doc.save({ useObjectStreams: true });
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_compressed.pdf`, original: file.size });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Compression failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  const saved = result ? Math.max(0, result.original - result.blob.size) : 0;
  const savedPct = result && result.original > 0 ? Math.round((saved / result.original) * 100) : 0;

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to compress" hint="Reduce file size by re-encoding the document structure" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Compression options">
              <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={stripMeta} onChange={(e) => setStripMeta(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span>Remove metadata (author, dates, producer) for extra savings</span>
              </label>
              <p className="text-[11px]  text-muted-foreground leading-relaxed">
                This tool rebuilds the internal structure of the PDF and removes redundant data,
                which often shrinks the file. Results depend on how the original file was created.
              </p>
              <ActionButton onClick={compress} busy={isBusy} busyLabel="Compressing…" disabled={pageCount === 0}>
                <Minimize2 className="w-4 h-4" /> Compress PDF
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl border   bg-muted border-border">
                  <div className="text-[9px] uppercase tracking-wide  text-muted-foreground mb-1">Before</div>
                  <div className="text-sm font-bold  text-foreground font-mono">{formatBytes(result.original)}</div>
                </div>
                <div className="p-3 rounded-xl border   bg-muted border-border">
                  <div className="text-[9px] uppercase tracking-wide  text-muted-foreground mb-1">After</div>
                  <div className="text-sm font-bold text-success font-mono">{formatBytes(result.blob.size)}</div>
                </div>
                <div className="p-3 rounded-xl border   bg-muted border-border">
                  <div className="text-[9px] uppercase tracking-wide  text-muted-foreground mb-1">Saved</div>
                  <div className="text-sm font-bold text-success font-mono">{savedPct}%</div>
                </div>
              </div>
              <ResultCard
                title="Compressed PDF ready"
                subtitle={`Saved ${formatBytes(saved)} (${savedPct}%) on your device.`}
                onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
                downloadLabel={result.name}
              />
            </>
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── WATERMARK ──────────────────────────────────────────────────
const WATERMARK_POSITIONS = [
  { value: 'center', label: 'Centered' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'tile', label: 'Tiled' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

export const PdfWatermarkTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [text, setText] = useState('CONFIDENTIAL');
  const [position, setPosition] = useState('diagonal');
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(0.2);
  const [color, setColor] = useState('#ef4444');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const drawWatermarks = useCallback((doc: PDFDocument, font: PDFFont, opts: {
    text: string; position: string; size: number; opacity: number; color: [number, number, number];
  }) => {
    const col = rgb(opts.color[0] / 255, opts.color[1] / 255, opts.color[2] / 255);
    const pages = doc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textW = font.widthOfTextAtSize(opts.text, opts.size);
      const draw = (x: number, y: number, angle: number) => {
        page.drawText(opts.text, {
          x, y, size: opts.size, font, color: col, opacity: opts.opacity,
          rotate: degrees(angle),
        });
      };
      if (opts.position === 'center') {
        draw((width - textW) / 2, (height - opts.size) / 2, 0);
      } else if (opts.position === 'diagonal') {
        draw((width - textW) / 2, (height - opts.size) / 2, 45);
      } else if (opts.position === 'top') {
        draw((width - textW) / 2, height - opts.size - 30, 0);
      } else if (opts.position === 'bottom') {
        draw((width - textW) / 2, 30, 0);
      } else {
        const step = opts.size * 2.4;
        const span = Math.hypot(width, height);
        const startX = -span / 2;
        const startY = -span / 2;
        const count = Math.ceil(span / step);
        for (let i = 0; i <= count; i++) {
          for (let j = 0; j <= count; j++) {
            draw(startX + i * step, startY + j * step, 30);
          }
        }
      }
    }
  }, []);

  const apply = async () => {
    if (!file) return;
    if (!text.trim()) { setErr('Enter watermark text.'); return; }
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const font = await doc.embedStandardFont(StandardFonts.HelveticaBold);
        drawWatermarks(doc, font, { text, position, size, opacity, color: hexToRgb(color) });
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_watermarked.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Adding watermark failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to watermark" hint="Stamp text onto every page in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Watermark settings">
              <div>
                <FieldLabel>Watermark text</FieldLabel>
                <input value={text} onChange={(e) => setText(e.target.value)} className={textInputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Position</FieldLabel>
                  <Select value={position} onChange={setPosition} options={WATERMARK_POSITIONS} />
                </div>
                <div>
                  <FieldLabel>Text size</FieldLabel>
                  <input type="number" min={8} max={120} value={size} onChange={(e) => setSize(Number(e.target.value) || 48)} className={textInputClass} />
                </div>
              </div>
              <div>
                <FieldLabel>Opacity: {Math.round(opacity * 100)}%</FieldLabel>
                <input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-primary" />
              </div>
              <div className="flex items-center gap-3">
                <FieldLabel>Color</FieldLabel>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 rounded-lg border  border-border cursor-pointer" />
                <span className="font-mono text-[11px]  text-muted-foreground">{color}</span>
              </div>
              <ActionButton onClick={apply} busy={isBusy} busyLabel="Adding watermark…" disabled={pageCount === 0}>
                <Stamp className="w-4 h-4" /> Add Watermark to {pageCount} page{pageCount === 1 ? '' : 's'}
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Watermarked PDF ready"
              subtitle="The watermark was stamped on every page."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              downloadLabel={result.name}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── PAGE NUMBERS ───────────────────────────────────────────────
const NUMBER_POSITIONS = [
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
];

const NUMBER_FORMATS = [
  { value: 'plain', label: '1, 2, 3…' },
  { value: 'padded', label: '01, 02, 03…' },
  { value: 'of', label: 'Page X of Y' },
];

export const PdfPageNumbersTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [position, setPosition] = useState('bottom-center');
  const [format, setFormat] = useState('plain');
  const [startAt, setStartAt] = useState(1);
  const [skipFirst, setSkipFirst] = useState(false);
  const [color, setColor] = useState('#334155');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const font = await doc.embedStandardFont(StandardFonts.Helvetica);
        const col = rgb(hexToRgb(color)[0] / 255, hexToRgb(color)[1] / 255, hexToRgb(color)[2] / 255);
        const pages = doc.getPages();
        const margin = 28;
        const fontSize = 10;
        for (let i = 0; i < pages.length; i++) {
          report(Math.round(10 + (75 * i) / pages.length), `Adding numbers ${i + 1}/${pages.length}…`);
          const page = pages[i];
          const { width, height } = page.getSize();
          if (skipFirst && i === 0) continue;
          const number = startAt + i;
          const label = format === 'padded'
            ? String(number).padStart(2, '0')
            : format === 'of'
              ? `Page ${number} of ${startAt + pages.length - 1}`
              : String(number);
          const textW = font.widthOfTextAtSize(label, fontSize);
          let x = (width - textW) / 2;
          if (position.endsWith('right')) x = width - margin - textW;
          if (position.endsWith('left')) x = margin;
          const y = position.startsWith('top') ? height - margin : margin;
          page.drawText(label, { x, y, size: fontSize, font, color: col });
        }
        report(90, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_numbered.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Adding page numbers failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to number" hint="Add automatic page numbers in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Page number settings">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Position</FieldLabel>
                  <Select value={position} onChange={setPosition} options={NUMBER_POSITIONS} />
                </div>
                <div>
                  <FieldLabel>Format</FieldLabel>
                  <Select value={format} onChange={setFormat} options={NUMBER_FORMATS} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Start at number</FieldLabel>
                  <input type="number" min={0} value={startAt} onChange={(e) => setStartAt(Number(e.target.value) || 0)} className={textInputClass} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span>Skip first page</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FieldLabel>Color</FieldLabel>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 rounded-lg border  border-border cursor-pointer" />
                <span className="font-mono text-[11px]  text-muted-foreground">{color}</span>
              </div>
              <ActionButton onClick={apply} busy={isBusy} busyLabel="Adding numbers…" disabled={pageCount === 0}>
                <Hash className="w-4 h-4" /> Add Page Numbers
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Page numbers added"
              subtitle="Every page now carries a number."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              downloadLabel={result.name}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── REDACT ─────────────────────────────────────────────────────
interface RedactRect { page: number; x: number; y: number; width: number; height: number; }

export const PdfRedactTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [keywords, setKeywords] = useState('CONFIDENTIAL');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setMatchCount(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const findMatches = useCallback(async (): Promise<RedactRect[]> => {
    const pdfjs = await getPdfjs();
    const data = new Uint8Array(await file!.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const words = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const rects: RedactRect[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      for (const item of content.items) {
        const it = item as { str?: string; transform?: number[]; width?: number };
        if (!it.str || !it.transform || it.transform.length < 6) continue;
        const hay = it.str.toLowerCase();
        if (words.some(w => w.length > 0 && hay.includes(w))) {
          const x = it.transform[4];
          const y = it.transform[5];
          const height = Math.abs(it.transform[3]);
          const width = it.width ?? it.str.length * height * 0.5;
          rects.push({ page: p, x: x - 2, y, width: width + 4, height: height * 1.25 + 4 });
        }
      }
    }
    return rects;
  }, [keywords, file]);

  const redact = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Scanning for text matches…');
        const rects = await findMatches();
        setMatchCount(rects.length);
        if (rects.length === 0) {
          setResult(null);
          report(100, 'Done');
          return;
        }
        report(30, 'Reading document…');
        const doc = await loadLibDoc(file);
        const pages = doc.getPages();
        const byPage = new Map<number, RedactRect[]>();
        for (const r of rects) {
          const list = byPage.get(r.page) ?? [];
          list.push(r);
          byPage.set(r.page, list);
        }
        for (const [pageNum, list] of byPage) {
          const page = pages[pageNum - 1];
          for (const r of list) {
            page.drawRectangle({ x: r.x, y: r.y - r.height, width: r.width, height: r.height, color: rgb(0, 0, 0) });
          }
        }
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_redacted.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Redaction failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to redact" hint="Permanently black out sensitive text — never uploads your file" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Redact by keyword">
              <div>
                <FieldLabel>Words or phrases (comma separated)</FieldLabel>
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={textInputClass} placeholder="CONFIDENTIAL, John Smith, 1234-5678" />
              </div>
              {matchCount !== null && (
                <p className="text-[11px]  text-muted-foreground">
                  {matchCount === 0
                    ? 'No matches found — try different keywords.'
                    : `Found ${matchCount} location${matchCount === 1 ? '' : 's'} to black out.`}
                </p>
              )}
              <p className="text-[11px]  text-muted-foreground leading-relaxed">
                Matching words are permanently covered with black boxes. Redaction is destructive and
                cannot be undone, so keep a backup of the original file.
              </p>
              <ActionButton onClick={redact} busy={isBusy} busyLabel="Redacting…" disabled={pageCount === 0}>
                <EyeOff className="w-4 h-4" /> Redact & Save PDF
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Redacted PDF ready"
              subtitle={`${matchCount ?? 0} sensitive area${matchCount === 1 ? '' : 's'} were blacked out on your device.`}
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              downloadLabel={result.name}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── SIGN ───────────────────────────────────────────────────────
type SignMode = 'draw' | 'type' | 'upload';

const SIGN_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const PdfSignTool: React.FC = () => {
  const { file, pageCount, thumbs, busy, error, load, reset } = usePdfSource(0.5);
  const [mode, setMode] = useState<SignMode>('draw');
  const [typedName, setTypedName] = useState('');
  const [targetPage, setTargetPage] = useState(1);
  const [align, setAlign] = useState('right');
  const [offsetY, setOffsetY] = useState(80);
  const [uploadedSig, setUploadedSig] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      setTargetPage(1);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk.current = false;
    }
  }, []);

  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const p = posFromEvent(e);
    if (!canvas || !ctx || !p) return;
    drawing.current = true;
    last.current = p;
    hasInk.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const p = posFromEvent(e);
    if (!canvas || !ctx || !p || !last.current) return;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const stopDrawing = () => { drawing.current = false; last.current = null; };

  const getSignature = async (doc: PDFDocument): Promise<PDFImage | { font: PDFFont; text: string }> => {
    if (mode === 'type') {
      if (!typedName.trim()) throw new Error('Enter the name to use as a signature.');
      const font = await doc.embedStandardFont(StandardFonts.HelveticaBold);
      return { font, text: typedName.trim() };
    }
    let dataUrl: string;
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Drawing canvas unavailable.');
      if (!hasInk.current) throw new Error('Draw your signature first, or choose Type / Upload.');
      dataUrl = canvas.toDataURL('image/png');
    } else {
      if (!uploadedSig) throw new Error('Upload a signature image first.');
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read signature image.'));
        reader.readAsDataURL(uploadedSig);
      });
    }
    const arr = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));
    if (mode === 'draw') return doc.embedPng(arr);
    if (uploadedSig?.type === 'image/png' || uploadedSig?.name.toLowerCase().endsWith('.png')) {
      return doc.embedPng(arr);
    }
    return doc.embedJpg(arr);
  };

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const pages = doc.getPages();
        if (targetPage < 1 || targetPage > pages.length) throw new Error('Invalid target page.');
        const page = pages[targetPage - 1];
        const { width } = page.getSize();
        const sig = await getSignature(doc);
        report(70, 'Placing signature…');
        if ('text' in sig) {
          const size = 26;
          const textW = sig.font.widthOfTextAtSize(sig.text, size);
          let x = (width - textW) / 2;
          if (align === 'left') x = 60;
          if (align === 'right') x = width - 60 - textW;
          page.drawText(sig.text, { x, y: offsetY, size, font: sig.font, color: rgb(0.1, 0.1, 0.2) });
        } else {
          const imgW = Math.min(180, width * 0.35);
          const imgH = imgW * (sig.height / sig.width);
          let x = (width - imgW) / 2;
          if (align === 'left') x = 60;
          if (align === 'right') x = width - 60 - imgW;
          page.drawImage(sig, { x, y: offsetY, width: imgW, height: imgH, opacity: 0.9 });
        }
        report(88, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_signed.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Signing failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  const targetThumb = targetPage >= 1 && targetPage <= thumbs.length ? thumbs[targetPage - 1] : null;

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to sign" hint="Add your signature to any page — draw, type or upload" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF…" />}
          {!busy && (
            <>
              <Card title="Signature">
                <div className="flex gap-2">
                  {(['draw', 'type', 'upload'] as SignMode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`btn-secondary text-xs px-4 py-2 flex-1 justify-center capitalize ${mode === m ? 'bg-primary/10 border-primary' : ''}`}>
                      {m === 'draw' ? <PenLine className="w-3.5 h-3.5" /> : m === 'type' ? <Hash className="w-3.5 h-3.5" /> : <UploadIcon className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>
                {mode === 'draw' && (
                  <div>
                    <canvas
                      ref={canvasRef}
                      width={420}
                      height={180}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                      className="w-full touch-none rounded-xl border dark:bg-card  bg-card border-border cursor-crosshair"
                      style={{ touchAction: 'none' }}
                    />
                    <button onClick={clearCanvas} className="btn-ghost text-xs mt-1.5"><Eraser className="w-3.5 h-3.5" /> Clear drawing</button>
                  </div>
                )}
                {mode === 'type' && (
                  <div>
                    <FieldLabel>Name to sign with</FieldLabel>
                    <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="John Doe" className={textInputClass} />
                    {typedName && (
                      <p className="mt-2 text-xl text-foreground " style={{ fontFamily: 'cursive' }}>{typedName}</p>
                    )}
                  </div>
                )}
                {mode === 'upload' && (
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => setUploadedSig(e.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-semibold hover:file:brightness-110 cursor-pointer"
                    />
                    {uploadedSig && <p className="mt-1.5 text-[11px]  text-muted-foreground font-mono">{uploadedSig.name}</p>}
                  </div>
                )}
              </Card>

              <Card title="Placement">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Target page</FieldLabel>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTargetPage(p => Math.max(1, p - 1))} className="btn-secondary text-xs px-2.5 py-2">−</button>
                      <input type="number" min={1} max={pageCount} value={targetPage} onChange={(e) => setTargetPage(Math.max(1, Math.min(pageCount, Number(e.target.value) || 1)))} className={textInputClass} />
                      <button onClick={() => setTargetPage(p => Math.min(pageCount, p + 1))} className="btn-secondary text-xs px-2.5 py-2">+</button>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Horizontal position</FieldLabel>
                    <Select value={align} onChange={setAlign} options={SIGN_POSITIONS} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Distance from bottom edge: {offsetY}pt</FieldLabel>
                  <input type="range" min={20} max={500} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                {targetThumb && (
                  <div className="rounded-xl overflow-hidden border  border-border relative bg-muted">
                    <img src={targetThumb} alt={`Page ${targetPage}`} className="mx-auto max-h-56 object-contain" />
                    <div className="absolute bottom-[14%] left-0 right-0 flex justify-center pointer-events-none">
                      <span className="w-32 h-10 border-2 border-dashed border-primary/40 rounded-sm" />
                    </div>
                    <span className="absolute top-1 left-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-white">Page {targetPage}</span>
                  </div>
                )}
              </Card>

              <ActionButton onClick={apply} busy={isBusy} busyLabel="Signing…" disabled={pageCount === 0}>
                <PenLine className="w-4 h-4" /> Sign PDF
              </ActionButton>
            </>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Signed PDF ready"
              subtitle={`Your signature was placed on page ${targetPage}.`}
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              downloadLabel={result.name}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};
