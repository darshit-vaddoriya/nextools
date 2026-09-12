import React, { useEffect, useState } from 'react';
import { Check, Download, Maximize2, Package } from 'lucide-react';
import { Button } from './Button';
import { Lightbox } from './Lightbox';
import { formatBytes } from '../../lib/formats';

export interface ResultItem {
  blob: Blob;
  name: string;
}

interface SelectableResultsProps {
  items: ResultItem[];
  /** Shown above the grid, e.g. "12 images ready". */
  title: string;
  /** Base name for the zip when several items are downloaded together. */
  zipName?: string;
}

/**
 * A grid of produced images where the user picks which ones to keep.
 *
 * Everything starts selected, so "download all" is still one click, but
 * single pages can be taken on their own instead of forcing the whole set.
 * One selected item downloads directly; several are zipped so the browser
 * asks once rather than prompting per file.
 */
export const SelectableResults: React.FC<SelectableResultsProps> = ({
  items, title, zipName = 'images',
}) => {
  const [selected, setSelected] = useState<Set<number>>(() => new Set(items.map((_, i) => i)));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  /* Object URLs are created and revoked inside one effect so the two always
     pair up. Splitting them (memo to create, effect to revoke) breaks under
     StrictMode's double-invoke, which revokes the URLs still on screen. */
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const created = items.map((item) => URL.createObjectURL(item.blob));
    setUrls(created);
    return () => { created.forEach(URL.revokeObjectURL); };
  }, [items]);

  /* A fresh conversion selects everything again. */
  useEffect(() => { setSelected(new Set(items.map((_, i) => i))); }, [items]);

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const allSelected = selected.size === items.length;
  const selectedBytes = items.reduce((sum, item, i) => (selected.has(i) ? sum + item.blob.size : sum), 0);

  const saveOne = (index: number) => {
    const link = document.createElement('a');
    link.href = urls[index];
    link.download = items[index].name;
    link.click();
  };

  const downloadSelected = async () => {
    const picked = [...selected].sort((a, b) => a - b);
    if (picked.length === 0) return;
    if (picked.length === 1) { saveOne(picked[0]); return; }

    setIsZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      picked.forEach((i) => zip.file(items[i].name, items[i].blob));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${zipName}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selected.size} of {items.length} selected
            {selected.size > 0 && <> &middot; <span className="font-mono">{formatBytes(selectedBytes)}</span></>}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelected(allSelected ? new Set() : new Set(items.map((_, i) => i)))}
          className="text-sm font-semibold text-primary hover:underline rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {allSelected ? 'Clear selection' : 'Select all'}
        </button>
      </div>

      <ul className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" role="list">
        {items.map((item, i) => {
          const isSelected = selected.has(i);
          return (
            <li key={item.name} className="relative">
              {/* The tile toggles selection; preview and save are separate
                  controls so a click never does the unexpected thing. */}
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={!urls[i]}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${item.name}`}
                className={[
                  'block w-full overflow-hidden rounded-[var(--radius-sm)] border-2 transition-all',
                  'duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isSelected ? 'border-primary shadow-raised' : 'border-border opacity-55 hover:opacity-85',
                ].join(' ')}
              >
                <img src={urls[i]} alt="" loading="lazy" className="block w-full bg-white object-contain aspect-[3/4]" />
              </button>

              <span
                aria-hidden="true"
                className={[
                  'pointer-events-none absolute left-2 top-2 grid place-items-center w-5 h-5 rounded-md border-2',
                  'transition-colors duration-[var(--motion-fast)]',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-white/80 bg-black/30',
                ].join(' ')}
              >
                {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>

              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Preview ${item.name}`}
                  className="grid place-items-center w-7 h-7 rounded-md bg-black/55 text-white hover:bg-black/75
                             transition-colors duration-[var(--motion-fast)]
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => saveOne(i)}
                  aria-label={`Download ${item.name}`}
                  className="grid place-items-center w-7 h-7 rounded-md bg-black/55 text-white hover:bg-black/75
                             transition-colors duration-[var(--motion-fast)]
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground" title={item.name}>
                {item.name}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          icon={selected.size > 1 ? Package : Download}
          onClick={downloadSelected}
          loading={isZipping}
          disabled={selected.size === 0}
        >
          {selected.size === 0
            ? 'Nothing selected'
            : selected.size === 1
            ? 'Download 1 image'
            : `Download ${selected.size} as ZIP`}
        </Button>
      </div>

      <Lightbox
        items={items.map((item, i) => ({ src: urls[i], label: item.name }))}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
};
