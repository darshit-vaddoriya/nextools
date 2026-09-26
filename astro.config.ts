import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, readFileSync, copyFileSync, readdirSync, statSync, existsSync } from 'fs';
import { TOOLS } from './src/config/tools';
import { STATIC_PAGES } from './src/config/pages';
import { BLOG_POSTS, BLOG_CATEGORIES, postsInCategory } from './src/config/blog';

const SITE = 'https://nexttool.click';
const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

/** Tool routes deliberately kept out of the sitemap — see the loop below. */
const NOINDEX_TOOL_IDS = ['image-editor'];

/** sitemap.xml and llms.txt, generated from config exactly as the Vite build did. */
function writeSitemap() {
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
    // its page has no readable text, which is exactly the thin page a crawler
    // is right to discount. It stays linked and reachable, just not submitted.
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
  writeFileSync(path.join(dist, 'sitemap.xml'), xml);
  writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
  console.log(`✓ sitemap.xml — ${urls.length} URLs`);

  // llms.txt — the Markdown index AI crawlers look for. Generated from the
  // same config as the sitemap rather than hand-written, so it cannot drift.
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

  writeFileSync(path.join(dist, 'llms.txt'), llms);
  writeFileSync(path.join(root, 'public/llms.txt'), llms);
  console.log(`✓ llms.txt — ${TOOLS.length} tools, ${BLOG_POSTS.length} guides`);
}

/**
 * libarchive.js runs in a worker that fetches its .wasm from its own folder,
 * so both files must keep their names and sit side by side — which a bundler's
 * hashed asset names would break. Served from node_modules in dev and copied
 * verbatim into dist/vendor/libarchive/ on build.
 */
const VENDOR_FILES = [
  { src: 'node_modules/libarchive.js/dist/worker-bundle.js', url: '/vendor/libarchive/worker-bundle.js', type: 'text/javascript' },
  { src: 'node_modules/libarchive.js/dist/libarchive.wasm', url: '/vendor/libarchive/libarchive.wasm', type: 'application/wasm' },
];

function vendorDevPlugin() {
  return {
    name: 'vendor-files',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const hit = VENDOR_FILES.find(f => req.url?.split('?')[0] === f.url);
        if (!hit) return next();
        res.setHeader('Content-Type', hit.type);
        res.end(readFileSync(path.join(root, hit.src)));
      });
    },
  };
}

function copyVendorFiles() {
  for (const f of VENDOR_FILES) {
    const dest = path.join(dist, f.url);
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(path.join(root, f.src), dest);
  }
}

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);

/**
 * Stamps dist/sw.js with a build id and the app-shell precache list — the
 * scripts and styles the homepage loads, plus the app's own tab screens — and
 * writes offline-manifest.json for "Download for offline": every tool's code
 * and, now that each route is its own HTML file, every page too.
 */
function stampServiceWorker() {
  const toUrl = (f: string) => f.slice(dist.length).split(path.sep).join('/');
  const pageUrl = (f: string) => {
    const u = toUrl(f).replace(/\/index\.html$/, '');
    return u === '' ? '/' : u;
  };

  const home = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const shell = new Set<string>();
  for (const m of home.matchAll(/(?:src|href|component-url|renderer-url)="(\/assets\/[^"]+\.(?:js|css))"/g)) shell.add(m[1]);

  const swPath = path.join(dist, 'sw.js');
  const precache = [
    ...shell,
    '/site.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png',
  ];
  const buildId = Date.now().toString(36);
  writeFileSync(swPath, readFileSync(swPath, 'utf8')
    .replace('__BUILD_ID__', buildId)
    .replace('/*__PRECACHE__*/ []', JSON.stringify(precache)));
  console.log(`✓ sw.js — build ${buildId}, ${precache.length} shell files precached`);

  // The onnxruntime .wasm (~23 MB) is left out: it only serves the AI
  // background remover, which must fetch its model from a CDN anyway, so it
  // cannot run offline.
  const assets = [
    ...walk(path.join(dist, 'assets')).filter(f => /\.(js|mjs|css|woff2?)$/.test(f)),
    ...(existsSync(path.join(dist, 'vendor')) ? walk(path.join(dist, 'vendor')) : []),
  ].map(f => ({ url: toUrl(f), bytes: statSync(f).size }));
  const pages = walk(dist)
    .filter(f => f.endsWith(`${path.sep}index.html`))
    .map(f => ({ url: pageUrl(f), bytes: statSync(f).size }));
  const files = [...pages, ...assets];
  const bytes = files.reduce((n, f) => n + f.bytes, 0);
  writeFileSync(path.join(dist, 'offline-manifest.json'), JSON.stringify({ build: buildId, bytes, files }));
  console.log(`✓ offline-manifest.json — ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
}

export default defineConfig({
  site: SITE,
  srcDir: './src/site',
  outDir: './dist',
  // Same file layout the Puppeteer prerender produced (dist/tool/x/index.html),
  // so Netlify serves every existing URL exactly as before.
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Keep bundles under /assets, where netlify.toml sets immutable caching.
    assets: 'assets',
  },
  integrations: [
    react(),
    {
      name: 'nexttool-build',
      hooks: {
        'astro:build:done': () => {
          writeSitemap();
          copyVendorFiles();
          // Last: its offline manifest lists files the steps above write.
          stampServiceWorker();
        },
      },
    },
  ],
  vite: {
    plugins: [vendorDevPlugin()],
    worker: { format: 'es' },
    build: {
      rollupOptions: {
        // Each lucide icon is its own module, so without this the homepage
        // requests ~100 sub-kilobyte chunks. One icon chunk (cached across
        // every page) and one React chunk instead.
        output: {
          manualChunks(id: string) {
            if (id.includes('/node_modules/lucide-react/')) return 'icons';
            if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
        // mammoth's `main` entry is the Node build, which pulls in @xmldom and
        // path-is-absolute. The package ships a self-contained browser bundle;
        // point the bare specifier at it so the Word tools stay client-side.
        mammoth: path.resolve(root, './node_modules/mammoth/mammoth.browser.js'),
        // gifenc's `main` is CommonJS, whose named exports Node cannot see when
        // tool UIs are prerendered at build time. Its ESM build works everywhere.
        gifenc: path.resolve(root, './node_modules/gifenc/dist/gifenc.esm.js'),
      },
    },
  },
});
