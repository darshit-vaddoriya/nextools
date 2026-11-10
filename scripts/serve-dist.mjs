// Serves dist/ the way Netlify does, for checking a production build locally.
//
// Pages are built as dist/tool/x.html and published as /tool/x, so a plain
// static server (python -m http.server) answers every internal link with a
// 404. Netlify resolves /tool/x to tool/x.html; this does the same, and
// answers unknown paths with 404.html and a 404 status.
//
// Usage: node scripts/serve-dist.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.argv[2] ?? 4190);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json',
};

async function isFile(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

async function resolve(pathname) {
  const clean = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = path.join(dist, clean);
  if (!base.startsWith(dist)) return null;
  const trimmed = base.replace(/[/\\]+$/, '');
  for (const candidate of [base, `${trimmed}.html`, path.join(base, 'index.html')]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  const file = await resolve(pathname);
  const status = file ? 200 : 404;
  const body = await readFile(file ?? path.join(dist, '404.html'));
  const type = TYPES[path.extname(file ?? '.html')] ?? 'application/octet-stream';
  const noCache = pathname === '/sw.js' || type.startsWith('text/html');
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=0' });
  res.end(body);
}).listen(port, () => console.log(`dist/ served like Netlify at http://localhost:${port}`));
