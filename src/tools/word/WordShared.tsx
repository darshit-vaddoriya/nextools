import React, { useCallback, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { DropZone } from '../image/ImageShared';

/** Extensions Word documents actually arrive with. Legacy binary .doc is not
 *  one of them: the tools here read the modern Office Open XML format only, and
 *  saying so up front is better than failing after the upload. */
export const DOCX_ACCEPT =
  '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const isDocx = (file: File) =>
  /\.docx$/i.test(file.name) ||
  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const baseName = (name: string) => name.replace(/\.[^.]+$/, '');

export const downloadBlobAs = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadText = (text: string, name: string, mime = 'text/plain;charset=utf-8') =>
  downloadBlobAs(new Blob([text], { type: mime }), name);

/** The .docx the visitor picked, with a way back to the drop zone. */
export const DocxFileBar: React.FC<{ name: string; onClear: () => void; note?: string }> = ({
  name, onClear, note,
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted border-border text-xs">
    <FileText className="w-4 h-4 text-primary shrink-0" />
    <div className="min-w-0 flex-1">
      <span className="block font-semibold text-foreground truncate">{name}</span>
      {note && <span className="block text-[11px] text-muted-foreground mt-0.5">{note}</span>}
    </div>
    <button
      onClick={onClear}
      className="text-muted-foreground hover:text-danger transition-colors shrink-0 flex items-center gap-1"
    >
      <X className="w-3.5 h-3.5" /> Change
    </button>
  </div>
);

export const DocxDropZone: React.FC<{
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
}> = ({ onFiles, multiple = false, label = 'Select or drag & drop a .docx file', hint = 'Read on your device, never uploaded' }) => (
  <DropZone onFiles={onFiles} accept={DOCX_ACCEPT} multiple={multiple} label={label} hint={hint} />
);

/**
 * Loads a .docx with mammoth and hands back both its HTML and its raw text.
 *
 * Every Word tool needs one or the other, and mammoth parses the archive once
 * either way, so the two calls are made together rather than per tool.
 */
export async function readDocx(file: File): Promise<{ html: string; text: string; messages: string[] }> {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ]);
  const messages = [...htmlResult.messages, ...textResult.messages]
    .filter(m => m.type === 'warning' || m.type === 'error')
    .map(m => m.message);
  return { html: htmlResult.value, text: textResult.value, messages: Array.from(new Set(messages)) };
}

/** Mammoth reports unsupported styles rather than failing; surfacing them is
 *  more honest than silently dropping formatting the visitor expected. */
export const ConversionNotes: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [open, setOpen] = useState(false);
  if (!messages.length) return null;
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-2.5 text-[11px]">
      <button
        onClick={() => setOpen(o => !o)}
        className="font-semibold text-warning hover:underline"
      >
        {messages.length} formatting note{messages.length > 1 ? 's' : ''} from this document
        {open ? ' — hide' : ' — show'}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 text-muted-foreground list-disc pl-4">
          {messages.slice(0, 25).map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      )}
    </div>
  );
};

/** Shared "pick a docx, run one conversion, get a result" state machine. */
export function useDocxSource() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const accept = useCallback((files: File[]) => {
    const picked = files.find(isDocx);
    if (!picked) {
      setError('Please choose a .docx file. Legacy .doc documents must be re-saved as .docx in Word first.');
      return null;
    }
    setError(null);
    setFile(picked);
    return picked;
  }, []);

  const clear = useCallback(() => { setFile(null); setError(null); }, []);

  return { file, setFile, error, setError, busy, setBusy, accept, clear };
}
