/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'
import type { PrecacheEntry } from 'workbox-precaching'
import { OFFLINE_LOCAL_ID_HEADER } from './Services/offlineId'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (PrecacheEntry | string)[]
}

// ── Precaching (build-time asset manifest injected by vite-plugin-pwa) ───────
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
self.addEventListener('activate', () => self.clients.claim())

// ── Runtime caching ────────────────────────────────────────────────────────
// API GET requests: network-first so data is fresh online, falls back to
// cache when offline.
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/v1/'),
  new NetworkFirst({
    cacheName: 'api-get-cache',
    networkTimeoutSeconds: 8,
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 })],
  }),
)

// Static assets (images, fonts, scripts, styles): cache-first.
registerRoute(
  ({ request }) =>
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

// ── Offline add-expense: workbox-background-sync Queue ───────────────────────
// Failed POSTs to /trips/{tripId}/expenses are stored in this Queue's own
// IndexedDB and automatically retried when connectivity returns (via the
// browser's Background Sync API). On each successful replay we notify open
// tabs so they can reconcile the local optimistic entry and refetch fresh data.
const expenseSyncQueue = new BackgroundSyncPlugin('expense-sync-queue', {
  maxRetentionTime: 24 * 60, // minutes (24h)
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      const { request } = entry
      const localId = request.headers.get(OFFLINE_LOCAL_ID_HEADER)
      try {
        const response = await fetch(request.clone())
        if (!response.ok && response.status >= 500) throw new Error('Server error, will retry later')

        const clients = await self.clients.matchAll({ type: 'window' })
        const tripIdMatch = request.url.match(/\/trips\/([^/]+)\/expenses/)
        clients.forEach((client) => {
          client.postMessage({
            type: 'EXPENSE_SYNCED',
            localId,
            tripId: tripIdMatch ? tripIdMatch[1] : null,
          })
        })
      } catch (err) {
        await queue.unshiftRequest(entry)
        throw err
      }
    }
  },
})

registerRoute(
  ({ url, request }) => request.method === 'POST' && /\/api\/v1\/trips\/[^/]+\/expenses$/.test(url.pathname),
  new NetworkOnly({ plugins: [expenseSyncQueue] }),
  'POST',
)

// ── Web Push (VAPID) ───────────────────────────────────────────────────────
// Replaces the old firebase-messaging-sw.js: this one service worker now
// handles both offline caching (above) and push, so there's no separate
// worker registered at its own scope. Subscription happens in app code (see
// Features/Hooks/usePushSubscription.ts) via this same registration.
interface PushPayload {
  title?: string
  body?: string
  tripId?: string
  url?: string
}

self.addEventListener('push', (event) => {
  let payload: PushPayload = {}
  try {
    payload = event.data ? (event.data.json() as PushPayload) : {}
  } catch {
    payload = { title: 'All Square', body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'All Square'
  const body = payload.body || ''
  const targetUrl = payload.url || (payload.tripId ? `/trips/${payload.tripId}` : '/app')

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: targetUrl },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data as { url?: string } | undefined)?.url || '/app'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(self.location.origin)) as WindowClient | undefined
      if (existing) {
        existing.focus()
        existing.navigate(targetUrl)
        return
      }
      self.clients.openWindow(targetUrl)
    }),
  )
})
