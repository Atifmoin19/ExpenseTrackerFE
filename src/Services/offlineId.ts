/**
 * Client-generated ids for new expenses.
 *
 * Every add-expense attempt carries the same id in the `X-Offline-Local-Id`
 * header: the first POST, the service worker's Background Sync replay of
 * that POST, and the foreground replay of the IndexedDB copy. The backend
 * stores it as `expenses.client_id` (unique per trip) and returns the existing
 * expense on a repeat, so however many of those replays reach the server,
 * only one expense is created.
 *
 * Kept free of store/IDB imports so it can be unit-tested in isolation.
 */
export const OFFLINE_LOCAL_ID_HEADER = 'X-Offline-Local-Id'

// The backend caps the column at 64 characters.
export const MAX_LOCAL_ID_LENGTH = 64

type CryptoLike = { randomUUID?: () => string } | undefined

export function generateLocalId(cryptoImpl: CryptoLike = globalThis.crypto): string {
  if (cryptoImpl && typeof cryptoImpl.randomUUID === 'function') return cryptoImpl.randomUUID()
  // Fallback for non-secure contexts where randomUUID is unavailable.
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function isValidLocalId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= MAX_LOCAL_ID_LENGTH
}

export function offlineIdHeaders(localId: string): Record<string, string> {
  if (!isValidLocalId(localId)) throw new Error('Invalid offline local id')
  return { [OFFLINE_LOCAL_ID_HEADER]: localId }
}
