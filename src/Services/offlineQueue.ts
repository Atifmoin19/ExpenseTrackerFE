import axios from 'axios'
import { BASE_URL } from 'Services/baseQuery'
import { TRIP_EXPENSES } from 'Constants/endpoints'
import { addPendingExpense, getPendingExpenses, removePendingExpense, type PendingExpense } from 'Services/offlineDb'
import type { CreateExpensePayload } from 'Services/Api/expenses.api'
import { appApi } from 'Services/Api/app.api'
import { store } from 'Features/Store/store'
import type { AppDispatch } from 'Features/Store/store'

export function generateLocalId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Persists an expense to IndexedDB so it survives reloads and can be shown
 * with an "offline — will sync" badge. The actual network retry is handled
 * either by the service worker's workbox-background-sync Queue (when
 * supported) or by `replayPendingExpenses` below as a foreground fallback.
 */
export async function queueExpenseOffline(localId: string, tripId: string, body: CreateExpensePayload) {
  const entry: PendingExpense = { localId, tripId, body, createdAt: new Date().toISOString() }
  await addPendingExpense(entry)

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(
          'expense-sync-queue',
        )
      }
    } catch {
      // Background Sync not supported/available — replayPendingExpenses() on 'online' covers it.
    }
  }
}

/**
 * Foreground fallback/reconciliation: replays anything still pending once the
 * browser reports it's back online. Safe to call even if the service worker
 * already handled it — pending entries are removed the moment they succeed,
 * so there is no double-submit risk.
 */
export async function replayPendingExpenses(dispatch: AppDispatch) {
  const pending = await getPendingExpenses()
  for (const entry of pending) {
    try {
      const token = store.getState().auth.accessToken
      await axios.post(BASE_URL + TRIP_EXPENSES(entry.tripId), entry.body, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Offline-Local-Id': entry.localId,
        },
      })
      await removePendingExpense(entry.localId)
      dispatch(
        appApi.util.invalidateTags([
          { type: 'ExpenseList', id: entry.tripId },
          { type: 'Dashboard', id: entry.tripId },
          { type: 'Timeline', id: entry.tripId },
        ]),
      )
    } catch {
      // Still offline or a real server error — stop here, try again on the next 'online' event.
      break
    }
  }
}

export { getPendingExpenses, removePendingExpense }
