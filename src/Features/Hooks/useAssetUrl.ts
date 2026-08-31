import { useEffect, useState } from 'react'
import { getViewUrl } from 'Services/uploads'

// Short in-memory cache so the same key (e.g. a member's avatar rendered in
// ten places on one screen) doesn't trigger ten GET /uploads/{key}/view
// calls, and re-renders don't refetch a URL we just resolved.
const CACHE_TTL_MS = 4 * 60 * 1000
const cache = new Map<string, { url: string; ts: number }>()

function isDirectUrl(value: string): boolean {
  return /^(https?:|blob:|data:)/.test(value)
}

/**
 * Resolves a stored object key (what `receiptUrl`/`photoUrl` hold — see
 * Services/uploads.ts) to a viewable URL via the backend's private-bucket
 * view endpoint. Returns undefined while unresolved/absent.
 *
 * Passing an already-direct URL (http(s):, blob:, data:) — e.g. a local
 * preview from a freshly-picked file — is a no-op passthrough, so callers
 * can feed this hook either a stored key or a local preview URL uniformly.
 */
export function useAssetUrl(key?: string | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => {
    if (!key) return undefined
    if (isDirectUrl(key)) return key
    return cache.get(key)?.url
  })

  useEffect(() => {
    if (!key) {
      setUrl(undefined)
      return
    }
    if (isDirectUrl(key)) {
      setUrl(key)
      return
    }
    const cached = cache.get(key)
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setUrl(cached.url)
      return
    }
    let cancelled = false
    getViewUrl(key)
      .then((resolved) => {
        if (cancelled) return
        cache.set(key, { url: resolved, ts: Date.now() })
        setUrl(resolved)
      })
      .catch(() => {
        if (!cancelled) setUrl(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [key])

  return url
}
