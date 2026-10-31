import axios from 'axios'
import { BASE_URL } from 'Services/baseQuery'
import { TRIP_EXPENSES } from 'Constants/endpoints'
import { addPendingExpense, getPendingExpenses, removePendingExpense, type PendingExpense } from 'Services/offlineDb'
import type { CreateExpensePayload } from 'Services/Api/expenses.api'
import { appApi } from 'Services/Api/app.api'
import { store } from 'Features/Store/store'
import type { AppDispatch } from 'Features/Store/store'

import { generateLocalId, offlineIdHeaders } from 'Services/offlineId'

export { generateLocalId }

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
 * browser reports it's back online. This can race the service worker's
 * Background Sync replay of the same POST (both hold a copy), so the request
 * may reach the server twice; that is safe because both carry the same
 * X-Offline-Local-Id and the backend create is idempotent on it.
 */
export async function replayPendingExpenses(dispatch: AppDispatch) {
  const pending = await getPendingExpenses()
  for (const entry of pending) {
    try {
      const token = store.getState().auth.accessToken
      await axios.post(BASE_URL + TRIP_EXPENSES(entry.tripId), entry.body, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...offlineIdHeaders(entry.localId),
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
