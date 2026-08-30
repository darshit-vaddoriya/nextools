import React, { useMemo, useRef, useState } from 'react';
import {
  Table2, Upload, Download, Plus, Minus, Trash2, Sparkles,
  FileJson, FileSpreadsheet, ArrowLeftRight, Copy as CopyIcon, Layers, ListX,
} from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { downloadBlob } from '../image/ImageUtils';
import { errorMessage } from '../../utils/errorMessage';

// ─── CSV parsing / serialization (RFC4180-ish, hand-written) ─────

export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  row.push(field);
  rows.push(row);
  // drop a single trailing empty row caused by trailing newline
  if (rows.length > 1 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  return rows;
}

function needsQuoting(value: string, delimiter: string): boolean {
  return value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r');
}

export function toDelimited(rows: string[][], delimiter: string): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const v = cell ?? '';
          if (needsQuoting(v, delimiter)) return `"${v.replace(/"/g, '""')}"`;
          return v;
        })
        .join(delimiter)
    )
    .join('\r\n');
}

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h || `col${i + 1}`] = r[i] ?? ''; });
    return obj;
  });
}

export function objectsToRows(objs: Record<string, unknown>[]): string[][] {
  const headerSet = new Set<string>();
  objs.forEach((o) => Object.keys(o).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);
  const rows: string[][] = [headers];
  objs.forEach((o) => {
    rows.push(headers.map((h) => {
      const v = o[h];
      if (v === undefined || v === null) return '';
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    }));
  });
  return rows;
}

const DELIMS: { value: string; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
  { value: ';', label: 'Semicolon (;)' },
];

function delimiterFromFileName(name: string): string {
  return name.toLowerCase().endsWith('.tsv') ? '\t' : ',';
}

// ─── Shared: file/paste input card ────────────────────────────
const CsvInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onFile?: (text: string, delimiter: string) => void;
  accept?: string;
}> = ({ value, onChange, onFile, accept = '.csv,.tsv,text/csv,text/tab-separated-values' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    const text = await file.text();
    const delim = delimiterFromFileName(file.name);
    onChange(text);
    onFile?.(text, delim);
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">CSV / TSV input</p>
        </div>
        <button onClick={() => inputRef.current?.click()} className="btn-secondary text-[11px] px-2.5 py-1">
          <Upload className="w-3.5 h-3.5" /> Upload file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'name,age,city\nJohn,30,NYC'}
        rows={6}
        className="textarea-base font-mono h-32"
      />
    </div>
  );
};

