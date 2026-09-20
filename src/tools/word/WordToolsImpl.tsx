import React, { useCallback, useMemo, useState } from 'react';
import {
  FileText, FileCode2, FileType2, FileDown, FileInput, BookOpen,
  Info, GitCompare, RemoveFormatting, Download, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';
import { errorMessage } from '../../utils/errorMessage';
import { lcsDiff } from '../../lib/lcsDiff';
import {
  DocxDropZone, DocxFileBar, ConversionNotes, readDocx, isDocx,
  baseName, downloadBlobAs, downloadText,
} from './WordShared';
import { htmlToDocxBlob, textToDocxBlob } from './htmlToDocx';

/* ── Shared chrome ───────────────────────────────────────────── */

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title, children, className = '',
}) => (
  <div className={`rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3 shadow-card ${className}`}>
    {title && <h3 className="text-[13px] font-bold text-foreground">{title}</h3>}
    {children}
  </div>
);

const ErrorBox: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  ) : null;

const ActionButton: React.FC<{
  onClick: () => void; busy?: boolean; disabled?: boolean; busyLabel?: string; children: React.ReactNode;
}> = ({ onClick, busy, disabled, busyLabel = 'Working…', children }) => (
  <button
    onClick={onClick}
    disabled={busy || disabled}
    className="w-full py-2.5 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {busy ? busyLabel : children}
  </button>
);

const DownloadBar: React.FC<{ label: string; onDownload: () => void; note?: string }> = ({
  label, onDownload, note,
}) => (
  <div className="p-4 rounded-2xl border border-success/30 bg-success/10 text-xs space-y-2.5">
    <div className="flex items-center gap-2 text-success font-bold">
      <CheckCircle className="w-4 h-4" /> <span>Ready</span>
    </div>
    {note && <p className="text-success/80 leading-relaxed">{note}</p>}
    <button
      onClick={onDownload}
      className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
    >
      <Download className="w-4 h-4" /> {label}
    </button>
  </div>
);

const OutputPanel: React.FC<{
  title: string; value: string; mono?: boolean; rows?: number; right?: React.ReactNode;
}> = ({ title, value, mono = true, rows = 16, right }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-xs">
    <div className="px-3.5 py-2 border-b bg-muted border-border flex items-center justify-between gap-2">
      <span className="text-[12px] font-semibold text-foreground">{title}</span>
      <div className="flex items-center gap-2">{right}<CopyButton text={value} /></div>
    </div>
    <textarea
      readOnly
      value={value}
      rows={rows}
      spellCheck={false}
      className={`w-full resize-y bg-transparent px-3.5 py-3 text-[12px] leading-relaxed text-foreground focus:outline-none ${mono ? 'font-mono' : ''}`}
    />
  </div>
);

const textInputClass =
  'w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 bg-card border-border text-foreground placeholder:text-muted-foreground';

/**
 * Every "upload one .docx, read it, show something" tool has the same shape.
 * `render` receives the parsed document and returns the tool-specific output.
 */
function useSingleDocx() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ html: string; text: string; messages: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (files: File[]) => {
    const picked = files.find(isDocx);
    if (!picked) {
      setError('Please choose a .docx file. Legacy binary .doc documents need to be re-saved as .docx in Word first.');
      return;
    }
    setError(null);
    setBusy(true);
    setFile(picked);
    try {
      setParsed(await readDocx(picked));
    } catch (e) {
      setParsed(null);
      setFile(null);
      setError(errorMessage(e, 'This file could not be read. It may be corrupted or not a real .docx archive.'));
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => { setFile(null); setParsed(null); setError(null); }, []);

  return { file, parsed, error, setError, busy, load, clear };
}

/* ── 1. DOCX → HTML ──────────────────────────────────────────── */

