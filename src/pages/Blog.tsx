import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Newspaper, Search, Sparkles, X } from 'lucide-react';
import {
  BLOG_POSTS, BLOG_CATEGORY_META, BlogCategory, BlogPost,
  readingMinutes, formatPostDate,
} from '../config/blog';
import { AppLink } from '../components/AppLink';

interface BlogProps {
  onBack: () => void;
  onOpenPost: (slug: string) => void;
}

const CATEGORIES = Object.keys(BLOG_CATEGORY_META) as BlogCategory[];

/** Small icon + label chip identifying the post's category. */
const CategoryChip: React.FC<{ category: BlogCategory; size?: 'sm' | 'md' }> = ({ category, size = 'sm' }) => {
  const meta = BLOG_CATEGORY_META[category];
  const Icon = meta.icon;
  const box = size === 'md' ? 'w-8 h-8 rounded-[10px]' : 'w-6 h-6 rounded-lg';
  const glyph = size === 'md' ? 15 : 12;
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className={`cat-icon ${meta.bg} ${box} shrink-0`}>
        <Icon className={meta.color} style={{ width: glyph, height: glyph }} />
      </span>
      <span className={`font-semibold text-foreground truncate ${size === 'md' ? 'text-[12.5px]' : 'text-[11.5px]'}`}>
        {meta.label}
      </span>
    </span>
  );
};

const ReadTime: React.FC<{ post: BlogPost }> = ({ post }) => (
  <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground shrink-0">
    <Clock className="w-3 h-3" /> {readingMinutes(post.body)} min
  </span>
);

export const Blog: React.FC<BlogProps> = ({ onBack, onOpenPost }) => {
  const [filter, setFilter] = useState<BlogCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter(p => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.excerpt} ${p.tags.join(' ')} ${BLOG_CATEGORY_META[p.category].label}`.toLowerCase();
      return q.split(/\s+/).every(word => hay.includes(word));
    });
  }, [filter, query]);

  // The newest post only earns the big treatment on the unfiltered, unsearched index.
  const showFeatured = filter === 'all' && !query.trim();
  const featured = showFeatured ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;

  const featuredMeta = featured ? BLOG_CATEGORY_META[featured.category] : undefined;
  const FeaturedIcon = featuredMeta?.icon;

  const resetFilters = () => { setFilter('all'); setQuery(''); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <AppLink href="/" onNavigate={onBack} className="btn-ghost mb-7">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </AppLink>

      {/* Hero */}
      <header className="pb-7 border-b border-border">
        <span className="section-kicker mb-3">
          <Newspaper className="w-3 h-3 shrink-0" /> Blog
        </span>
        <h1 className="font-heading text-[32px] sm:text-[42px] font-extrabold text-foreground tracking-[-0.03em] leading-[1.08] max-w-3xl">
          Guides for working with files, safely
        </h1>
        <p className="text-[15px] text-muted-foreground mt-3.5 leading-relaxed max-w-2xl">
          Practical write-ups on file formats, compression, encoding and privacy — the reasoning
          behind the tools on this site, explained so you can make better choices whichever
          software you end up using.
        </p>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-5 text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">{BLOG_POSTS.length} articles</span>
          <span aria-hidden="true">·</span>
          <span>{CATEGORIES.length} topics</span>
          <span aria-hidden="true">·</span>
          <span>Updated {formatPostDate(BLOG_POSTS[0].published)}</span>
        </div>
      </header>

      {/* Search + category filter */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-6">
        <label className="relative w-full lg:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${BLOG_POSTS.length} articles…`}
            className="input-base w-full h-10 pl-10 pr-9 rounded-xl text-[13.5px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full
                text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 lg:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all duration-150 ${
              filter === 'all'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            All
            <span className={`ml-1.5 text-[10.5px] font-mono ${filter === 'all' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {BLOG_POSTS.length}
            </span>
          </button>
          {CATEGORIES.map(cat => {
            const count = BLOG_POSTS.filter(p => p.category === cat).length;
            if (count === 0) return null;
            const meta = BLOG_CATEGORY_META[cat];
            const Icon = meta.icon;
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12.5px] font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? '' : meta.color}`} />
                {meta.label}
                <span className={`text-[10.5px] font-mono ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured */}
      {featured && featuredMeta && FeaturedIcon && (
        <AppLink
          href={`/blog/${featured.slug}`}
          onNavigate={() => onOpenPost(featured.slug)}
          className="block w-full text-left rounded-2xl border border-border bg-card shadow-card overflow-hidden mt-6
            grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] group hover:border-primary/40 hover:shadow-pop transition-all duration-200"
        >
          <div className="p-6 sm:p-8 min-w-0 order-2 lg:order-1">
            <span className="badge badge-primary mb-4">
              <Sparkles className="w-3 h-3 shrink-0" /> Latest
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <CategoryChip category={featured.category} size="md" />
              <span className="text-[11.5px] text-muted-foreground" aria-hidden="true">·</span>
              <time dateTime={featured.published} className="text-[11.5px] text-muted-foreground">
                {formatPostDate(featured.published)}
              </time>
              <span className="text-[11.5px] text-muted-foreground" aria-hidden="true">·</span>
              <ReadTime post={featured} />
            </div>
            <h2 className="font-heading text-[22px] sm:text-[28px] font-extrabold text-foreground tracking-[-0.02em] leading-tight mt-3.5 group-hover:text-primary transition-colors">
              {featured.title}
            </h2>
            <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">
              {featured.excerpt}
            </p>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary mt-5">
              Read article
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>

          {/* Decorative panel — carries the category colour so the card reads at a glance */}
          <div className={`relative order-1 lg:order-2 min-h-[120px] lg:min-h-full ${featuredMeta.bg} flex items-center justify-center overflow-hidden`}>
            <FeaturedIcon
              className={`${featuredMeta.color} opacity-90 transition-transform duration-300 group-hover:scale-105`}
              style={{ width: 56, height: 56 }}
            />
            <div className="absolute inset-0 bg-grid opacity-[0.35] pointer-events-none" />
          </div>
        </AppLink>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {rest.map((post, idx) => (
            <AppLink
              key={post.slug}
              href={`/blog/${post.slug}`}
              onNavigate={() => onOpenPost(post.slug)}
              className="text-left rounded-2xl border border-border bg-card p-5 flex flex-col group
                hover:border-primary/40 hover:shadow-card hover:-translate-y-0.5 transition-all duration-150 fade-up"
              style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <CategoryChip category={post.category} />
                <ReadTime post={post} />
              </div>

              <h2 className="text-[15.5px] font-bold text-foreground leading-snug mt-3.5 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-2 leading-relaxed flex-1">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10.5px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-border">
                <time dateTime={post.published} className="text-[11px] text-muted-foreground">
                  {formatPostDate(post.published)}
                </time>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary">
                  Read
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </AppLink>
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <h2 className="text-[16px] font-semibold text-foreground mb-1">No articles found</h2>
          <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
            Try a different keyword, or switch to another topic.
          </p>
          <button onClick={resetFilters} className="btn-ghost mt-4">
            Show all articles
          </button>
        </div>
      )}
    </div>
  );
};
