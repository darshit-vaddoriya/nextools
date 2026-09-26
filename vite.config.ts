import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync, mkdirSync, readFileSync, copyFileSync, readdirSync, statSync, existsSync } from 'fs';
import { TOOLS } from './src/config/tools';
import { STATIC_PAGES } from './src/config/pages';
import { BLOG_POSTS, BLOG_CATEGORIES, postsInCategory } from './src/config/blog';

const SITE = 'https://nexttool.click';

/** Tool routes deliberately kept out of the sitemap — see the loop below. */
const NOINDEX_TOOL_IDS = ['image-editor'];

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
        // The full-screen image editor is a canvas application, not a document:
        // prerendering it yields a page with no readable text, which is exactly
        // the thin page a crawler is right to discount. It stays linked from the
        // image category and reachable, just not submitted for indexing.
        if (NOINDEX_TOOL_IDS.includes(tool.id)) continue;
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

      // llms.txt — the Markdown index AI crawlers look for. Generated from the
      // same config as the sitemap rather than hand-written, so it cannot drift.
      // Previously absent, which meant /llms.txt fell through the SPA catch-all
      // in _redirects and answered with index.html: HTML where Markdown was
      // expected, hence "missing H1" and "no links" in Lighthouse.
      const section = (heading: string, items: { name: string; url: string; note?: string }[]) =>
        `## ${heading}\n\n${items.map(i => `- [${i.name}](${i.url})${i.note ? `: ${i.note}` : ''}`).join('\n')}\n`;

      const llms = [
        '# NextTool',
        '',
        '> Free browser-based tools for PDF, image, developer and AI tasks. Every tool runs',
        "> entirely on the visitor's own device — files are never uploaded to a server, and",
        '> no account is required.',
        '',
        ...categories.map(cat => section(
          `${cat} tools`,
          TOOLS.filter(t => t.category === cat).map(t => ({
            name: t.name, url: `${SITE}/tool/${t.id}`, note: t.description,
          })),
        )),
        section('Guides', BLOG_POSTS.map(p => ({
          name: p.title, url: `${SITE}/blog/${p.slug}`, note: p.description,
        }))),
        section('About', [
          { name: 'All tools', url: `${SITE}/all-tools` },
          ...STATIC_PAGES.map(p => ({ name: p.title, url: `${SITE}${p.path}`, note: p.description })),
        ]),
      ].join('\n');

      writeFileSync('dist/llms.txt', llms);
      writeFileSync('public/llms.txt', llms);
      console.log(`✓ llms.txt — ${TOOLS.length} tools, ${BLOG_POSTS.length} guides`);
    },
  };
}

/**
 * Stamps public/sw.js (as copied to dist/) with a build id and the app-shell
 * precache list: the entry chunk, its static imports and their CSS, i.e.
 * exactly what the homepage needs to boot offline. Tool chunks are not
 * precached (the full build is ~36 MB); the worker caches each one the first
 * time that tool is opened.
 */
const APP_SCREENS = /src\/(pages\/(Settings|MyFiles|StaticPageView|NotFound|Blog)|components\/AllToolsView)\.tsx$/;

function pwaPlugin() {
  const shell = new Set<string>();
  return {
    name: 'pwa-service-worker',
    apply: 'build' as const,
    generateBundle(_: unknown, bundle: Record<string, {
      type: string; fileName: string; isEntry?: boolean; imports?: string[]; facadeModuleId?: string | null;
      viteMetadata?: { importedCss?: Set<string> };
    }>) {
      const visit = (fileName: string) => {
        if (shell.has(fileName)) return;
        const chunk = bundle[fileName];
        if (!chunk || chunk.type !== 'chunk') return;
        shell.add(fileName);
        chunk.viteMetadata?.importedCss?.forEach(css => shell.add(css));
        chunk.imports?.forEach(visit);
      };
      Object.values(bundle).filter(c => c.type === 'chunk' && c.isEntry).forEach(c => visit(c.fileName));
      // The app's own screens are small and reachable from the tab bar, so they
      // must open offline even if never visited. Tools stay on-demand.
      Object.values(bundle)
        .filter(c => c.type === 'chunk' && APP_SCREENS.test(c.facadeModuleId ?? ''))
        .forEach(c => visit(c.fileName));
    },
    closeBundle() {
      const swPath = 'dist/sw.js';
      const src = readFileSync(swPath, 'utf8');
      const precache = [
        ...[...shell].map(f => `/${f}`),
        '/site.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png',
      ];
      const buildId = Date.now().toString(36);
      writeFileSync(swPath, src
        .replace('__BUILD_ID__', buildId)
        .replace('/*__PRECACHE__*/ []', JSON.stringify(precache)));
      console.log(`✓ sw.js — build ${buildId}, ${precache.length} shell files precached`);

      // offline-manifest.json: every file the tools need, for "Download for
      // offline" (see the CACHE_ALL handler in sw.js). The onnxruntime .wasm
      // (~23 MB) is left out: it only serves the AI background remover, which
      // must fetch its model from a CDN anyway, so it cannot run offline.
      const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
        .flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
      const files = [
        ...walk('dist/assets').filter(f => /\.(js|mjs|css|woff2?)$/.test(f)),
        // Unhashed worker files (libarchive) that tools load by fixed URL.
        ...(existsSync('dist/vendor') ? walk('dist/vendor') : []),
      ].map(f => ({ url: f.slice('dist'.length), bytes: statSync(f).size }));
      const bytes = files.reduce((n, f) => n + f.bytes, 0);
      writeFileSync('dist/offline-manifest.json', JSON.stringify({ build: buildId, bytes, files }));
      console.log(`✓ offline-manifest.json — ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
    },
  };
}

/**
 * libarchive.js runs in a worker that fetches its .wasm from its own folder,
 * so both files must keep their names and sit side by side — which a bundler's
 * hashed asset names would break. Served from node_modules in dev and copied
 * verbatim into dist/vendor/libarchive/ on build.
 */
function vendorPlugin() {
  const files = [
    { src: 'node_modules/libarchive.js/dist/worker-bundle.js', url: '/vendor/libarchive/worker-bundle.js', type: 'text/javascript' },
    { src: 'node_modules/libarchive.js/dist/libarchive.wasm', url: '/vendor/libarchive/libarchive.wasm', type: 'application/wasm' },
  ];
  return {
    name: 'vendor-files',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const hit = files.find(f => req.url?.split('?')[0] === f.url);
        if (!hit) return next();
        res.setHeader('Content-Type', hit.type);
        res.end(readFileSync(hit.src));
      });
    },
    closeBundle() {
      for (const f of files) {
        const dest = path.join('dist', f.url);
        mkdirSync(path.dirname(dest), { recursive: true });
        copyFileSync(f.src, dest);
      }
    },
  };
}

export default defineConfig({
  // pwaPlugin last: its offline manifest lists files the others write to dist/.
  plugins: [react(), sitemapPlugin(), vendorPlugin(), pwaPlugin()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // mammoth's `main` entry is the Node build, which pulls in @xmldom and
      // path-is-absolute. The package ships a self-contained browser bundle;
      // point the bare specifier at it so the Word tools stay client-side and
      // TypeScript still resolves the types next to the Node entry.
      mammoth: path.resolve(__dirname, './node_modules/mammoth/mammoth.browser.js'),
    },
  },
});