const TableView: React.FC<{ rows: string[][]; maxHeight?: string }> = ({ rows, maxHeight = 'max-h-96' }) => {
  if (rows.length === 0) return <p className="text-xs text-muted-foreground italic">No data yet.</p>;
  const [header, ...body] = rows;
  return (
    <div className={`overflow-auto ${maxHeight} rounded-xl border border-border`}>
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-muted">
          <tr>
            {header.map((h, i) => (
              <th key={i} className="text-left font-bold text-foreground px-3 py-2 border-b border-border whitespace-nowrap">{h || `col${i + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className={ri % 2 ? 'bg-card' : 'bg-muted/40'}>
              {header.map((_, ci) => (
                <td key={ci} className="px-3 py-1.5 border-b border-border text-muted-foreground font-mono whitespace-nowrap">{row[ci] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── CSV VIEWER ──────────────────────────────────────────────
export const CsvViewerTool: React.FC = () => {
  const [text, setText] = useState('name,age,city\nJohn,30,NYC\nJane,25,LA');
  const [delimiter, setDelimiter] = useState(',');
  const rows = useMemo(() => (text.trim() ? parseDelimited(text, delimiter) : []), [text, delimiter]);

  return (
    <div className="space-y-4">
      <CsvInput value={text} onChange={setText} onFile={(_, d) => setDelimiter(d)} />
      <div className="flex items-center gap-2">
        <span className="section-label">Delimiter</span>
        <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">{rows.length ? `${rows.length - 1} rows × ${rows[0].length} cols` : ''}</span>
      </div>
      <TableView rows={rows} />
    </div>
  );
};

// ─── CSV EDITOR ──────────────────────────────────────────────
export const CsvEditorTool: React.FC = () => {
  const [delimiter, setDelimiter] = useState(',');
  const [rows, setRows] = useState<string[][]>(() => parseDelimited('name,age,city\nJohn,30,NYC\nJane,25,LA', ','));

  const loadText = (text: string, delim: string) => {
    setDelimiter(delim);
    setRows(text.trim() ? parseDelimited(text, delim) : [['']]);
  };

  const updateCell = (r: number, c: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, new Array(prev[0]?.length ?? 1).fill('')]);
  const removeRow = (r: number) => setRows((prev) => prev.filter((_, i) => i !== r));
  const addColumn = () => setRows((prev) => prev.map((row, i) => [...row, i === 0 ? `col${row.length + 1}` : '']));
  const removeColumn = (c: number) => setRows((prev) => prev.map((row) => row.filter((_, i) => i !== c)));

  const exportCsv = () => {
    const csv = toDelimited(rows, delimiter);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'edited.csv');
  };

  const header = rows[0] ?? [];

  return (
    <div className="space-y-4">
      <CsvInput value={toDelimited(rows, delimiter)} onChange={(v) => setRows(v.trim() ? parseDelimited(v, delimiter) : [['']])} onFile={loadText} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="section-label">Delimiter</span>
        <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
        <button onClick={addRow} className="btn-secondary text-[11px] px-2.5 py-1"><Plus className="w-3.5 h-3.5" /> Row</button>
        <button onClick={addColumn} className="btn-secondary text-[11px] px-2.5 py-1"><Plus className="w-3.5 h-3.5" /> Column</button>
        <button onClick={exportCsv} className="btn-primary text-[11px] px-3 py-1.5 ml-auto"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>
      <div className="overflow-auto max-h-96 rounded-xl border border-border">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {header.map((h, ci) => (
                <th key={ci} className="px-1 py-1 border-b border-border">
                  <div className="flex items-center gap-1">
                    <input value={h} onChange={(e) => updateCell(0, ci, e.target.value)} className="input-base w-28 font-bold text-[11px] px-2 py-1" />
                    <button onClick={() => removeColumn(ci)} className="p-1 text-muted-foreground hover:text-danger shrink-0"><Minus className="w-3 h-3" /></button>
                  </div>
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, ri) => (
              <tr key={ri}>
                {header.map((_, ci) => (
                  <td key={ci} className="px-1 py-1 border-b border-border">
                    <input value={row[ci] ?? ''} onChange={(e) => updateCell(ri + 1, ci, e.target.value)} className="input-base w-28 font-mono text-[11px] px-2 py-1" />
                  </td>
                ))}
                <td className="px-1 py-1 border-b border-border">
                  <button onClick={() => removeRow(ri + 1)} className="p-1 text-muted-foreground hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── CSV CLEANER ─────────────────────────────────────────────
export const CsvCleanerTool: React.FC = () => {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [trim, setTrim] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [normalizeEol, setNormalizeEol] = useState(true);

  const cleaned = useMemo(() => {
    if (!text.trim()) return { rows: [] as string[][], removedCount: 0 };
    let source = text;
    if (normalizeEol) source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let rows = parseDelimited(source, delimiter);
    if (trim) rows = rows.map((r) => r.map((c) => c.trim()));
    const before = rows.length;
    if (removeEmpty) rows = rows.filter((r) => r.some((c) => c !== ''));
    return { rows, removedCount: before - rows.length };
  }, [text, delimiter, trim, removeEmpty, normalizeEol]);

  const download = () => {
    const csv = toDelimited(cleaned.rows, delimiter);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'cleaned.csv');
  };

  return (
    <div className="space-y-4">
      <CsvInput value={text} onChange={setText} onFile={(_, d) => setDelimiter(d)} />
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="section-label">Delimiter</span>
          <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} className="rounded text-primary" /> Trim whitespace in every cell
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="rounded text-primary" /> Remove fully-empty rows
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={normalizeEol} onChange={(e) => setNormalizeEol(e.target.checked)} className="rounded text-primary" /> Normalize line endings
          </label>
        </div>
      </div>
      {cleaned.rows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span><Sparkles className="w-3.5 h-3.5 inline mr-1 text-primary" />{cleaned.removedCount} empty row(s) removed</span>
            <button onClick={download} className="btn-primary text-[11px] px-3 py-1.5"><Download className="w-3.5 h-3.5" /> Download cleaned CSV</button>
          </div>
          <TableView rows={cleaned.rows} />
        </div>
      )}
    </div>
  );
};

// ─── CSV TO JSON ─────────────────────────────────────────────
export const CsvToJsonTool: React.FC = () => {
  const [text, setText] = useState('name,age,city\nJohn,30,NYC\nJane,25,LA');
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState<string | null>(null);

  const json = useMemo(() => {
    setError(null);
    try {
      if (!text.trim()) return '';
      const rows = parseDelimited(text, delimiter);
      return JSON.stringify(rowsToObjects(rows), null, 2);
    } catch (e) {
      setError(errorMessage(e, 'Could not convert this CSV.'));
      return '';
    }
  }, [text, delimiter]);

  const download = () => downloadBlob(new Blob([json], { type: 'application/json' }), 'data.json');

  return (
    <div className="space-y-4">
      <CsvInput value={text} onChange={setText} onFile={(_, d) => setDelimiter(d)} />
      <div className="flex items-center gap-2">
        <span className="section-label">Delimiter</span>
        <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-primary" />
            <p className="section-label">JSON output</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={json} />
            <button onClick={download} className="btn-secondary text-[11px] px-2.5 py-1"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
        </div>
        <textarea readOnly value={json} rows={10} className="textarea-base font-mono h-64" />
      </div>
    </div>
  );
};

// ─── JSON TO CSV ─────────────────────────────────────────────
export const JsonToCsvTool: React.FC = () => {
  const [text, setText] = useState('[\n  { "name": "John", "age": 30, "city": "NYC" },\n  { "name": "Jane", "age": 25, "city": "LA" }\n]');
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState<string | null>(null);

  const csv = useMemo(() => {
    setError(null);
    if (!text.trim()) return '';
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('JSON input must be an array of objects.');
      const rows = objectsToRows(data as Record<string, unknown>[]);
      return toDelimited(rows, delimiter);
    } catch (e) {
      setError(errorMessage(e, 'Invalid JSON input.'));
      return '';
    }
  }, [text, delimiter]);

  const download = () => downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'data.csv');

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-primary" />
          <p className="section-label">JSON array of objects</p>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono h-48" />
      </div>
      <div className="flex items-center gap-2">
        <span className="section-label">Output delimiter</span>
        <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <p className="section-label">CSV output</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={csv} />
            <button onClick={download} className="btn-secondary text-[11px] px-2.5 py-1"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
        </div>
        <textarea readOnly value={csv} rows={8} className="textarea-base font-mono h-48" />
      </div>
    </div>
  );
};

// ─── TSV CONVERTER (three-way: CSV / TSV / JSON) ─────────────
const IO_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'tsv', label: 'TSV' },
  { value: 'json', label: 'JSON' },
];

export const TsvConverterTool: React.FC = () => {
  const [text, setText] = useState('name,age,city\nJohn,30,NYC\nJane,25,LA');
  const [from, setFrom] = useState('csv');
  const [to, setTo] = useState('json');
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    setError(null);
    if (!text.trim()) return '';
    try {
      let rows: string[][];
      if (from === 'json') {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('JSON input must be an array of objects.');
        rows = objectsToRows(data as Record<string, unknown>[]);
      } else {
        rows = parseDelimited(text, from === 'tsv' ? '\t' : ',');
      }
      if (to === 'json') return JSON.stringify(rowsToObjects(rows), null, 2);
      return toDelimited(rows, to === 'tsv' ? '\t' : ',');
    } catch (e) {
      setError(errorMessage(e, 'Could not convert this input.'));
      return '';
    }
  }, [text, from, to]);

  const download = () => {
    const ext = to === 'json' ? 'json' : to;
    const mime = to === 'json' ? 'application/json' : 'text/csv;charset=utf-8';
    downloadBlob(new Blob([result], { type: mime }), `converted.${ext}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          <span className="section-label">From</span>
          <Select value={from} onChange={setFrom} options={IO_FORMATS} className="w-32" />
        </label>
        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
        <label className="flex items-center gap-2 text-xs">
          <span className="section-label">To</span>
          <Select value={to} onChange={setTo} options={IO_FORMATS} className="w-32" />
        </label>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <p className="section-label">Input ({from.toUpperCase()})</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono h-48" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Output ({to.toUpperCase()})</p>
          <div className="flex items-center gap-2">
            <CopyButton text={result} />
            <button onClick={download} className="btn-secondary text-[11px] px-2.5 py-1"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
        </div>
        <textarea readOnly value={result} rows={8} className="textarea-base font-mono h-48" />
      </div>
    </div>
  );
};

// ─── DELIMITER CONVERTER ──────────────────────────────────────
export const DelimiterConverterTool: React.FC = () => {
  const [text, setText] = useState('name,age,city\nJohn,30,NYC\nJane,25,LA');
  const [from, setFrom] = useState(',');
  const [to, setTo] = useState('|');

  const result = useMemo(() => {
    if (!text.trim()) return '';
    const rows = parseDelimited(text, from);
    return toDelimited(rows, to);
  }, [text, from, to]);

  const download = () => downloadBlob(new Blob([result], { type: 'text/plain;charset=utf-8' }), 'converted.txt');

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <p className="section-label">Delimited text</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono h-48" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          <span className="section-label">Source delimiter</span>
          <Select value={from} onChange={setFrom} options={DELIMS} className="w-40" />
        </label>
        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
        <label className="flex items-center gap-2 text-xs">
          <span className="section-label">Target delimiter</span>
          <Select value={to} onChange={setTo} options={DELIMS} className="w-40" />
        </label>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Result</p>
          <div className="flex items-center gap-2">
            <CopyButton text={result} />
            <button onClick={download} className="btn-secondary text-[11px] px-2.5 py-1"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
        </div>
        <textarea readOnly value={result} rows={8} className="textarea-base font-mono h-48" />
      </div>
    </div>
  );
};

// ─── REMOVE DUPLICATE ROWS ────────────────────────────────────
export const RemoveDuplicateRowsTool: React.FC = () => {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(',');

  const { rows, removedCount } = useMemo(() => {
    if (!text.trim()) return { rows: [] as string[][], removedCount: 0 };
    const all = parseDelimited(text, delimiter);
    if (all.length === 0) return { rows: [], removedCount: 0 };
    const [header, ...body] = all;
    const seen = new Set<string>();
    const kept: string[][] = [];
    let removed = 0;
    for (const r of body) {
      const key = r.join('');
      if (seen.has(key)) { removed++; continue; }
      seen.add(key);
      kept.push(r);
    }
    return { rows: [header, ...kept], removedCount: removed };
  }, [text, delimiter]);

  const download = () => downloadBlob(new Blob([toDelimited(rows, delimiter)], { type: 'text/csv;charset=utf-8' }), 'deduplicated.csv');

  return (
    <div className="space-y-4">
      <CsvInput value={text} onChange={setText} onFile={(_, d) => setDelimiter(d)} />
      <div className="flex items-center gap-2">
        <span className="section-label">Delimiter</span>
        <Select value={delimiter} onChange={setDelimiter} options={DELIMS} className="w-40" />
      </div>
      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground"><ListX className="w-3.5 h-3.5 text-primary" /> {removedCount} duplicate row(s) removed</span>
            <button onClick={download} className="btn-primary text-[11px] px-3 py-1.5"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
          <TableView rows={rows} />
        </div>
      )}
    </div>
  );
};

// ─── MERGE CSV ────────────────────────────────────────────────
export const MergeCsvTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merged, setMerged] = useState<{ rows: string[][]; warning: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list || !list.length) return;
    const incoming = Array.from(list);
    setFiles((prev) => [...prev, ...incoming]);
    setError(null);
  };

  const merge = async () => {
    if (files.length < 2) { setError('Add at least two CSV files to merge.'); return; }
    try {
      let header: string[] | null = null;
      const allRows: string[][] = [];
      let warning: string | null = null;
      for (const f of files) {
        const text = await f.text();
        const delim = delimiterFromFileName(f.name);
        const rows = parseDelimited(text, delim);
        if (!rows.length) continue;
        const [h, ...body] = rows;
        if (header === null) {
          header = h;
        } else if (h.join('|') !== header.join('|')) {
          warning = `Headers differ across files (e.g. "${f.name}"). Rows were still merged using the first file's header order.`;
        }
        allRows.push(...body);
      }
      setMerged({ rows: [header ?? [], ...allRows], warning });
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Could not merge these files.'));
    }
  };

  const download = () => {
    if (!merged) return;
    downloadBlob(new Blob([toDelimited(merged.rows, ',')], { type: 'text/csv;charset=utf-8' }), 'merged.csv');
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <p className="section-label">CSV files to merge (same header assumed)</p>
          </div>
          <button onClick={() => inputRef.current?.click()} className="btn-secondary text-[11px] px-2.5 py-1">
            <Upload className="w-3.5 h-3.5" /> Add files
          </button>
          <input ref={inputRef} type="file" accept=".csv,.tsv,text/csv" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
        </div>
        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5 text-xs">
                <span className="truncate text-muted-foreground">{f.name}</span>
                <button onClick={() => removeFile(i)} className="p-1 text-muted-foreground hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        <button onClick={merge} disabled={files.length < 2} className="btn-primary text-xs px-4 py-2 w-full"><CopyIcon className="w-3.5 h-3.5" /> Merge Files</button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {merged && (
        <div className="space-y-2">
          {merged.warning && <p className="text-xs text-amber-500 dark:text-amber-400">{merged.warning}</p>}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{merged.rows.length - 1} total rows merged</span>
            <button onClick={download} className="btn-primary text-[11px] px-3 py-1.5"><Download className="w-3.5 h-3.5" /> Download merged CSV</button>
          </div>
          <TableView rows={merged.rows} />
        </div>
      )}
    </div>
  );
};
