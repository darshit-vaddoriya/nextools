import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { TOOLS } from './src/config/tools';

const SITE = 'https://nextools.app';

function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const categories = [...new Set(TOOLS.map(t => t.category))];
      const urls: { loc: string; priority: string; changefreq: string }[] = [
        { loc: `${SITE}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${SITE}/privacy`, priority: '0.3', changefreq: 'monthly' },
      ];
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
    <changefreq>${u.changefreq}</changefreq>
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
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
