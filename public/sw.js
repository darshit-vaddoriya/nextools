/* NextTool service worker.
 *
 * The build (pwaPlugin in vite.config.ts) rewrites the two placeholders below
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
  const have = new Set((await cache.keys()).map(r => new URL(r.url).pathname));
  const todo = manifest.files.filter(f => !have.has(f.url));
  const total = manifest.files.length;
  let done = total - todo.length;
  let failed = 0;
  await broadcast({ type: 'OFFLINE_STATUS', done, total, bytes: manifest.bytes, complete: todo.length === 0 });

  const queue = todo.slice();
  const worker = async () => {
    while (queue.length) {
      const f = queue.shift();
      try {
        // Reuse a copy the on-demand caches already hold before downloading.
        let res = await caches.match(f.url, MATCH);
        if (!res) res = await fetch(f.url);
        if (!res.ok) throw new Error(String(res.status));
        await cache.put(f.url, res);
      } catch {
        failed++;
      }
      done++;
      if (done % 5 === 0 || !queue.length) broadcast({ type: 'OFFLINE_STATUS', done, total, bytes: manifest.bytes, complete: false });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

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

/* Pages are cached by path alone, so /?source=pwa and / share an entry. */
function pageKey(url) {
  return new Request(url.origin + url.pathname);
}

async function handleNavigation(event, url) {
  const key = pageKey(url);
  try {
    const preload = event.preloadResponse ? await event.preloadResponse : undefined;
    const response = preload || await Promise.race([
      fetch(event.request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT_MS)),
    ]);
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(caches.open(PAGES_CACHE).then(c => c.put(key, copy)).then(() => trim(PAGES_CACHE, MAX_PAGES)));
    }
    return response;
  } catch {
    // Offline or too slow. Any cached HTML works as the shell: the app reads
    // the route from location.pathname and renders the right view itself.
    return (await caches.match(key, MATCH))
      || (await caches.match('/', { cacheName: SHELL_CACHE, ...MATCH }))
      || (await caches.match('/', MATCH))
      || new Response('<h1>You are offline</h1><p>Reconnect and try again.</p>', {
        status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
  }
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
