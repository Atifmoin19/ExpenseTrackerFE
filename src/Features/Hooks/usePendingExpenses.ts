import { useEffect, useState } from 'react'
import { getPendingExpenses } from 'Services/offlineDb'
import type { Expense } from 'Features/Schema/types'

/**
 * Surfaces IndexedDB-queued (offline, not-yet-synced) expenses for a trip so
 * they still show with an "offline — will sync" badge after a page reload,
 * even though the RTK Query cache itself isn't persisted.
 */
export function usePendingExpenses(tripId: string | undefined) {
  const [pending, setPending] = useState<Expense[]>([])

  useEffect(() => {
    if (!tripId) return
    let cancelled = false

    const load = async () => {
      const entries = await getPendingExpenses(tripId)
      if (cancelled) return
      setPending(
        entries.map((e) => ({
          id: e.localId,
          tripId: e.tripId,
          description: e.body.description,
          amount: e.body.amount,
          currency: e.body.currency,
          category: e.body.category,
          notes: e.body.notes,
          tags: e.body.tags ?? [],
          receiptUrl: e.body.receiptUrl,
          paidBy: e.body.paidBy,
          splitType: e.body.splitType,
          splits: e.body.splits,
          createdBy: e.body.paidBy,
          date: e.body.date,
          createdAt: e.createdAt,
          updatedAt: e.createdAt,
          pendingSync: true,
        })),
      )
    }

    void load()
    const interval = window.setInterval(load, 3000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [tripId])

  return pending
}
