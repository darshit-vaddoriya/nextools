/* NextTool service worker.
 *
 * The build (stampServiceWorker in astro.config.ts) rewrites the two placeholders below
 * with the build id and the app-shell file list. In dev this file is served
 * as-is but never registered (see src/lib/pwa.ts).
 *
 * Strategy, same-origin GET only; ads, analytics and CDN models pass straight
 * through to the network:
 *   page navigations  network first, cached copy when offline, "/" as the shell
 *   /assets/*         cache first. Vite hashes these names, so a hit is never stale
 *   everything else   stale-while-revalidate (icons, fonts, manifest)
 */
const BUILD_ID = '__BUILD_ID__';
const PRECACHE_URLS = /*__PRECACHE__*/ [];

const SHELL_CACHE = `nexttool-shell-${BUILD_ID}`;
const PAGES_CACHE = 'nexttool-pages';
const ASSETS_CACHE = 'nexttool-assets';
const STATIC_CACHE = 'nexttool-static';
/* Full copy of every tool's code, filled by "Download for offline". Kept
   apart from ASSETS_CACHE so the size cap on that one never evicts it. */
const OFFLINE_CACHE = 'nexttool-offline';
/* Entry in OFFLINE_CACHE holding the build id its pages were saved from. */
const BUILD_MARKER = '/__offline-build';
const KEEP = [SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE, STATIC_CACHE, OFFLINE_CACHE];

const MAX_PAGES = 60;
const MAX_ASSETS = 250;
const NAV_TIMEOUT_MS = 4000;

/* Never cached: crawler files and anything that must always be fresh. */
const BYPASS = /^\/(sw\.js|offline-manifest\.json|sitemap\.xml|robots\.txt|ads\.txt|llms\.txt)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(['/', ...PRECACHE_URLS])),
  );
  // No skipWaiting here: the page asks for it (the "Update" button), so an open
  // tab is never switched to new code mid-conversion.
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('nexttool-') && !KEEP.includes(n)).map(n => caches.delete(n)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch { /* unsupported */ }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  else if (type === 'CACHE_ALL') event.waitUntil(cacheAll());
  else if (type === 'CLEAR_OFFLINE') event.waitUntil(caches.delete(OFFLINE_CACHE).then(() => broadcast({ type: 'OFFLINE_STATUS', done: 0, total: 0, complete: false })));
});

async function broadcast(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(c => c.postMessage(msg));
}

/* Downloads every file in offline-manifest.json that is not cached yet, then
   drops files from older builds. Cheap to call on every launch: once complete
   it only fetches the manifest. One run at a time. */
let cacheAllRun = null;
function cacheAll() {
  if (!cacheAllRun) cacheAllRun = doCacheAll().finally(() => { cacheAllRun = null; });
  return cacheAllRun;
}

async function doCacheAll() {
  let manifest;
  try {
    manifest = await (await fetch('/offline-manifest.json', { cache: 'no-store' })).json();
  } catch {
    await broadcast({ type: 'OFFLINE_STATUS', error: 'offline' });
    return;
  }
  const cache = await caches.open(OFFLINE_CACHE);
  const wanted = new Set(manifest.files.map(f => f.url));
  wanted.add(BUILD_MARKER);
  const have = new Set((await cache.keys()).map(r => new URL(r.url).pathname));
  // Hashed assets never change under one name, so a saved copy is always
  // right. Pages keep their URL across deploys, and a page saved from an older
  // build points at scripts that no longer exist: re-fetch every page when
  // the build changes.
  const marker = await cache.match(BUILD_MARKER);
  const sameBuild = marker && (await marker.text()) === manifest.build;
  const isHashed = (u) => u.startsWith('/assets/') || u.startsWith('/vendor/');
  const todo = manifest.files.filter(f => !have.has(f.url) || (!sameBuild && !isHashed(f.url)));
  const total = manifest.files.length;
  let done = total - todo.length;
  let failed = 0;
  await broadcast({ type: 'OFFLINE_STATUS', done, total, bytes: manifest.bytes, complete: todo.length === 0 });

  const queue = todo.slice();
  const worker = async () => {
    while (queue.length) {
      const f = queue.shift();
      try {
        // Hashed files: reuse a copy the on-demand caches already hold. Pages
        // always come from the network, so they match this build.
        let res = isHashed(f.url) ? await caches.match(f.url, MATCH) : undefined;
        if (!res) res = await fetch(f.url, isHashed(f.url) ? undefined : { cache: 'no-cache' });
        if (!res.ok) throw new Error(String(res.status));
        // Pages can arrive through Netlify's /path -> /path/ redirect, and a
        // redirected response cannot answer a navigation, so store a plain copy.
        if (res.redirected) res = new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
        await cache.put(f.url, res);
      } catch {
        failed++;
      }
      done++;
      if (done % 5 === 0 || !queue.length) broadcast({ type: 'OFFLINE_STATUS', done, total, bytes: manifest.bytes, complete: false });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  if (!failed) await cache.put(BUILD_MARKER, new Response(manifest.build));

  // Prune files a newer build no longer references.
  for (const req of await cache.keys()) {
    if (!wanted.has(new URL(req.url).pathname)) await cache.delete(req);
  }
  await broadcast({ type: 'OFFLINE_STATUS', done: total - failed, total, bytes: manifest.bytes, complete: failed === 0, error: failed ? 'partial' : undefined });
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/* Pages are cached by path alone, so /?source=pwa and / share an entry, and
   without a trailing slash: the host redirects /tool/x to /tool/x/, links and
   offline-manifest.json use /tool/x, and all of them must find one copy. */
function pageKey(url) {
  const p = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : '/';
  return new Request(url.origin + p);
}

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

/* A redirected response cannot answer a navigation; keep a plain copy. */
async function plain(res) {
  return res.redirected
    ? new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers })
    : res;
}

async function handleNavigation(event, url) {
  const key = pageKey(url);
  const network = (async () => (await event.preloadResponse) || fetch(event.request))();
  network.catch(() => {}); // handled below; stops an unhandled-rejection warning
  try {
    // The timeout covers the preload too, so a weak connection falls back to
    // the saved copy instead of leaving the app on a blank screen.
    const response = await Promise.race([network, timeout(NAV_TIMEOUT_MS)]);
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(plain(copy).then(r => caches.open(PAGES_CACHE).then(c => c.put(key, r))).then(() => trim(PAGES_CACHE, MAX_PAGES)));
    }
    return response;
  } catch (err) {
    const hit = await caches.match(key, MATCH);
    if (hit) return hit;
    // Only slow, not offline: nothing saved, so keep waiting for the network.
    if (err && err.message === 'timeout') {
      try { return await network; } catch { /* went offline meanwhile */ }
    }
    return offlinePage();
  }
}

