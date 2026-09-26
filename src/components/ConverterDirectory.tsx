import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, RefreshCw, Search, ShieldCheck, Star, X, Zap } from 'lucide-react';
import { TOOLS } from '../config/tools';
import {
  ALL_INPUT_FORMATS, CONVERTER_GROUPS, CONVERTER_TOOLS, CONV_FORMATS, targetsFor,
  type ConvFormat, type ConverterGroup,
} from '../config/converters';
import { formatOf } from '../lib/formats';
import { stageFiles } from '../lib/fileHandoff';
import { AppLink } from './AppLink';
import { Select } from './Select';
import { Button } from './ui/Button';
import { DropZone } from './ui/DropZone';

/**
 * The File Converters category page.
 *
 * People arrive holding a file of one format and wanting another, so the page
 * answers that question first — pick "PNG → JPG" or drop the file — and only
 * then lists every converter, grouped by family and filterable, with the
 * explanatory copy below where it does not stand between a visitor and a tool.
 */

const HUB_ID = 'file-converter';
const POPULAR = ['heic-to-jpg', 'png-to-jpg', 'mp4-to-mp3', 'webp-to-jpg', 'excel-to-csv', 'pdf-to-excel'];

/** The dedicated page for a pair, falling back to the open converter. */
function destinationFor(from: ConvFormat, to: ConvFormat): string {
  const pair = Object.entries(CONVERTER_TOOLS).find(([id, spec]) =>
    id !== HUB_ID && id !== 'audio-converter' && spec.inputs[0] === from && spec.targets?.includes(to));
  if (pair) return pair[0];
  const audio = CONVERTER_TOOLS['audio-converter'];
  if (audio.inputs.includes(from) && audio.targets?.includes(to)) return 'audio-converter';
  return HUB_ID;
}

const FormatBadge: React.FC<{ format: ConvFormat; label?: string }> = ({ format, label }) => (
  <span
    className={`inline-flex h-6 min-w-[44px] items-center justify-center rounded-md px-1.5
                font-mono text-[11px] font-bold tracking-wide ${formatOf(CONV_FORMATS[format].exts[0]).tint}`}
  >
    {label ?? CONV_FORMATS[format].label}
  </span>
);

const PairBadges: React.FC<{ id: string }> = ({ id }) => {
  const spec = CONVERTER_TOOLS[id];
  const targets = spec.targets ?? [];
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      <FormatBadge format={spec.inputs[0]} label={id === 'audio-converter' ? 'AUDIO' : undefined} />
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      <FormatBadge format={targets[0]} label={targets.map((t) => CONV_FORMATS[t].label).join(' / ')} />
    </span>
  );
};

// Input formats in family order, so the list reads images → audio → video → data.
const FROM_OPTIONS = [...ALL_INPUT_FORMATS]
  .sort((a, b) => ['image', 'audio', 'video', 'sheet', 'pdf'].indexOf(CONV_FORMATS[a].group)
    - ['image', 'audio', 'video', 'sheet', 'pdf'].indexOf(CONV_FORMATS[b].group))
  .map((f) => ({ value: f, label: CONV_FORMATS[f].label }));

const SHORT_TITLE: Record<ConverterGroup['id'], string> = {
  image: 'Images', media: 'Video & audio', data: 'Data', doc: 'Documents', font: 'Fonts', archive: 'Archives',
};

interface ConverterDirectoryProps {
  tagline?: string;
  intro?: string;
  onSelectTool: (id: string) => void;
}

