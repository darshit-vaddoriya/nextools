import React, { useMemo } from 'react';
import { ArrowLeft, Clock, ChevronRight, ArrowUpRight, Wrench, List } from 'lucide-react';
import {
  BlogPost, BLOG_CATEGORY_LABELS, readingMinutes, formatPostDate, relatedPosts,
} from '../config/blog';
import { renderMarkdown } from '../utils/markdown';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES } from '../config/categories';
import { AppLink } from '../components/AppLink';

interface BlogPostViewProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onOpenPost: (slug: string) => void;
  onSelectTool: (id: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post, onBackToBlog, onOpenPost, onSelectTool,
}) => {
  const { html, headings } = useMemo(() => renderMarkdown(post.body), [post.body]);
  const related = useMemo(() => relatedPosts(post), [post]);
  const tools = post.relatedTools
    .map(id => TOOLS.find(t => t.id === id))
    .filter((t): t is typeof TOOLS[number] => Boolean(t));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] flex-wrap mb-6" aria-label="Breadcrumb">
        <AppLink href="/blog" onNavigate={onBackToBlog} className="text-muted-foreground hover:text-foreground transition-colors">
          Blog
        </AppLink>
        <ChevronRight className="w-3 h-3 text-border" />
        <span className="text-foreground font-medium truncate max-w-[420px]">{post.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Article */}
        <article className="flex-1 min-w-0 max-w-[760px]">
          <header className="pb-7 mb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
              <span className="font-semibold text-primary">{BLOG_CATEGORY_LABELS[post.category]}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published}>{formatPostDate(post.published)}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readingMinutes(post.body)} min read
              </span>
            </div>

            <h1 className="font-heading text-[28px] sm:text-[38px] font-extrabold text-foreground tracking-[-0.03em] leading-[1.12] mt-3.5">
              {post.title}
            </h1>
            <p className="text-[15.5px] text-muted-foreground mt-4 leading-relaxed">
              {post.excerpt}
            </p>
            {post.updated && (
              <p className="text-[11.5px] text-muted-foreground mt-4">
                Updated {formatPostDate(post.updated)}
              </p>
            )}
          </header>

          {/* Body, authored in this repo, so the HTML is ours, not user input */}
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-10 pt-6 border-t border-border">
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-10" aria-labelledby="related-posts">
              <h2 id="related-posts" className="text-[17px] font-bold text-foreground mb-4">
                Keep reading
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map(r => (
                  <AppLink
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    onNavigate={() => onOpenPost(r.slug)}
                    className="block text-left rounded-xl border border-border bg-card p-4 group hover:border-primary/40 transition-all duration-150"
                  >
                    <span className="text-[11px] font-semibold text-primary">
                      {BLOG_CATEGORY_LABELS[r.category]}
                    </span>
                    <p className="text-[13px] font-semibold text-foreground leading-snug mt-1.5 group-hover:text-primary transition-colors">
                      {r.title}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" /> {readingMinutes(r.body)} min
                    </span>
                  </AppLink>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-[290px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-[82px] lg:self-start">
          {headings.length > 2 && (
            <nav className="rounded-2xl border border-border bg-card p-5" aria-label="On this page">
              <span className="section-kicker mb-3">
                <List className="w-3 h-3 shrink-0" /> On this page
              </span>
              <ul className="space-y-2 mt-3">
                {headings.map(h => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-[12.5px] text-muted-foreground hover:text-primary transition-colors leading-snug block"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {tools.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <span className="section-kicker mb-3">
                <Wrench className="w-3 h-3 shrink-0" /> Tools in this article
              </span>
              <div className="space-y-1 mt-3">
                {tools.map(tool => {
                  const conf = ALL_CATEGORIES.find(c => c.id === tool.category);
                  const Icon = conf?.icon;
                  return (
                    <AppLink
                      key={tool.id}
                      href={`/tool/${tool.id}`}
                      onNavigate={() => onSelectTool(tool.id)}
                      className="group w-full flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-left hover:bg-muted/60 transition-colors"
                    >
                      {Icon && (
                        <div className={`cat-icon ${conf?.iconBg} w-8 h-8 rounded-lg shrink-0`}>
                          <Icon className={conf?.iconColor} style={{ width: 15, height: 15 }} />
                        </div>
                      )}
                      <span className="text-[12.5px] font-semibold text-foreground leading-snug flex-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </AppLink>
                  );
                })}
              </div>
            </div>
          )}

          <AppLink href="/blog" onNavigate={onBackToBlog} className="btn-ghost self-start">
            <ArrowLeft className="w-4 h-4" /> All articles
          </AppLink>
        </aside>
      </div>
    </div>
  );
};
