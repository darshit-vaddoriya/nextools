// Prerenders every route to static HTML after `vite build`, so crawlers
// (and users with JS disabled/slow) get real content + correct <title>/
// meta tags/JSON-LD without waiting for the SPA bundle to execute.
// The same JS bundle still loads and hydrates the page normally on visit.
//
// Run: node scripts/prerender.mjs   (after `vite build`, before deploy)
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const PORT = 4173;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.xml': 'application/xml',
};

function serveStatic() {
  return createServer(async (req, res) => {
    let filePath = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
    if (!existsSync(filePath) || filePath.endsWith('/')) filePath = path.join(dist, 'index.html');
    try {
      const data = await readFile(filePath);
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      res.end(data);
    } catch {
      const fallback = await readFile(path.join(dist, 'index.html'));
      res.setHeader('Content-Type', 'text/html');
      res.end(fallback);
    }
  });
}

async function main() {
  if (!existsSync(dist)) {
    console.error('dist/ not found — run `vite build` first');
    process.exit(1);
  }

  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  // Host-agnostic on purpose — the sitemap's domain is set in vite.config.ts,
  // and a hardcoded host here would silently yield zero routes if it changes.
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => new URL(m[1]).pathname);

  const server = serveStatic();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`static server up on :${PORT}, prerendering ${routes.length} routes...`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  let done = 0;
  const incomplete = [];
  for (const route of routes) {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });

    // Wait for the page's real heading, not just a title — index.html ships a
    // static <title>, so a title check passes instantly and snapshots the page
    // before a lazily-loaded tool has mounted its content.
    await page.waitForFunction(
      () => document.querySelector('h1') !== null,
      { timeout: 15000 },
    ).catch(() => { incomplete.push(route); });

    const html = await page.content();

    const outDir = route === '/' ? dist : path.join(dist, route);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), html);
    done++;
    if (done % 10 === 0 || done === routes.length) {
      console.log(`  ${done}/${routes.length} rendered`);
    }
  }

  await browser.close();
  server.close();

  // Surface partial snapshots loudly — a page captured before it rendered ships
  // to search engines with no heading and almost no content.
  if (incomplete.length) {
    console.warn(`\n⚠ ${incomplete.length} route(s) had no <h1> before the timeout:`);
    for (const route of incomplete) console.warn(`    ${route}`);
  }
  console.log('✓ prerender complete');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
