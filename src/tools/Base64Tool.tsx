import React, { useState, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { FileDropWrapper } from '../components/FileDropWrapper';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputText, setInputText] = useState<string>('Hello World! ToolsLab is 100% Client Side.');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const isFileRef = React.useRef(false);

  const handleProcess = useCallback(() => {
    if (!inputText) {
      setOutputText('');
      setError(null);
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(
          encodeURIComponent(inputText).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        setOutputText(encoded);
        setError(null);
      } else {
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(inputText.trim()), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        setOutputText(decoded);
        setError(null);
      }
    } catch {
      setError(mode === 'encode' ? 'Encoding failed.' : 'Invalid Base64 string.');
      setOutputText('');
    }
  }, [inputText, mode]);

  React.useEffect(() => {
    if (isFileRef.current) {
      isFileRef.current = false;
      return;
    }
    handleProcess();
  }, [inputText, mode, handleProcess]);

  const handleFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      isFileRef.current = true;
      if (mode === 'encode') {
        const b64 = result.split(',')[1] ?? '';
        setInputText(`File: ${file.name} (${file.size} bytes)`);
        setOutputText(b64);
        setError(null);
      } else {
        try {
          const decoded = decodeURIComponent(
            Array.prototype.map
              .call(atob(result.split(',')[1]?.trim() ?? ''), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          setInputText(`File: ${file.name} (${file.size} bytes)`);
          setOutputText(decoded);
          setError(null);
        } catch {
          setError('Invalid Base64 string.');
          setOutputText('');
        }
      }
    };
    reader.onerror = () => setError('Could not read the selected file.');
    if (mode === 'encode') reader.readAsDataURL(file);
    else reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <FileDropWrapper
      onFiles={(files) => handleFile(files[0])}
      overlayText={mode === 'encode' ? 'Drop a file to encode' : 'Drop a file to decode'}
    >
      <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'encode'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'dark:bg-dark-hover dark:text-zinc-300 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 border'
            }`}
          >
            Encode to Base64
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'decode'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'dark:bg-dark-hover dark:text-zinc-300 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 border'
            }`}
          >
            Decode from Base64
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-3 py-1.5 text-xs dark:bg-dark-hover dark:text-zinc-300 dark:border-dark-border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 border rounded-md flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="hidden md:inline text-[11px] dark:text-zinc-600 text-slate-400">or drag &amp; drop a file anywhere</span>
          <CopyButton text={outputText} label="Copy Output" />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden flex flex-col h-[450px] shadow-xs">
          <div className="px-3.5 py-2 border-b dark:bg-dark-bg/60 dark:border-dark-border bg-slate-50 border-slate-200 text-xs font-semibold dark:text-zinc-200 text-slate-800 flex items-center justify-between">
            <span>{mode === 'encode' ? 'Plain Input Text' : 'Base64 Encoded Input'}</span>
            <span className="text-slate-400 font-mono text-[11px]">{inputText.length} chars</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string here...'}
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono dark:text-zinc-200 text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden flex flex-col h-[450px] shadow-xs">
          <div className="px-3.5 py-2 border-b dark:bg-dark-bg/60 dark:border-dark-border bg-slate-50 border-slate-200 text-xs font-semibold dark:text-zinc-200 text-slate-800 flex items-center justify-between">
            <span>{mode === 'encode' ? 'Base64 Output' : 'Decoded Plain Text'}</span>
            {outputText && (
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1 font-normal">
                <CheckCircle className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>
          <div className="flex-1 p-3.5 overflow-auto font-mono text-xs text-indigo-600 dark:text-indigo-400 whitespace-pre-wrap leading-relaxed select-text">
            {outputText || <span className="text-slate-400 font-sans">Output will update in real-time...</span>}
          </div>
        </div>
      </div>
      </div>
    </FileDropWrapper>
  );
};