/* Shown for a page that was never opened or saved. Serving the home page
   instead would put home content under a tool's URL, since every route is
   now its own prerendered document. */
function offlinePage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f7f8fa"><title>Offline · NextTool</title>
<style>
:root{color-scheme:light dark;--bg:#f7f8fa;--fg:#101422;--mute:#5b6472;--card:#fff;--line:#e6e8ec;--pri:#2347ff}
@media (prefers-color-scheme:dark){:root{--bg:#0b0d12;--fg:#e8eaf0;--mute:#9aa3b2;--card:#12151c;--line:#262c39;--pri:#7c93ff}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--fg);
font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.c{max-width:360px;text-align:center}.i{width:64px;height:64px;margin:0 auto 18px;border-radius:20px;display:grid;place-items:center;color:#fff;
background:linear-gradient(135deg,#632be2,#db2777)}h1{font-size:20px;margin:0 0 8px}p{margin:0;color:var(--mute);font-size:14px}
.b{display:flex;gap:10px;justify-content:center;margin-top:22px}a,button{font:inherit;font-weight:700;font-size:14px;height:44px;padding:0 18px;
border-radius:12px;display:inline-flex;align-items:center;text-decoration:none;cursor:pointer}
button{background:var(--card);color:var(--fg);border:1px solid var(--line)}a{background:var(--pri);color:#fff;border:0}
</style></head><body><div class="c">
<div class="i"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h.01M8.5 16.43a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 13a10 10 0 0 1 5.24-2.76M2 2l20 20"/></svg></div>
<h1>You're offline</h1>
<p>This page isn't saved on your device yet. Pages you've opened before still work. To save every tool, go to Settings and tap “Download for offline” when you're back online.</p>
<div class="b"><button onclick="history.length>1?history.back():location.assign('/')">Go back</button><a href="/">Home</a></div>
</div></body></html>`;
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

/* ignoreVary: dev/preview servers send "Vary: Origin", and a module script is
   requested with an Origin header while the precache request was not, so a
   strict match misses a file that is sitting right there in the cache. */
const MATCH = { ignoreVary: true };

async function cacheFirst(request) {
  const hit = await caches.match(request, MATCH);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(ASSETS_CACHE).then(c => c.put(request, copy)).then(() => trim(ASSETS_CACHE, MAX_ASSETS));
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(STATIC_CACHE);
  // Falls back to the other caches, e.g. vendor worker files that only the
  // "Download for offline" copy holds.
  const hit = (await cache.match(event.request, MATCH)) || (await caches.match(event.request, MATCH));
  const network = fetch(event.request).then(response => {
    if (response.ok) cache.put(event.request, response.clone());
    return response;
  });
  if (hit) {
    event.waitUntil(network.catch(() => {}));
    return hit;
  }
  return network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (BYPASS.test(url.pathname)) return;
  // Range requests (media seeking) cannot be answered from a full cached body.
  if (request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event, url));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
