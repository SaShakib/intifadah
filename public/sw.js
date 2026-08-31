/**
 * Intifadah Service Worker
 * Implements:
 *  - Leaves all application fetches to the browser and Next.js
 *  - Receives push notifications while the app is closed
 */

const CACHE_VERSION = 'v6';

/* ── Install ──────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

/* ── Activate — clear legacy caches before claiming clients ─ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name.startsWith('intifadah-') && !name.endsWith(CACHE_VERSION)).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
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