export const ConverterDirectory: React.FC<ConverterDirectoryProps> = ({ tagline, intro, onSelectTool }) => {
  const byId = useMemo(() => new Map(TOOLS.map((t) => [t.id, t])), []);
  const [from, setFrom] = useState<ConvFormat>('png');
  const [to, setTo] = useState<ConvFormat>('jpg');
  const [group, setGroup] = useState<ConverterGroup['id'] | 'all'>('all');
  const [query, setQuery] = useState('');

  const toOptions = targetsFor(from);
  const target = toOptions.includes(to) ? to : toOptions[0];
  const destination = destinationFor(from, target);
  const destinationName = byId.get(destination)?.name ?? 'File Converter';

  const changeFrom = (value: string) => {
    const f = value as ConvFormat;
    setFrom(f);
    if (!targetsFor(f).includes(to)) setTo(targetsFor(f)[0]);
  };

  const openWithFiles = async (files: File[]) => {
    await stageFiles(HUB_ID, files);
    onSelectTool(HUB_ID);
  };

  const q = query.trim().toLowerCase();
  const matches = (id: string) => {
    if (!q) return true;
    const tool = byId.get(id);
    const spec = CONVERTER_TOOLS[id];
    const haystack = [tool?.name, tool?.description, ...(tool?.keywords ?? []),
      ...spec.inputs.map((f) => CONV_FORMATS[f].label), ...(spec.targets ?? []).map((f) => CONV_FORMATS[f].label)]
      .join(' ').toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word.replace(/^\./, '')));
  };
  const visibleGroups = CONVERTER_GROUPS
    .filter((g) => group === 'all' || g.id === group)
    .map((g) => ({ ...g, visible: g.tools.filter((id) => byId.has(id) && matches(id)) }))
    .filter((g) => g.visible.length > 0);

  return (
    <div className="space-y-14">
      {/* ── Hero: choose a pair, or drop the file ─────────────────── */}
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          {Object.keys(CONVERTER_TOOLS).length} converters · runs in your browser
        </span>
        <h1 className="mt-4 font-heading text-[30px] sm:text-[40px] font-extrabold leading-tight tracking-[-0.025em] text-foreground">
          File Converters
        </h1>
        {tagline && <p className="mx-auto mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground">{tagline}</p>}

        <div className="mt-8 rounded-3xl border border-border bg-card p-4 text-left shadow-card sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="text-[14px] font-semibold text-foreground">Convert</span>
              <Select value={from} options={FROM_OPTIONS} onChange={changeFrom} className="min-w-0 flex-1 sm:w-36 sm:flex-none" />
              <span className="text-[14px] font-semibold text-foreground">to</span>
              <Select
                value={target}
                options={toOptions.map((f) => ({ value: f, label: CONV_FORMATS[f].label }))}
                onChange={(v) => setTo(v as ConvFormat)}
                className="min-w-0 flex-1 sm:w-36 sm:flex-none"
              />
            </div>
            <Button icon={ArrowRight} onClick={() => onSelectTool(destination)} className="sm:ml-auto">
              Open converter
            </Button>
          </div>
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            Opens <span className="font-semibold text-foreground">{destinationName}</span>
            {destination === HUB_ID && ', which handles this pair from its format list'}.
          </p>

          <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or drop a file <span className="h-px flex-1 bg-border" />
          </div>

          <DropZone
            onFiles={openWithFiles}
            multiple
            label="Choose files"
            hint="or drop them here, the format is detected for you"
          />
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Files never leave your device</li>
          <li className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-warning" /> No queue or size tiers</li>
          <li className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 text-primary" /> Batch results in one ZIP</li>
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[12px] font-semibold text-muted-foreground">Popular:</span>
          {POPULAR.map((id) => (
            <AppLink
              key={id}
              href={`/tool/${id}`}
              onNavigate={() => onSelectTool(id)}
              className="rounded-full border border-border bg-card px-3 py-1 text-[12.5px] font-semibold text-foreground
                         transition-colors hover:border-primary/50 hover:text-primary"
            >
              {byId.get(id)?.name}
            </AppLink>
          ))}
        </div>
      </section>

      {/* ── All converters: filter, then browse by family ─────────── */}
      <section aria-labelledby="conv-all" className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="conv-all" className="font-heading text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
              All converters
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Every page accepts a batch and works offline once loaded.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div role="tablist" aria-label="Converter family" className="flex flex-wrap gap-1.5">
              {(['all', ...CONVERTER_GROUPS.map((g) => g.id)] as const).map((id) => {
                const active = group === id;
                const count = id === 'all'
                  ? CONVERTER_GROUPS.reduce((n, g) => n + g.tools.length, 0)
                  : CONVERTER_GROUPS.find((g) => g.id === id)!.tools.length;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setGroup(id)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {id === 'all' ? 'All' : SHORT_TITLE[id]} <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            <label className="relative block sm:w-60">
              <span className="sr-only">Search converters</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search, e.g. heic, mp3"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-8 text-[13px] text-foreground
                           placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          </div>
        </div>

        {visibleGroups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-[14px] font-semibold text-foreground">No converter matches “{query}”.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try the{' '}
              <AppLink href={`/tool/${HUB_ID}`} onNavigate={() => onSelectTool(HUB_ID)} className="font-semibold text-primary hover:underline">
                File Converter
              </AppLink>
              , which lists every format it can read and write.
            </p>
          </div>
        )}

        {visibleGroups.map((g) => (
          <div key={g.id} className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-bold text-foreground">
                {g.title} <span className="font-normal text-muted-foreground">· {g.blurb}</span>
              </h3>
              <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{g.visible.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {g.visible.map((id) => {
                const tool = byId.get(id)!;
                return (
                  <article
                    key={id}
                    className="group relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4
                               transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card
                               focus-within:outline focus-within:outline-2 focus-within:outline-primary/60"
                  >
                    <div className="min-w-0 flex-1">
                      <PairBadges id={id} />
                      <h4 className="mt-2.5 flex items-center gap-1.5 text-[14.5px] font-bold leading-snug text-foreground group-hover:text-primary">
                        <AppLink
                          href={`/tool/${id}`}
                          onNavigate={() => onSelectTool(id)}
                          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none"
                        >
                          {tool.name}
                        </AppLink>
                        {tool.isPopular && <Star className="h-3 w-3 shrink-0 fill-current text-warning" aria-label="Popular" />}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{tool.description}</p>
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Formats at a glance ───────────────────────────────────── */}
      <section aria-labelledby="conv-formats" className="space-y-4">
        <div>
          <h2 id="conv-formats" className="font-heading text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
            Supported formats
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Browsers can read more formats than they can write, so some formats appear only as inputs.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {CONVERTER_GROUPS.map((g, i) => (
            <div key={g.id} className={`grid gap-3 p-4 sm:grid-cols-[160px_1fr_1fr] sm:items-start ${i > 0 ? 'border-t border-border' : ''}`}>
              <span className="text-[13.5px] font-bold text-foreground">{SHORT_TITLE[g.id]}</span>
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Reads</span>
                <div className="flex flex-wrap gap-1.5">{g.reads.map((f) => <FormatBadge key={f} format={f} />)}</div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Writes</span>
                <div className="flex flex-wrap gap-1.5">{g.writes.map((f) => <FormatBadge key={f} format={f} />)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {intro && (
        <section aria-labelledby="conv-how" className="max-w-3xl space-y-3">
          <h2 id="conv-how" className="font-heading text-[19px] font-extrabold tracking-[-0.02em] text-foreground">
            How these converters work without uploading
          </h2>
          <p className="text-[14px] leading-relaxed text-muted-foreground">{intro}</p>
        </section>
      )}
    </div>
  );
};
