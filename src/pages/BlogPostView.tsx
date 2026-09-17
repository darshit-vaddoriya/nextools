import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronRight, ListChecks, Wrench } from 'lucide-react';
import { BlogPost, BlogCategory, BLOG_CATEGORY_META, readingMinutes, formatPostDate, relatedPosts, loadPostBody } from '../config/blog';
import { renderMarkdown } from '../utils/markdown';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES } from '../config/categories';
import { AppLink } from '../components/AppLink';
import { blogTopicPath } from '../utils/seo';

interface BlogPostViewProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onOpenPost: (slug: string) => void;
  onSelectTool: (id: string) => void;
  onSelectTopic: (topic: BlogCategory) => void;
}

/**
 * Tracks which section the reader is in so the contents rail can mark their
 * place. Picks the last heading that has crossed the top reading line.
 */
function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  useEffect(() => {
    if (!ids.length) return;
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids]);
  return active;
}

/** How far the reader has scrolled through the document, as a percentage. */
function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 0 : Math.min(100, (window.scrollY / scrollable) * 100));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return progress;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ post, onBackToBlog, onOpenPost, onSelectTool, onSelectTopic }) => {
  // The body is fetched per topic rather than bundled with the post metadata, so
  // it arrives a tick after the header does. Everything above the article text —
  // title, byline, takeaways — renders immediately from metadata.
  const [body, setBody] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setBody(null);
    loadPostBody(post).then(text => { if (!cancelled) setBody(text); });
    return () => { cancelled = true; };
  }, [post]);

  const { html, headings } = useMemo(() => renderMarkdown(body ?? ''), [body]);
  const related = useMemo(() => relatedPosts(post), [post]);
  const tools = post.relatedTools.map(id => TOOLS.find(tool => tool.id === id)).filter((tool): tool is typeof TOOLS[number] => Boolean(tool));
  const meta = BLOG_CATEGORY_META[post.category];
  const headingIds = useMemo(() => headings.map(heading => heading.id), [headings]);
  const active = useActiveHeading(headingIds);
  const progress = useReadingProgress();
  const CategoryIcon = meta.icon;

  // The first related tool is the one the article is arguing towards, so it is
  // what the closing call to action offers.
  const primaryTool = tools[0];
  const primaryConfig = primaryTool ? ALL_CATEGORIES.find(category => category.id === primaryTool.category) : undefined;
  const PrimaryIcon = primaryConfig?.icon;

  return <main className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 py-7 sm:py-10 fade-in">
    {/* How far through you are. The one piece of feedback that makes a long
        article feel finishable rather than open-ended. */}
    <div aria-hidden className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent">
      <div className="h-full bg-primary transition-[width] duration-100 ease-out" style={{ width: `${progress}%` }} />
    </div>

    {/* One grid for the whole page, three tracks wide.
        Contents on the left, the article in the middle, tools and further
        reading on the right. Everything in the middle track shares one left and
        one right edge. The third track is what lets the page use a wide screen
        without the extra pixels going into unreadably long lines. */}
    <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)_var(--aside)] lg:grid-rows-[auto_auto_auto] lg:gap-x-12 xl:gap-x-14 lg:items-start">
      <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1 min-w-0">
        <nav className="flex items-center gap-1.5 text-[12px] flex-wrap mb-6" aria-label="Breadcrumb">
          <AppLink href="/blog" onNavigate={onBackToBlog} className="text-muted-foreground hover:text-foreground transition-colors">Journal</AppLink>
          <ChevronRight className="w-3 h-3 text-border" />
          <AppLink href={blogTopicPath(post.category)} onNavigate={() => onSelectTopic(post.category)} className={`font-bold hover:underline ${meta.color}`}>
            {meta.label}
          </AppLink>
        </nav>

        <header className="pb-8 border-b border-border">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.05em] ${meta.bg} ${meta.color}`}>
            <CategoryIcon className="w-3 h-3" /> {meta.label}
          </span>
          <h1 className="font-heading text-[30px] sm:text-[38px] lg:text-[42px] font-extrabold text-foreground tracking-[-.04em] leading-[1.08] mt-4 text-balance">{post.title}</h1>
          <p className="text-[16.5px] sm:text-[18px] text-muted-foreground leading-[1.55] mt-4">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-[12.5px] text-muted-foreground">
            <time dateTime={post.published}>{formatPostDate(post.published)}</time>
            <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
            <span className="tabular-nums">{readingMinutes(post)} minute read</span>
            {post.updated && <>
              <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
              <span>Updated {formatPostDate(post.updated)}</span>
            </>}
          </div>
        </header>
      </div>

      {/* Contents rail: where you are, and where you can go and do it. On a
          phone there is no room alongside, so it follows the article instead —
          and the contents drop away, since scrolling back up is the same gesture. */}
      <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-[86px] lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto no-scrollbar">
        {headings.length > 1 && <nav aria-label="On this page" className="hidden lg:block">
          <p className="text-[11.5px] font-bold text-muted-foreground pb-2.5 border-b border-border">On this page</p>
          <ul className="mt-1">
            {headings.map(heading => {
              const current = heading.id === active;
              return <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  aria-current={current ? 'location' : undefined}
                  className={`block border-l-2 py-2 pl-3 text-[12.5px] leading-snug transition-colors ${
                    current ? 'border-primary font-bold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {heading.text}
                </a>
              </li>;
            })}
          </ul>
        </nav>}

      </div>

      {/* Third track: what to do with the article, and what to read after it. */}
      <div className="order-4 lg:order-none lg:col-start-3 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-[86px] lg:max-h-[calc(100vh-110px)] lg:overflow-y-auto no-scrollbar flex flex-col gap-8">
        {tools.length > 0 && <section>
          <p className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-muted-foreground pb-2.5 border-b border-border w-full">
            <Wrench className="w-3.5 h-3.5 text-primary" /> Do it here
          </p>
          <div className="mt-2 space-y-0.5">
            {tools.map(tool => {
              const config = ALL_CATEGORIES.find(category => category.id === tool.category);
              const Icon = config?.icon;
              return <AppLink
                key={tool.id}
                href={`/tool/${tool.id}`}
                onNavigate={() => onSelectTool(tool.id)}
                className="group flex items-center gap-2.5 rounded-lg py-2 pl-1 pr-1.5 hover:bg-muted/60 transition-colors"
              >
                <span className={`cat-icon ${config?.iconBg ?? 'bg-muted'} w-7 h-7 rounded-lg shrink-0`}>{Icon && <Icon className={config?.iconColor} size={14} />}</span>
                <span className="flex-1 text-[12.5px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{tool.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </AppLink>;
            })}
          </div>
        </section>}

        {related.length > 0 && <section aria-labelledby="related-posts">
          <h2 id="related-posts" className="text-[11.5px] font-bold text-muted-foreground pb-2.5 border-b border-border">Read next</h2>
          <div className="mt-1">
            {related.map(item => {
              const itemMeta = BLOG_CATEGORY_META[item.category];
              return <AppLink
                key={item.slug}
                href={`/blog/${item.slug}`}
                onNavigate={() => onOpenPost(item.slug)}
                className="group block border-b border-border/70 py-3 last:border-b-0"
              >
                <span className="block text-[12.5px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={`font-bold ${itemMeta.color}`}>{itemMeta.label}</span>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
                  <span className="tabular-nums">{readingMinutes(item)} min</span>
                </span>
              </AppLink>;
            })}
          </div>
        </section>}
      </div>

      <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-2 min-w-0">
        <article>
          {/* The conclusions, before the argument for them. A reader who stops
              at this box still leaves with the answers. */}
          {post.takeaways && post.takeaways.length > 0 && <aside
            aria-labelledby="takeaways-heading"
            className="mb-10 rounded-[18px] border border-border bg-muted/40 p-5 sm:p-6"
          >
            <h2 id="takeaways-heading" className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-primary">
              <ListChecks className="w-3.5 h-3.5" /> The short version
            </h2>
            <ul className="mt-3.5 space-y-2.5">
              {post.takeaways.map((point, i) => <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground">
                <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{point}</span>
              </li>)}
            </ul>
          </aside>}

          {body === null
            ? <div className="blog-prose" aria-busy="true">
                {/* Placeholder lines sized from the post's word count, so the page
                    does not jump when the body lands. */}
                {Array.from({ length: Math.min(12, Math.max(4, Math.round(post.words / 90))) }).map((_, i) => (
                  <div
                    key={i}
                    className="mb-3 h-4 animate-pulse rounded bg-outline-variant/40"
                    style={{ width: i % 4 === 3 ? '62%' : '100%' }}
                  />
                ))}
              </div>
            : <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />}
        </article>

        {/* Every guide argues towards doing something. This is where it is done,
            placed at the end of the argument rather than only in the rail. */}
        {primaryTool && <AppLink
          href={`/tool/${primaryTool.id}`}
          onNavigate={() => onSelectTool(primaryTool.id)}
          className="group mt-12 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[20px] border border-primary/25 bg-primary/[0.06] p-6 hover:border-primary/50 hover:bg-primary/[0.09] transition-colors"
        >
          <span className={`cat-icon ${primaryConfig?.iconBg ?? 'bg-muted'} w-11 h-11 rounded-[14px] shrink-0`}>
            {PrimaryIcon && <PrimaryIcon className={primaryConfig?.iconColor} size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-primary">Do it here</span>
            <span className="block mt-1 font-heading text-[19px] font-extrabold tracking-[-.02em] text-foreground">{primaryTool.name}</span>
            <span className="block mt-1 text-[13px] leading-relaxed text-muted-foreground">{primaryTool.description}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary whitespace-nowrap">
            Open <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </AppLink>}

        <footer className="mt-14 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => <span key={tag} className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">{tag}</span>)}
          </div>
        </footer>
      </div>

      <div className="order-5 lg:order-none lg:col-start-2 lg:row-start-3 min-w-0">
        <AppLink href="/blog" onNavigate={onBackToBlog} className="btn-ghost mt-10 -ml-2">
          <ArrowLeft className="w-4 h-4" /> All guides
        </AppLink>
      </div>

    </div>
  </main>;
};
