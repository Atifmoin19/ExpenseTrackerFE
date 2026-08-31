import { useEffect } from 'react'
import { useAppDispatch } from 'Features/Store/common'
import { setOnline } from 'Features/Store/appReducer.slice'
import { replayPendingExpenses, removePendingExpense } from 'Services/offlineQueue'
import { appApi } from 'Services/Api/app.api'

interface ExpenseSyncedMessage {
  type: 'EXPENSE_SYNCED'
  localId: string | null
  tripId: string | null
}

function isExpenseSyncedMessage(data: unknown): data is ExpenseSyncedMessage {
  return typeof data === 'object' && data !== null && (data as { type?: string }).type === 'EXPENSE_SYNCED'
}

/**
 * Tracks online/offline status in Redux and wires up reconciliation for
 * offline-queued expenses:
 *  - on 'online', replays anything still pending (foreground fallback for
 *    browsers without Background Sync support)
 *  - on a message from the service worker's background-sync Queue, clears
 *    the matching local entry and refetches fresh data for that trip
 */
export function useOfflineSync() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnline(true))
      void replayPendingExpenses(dispatch)
    }
    const handleOffline = () => dispatch(setOnline(false))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.onLine) void replayPendingExpenses(dispatch)

    const handleMessage = (event: MessageEvent) => {
      if (!isExpenseSyncedMessage(event.data)) return
      const { localId, tripId } = event.data
      if (localId) void removePendingExpense(localId)
      if (tripId) {
        dispatch(
          appApi.util.invalidateTags([
            { type: 'ExpenseList', id: tripId },
            { type: 'Dashboard', id: tripId },
            { type: 'Timeline', id: tripId },
          ]),
        )
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
