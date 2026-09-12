import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Lightbox } from './Lightbox';

interface PagePreviewGridProps {
  /** Thumbnail data URLs, one per page, in page order. */
  thumbs: string[];
  /** Optional high-resolution render for the full-screen view. */
  renderFull?: (index: number) => Promise<string>;
  /** Marks pages as included in the current selection. */
  selected?: (pageIndex: number) => boolean;
  title?: string;
  className?: string;
}

/**
 * Page thumbnails for a loaded PDF. Clicking one opens it full screen.
 *
 * When a `selected` predicate is supplied, pages outside the current
 * selection are dimmed, so a range like "1-3, 7" is visible on the pages
 * themselves rather than only as text.
 */
export const PagePreviewGrid: React.FC<PagePreviewGridProps> = ({
  thumbs, renderFull, selected, title = 'Pages', className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (thumbs.length === 0) return null;

  const items = thumbs.map((src, i) => ({ src, label: `Page ${i + 1} of ${thumbs.length}` }));

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">
          {title} <span className="font-medium text-muted-foreground">{thumbs.length}</span>
        </h3>
        <p className="text-xs text-muted-foreground">Click a page to view it full screen</p>
      </div>

      <ul
        className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        role="list"
      >
        {thumbs.map((src, i) => {
          const isSelected = selected ? selected(i) : true;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View page ${i + 1} full screen`}
                className={[
                  'group relative block w-full overflow-hidden rounded-[var(--radius-sm)] border',
                  'transition-all duration-[var(--motion-fast)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-background',
                  isSelected
                    ? 'border-border hover:border-primary hover:shadow-raised'
                    : 'border-border opacity-40 hover:opacity-70',
                ].join(' ')}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="block w-full bg-white object-contain aspect-[3/4]"
                />

                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center bg-black/40 opacity-0
                             transition-opacity duration-[var(--motion-fast)] group-hover:opacity-100"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </span>

                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[10px]
                             font-semibold text-white"
                >
                  {i + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
        renderFull={renderFull}
      />
    </div>
  );
};
