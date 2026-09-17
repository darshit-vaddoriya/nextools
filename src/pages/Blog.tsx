import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, LayoutGrid, Search, X } from 'lucide-react';
import { BLOG_POSTS, BLOG_CATEGORIES, BLOG_CATEGORY_META, BlogCategory, BlogPost, readingMinutes, formatPostDate } from '../config/blog';
import { TOOLS } from '../config/tools';
import { AppLink } from '../components/AppLink';
import { blogTopicPath } from '../utils/seo';

interface BlogProps {
  onBack: () => void;
  onOpenPost: (slug: string) => void;
  /** The topic hub being viewed, or null for the full index at /blog. */
  topic: BlogCategory | null;
  onSelectTopic: (topic: BlogCategory | null) => void;
}

const CATEGORIES = BLOG_CATEGORIES;

/** How many guides each subject shows on the index before deferring to its hub. */
const INDEX_PREVIEW_COUNT = 3;

const countIn = (category: BlogCategory) => BLOG_POSTS.filter(post => post.category === category).length;

const SUBJECT_TABS: { value: BlogCategory | null; label: string; count: number; href: string; icon: React.ElementType }[] = [
  { value: null, label: 'Everything', count: BLOG_POSTS.length, href: '/blog', icon: LayoutGrid },
  ...CATEGORIES.map(category => ({
    value: category,
    label: BLOG_CATEGORY_META[category].label,
    count: countIn(category),
    href: blogTopicPath(category),
    icon: BLOG_CATEGORY_META[category].icon,
  })),
];

/**
 * Subject badge — the icon plus the label in that subject's colour. It is the
 * only colour a card carries, which is what lets a grid of otherwise identical
 * cards still be sorted by eye.
 */
