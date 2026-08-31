/**
 * Intifadah Service Worker
 * Implements:
 *  - Precaching of app shell routes on install
 *  - Cache-first for static assets (JS, CSS, fonts, images)
 *  - Network-first with offline fallback for HTML pages
 *  - Stale-while-revalidate for everything else
 */

const CACHE_VERSION = 'v4';
const SHELL_CACHE  = `intifadah-shell-${CACHE_VERSION}`;
const ASSET_CACHE  = `intifadah-assets-${CACHE_VERSION}`;
const DATA_CACHE   = `intifadah-data-${CACHE_VERSION}`;

/* Routes to precache on install */
const SHELL_URLS = [
  '/offline.html',
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

  /* React Server Component payloads must never be cached across deployments. */
  if (
    request.headers.has('RSC') ||
    request.headers.has('Next-Router-State-Tree') ||
    url.searchParams.has('_rsc')
  ) return;

  /* Only immutable Next static assets are cacheable. */
  if (url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/')) return;

  /* Static assets: JS, CSS, fonts, images → cache-first */
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  /* HTML pages are always network-only to keep Next.js page data and JS in sync. */
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  /* Everything else → stale-while-revalidate */
  event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
});

/* ── Web Push: works while the installed app is closed ───── */
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'ইনতিফাদাহ';
  const options = {
    body: payload.body || 'আপনার জন্য নতুন একটি বিজ্ঞপ্তি আছে।',
    icon: '/icons/intifadah.jpeg',
    badge: '/icons/intifadah.jpeg',
    tag: payload.tag || 'intifadah-notification',
    data: { url: payload.url || '/user/dashboard' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const matchingClient = clients.find(client => client.url === targetUrl);
    if (matchingClient) return matchingClient.focus();
    return self.clients.openWindow(targetUrl);
  })());
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
    return await fetch(request);
  } catch {
    const offlinePage = await caches.match('/offline.html');
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
