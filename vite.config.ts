import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { TOOLS } from './src/config/tools';
import { STATIC_PAGES } from './src/config/pages';
import { BLOG_POSTS, BLOG_CATEGORIES, postsInCategory } from './src/config/blog';

const SITE = 'https://nexttool.click';

function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const categories = [...new Set(TOOLS.map(t => t.category))];
      // Only pages with a real publication date carry <lastmod>. Stamping every
      // URL with the build time would tell crawlers the whole site changed on
      // each deploy, which is both untrue and quickly ignored.
      const urls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
        { loc: `${SITE}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${SITE}/all-tools`, priority: '0.9', changefreq: 'weekly' },
      ];
      // About/Contact/legal pages — crawlable and prerendered, which AdSense expects.
      for (const page of STATIC_PAGES) {
        urls.push({
          loc: `${SITE}${page.path}`,
          priority: page.id === 'about' || page.id === 'contact' ? '0.6' : '0.3',
          changefreq: 'monthly',
        });
      }
      const newestPost = BLOG_POSTS[0];
      urls.push({
        loc: `${SITE}/blog`, priority: '0.8', changefreq: 'weekly',
        lastmod: newestPost?.updated ?? newestPost?.published,
      });
      // Topic hubs, one per category that has posts. A hub's lastmod is the
      // newest post in it, since that is the only thing that changes the page.
      for (const cat of BLOG_CATEGORIES) {
        const newest = postsInCategory(cat)[0];
        urls.push({
          loc: `${SITE}/blog/topic/${cat}`, priority: '0.7', changefreq: 'weekly',
          lastmod: newest?.updated ?? newest?.published,
        });
      }
      for (const post of BLOG_POSTS) {
        urls.push({
          loc: `${SITE}/blog/${post.slug}`, priority: '0.7', changefreq: 'monthly',
          lastmod: post.updated ?? post.published,
        });
      }
      for (const cat of categories) {
        urls.push({ loc: `${SITE}/category/${cat}`, priority: '0.8', changefreq: 'weekly' });
      }
      for (const tool of TOOLS) {
        urls.push({
          loc: `${SITE}/tool/${tool.id}`,
          priority: tool.isPopular ? '0.9' : '0.7',
          changefreq: 'monthly',
        });
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
      mkdirSync('dist', { recursive: true });
      writeFileSync('dist/sitemap.xml', xml);
      mkdirSync('public', { recursive: true });
      writeFileSync('public/sitemap.xml', xml);
      console.log(`✓ sitemap.xml — ${urls.length} URLs`);
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
