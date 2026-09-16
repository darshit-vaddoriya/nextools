import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search, X } from 'lucide-react';
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
const INDEX_PREVIEW_COUNT = 4;

const countIn = (category: BlogCategory) => BLOG_POSTS.filter(post => post.category === category).length;

const SUBJECT_TABS: { value: BlogCategory | null; label: string; count: number; href: string }[] = [
  { value: null, label: 'Everything', count: BLOG_POSTS.length, href: '/blog' },
  ...CATEGORIES.map(category => ({
    value: category,
    label: BLOG_CATEGORY_META[category].label,
    count: countIn(category),
    href: blogTopicPath(category),
  })),
];

/**
 * A guide in the list. The whole row is the target and it lifts on hover, so a
 * long column of them reads as a stack of things to open rather than as a
 * table of contents to scan past. `showSubject` is off inside a topic hub,
 * where labelling every row "PDF" on the PDF page is just noise.
 */
const PostRow: React.FC<{ post: BlogPost; onOpen: (slug: string) => void; showSubject?: boolean }> = ({ post, onOpen, showSubject }) => {
  const meta = BLOG_CATEGORY_META[post.category];
  return <AppLink
    href={`/blog/${post.slug}`}
    onNavigate={() => onOpen(post.slug)}
    className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2 rounded-2xl border border-transparent px-4 -mx-4 py-5 transition-[background-color,border-color] hover:bg-card hover:border-border"
  >
    <h3 className="flex items-start gap-2 text-[17px] sm:text-[19px] font-bold leading-[1.3] tracking-[-.02em] text-foreground group-hover:text-primary transition-colors">
      <span>{post.title}</span>
      <ArrowUpRight className="mt-1 w-4 h-4 shrink-0 opacity-0 -translate-x-1 text-primary transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
    </h3>
    <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap">{readingMinutes(post.body)} min</span>
    <p className="col-span-2 sm:col-span-1 max-w-[58ch] text-[14.5px] leading-[1.6] text-muted-foreground">
      {post.excerpt}
    </p>
    <span className="col-span-2 sm:col-span-1 sm:col-start-1 flex flex-wrap items-center gap-x-2.5 text-[11.5px] text-muted-foreground">
      {showSubject && <><span className={`font-bold ${meta.color}`}>{meta.label}</span><span aria-hidden className="h-1 w-1 rounded-full bg-border" /></>}
      <time dateTime={post.published}>{formatPostDate(post.published)}</time>
    </span>
  </AppLink>;
};

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
  const featured = browsing ? posts[0] : undefined;
  const listed = featured ? posts.slice(1) : posts;
  const featuredTools = featured
    ? featured.relatedTools.map(id => TOOLS.find(tool => tool.id === id)).filter((tool): tool is typeof TOOLS[number] => Boolean(tool)).slice(0, 3)
    : [];

  // On the index each subject shows only its newest few and points at its hub
  // for the rest. Listing all of them made the page thousands of pixels of
  // identical rows, and left the six hub pages with nothing sending readers to
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
      ? <AppLink href="/blog" onNavigate={() => onSelectTopic(null)} className="btn-ghost mb-7 -ml-2"><ArrowLeft className="w-4 h-4" /> All guides</AppLink>
      : <AppLink href="/" onNavigate={onBack} className="btn-ghost mb-7 -ml-2"><ArrowLeft className="w-4 h-4" /> Back to tools</AppLink>}

    {/* Masthead: the claim on the left, the way in on the right. On a topic hub
        the claim is replaced by that topic's own heading, so each of the six
        URLs has a heading and a standfirst that belong only to it. */}
    <header className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end pb-7 border-b border-border">
      <div>
        <h1 className="font-heading text-[38px] sm:text-[52px] font-extrabold tracking-[-.05em] leading-[0.98] text-foreground">
          {topicMeta
            ? topicMeta.heading
            : <>Read it while the<br className="hidden sm:block" /> file is still open.</>}
        </h1>
        <p className="mt-5 max-w-[54ch] text-[15px] sm:text-[16px] leading-relaxed text-muted-foreground">
          {topicMeta
            ? topicMeta.description
            : 'Short guides on the decisions behind PDFs, images, spreadsheets and privacy. Every one of them ends somewhere you can actually do the job.'}
        </p>
      </div>
      <div className="lg:pb-1">
        <label className="relative block">
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
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          {topic
            ? <>{posts.length} guide{posts.length === 1 ? '' : 's'} in {topicMeta?.label}</>
            : <>{BLOG_POSTS.length} guides, last updated {formatPostDate(BLOG_POSTS[0].published)}</>}
        </p>
      </div>
    </header>

    <div className="mt-8 grid gap-8 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-14 lg:items-start">
      {/* Subject rail — navigation on the leading edge, counts carried as data */}
      <nav
        aria-label="Filter by subject"
        className="flex lg:flex-col gap-x-5 gap-y-0 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-[86px]"
      >
        {SUBJECT_TABS.map(({ value, label, count, href }) => {
          const active = topic === value;
          return <AppLink
            key={value ?? 'all'}
            href={href}
            onNavigate={() => onSelectTopic(value)}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 flex items-center justify-between gap-3 whitespace-nowrap py-2 text-[13.5px] transition-colors lg:border-l-2 lg:pl-3 ${
              active
                ? 'font-bold text-foreground lg:border-primary'
                : 'text-muted-foreground hover:text-foreground lg:border-transparent'
            }`}
          >
            {label}
            <span className="text-[11.5px] tabular-nums text-muted-foreground">{count}</span>
          </AppLink>;
        })}
      </nav>

      <div className="min-w-0">
        {/* Featured guide — the one loud element, and the only place that names
            the tools a guide hands you off to */}
        {featured && <AppLink
          href={`/blog/${featured.slug}`}
          onNavigate={() => onOpenPost(featured.slug)}
          className="group block rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-card hover:border-primary/40 hover:shadow-pop transition-[box-shadow,border-color] duration-200"
        >
          <span className={`text-[11.5px] font-bold ${BLOG_CATEGORY_META[featured.category].color}`}>
            Newest in {BLOG_CATEGORY_META[featured.category].label}
          </span>
          <h2 className="font-heading text-[24px] sm:text-[31px] font-extrabold tracking-[-.035em] leading-[1.12] text-foreground mt-3 max-w-[20ch] group-hover:text-primary transition-colors">
            {featured.title}
          </h2>
          <p className="mt-4 max-w-[58ch] text-[14.5px] leading-relaxed text-muted-foreground">{featured.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
            <time dateTime={featured.published}>{formatPostDate(featured.published)}</time>
            <span className="tabular-nums">{readingMinutes(featured.body)} min read</span>
          </div>
          {featuredTools.length > 0 && <p className="mt-5 pt-5 border-t border-border text-[12.5px] text-muted-foreground">
            Ends at <span className="font-bold text-foreground">{featuredTools.map(tool => tool.name).join(', ')}</span>
          </p>}
        </AppLink>}

        {/* Results: grouped by subject while browsing, flat once narrowed */}
        {grouped.length > 0 && (browsing
          ? <div className="mt-12 space-y-12">
              {grouped.map(group => {
                const meta = BLOG_CATEGORY_META[group.category];
                const Icon = meta.icon;
                const hidden = group.total - group.items.length;
                return <section key={group.category} aria-labelledby={`subject-${group.category}`}>
                  <div className="flex items-baseline justify-between gap-4 pb-3 border-b-2 border-foreground/15">
                    <h2 id={`subject-${group.category}`} className="flex items-center gap-2">
                      <span className={`cat-icon ${meta.bg} w-6 h-6 rounded-lg shrink-0 self-center`}>
                        <Icon className={meta.color} size={13} />
                      </span>
                      <AppLink
                        href={blogTopicPath(group.category)}
                        onNavigate={() => onSelectTopic(group.category)}
                        className={`text-[15px] font-extrabold tracking-[-.01em] hover:underline ${meta.color}`}
                      >
                        {meta.label}
                      </AppLink>
                    </h2>
                    <span className="text-[12px] tabular-nums text-muted-foreground">{group.total} guides</span>
                  </div>
                  {group.items.map(post => <PostRow key={post.slug} post={post} onOpen={onOpenPost} />)}
                  {hidden > 0 && <AppLink
                    href={blogTopicPath(group.category)}
                    onNavigate={() => onSelectTopic(group.category)}
                    className="group inline-flex items-center gap-1.5 border-t border-border pt-4 w-full text-[12.5px] font-bold text-primary hover:underline"
                  >
                    {hidden} more in {meta.label}
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </AppLink>}
                </section>;
              })}
            </div>
          : <div>
              <p className="pb-3 border-b-2 border-foreground/15 text-[13px] text-muted-foreground">
                {posts.length} guide{posts.length === 1 ? '' : 's'}
                {query.trim() && <> matching “<span className="text-foreground font-bold">{query.trim()}</span>”</>}
              </p>
              {listed.map(post => <PostRow key={post.slug} post={post} onOpen={onOpenPost} showSubject />)}
            </div>
        )}

        {!posts.length && <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <h2 className="text-[16px] font-extrabold text-foreground">Nothing here matches that</h2>
          <p className="mt-2 text-[13.5px] text-muted-foreground">Try a broader word, or pick a subject from the list.</p>
          <button onClick={reset} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline">
            Show all {BLOG_POSTS.length} guides <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>}
      </div>
    </div>
  </main>;
};