export const DocxToHtmlTool: React.FC = () => {
  const { file, parsed, error, busy, load, clear } = useSingleDocx();
  const [pretty, setPretty] = useState(true);

  const html = useMemo(() => {
    if (!parsed) return '';
    if (!pretty) return parsed.html;
    // mammoth emits one long line; putting each block on its own line is what
    // makes the output reviewable before it is pasted into a CMS.
    return parsed.html.replace(/></g, '>\n<');
  }, [parsed, pretty]);

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a Word document to convert to HTML" hint="Parsed in your browser, nothing is uploaded" />
      ) : (
        <>
          <DocxFileBar name={file.name} onClear={clear} note={busy ? 'Reading document…' : 'Converted to semantic HTML'} />
          {parsed && (
            <>
              <ConversionNotes messages={parsed.messages} />
              <OutputPanel
                title="HTML output"
                value={html}
                right={
                  <button
                    onClick={() => setPretty(p => !p)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    {pretty ? 'One line' : 'Split lines'}
                  </button>
                }
              />
              <button
                onClick={() => downloadText(html, `${baseName(file.name)}.html`, 'text/html;charset=utf-8')}
                className="btn-secondary w-full text-xs py-2.5"
              >
                <FileCode2 className="w-4 h-4" /> Download .html
              </button>
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 2. DOCX → Markdown ──────────────────────────────────────── */

export const DocxToMarkdownTool: React.FC = () => {
  const { file, parsed, error, busy, load, clear } = useSingleDocx();
  const [markdown, setMarkdown] = useState('');
  const [converting, setConverting] = useState(false);

  React.useEffect(() => {
    let cancelled = false;
    if (!parsed) { setMarkdown(''); return; }
    setConverting(true);
    (async () => {
      const TurndownService = (await import('turndown')).default;
      const turndown = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
      });
      const md = turndown.turndown(parsed.html);
      if (!cancelled) { setMarkdown(md); setConverting(false); }
    })();
    return () => { cancelled = true; };
  }, [parsed]);

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a Word document to convert to Markdown" hint="Headings, lists and links are mapped to Markdown syntax" />
      ) : (
        <>
          <DocxFileBar
            name={file.name}
            onClear={clear}
            note={busy || converting ? 'Converting…' : 'Converted to standard Markdown'}
          />
          {parsed && !converting && (
            <>
              <ConversionNotes messages={parsed.messages} />
              <OutputPanel title="Markdown output" value={markdown} />
              <button
                onClick={() => downloadText(markdown, `${baseName(file.name)}.md`, 'text/markdown;charset=utf-8')}
                className="btn-secondary w-full text-xs py-2.5"
              >
                <FileType2 className="w-4 h-4" /> Download .md
              </button>
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 3. DOCX → TXT ───────────────────────────────────────────── */

export const DocxToTxtTool: React.FC = () => {
  const { file, parsed, error, busy, load, clear } = useSingleDocx();

  const stats = useMemo(() => {
    if (!parsed) return null;
    const text = parsed.text;
    return {
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split(/\r?\n/).filter(l => l.trim()).length,
    };
  }, [parsed]);

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a Word document to extract plain text" hint="All styling is stripped, paragraph breaks are kept" />
      ) : (
        <>
          <DocxFileBar name={file.name} onClear={clear} note={busy ? 'Extracting text…' : 'Formatting removed'} />
          {parsed && stats && (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                {([['Words', stats.words], ['Characters', stats.characters], ['Paragraphs', stats.lines]] as const).map(
                  ([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-center">
                      <div className="text-[15px] font-extrabold text-foreground font-mono">{value.toLocaleString()}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">{label}</div>
                    </div>
                  ),
                )}
              </div>
              <OutputPanel title="Plain text" value={parsed.text} mono={false} />
              <button
                onClick={() => downloadText(parsed.text, `${baseName(file.name)}.txt`)}
                className="btn-secondary w-full text-xs py-2.5"
              >
                <FileText className="w-4 h-4" /> Download .txt
              </button>
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 4. DOCX → PDF ───────────────────────────────────────────── */

export const DocxToPdfTool: React.FC = () => {
  const { file, parsed, error, setError, busy, load, clear } = useSingleDocx();
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const convert = async () => {
    if (!parsed || !file) return;
    setExporting(true);
    setError(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      // Rendered off-screen at A4 width so the page breaks land where they
      // would on paper rather than wherever the viewport happens to end.
      const host = document.createElement('div');
      host.style.cssText =
        'position:fixed;left:-99999px;top:0;width:794px;background:#ffffff;color:#111111;'
        + 'padding:56px;font-family:Georgia,"Times New Roman",serif;font-size:15px;line-height:1.6;';
      host.innerHTML = parsed.html;
      document.body.appendChild(host);
      try {
        const canvas = await html2canvas(host, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const imgH = (canvas.height * pageW) / canvas.width;
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        let remaining = imgH;
        let offsetY = 0;
        let first = true;
        while (remaining > 0) {
          if (!first) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, -offsetY, pageW, imgH);
          remaining -= pageH;
          offsetY += pageH;
          first = false;
        }
        setResult({ blob: pdf.output('blob'), name: `${baseName(file.name)}.pdf` });
      } finally {
        document.body.removeChild(host);
      }
    } catch (e) {
      setError(errorMessage(e, 'The PDF could not be generated.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a Word document to convert to PDF" hint="Rendered and exported on your device" />
      ) : (
        <>
          <DocxFileBar name={file.name} onClear={() => { clear(); setResult(null); }} note={busy ? 'Reading document…' : undefined} />
          {parsed && (
            <>
              <ConversionNotes messages={parsed.messages} />
              <Card title="Preview">
                <div
                  className="max-h-[420px] overflow-auto rounded-xl border border-border bg-white text-black p-6 text-[13px] leading-relaxed docx-preview"
                  dangerouslySetInnerHTML={{ __html: parsed.html }}
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The PDF is produced from exactly this rendering. Headings, emphasis, lists and images
                  carry over; Word-specific page furniture such as headers, footers and field codes does not.
                </p>
              </Card>
              <ActionButton onClick={convert} busy={exporting} busyLabel="Rendering PDF…">
                <FileDown className="w-4 h-4" /> Convert to PDF
              </ActionButton>
              {result && (
                <DownloadBar
                  label={result.name}
                  note="Generated locally — the document never left this browser."
                  onDownload={() => downloadBlobAs(result.blob, result.name)}
                />
              )}
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 5. Word Viewer ──────────────────────────────────────────── */

export const WordViewerTool: React.FC = () => {
  const { file, parsed, error, busy, load, clear } = useSingleDocx();

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a .docx file to read" hint="Opens in this tab — no Word, no account, no upload" />
      ) : (
        <>
          <DocxFileBar name={file.name} onClear={clear} note={busy ? 'Opening…' : 'Rendered from the document body'} />
          {parsed && (
            <>
              <ConversionNotes messages={parsed.messages} />
              <div className="rounded-2xl border border-border bg-white text-black shadow-card overflow-hidden">
                <div
                  className="max-h-[70vh] overflow-auto px-7 sm:px-12 py-9 text-[14px] leading-[1.75] docx-preview"
                  dangerouslySetInnerHTML={{ __html: parsed.html }}
                />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button onClick={() => window.print()} className="btn-secondary text-xs px-4 py-2.5">
                  <BookOpen className="w-4 h-4" /> Print / Save as PDF
                </button>
                <button
                  onClick={() => downloadText(parsed.text, `${baseName(file.name)}.txt`)}
                  className="btn-ghost text-xs px-4 py-2.5"
                >
                  <FileText className="w-4 h-4" /> Download text
                </button>
              </div>
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 6. Word Metadata Viewer ─────────────────────────────────── */

interface DocxMetadata { label: string; value: string }

async function readDocxMetadata(file: File): Promise<{ core: DocxMetadata[]; app: DocxMetadata[] }> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);

  const parseXml = async (path: string) => {
    const entry = zip.file(path);
    if (!entry) return null;
    return new DOMParser().parseFromString(await entry.async('string'), 'application/xml');
  };

  const textOf = (doc: Document | null, tag: string) => {
    if (!doc) return '';
    const el = doc.getElementsByTagName(tag)[0] ?? doc.getElementsByTagNameNS('*', tag.split(':').pop() ?? tag)[0];
    return (el?.textContent ?? '').trim();
  };

  const prettyDate = (raw: string) => {
    if (!raw) return '';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleString();
  };

  const core = await parseXml('docProps/core.xml');
  const app = await parseXml('docProps/app.xml');

  const coreRows: DocxMetadata[] = [
    { label: 'Title', value: textOf(core, 'dc:title') },
    { label: 'Subject', value: textOf(core, 'dc:subject') },
    { label: 'Author', value: textOf(core, 'dc:creator') },
    { label: 'Last modified by', value: textOf(core, 'cp:lastModifiedBy') },
    { label: 'Keywords', value: textOf(core, 'cp:keywords') },
    { label: 'Description', value: textOf(core, 'dc:description') },
    { label: 'Category', value: textOf(core, 'cp:category') },
    { label: 'Revision', value: textOf(core, 'cp:revision') },
    { label: 'Created', value: prettyDate(textOf(core, 'dcterms:created')) },
    { label: 'Modified', value: prettyDate(textOf(core, 'dcterms:modified')) },
  ].filter(r => r.value);

  const appRows: DocxMetadata[] = [
    { label: 'Created with', value: textOf(app, 'Application') },
    { label: 'App version', value: textOf(app, 'AppVersion') },
    { label: 'Company', value: textOf(app, 'Company') },
    { label: 'Template', value: textOf(app, 'Template') },
    { label: 'Pages', value: textOf(app, 'Pages') },
    { label: 'Words', value: textOf(app, 'Words') },
    { label: 'Characters', value: textOf(app, 'Characters') },
    { label: 'Paragraphs', value: textOf(app, 'Paragraphs') },
    { label: 'Lines', value: textOf(app, 'Lines') },
    { label: 'Total editing time', value: (() => {
      const m = textOf(app, 'TotalTime');
      if (!m) return '';
      const mins = Number(m);
      if (Number.isNaN(mins)) return m;
      return mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
    })() },
  ].filter(r => r.value);

  return { core: coreRows, app: appRows };
}

export const WordMetadataTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ core: DocxMetadata[]; app: DocxMetadata[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (files: File[]) => {
    const picked = files.find(isDocx);
    if (!picked) { setError('Please choose a .docx file.'); return; }
    setError(null); setBusy(true); setFile(picked);
    try {
      setMeta(await readDocxMetadata(picked));
    } catch (e) {
      setMeta(null); setFile(null);
      setError(errorMessage(e, 'The document properties could not be read.'));
    } finally { setBusy(false); }
  };

  const Section: React.FC<{ title: string; rows: DocxMetadata[] }> = ({ title, rows }) =>
    rows.length ? (
      <Card title={title}>
        <dl className="divide-y divide-border text-xs">
          {rows.map(row => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2">
              <dt className="text-muted-foreground shrink-0">{row.label}</dt>
              <dd className="font-semibold text-foreground text-right break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    ) : null;

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a .docx file to inspect" hint="Reads docProps only — the document text is not shown" />
      ) : (
        <>
          <DocxFileBar
            name={file.name}
            onClear={() => { setFile(null); setMeta(null); setError(null); }}
            note={busy ? 'Reading properties…' : `${(file.size / 1024).toFixed(0)} KB on disk`}
          />
          {meta && (
            <>
              <Section title="Document properties" rows={meta.core} />
              <Section title="Application statistics" rows={meta.app} />
              {!meta.core.length && !meta.app.length && (
                <Card>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This document carries no readable properties. That usually means the metadata was
                    stripped before it was shared, which is what a careful sender does on purpose.
                  </p>
                </Card>
              )}
              <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Author names, company and editing time travel with every Word file you send. Worth
                  checking before a document leaves your organisation.
                </span>
              </div>
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 7. Remove Formatting ────────────────────────────────────── */

export const WordRemoveFormatTool: React.FC = () => {
  const { file, parsed, error, setError, busy, load, clear } = useSingleDocx();
  const [collapseBlankLines, setCollapseBlankLines] = useState(true);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [working, setWorking] = useState(false);

  const cleaned = useMemo(() => {
    if (!parsed) return '';
    let text = parsed.text
      // Smart quotes, em dashes and non-breaking spaces are the usual reason
      // Word text breaks a downstream parser, so they go too.
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/\u2026/g, '...')
      .replace(/[\u00A0\u2007\u202F]/g, ' ')
      .replace(/[ \t]+$/gm, '');
    if (collapseBlankLines) text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }, [parsed, collapseBlankLines]);

  const build = async () => {
    if (!file) return;
    setWorking(true); setError(null);
    try {
      setResult({ blob: await textToDocxBlob(cleaned, baseName(file.name)), name: `${baseName(file.name)}-clean.docx` });
    } catch (e) {
      setError(errorMessage(e, 'The clean document could not be created.'));
    } finally { setWorking(false); }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <DocxDropZone onFiles={load} label="Select a Word document to strip formatting from" hint="Styles, fonts and smart punctuation removed" />
      ) : (
        <>
          <DocxFileBar name={file.name} onClear={() => { clear(); setResult(null); }} note={busy ? 'Reading document…' : undefined} />
          {parsed && (
            <>
              <Card title="Options">
                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collapseBlankLines}
                    onChange={e => { setCollapseBlankLines(e.target.checked); setResult(null); }}
                    className="accent-[rgb(var(--primary))]"
                  />
                  Collapse runs of blank lines into one
                </label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Curly quotes, ellipsis characters and non-breaking spaces are converted to their plain
                  ASCII equivalents. These are the characters that break CSV imports, code blocks and
                  search matching after a copy out of Word.
                </p>
              </Card>
              <OutputPanel title="Clean text" value={cleaned} mono={false} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => downloadText(cleaned, `${baseName(file.name)}-clean.txt`)}
                  className="btn-secondary text-xs py-2.5"
                >
                  <FileText className="w-4 h-4" /> Download .txt
                </button>
                <ActionButton onClick={build} busy={working} busyLabel="Building DOCX…">
                  <RemoveFormatting className="w-4 h-4" /> Build clean .docx
                </ActionButton>
              </div>
              {result && (
                <DownloadBar
                  label={result.name}
                  note="Plain paragraphs in Word's default style — no inherited fonts, colours or tracked changes."
                  onDownload={() => downloadBlobAs(result.blob, result.name)}
                />
              )}
            </>
          )}
        </>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 8. Document Compare ─────────────────────────────────────── */

type CompareRow = { type: 'equal' | 'add' | 'remove'; text: string };

export const WordCompareTool: React.FC = () => {
  const [left, setLeft] = useState<{ file: File; text: string } | null>(null);
  const [right, setRight] = useState<{ file: File; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'left' | 'right' | null>(null);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const pick = (side: 'left' | 'right') => async (files: File[]) => {
    const picked = files.find(isDocx);
    if (!picked) { setError('Please choose a .docx file.'); return; }
    setError(null); setBusy(side);
    try {
      const { text } = await readDocx(picked);
      const value = { file: picked, text };
      if (side === 'left') setLeft(value); else setRight(value);
    } catch (e) {
      setError(errorMessage(e, 'That document could not be read.'));
    } finally { setBusy(null); }
  };

  const rows = useMemo<CompareRow[] | null>(() => {
    if (!left || !right) return null;
    const a = left.text.split(/\r?\n/).filter(l => l.trim());
    const b = right.text.split(/\r?\n/).filter(l => l.trim());
    const norm = (l: string) => {
      const collapsed = l.replace(/\s+/g, ' ').trim();
      return ignoreCase ? collapsed.toLowerCase() : collapsed;
    };
    return lcsDiff(a.map(norm), b.map(norm)).map(op => ({
      type: op.type,
      text: op.type === 'add' ? b[op.bi] : a[op.ai],
    }));
  }, [left, right, ignoreCase]);

  const summary = useMemo(() => {
    if (!rows) return null;
    return {
      added: rows.filter(r => r.type === 'add').length,
      removed: rows.filter(r => r.type === 'remove').length,
      unchanged: rows.filter(r => r.type === 'equal').length,
    };
  }, [rows]);

  const Side: React.FC<{ side: 'left' | 'right'; value: typeof left; label: string }> = ({ side, value, label }) => (
    <div className="space-y-2">
      <span className="section-label">{label}</span>
      {value ? (
        <DocxFileBar
          name={value.file.name}
          onClear={() => (side === 'left' ? setLeft(null) : setRight(null))}
          note={`${value.text.split(/\r?\n/).filter(l => l.trim()).length} paragraphs`}
        />
      ) : (
        <DocxDropZone
          onFiles={pick(side)}
          label={busy === side ? 'Reading…' : `Select the ${label.toLowerCase()}`}
          hint="Compared locally, neither file is uploaded"
        />
      )}
    </div>
  );

  const reportText = useMemo(() => {
    if (!rows || !left || !right) return '';
    const lines = [
      `Comparison: ${left.file.name} → ${right.file.name}`,
      '',
      ...rows
        .filter(r => r.type !== 'equal')
        .map(r => `${r.type === 'add' ? '+' : '-'} ${r.text}`),
    ];
    return lines.join('\n');
  }, [rows, left, right]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Side side="left" value={left} label="Original document" />
        <Side side="right" value={right} label="Revised document" />
      </div>

      {rows && summary && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card border-border">
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="text-success">+{summary.added} added</span>
              <span className="text-danger">−{summary.removed} removed</span>
              <span className="text-muted-foreground">{summary.unchanged} unchanged</span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={e => setIgnoreCase(e.target.checked)}
                className="accent-[rgb(var(--primary))]"
              />
              Ignore case
            </label>
          </div>

          {summary.added === 0 && summary.removed === 0 ? (
            <div className="p-4 rounded-2xl border border-success/30 bg-success/10 text-xs text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> The text of these two documents is identical.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-3.5 py-2 border-b bg-muted border-border flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground">Paragraph-level differences</span>
                  <CopyButton text={reportText} label="Copy report" />
                </div>
                <div className="max-h-[520px] overflow-auto divide-y divide-border">
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className={`px-3.5 py-2 text-[12px] leading-relaxed flex gap-2.5 ${
                        row.type === 'add' ? 'bg-success/10' : row.type === 'remove' ? 'bg-danger/10' : ''
                      }`}
                    >
                      <span
                        className={`font-mono shrink-0 font-bold ${
                          row.type === 'add' ? 'text-success' : row.type === 'remove' ? 'text-danger' : 'text-border'
                        }`}
                      >
                        {row.type === 'add' ? '+' : row.type === 'remove' ? '−' : ' '}
                      </span>
                      <span className={row.type === 'equal' ? 'text-muted-foreground' : 'text-foreground'}>
                        {row.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => downloadText(reportText, 'document-comparison.txt')}
                className="btn-secondary w-full text-xs py-2.5"
              >
                <GitCompare className="w-4 h-4" /> Download comparison report
              </button>
            </>
          )}
        </>
      )}

      {(!left || !right) && (
        <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
          Comparison is on the text of each document. Formatting-only edits — a font change, a different
          margin — are intentionally not reported as differences.
        </p>
      )}
      <ErrorBox message={error} />
    </div>
  );
};

/* ── 9. HTML → DOCX ──────────────────────────────────────────── */

const HTML_SAMPLE = `<h1>Quarterly update</h1>
<p>Revenue grew <strong>18%</strong> against a <em>flat</em> headcount.</p>
<ul>
  <li>EMEA led on new logos</li>
  <li>Churn fell to 1.9%</li>
</ul>
<p>Full detail in the <a href="https://example.com/report">attached report</a>.</p>`;

const SourceToDocx: React.FC<{
  kind: 'html' | 'markdown';
  sample: string;
  accept: string;
  label: string;
  hint: string;
}> = ({ kind, sample, accept, label, hint }) => {
  const [source, setSource] = useState(sample);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const upload = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setSource(String(reader.result ?? '')); setResult(null); };
    reader.readAsText(f);
  };

  const convert = async () => {
    if (!source.trim()) { setError(`Enter some ${kind === 'html' ? 'HTML' : 'Markdown'} first.`); return; }
    setBusy(true); setError(null);
    try {
      let html = source;
      if (kind === 'markdown') {
        const { marked } = await import('marked');
        html = await marked.parse(source, { async: true });
      }
      const blob = await htmlToDocxBlob(html);
      setResult({ blob, name: kind === 'html' ? 'converted.docx' : 'markdown.docx' });
    } catch (e) {
      setError(errorMessage(e, 'The Word document could not be created.'));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Card title={label}>
        <textarea
          value={source}
          onChange={e => { setSource(e.target.value); setResult(null); }}
          rows={12}
          spellCheck={false}
          className={`${textInputClass} font-mono leading-relaxed`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn-ghost text-[11px] px-3 py-1.5 cursor-pointer">
            <FileInput className="w-3.5 h-3.5" /> Upload a file
            <input type="file" accept={accept} className="hidden" onChange={e => upload(e.target.files)} />
          </label>
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        </div>
      </Card>
      <ActionButton onClick={convert} busy={busy} busyLabel="Building DOCX…">
        <FileText className="w-4 h-4" /> Convert to Word
      </ActionButton>
      {result && (
        <DownloadBar
          label={result.name}
          note="Opens in Microsoft Word, Google Docs and LibreOffice."
          onDownload={() => downloadBlobAs(result.blob, result.name)}
        />
      )}
      <ErrorBox message={error} />
    </div>
  );
};

export const HtmlToDocxTool: React.FC = () => (
  <SourceToDocx
    kind="html"
    sample={HTML_SAMPLE}
    accept=".html,.htm,text/html"
    label="HTML source"
    hint="Headings, emphasis, links, lists, quotes and tables are mapped to Word styles."
  />
);

/* ── 10. Markdown → DOCX ─────────────────────────────────────── */

const MD_SAMPLE = `# Release notes

The **2.4** release is focused on export quality.

## Fixed

- Page breaks in long tables
- *Italic* runs losing their style on paste

See the [changelog](https://example.com/changelog) for the full list.`;

export const MarkdownToDocxTool: React.FC = () => (
  <SourceToDocx
    kind="markdown"
    sample={MD_SAMPLE}
    accept=".md,.markdown,text/markdown,text/plain"
    label="Markdown source"
    hint="Parsed as standard Markdown, then mapped to Word heading and list styles."
  />
);
