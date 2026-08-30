import React, { useState } from 'react';
import JSZip from 'jszip';
import { Archive, Download, FileArchive, FolderArchive, Trash2 } from 'lucide-react';
import { DropZone, ErrorNotice } from '../image/ImageShared';
import { downloadBlob, formatBytes } from '../image/ImageUtils';
import { errorMessage } from '../../utils/errorMessage';

interface ZipEntry {
  name: string;
  size: number;
  compressedSize: number;
  dir: boolean;
  file: JSZip.JSZipObject;
}

// ─── ZIP EXTRACTOR ───────────────────────────────────────────
export const ZipExtractorTool: React.FC = () => {
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [archiveName, setArchiveName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setBusy('loading');
    try {
      const zip = await JSZip.loadAsync(file);
      const list: ZipEntry[] = [];
      zip.forEach((_, entry) => {
        list.push({
          name: entry.name,
          size: (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0,
          compressedSize: (entry as unknown as { _data?: { compressedSize?: number } })._data?.compressedSize ?? 0,
          dir: entry.dir,
          file: entry,
        });
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setEntries(list);
      setArchiveName(file.name);
    } catch (e) {
      setError(errorMessage(e, 'Could not read this ZIP file. It may be corrupted or unsupported.'));
    } finally {
      setBusy(null);
    }
  };

  const downloadOne = async (entry: ZipEntry) => {
    if (entry.dir) return;
    setBusy(entry.name);
    try {
      const blob = await entry.file.async('blob');
      downloadBlob(blob, entry.name.split('/').pop() || entry.name);
    } catch (e) {
      setError(errorMessage(e, `Could not extract "${entry.name}".`));
    } finally {
      setBusy(null);
    }
  };

  const downloadAll = async () => {
    setBusy('all');
    setError(null);
    try {
      const files = entries.filter((e) => !e.dir);
      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        const blob = await entry.file.async('blob');
        downloadBlob(blob, entry.name.split('/').pop() || entry.name);
        if (i < files.length - 1) await new Promise((r) => setTimeout(r, 350));
      }
    } catch (e) {
      setError(errorMessage(e, 'Could not extract all files.'));
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setEntries([]);
    setArchiveName('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <DropZone onFiles={handleFiles} accept=".zip,application/zip,application/x-zip-compressed" label="Select or drag & drop a .zip file" hint="Extracted entirely on your device" />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileArchive className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">{archiveName}</span>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0">{entries.filter(e => !e.dir).length} files</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={downloadAll} disabled={busy !== null} className="btn-secondary text-[11px] px-3 py-1.5">
                <Download className="w-3.5 h-3.5" /> {busy === 'all' ? 'Downloading…' : 'Download All'}
              </button>
              <button onClick={reset} className="btn-ghost text-[11px] px-3 py-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-auto space-y-1.5">
            {entries.map((e) => (
              <div key={e.name} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                <span className="truncate font-mono text-muted-foreground">{e.name}{e.dir ? '/' : ''}</span>
                {!e.dir && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground">{formatBytes(e.size)} ({formatBytes(e.compressedSize)} zipped)</span>
                    <button onClick={() => downloadOne(e)} disabled={busy !== null} className="btn-secondary text-[10px] px-2.5 py-1">
                      {busy === e.name ? '…' : <Download className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};

// ─── ZIP CREATOR ─────────────────────────────────────────────
export const ZipCreatorTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState('archive.zip');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => setFiles((prev) => [...prev, ...incoming]);
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const createZip = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const zip = new JSZip();
      for (const f of files) zip.file(f.name, f);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const name = zipName.trim() || 'archive.zip';
      downloadBlob(blob, name.endsWith('.zip') ? name : `${name}.zip`);
    } catch (e) {
      setError(errorMessage(e, 'Could not create the ZIP file.'));
    } finally {
      setBusy(false);
    }
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-4">
      <DropZone onFiles={addFiles} multiple label="Select or drag & drop files to zip" hint="Add as many files as you need" />
      {files.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-muted-foreground">{files.length} file(s) · {formatBytes(totalSize)}</span>
            <label className="flex items-center gap-2 text-xs">
              <span className="section-label">Zip name</span>
              <input value={zipName} onChange={(e) => setZipName(e.target.value)} className="input-base font-mono w-40" />
            </label>
          </div>
          <div className="max-h-56 overflow-auto space-y-1.5">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                <span className="truncate text-muted-foreground">{f.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground">{formatBytes(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={createZip} disabled={busy} className="btn-primary w-full py-2.5 text-xs">
            <Archive className="w-4 h-4" /> {busy ? 'Zipping…' : 'Create & Download ZIP'}
          </button>
        </div>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};

// ─── BATCH ZIP (one zip per input file, bundled into one outer zip) ──
export const BatchZipTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => setFiles((prev) => [...prev, ...incoming]);
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const outer = new JSZip();
      for (const f of files) {
        const inner = new JSZip();
        inner.file(f.name, f);
        const innerBlob = await inner.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        const baseName = f.name.replace(/\.[^.]+$/, '');
        outer.file(`${baseName}.zip`, innerBlob);
      }
      const outerBlob = await outer.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      downloadBlob(outerBlob, 'batch-zips.zip');
    } catch (e) {
      setError(errorMessage(e, 'Could not batch-zip these files.'));
    } finally {
      setBusy(false);
    }
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted p-3 text-[11px] text-muted-foreground flex items-start gap-2">
        <FolderArchive className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>Each file you add is zipped <strong>individually</strong>, then all of those little .zip files are bundled into a single outer <code>batch-zips.zip</code> for one convenient download.</span>
      </div>
      <DropZone onFiles={addFiles} multiple label="Select or drag & drop files" hint="Each file becomes its own .zip" />
      {files.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <span className="text-xs font-mono text-muted-foreground">{files.length} file(s) · {formatBytes(totalSize)} · will produce {files.length} inner zips</span>
          <div className="max-h-56 overflow-auto space-y-1.5">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                <span className="truncate text-muted-foreground">{f.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground">{formatBytes(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={run} disabled={busy} className="btn-primary w-full py-2.5 text-xs">
            <Archive className="w-4 h-4" /> {busy ? 'Zipping…' : 'Create Batch ZIPs & Download'}
          </button>
        </div>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};
