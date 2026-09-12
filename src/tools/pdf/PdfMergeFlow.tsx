import React from 'react';
import { PDFDocument } from 'pdf-lib';
import { ConversionFlow } from '../../components/conversion/ConversionFlow';
import type { RunContext } from '../../lib/useConversion';

/**
 * Merge several PDFs into one, in the order shown.
 *
 * Reference implementation of the shared four-step flow: the tool supplies
 * only `run`, and `ConversionFlow` owns the stepper, file queue, progress,
 * cancellation, history and result states.
 */
async function mergePdfs(files: File[], { onProgress, signal }: RunContext) {
  if (files.length < 2) {
    throw new Error('Pick at least two PDFs to merge.');
  }

  const merged = await PDFDocument.create();

  for (let i = 0; i < files.length; i += 1) {
    // Cancellation can only take effect between files, a single
    // pdf-lib parse is not itself interruptible.
    if (signal.aborted) throw new Error('Merge cancelled.');

    const file = files[i];
    let source: PDFDocument;
    try {
      source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    } catch {
      throw new Error(`“${file.name}” isn’t a readable PDF. Remove it and try again.`);
    }

    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));

    onProgress(Math.round(((i + 1) / files.length) * 95));
  }

  const bytes = await merged.save();
  onProgress(100);

  return {
    // Copy into a fresh buffer so the Blob owns memory pdf-lib may reuse.
    blob: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
    filename: 'merged.pdf',
  };
}

export const PdfMergeFlow: React.FC = () => (
  <ConversionFlow
    toolId="pdf-merge"
    toolName="Merge PDF"
    run={mergePdfs}
    accept="application/pdf,.pdf"
    multiple
    ordered
    dropLabel="Choose PDFs to merge"
    dropHint="or drop them here, they merge in the order you set"
    actionLabel="Merge PDFs"
  />
);
