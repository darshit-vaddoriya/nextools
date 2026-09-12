/**
 * CONVERSION STATE MACHINE
 *
 * Drives the four-step flow shared by every file tool:
 *   upload → configure → converting → done | error
 *
 * A tool supplies one `run` function that does the actual work (pdf-lib,
 * canvas, jszip, …). Everything else, progress, cancellation, history,
 * object-URL cleanup, is handled here so tools stay small.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { recordJobEnd, recordJobStart } from './history';
import { takeStagedFiles } from './fileHandoff';
import type { QueuedFile } from '../components/ui/FileList';

export type ConversionPhase = 'upload' | 'configure' | 'converting' | 'done' | 'error';

export interface ConversionResult {
  blob: Blob;
  filename: string;
}

/** Handed to a tool's `run` so it can report progress and honour cancels. */
export interface RunContext {
  /** Report 0–100. Pass nothing for work of unknown length. */
  onProgress: (percent: number | null) => void;
  /** Aborts when the user cancels; long loops should check this. */
  signal: AbortSignal;
}

export interface UseConversionOptions {
  toolId: string;
  toolName: string;
  /** Does the work. Throw to surface an error; return the output file. */
  run: (files: File[], ctx: RunContext) => Promise<ConversionResult>;
  /** Skip the options step for tools with nothing to configure. */
  skipConfigure?: boolean;
}

let seq = 0;
const nextId = () => `f${Date.now().toString(36)}${(seq += 1).toString(36)}`;

export function useConversion({ toolId, toolName, run, skipConfigure = false }: UseConversionOptions) {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [phase, setPhase] = useState<ConversionPhase>('upload');
  const [progress, setProgress] = useState<number | null>(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  // Tracked so we can revoke on unmount, object URLs leak otherwise.
  const objectUrlRef = useRef<string>('');

  /* Pick up a file handed over from the homepage drop zone, so choosing a
     tool after dropping a file doesn't ask for the same file twice. */
  useEffect(() => {
    const staged = takeStagedFiles(toolId);
    if (staged.length === 0) return;
    setFiles(staged.map((file) => ({ id: nextId(), file })));
    setPhase('configure');
  }, [toolId]);

  /* Tick the elapsed clock while work is in flight, for the ETA readout. */
  useEffect(() => {
    if (phase !== 'converting') return;
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  /* Release the download URL when the component goes away. */
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    abortRef.current?.abort();
  }, []);

  const addFiles = useCallback((incoming: File[], { multiple = true } = {}) => {
    setError('');
    setFiles((prev) => {
      const added = incoming.map((file) => ({ id: nextId(), file }));
      return multiple ? [...prev, ...added] : added.slice(-1);
    });
    setPhase(skipConfigure ? 'configure' : 'configure');
  }, [skipConfigure]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) setPhase('upload');
      return next;
    });
  }, []);

  const reorderFiles = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const start = useCallback(async () => {
    if (files.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const begun = Date.now();
    setStartedAt(begun);
    setElapsedMs(0);
    setProgress(0);
    setError('');
    setPhase('converting');

    const jobId = recordJobStart({
      toolId,
      toolName,
      fileNames: files.map((f) => f.file.name),
      totalBytes: files.reduce((sum, f) => sum + f.file.size, 0),
    });

    try {
      const output = await run(
        files.map((f) => f.file),
        { onProgress: setProgress, signal: controller.signal },
      );

      // The user cancelled while the tool was still finishing up.
      if (controller.signal.aborted) return;

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(output.blob);

      setResult(output);
      setProgress(100);
      setPhase('done');
      recordJobEnd(jobId, { status: 'done' });
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'The conversion stopped unexpectedly.';
      setError(message);
      setPhase('error');
      recordJobEnd(jobId, { status: 'failed', error: message });
    } finally {
      abortRef.current = null;
    }
  }, [files, run, toolId, toolName]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase('configure');
    setProgress(0);
  }, []);

  const retry = useCallback(() => {
    setError('');
    setPhase('configure');
  }, []);

  /** Back to an empty upload step, keeping the tool open. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }
    setFiles([]);
    setResult(null);
    setError('');
    setProgress(0);
    setElapsedMs(0);
    setPhase('upload');
  }, []);

  /** Rough time remaining, derived from observed throughput. */
  const etaMs = (() => {
    if (phase !== 'converting' || progress === null || progress <= 2) return null;
    return Math.max(0, Math.round((elapsedMs / progress) * (100 - progress)));
  })();

  const downloadUrl = objectUrlRef.current;

  /** Index into the Upload → Options → Convert → Download rail. */
  const stepIndex = { upload: 0, configure: 1, converting: 2, done: 3, error: 2 }[phase];

  return {
    files, phase, progress, result, error, elapsedMs, etaMs, downloadUrl, stepIndex,
    addFiles, removeFile, reorderFiles, start, cancel, retry, reset,
  };
}