const SubjectBadge: React.FC<{ category: BlogCategory; size?: 'sm' | 'md' }> = ({ category, size = 'sm' }) => {
  const meta = BLOG_CATEGORY_META[category];
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 font-bold ${meta.color} ${size === 'md' ? 'text-[12.5px]' : 'text-[11.5px]'}`}>
    <span className={`cat-icon ${meta.bg} ${size === 'md' ? 'w-6 h-6' : 'w-5 h-5'} rounded-md shrink-0`}>
      <Icon className={meta.color} size={size === 'md' ? 13 : 11} />
    </span>
    {meta.label}
  </span>;
};

/**
 * A guide as a card in the grid. Cards are equal-height so a row reads as a
 * row; the meta line is pinned to the bottom with `mt-auto` rather than
 * floating under whatever length the excerpt happened to be.
 */
const PostCard: React.FC<{ post: BlogPost; onOpen: (slug: string) => void; showSubject?: boolean }> = ({ post, onOpen, showSubject = true }) => (
  <AppLink
    href={`/blog/${post.slug}`}
    onNavigate={() => onOpen(post.slug)}
    className="group flex h-full flex-col rounded-[18px] border border-border bg-card p-5 shadow-card transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
  >
    {showSubject && <SubjectBadge category={post.category} />}
    <h3 className={`${showSubject ? 'mt-3.5' : ''} font-heading text-[17px] font-extrabold leading-[1.22] tracking-[-.025em] text-foreground transition-colors group-hover:text-primary`}>
      {post.title}
    </h3>
    <p className="mt-2.5 text-[13.5px] leading-[1.6] text-muted-foreground line-clamp-3">{post.excerpt}</p>
    <div className="mt-auto pt-5 flex items-center gap-2 text-[11.5px] text-muted-foreground">
      <time dateTime={post.published}>{formatPostDate(post.published)}</time>
      <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
      <span className="tabular-nums">{readingMinutes(post)} min</span>
      <ArrowUpRight className="ml-auto w-4 h-4 text-primary opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
    </div>
  </AppLink>
);

export const Blog: React.FC<BlogProps> = ({ onBack, onOpenPost, topic, onSelectTopic }) => {
  const [query, setQuery] = useState('');
  const topicMeta = topic ? BLOG_CATEGORY_META[topic] : undefined;

  // The subject the reader is on lives in the URL, not in component state, so
  // that every filtered view is a page that can be linked to and indexed.
  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter(post => {
      if (topic && post.category !== topic) return false;
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')} ${BLOG_CATEGORY_META[post.category].label}`.toLowerCase();
      return !q || q.split(/\s+/).every(word => haystack.includes(word));
    });
  }, [topic, query]);

  const browsing = !topic && !query.trim();
  // The front page runs a magazine lead: one full-bleed story, two beside it.
  const lead = browsing ? posts[0] : undefined;
  const seconds = browsing ? posts.slice(1, 3) : [];
  const listed = browsing ? posts.slice(3) : posts;
  const leadTools = lead
    ? lead.relatedTools.map(id => TOOLS.find(tool => tool.id === id)).filter((tool): tool is typeof TOOLS[number] => Boolean(tool)).slice(0, 3)
    : [];

  // On the index each subject shows only its newest few and points at its hub
  // for the rest. Listing all of them made the page thousands of pixels of
  // identical cards, and left the hub pages with nothing sending readers to
  // them. Inside a hub there is no truncation, because the full list is the
  // reason you are there.
  const grouped = CATEGORIES
    .map(category => {
      const items = listed.filter(post => post.category === category);
      return {
        category,
        items: topic ? items : items.slice(0, INDEX_PREVIEW_COUNT),
        total: countIn(category),
      };
    })
    .filter(group => group.items.length > 0);

  const reset = () => { setQuery(''); onSelectTopic(null); };

  return <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-7 sm:py-10 fade-in">
    {topicMeta
      ? <AppLink href="/blog" onNavigate={() => onSelectTopic(null)} className="btn-ghost mb-6 -ml-2"><ArrowLeft className="w-4 h-4" /> All guides</AppLink>
      : <AppLink href="/" onNavigate={onBack} className="btn-ghost mb-6 -ml-2"><ArrowLeft className="w-4 h-4" /> Back to tools</AppLink>}

    {/* Masthead. On a topic hub the claim is replaced by that topic's own
        heading, so each of the hub URLs has a heading and a standfirst that
        belong only to it. */}
    <header className="relative overflow-hidden rounded-[24px] border border-border bg-card px-6 sm:px-9 py-8 sm:py-10 shadow-card">
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgb(var(--primary)/0.06),transparent_60%)]" />

      <div className="relative">
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] text-muted-foreground">
          {topicMeta ? <SubjectBadge category={topic!} size="md" /> : <span className="text-primary">The Journal</span>}
          <span aria-hidden className="h-px w-10 bg-border" />
          <span className="tabular-nums normal-case tracking-normal font-medium">
            Updated {formatPostDate(BLOG_POSTS[0].published)}
          </span>
        </p>

        <h1 className="mt-5 font-heading text-[38px] sm:text-[54px] font-extrabold tracking-[-.055em] leading-[0.96] text-foreground">
          {topicMeta
            ? topicMeta.heading
            : <>Read it while the<br className="hidden sm:block" /> file is still open.</>}
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] sm:text-[16.5px] leading-relaxed text-muted-foreground">
          {topicMeta
            ? topicMeta.description
            : 'Short guides on the decisions behind PDFs, images, spreadsheets and privacy. Every one of them ends somewhere you can actually do the job.'}
        </p>

        {/* Search sits under the standfirst with the counts beside it, so the
            masthead is one block instead of a headline floating next to a box. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="relative block w-full max-w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the journal"
              aria-label="Search the journal"
              className="input-base h-11 w-full pl-10 pr-9 rounded-xl text-[13.5px]"
            />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </label>
          <p className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
            <span><span className="font-bold text-foreground tabular-nums">{topic ? posts.length : BLOG_POSTS.length}</span> guide{(topic ? posts.length : BLOG_POSTS.length) === 1 ? '' : 's'}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
            <span className="tabular-nums">{CATEGORIES.length} subjects</span>
          </p>
        </div>
      </div>
    </header>

    {/* Subject chips — the rail moved up top so the stories get the full width */}
    <nav
      aria-label="Filter by subject"
      className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mt-6 pb-5 border-b border-border"
    >
      {SUBJECT_TABS.map(({ value, label, count, href, icon: Icon }) => {
        const active = topic === value;
        return <AppLink
          key={value ?? 'all'}
          href={href}
          onNavigate={() => onSelectTopic(value)}
          aria-current={active ? 'page' : undefined}
          className={`group shrink-0 inline-flex items-center gap-2 rounded-full border py-2 pl-3.5 pr-2 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
            active
              ? 'border-transparent bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-pop'
              // Hover has to change the fill, not just the border: a 1px tint
              // on a white pill was not readable as "this one is under the cursor".
              : 'border-border bg-card text-muted-foreground shadow-card hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-pop'
          }`}
        >
          <Icon size={14} className={active ? '' : `${value ? BLOG_CATEGORY_META[value].color : 'text-muted-foreground'} group-hover:text-primary`} />
          {label}
          {/* The count sits in its own pill so a two-digit number does not read
              as part of the label — "Images 15" was being scanned as one word. */}
          <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${
            active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
          }`}>{count}</span>
        </AppLink>;
      })}
    </nav>

    {/* Lead story plus its two runners-up. The lead is the one loud element and
        the only place that names the tools a guide hands you off to. */}
    {lead && <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-stretch">
      <AppLink
        href={`/blog/${lead.slug}`}
        onNavigate={() => onOpenPost(lead.slug)}
        className="group relative flex flex-col justify-center overflow-hidden rounded-[22px] border border-border bg-card p-7 sm:p-9 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-primary/40 hover:shadow-pop"
      >
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.07] blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">
            Latest
            <span aria-hidden className="h-1 w-1 rounded-full bg-primary/50" />
            <span className={BLOG_CATEGORY_META[lead.category].color}>{BLOG_CATEGORY_META[lead.category].label}</span>
          </span>
          <h2 className="mt-4 font-heading text-[27px] sm:text-[36px] font-extrabold tracking-[-.04em] leading-[1.06] text-foreground max-w-[20ch] transition-colors group-hover:text-primary">
            {lead.title}
          </h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">{lead.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-muted-foreground">
            <time dateTime={lead.published}>{formatPostDate(lead.published)}</time>
            <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
            <span className="tabular-nums">{readingMinutes(lead)} min read</span>
          </div>
          {leadTools.length > 0 && <p className="mt-6 pt-5 border-t border-border text-[12.5px] text-muted-foreground">
            Ends at <span className="font-bold text-foreground">{leadTools.map(tool => tool.name).join(', ')}</span>
          </p>}
        </div>
      </AppLink>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {seconds.map(post => <PostCard key={post.slug} post={post} onOpen={onOpenPost} />)}
      </div>
    </section>}

    {/* Results: sectioned by subject while browsing, one flat grid once narrowed */}
    {grouped.length > 0 && (browsing
      ? <div className="mt-14 space-y-12">
          {grouped.map(group => {
            const meta = BLOG_CATEGORY_META[group.category];
            const hidden = group.total - group.items.length;
            return <section key={group.category} aria-labelledby={`subject-${group.category}`}>
              <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-foreground/10">
                <h2 id={`subject-${group.category}`}>
                  <AppLink
                    href={blogTopicPath(group.category)}
                    onNavigate={() => onSelectTopic(group.category)}
                    className="group inline-flex items-center gap-2"
                  >
                    <SubjectBadge category={group.category} size="md" />
                    <span className="text-[12px] text-muted-foreground tabular-nums">· {group.total} guides</span>
                  </AppLink>
                </h2>
                {hidden > 0 && <AppLink
                  href={blogTopicPath(group.category)}
                  onNavigate={() => onSelectTopic(group.category)}
                  className={`group inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold hover:underline ${meta.color}`}
                >
                  {hidden} more
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </AppLink>}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(post => <PostCard key={post.slug} post={post} onOpen={onOpenPost} />)}
              </div>
            </section>;
          })}
        </div>
      : <div className="mt-8">
          <p className="pb-3 border-b-2 border-foreground/10 text-[13px] text-muted-foreground">
            {posts.length} guide{posts.length === 1 ? '' : 's'}
            {query.trim() && <> matching “<span className="text-foreground font-bold">{query.trim()}</span>”</>}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Inside a hub every row would carry the same badge, which is noise */}
            {listed.map(post => <PostCard key={post.slug} post={post} onOpen={onOpenPost} showSubject={!topic} />)}
          </div>
        </div>
    )}

    {!posts.length && <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <h2 className="text-[16px] font-extrabold text-foreground">Nothing here matches that</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">Try a broader word, or pick a subject from the list.</p>
      <button onClick={reset} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline">
        Show all {BLOG_POSTS.length} guides <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>}
  </main>;
};
