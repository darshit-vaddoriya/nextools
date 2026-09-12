import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, FileArchive, Loader2, Maximize2, Music } from 'lucide-react';
import { Lightbox } from './Lightbox';
import { formatOf } from '../../lib/formats';

interface ResultPreviewThumbProps {
  blob: Blob;
  filename: string;
  className?: string;
}

/** Pages beyond this render lazily only if opened, keeps a 300-page PDF
 *  from stalling the tab the moment the result appears. */
const EAGER_PREVIEW_PAGES = 20;

async function loadPdfjs() {
  const pdfjsModule = await import('pdfjs-dist');
  pdfjsModule.GlobalWorkerOptions.workerSrc =
    new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  return pdfjsModule;
}

async function renderPdfPage(
  doc: Awaited<ReturnType<Awaited<ReturnType<typeof loadPdfjs>>['getDocument']>['promise']>,
  pageNumber: number,
  scale: number,
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * A result's identity, shown before download: an image thumbnail, the full
 * PDF (every page, browsable full screen), or a labelled icon for formats
 * that have no visual page (audio, archives, plain files).
 *
 * PDFs also get an "open in new tab" action, the browser's own PDF viewer
 * handles arbitrarily long documents better than re-rendering every page as
 * an image, so it's offered alongside the in-app page browser rather than
 * instead of it.
 */
export const ResultPreviewThumb: React.FC<ResultPreviewThumbProps> = ({ blob, filename, className = '' }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [pdfThumb, setPdfThumb] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [pageThumbs, setPageThumbs] = useState<string[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const pdfUrlRef = useRef('');

  const meta = formatOf(filename);
  const isImage = blob.type.startsWith('image/') || meta.kind === 'image';
  const isPdf = blob.type === 'application/pdf' || meta.kind === 'pdf';
  const isAudio = blob.type.startsWith('audio/') || meta.kind === 'audio';
  const isArchive = meta.kind === 'archive';

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob, isImage]);

  // A stable object URL for "open in new tab", created once per result and
  // revoked when the result changes or the tool unmounts.
  useEffect(() => {
    if (!isPdf) return;
    const url = URL.createObjectURL(blob);
    pdfUrlRef.current = url;
    return () => { URL.revokeObjectURL(url); pdfUrlRef.current = ''; };
  }, [blob, isPdf]);

  // The cover thumbnail (page 1) plus enough of the document to browse
  // full screen without a second click.
  useEffect(() => {
    if (!isPdf) return;
    let cancelled = false;
    setPdfThumb('');
    setPageThumbs([]);
    setPageCount(0);

    (async () => {
      const pdfjsModule = await loadPdfjs();
      const data = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjsModule.getDocument({ data }).promise;
      if (cancelled) return;
      setPageCount(doc.numPages);

      const first = await renderPdfPage(doc, 1, 1);
      if (cancelled) return;
      setPdfThumb(first);

      const eagerCount = Math.min(doc.numPages, EAGER_PREVIEW_PAGES);
      const rest = await Promise.all(
        Array.from({ length: eagerCount - 1 }, (_, i) => renderPdfPage(doc, i + 2, 1)),
      );
      if (cancelled) return;
      setPageThumbs([first, ...rest]);
    })().catch(() => { /* fall back to the icon card */ });

    return () => { cancelled = true; };
  }, [blob, isPdf]);

  /** Render a later page on demand when the reader scrolls past what was pre-loaded. */
  const renderFullPage = useCallback(async (index: number) => {
    const pdfjsModule = await loadPdfjs();
    const data = new Uint8Array(await blob.arrayBuffer());
    const doc = await pdfjsModule.getDocument({ data }).promise;
    return renderPdfPage(doc, index + 1, 2);
  }, [blob]);

  const openInNewTab = () => {
    if (pdfUrlRef.current) window.open(pdfUrlRef.current, '_blank', 'noopener');
  };

  const openFullscreen = async () => {
    setLightboxIndex(0);
    if (pageThumbs.length >= pageCount || isLoadingPages) return;
    // More pages than the eager batch, fill in the rest before browsing.
    setIsLoadingPages(true);
    try {
      const pdfjsModule = await loadPdfjs();
      const data = new Uint8Array(await blob.arrayBuffer());
      const doc = await pdfjsModule.getDocument({ data }).promise;
      const remaining = await Promise.all(
        Array.from({ length: pageCount - pageThumbs.length }, (_, i) => renderPdfPage(doc, pageThumbs.length + i + 1, 1)),
      );
      setPageThumbs((prev) => [...prev, ...remaining]);
    } catch {
      // Keep whatever pages loaded so far, partial browsing beats none.
    } finally {
      setIsLoadingPages(false);
    }
  };

  if (isImage && imageUrl) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`View ${filename} full screen`}
          className={`group relative block w-full overflow-hidden rounded-[var(--radius-md)] border border-border
                     bg-surface-container-low transition-colors duration-[var(--motion-fast)]
                     hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        >
          <img src={imageUrl} alt="" className="block max-h-[22rem] w-full object-contain" />
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-black/35 opacity-0
                       transition-opacity duration-[var(--motion-fast)] group-hover:opacity-100"
          >
            <Maximize2 className="w-6 h-6 text-white" />
          </span>
        </button>
        <Lightbox
          items={[{ src: imageUrl, label: filename }]}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      </>
    );
  }

  if (isPdf) {
    const items = (pageThumbs.length ? pageThumbs : [pdfThumb]).map((src, i) => ({
      src,
      label: pageCount > 1 ? `${filename} (page ${i + 1} of ${pageCount})` : filename,
    }));

    return (
      <>
        <div className={`group relative w-full ${className}`}>
          <button
            type="button"
            onClick={openFullscreen}
            disabled={!pdfThumb}
            aria-label={pdfThumb
              ? `Browse all ${pageCount} pages of ${filename} full screen`
              : `${filename} preview loading`}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]
                       border border-border bg-surface-container-low py-6 transition-colors duration-[var(--motion-fast)]
                       group-hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                       focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none"
          >
            {pdfThumb ? (
              <>
                <img src={pdfThumb} alt="" className="max-h-[18rem] rounded-sm shadow-raised" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center bg-black/35 opacity-0
                             transition-opacity duration-[var(--motion-fast)] group-hover:opacity-100"
                >
                  <Maximize2 className="w-6 h-6 text-white" />
                </span>
                {pageCount > 1 && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60
                                   px-2.5 py-1 text-xs font-semibold text-white">
                    {pageCount} pages
                  </span>
                )}
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">Preparing preview…</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openInNewTab}
            disabled={!pdfThumb}
            aria-label={`Open ${filename} in a new tab`}
            title="Open in new tab"
            className="absolute right-2 top-2 grid place-items-center w-8 h-8 rounded-[var(--radius-sm)]
                       bg-black/45 text-white opacity-0 transition-opacity duration-[var(--motion-fast)]
                       group-hover:opacity-100 hover:bg-black/65 focus-visible:opacity-100
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                       disabled:pointer-events-none"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {pdfThumb && (
          <Lightbox
            items={items}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
            renderFull={pageCount > 1 ? renderFullPage : undefined}
          />
        )}
      </>
    );
  }

  if (isAudio) {
    const url = URL.createObjectURL(blob);
    return (
      <div className={`flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-border
                       bg-surface-container-low px-4 py-6 ${className}`}>
        <span className="grid place-items-center w-12 h-12 rounded-full bg-tertiary/10 text-tertiary">
          <Music className="w-6 h-6" aria-hidden="true" />
        </span>
        <audio controls src={url} className="w-full max-w-xs" />
      </div>
    );
  }

  // No page or waveform to show, an icon card states what it is instead.
  return (
    <div className={`flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-border
                     bg-surface-container-low px-4 py-8 ${className}`}>
      <span className={`grid place-items-center w-14 h-14 rounded-[var(--radius-md)] ${meta.tint}`}>
        {isArchive ? <FileArchive className="w-7 h-7" aria-hidden="true" /> : <meta.icon className="w-7 h-7" aria-hidden="true" />}
      </span>
      <span className="text-xs font-semibold text-muted-foreground">{meta.label} file</span>
    </div>
  );
};
