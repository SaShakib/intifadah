/**
 * Intifadah Service Worker
 * Implements:
 *  - Precaching of app shell routes on install
 *  - Cache-first for static assets (JS, CSS, fonts, images)
 *  - Network-first with offline fallback for HTML pages
 *  - Stale-while-revalidate for everything else
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE  = `intifadah-shell-${CACHE_VERSION}`;
const ASSET_CACHE  = `intifadah-assets-${CACHE_VERSION}`;
const DATA_CACHE   = `intifadah-data-${CACHE_VERSION}`;

/* Routes to precache on install */
const SHELL_URLS = [
  '/login',
  '/admin/dashboard',
  '/user/dashboard',
  '/offline',
];

/* ── Install ──────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate — clear stale caches ───────────────────────── */
self.addEventListener('activate', event => {
  const validCaches = [SHELL_CACHE, ASSET_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !validCaches.includes(n)).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ───────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET, cross-origin, and Next.js internals */
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  /* Static assets: JS, CSS, fonts, images → cache-first */
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/icon' ||
    url.pathname === '/apple-icon' ||
    /\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  /* HTML pages → network-first with offline fallback */
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  /* Everything else → stale-while-revalidate */
  event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
});

/* ── Strategies ───────────────────────────────────────────── */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match('/offline');
    return offlinePage || new Response(
      '<h1>অফলাইন</h1><p>ইন্টারনেট সংযোগ নেই</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await networkPromise || new Response('', { status: 503 });
}
