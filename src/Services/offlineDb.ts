import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CreateExpensePayload } from 'Services/Api/expenses.api'

export interface PendingExpense {
  localId: string
  tripId: string
  body: CreateExpensePayload
  createdAt: string
}

interface OfflineDbSchema extends DBSchema {
  'pending-expenses': {
    key: string
    value: PendingExpense
    indexes: { tripId: string }
  }
}

const DB_NAME = 'expense-tracker-offline'
const DB_VERSION = 1
const STORE = 'pending-expenses'

let dbPromise: Promise<IDBPDatabase<OfflineDbSchema>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: 'localId' })
        store.createIndex('tripId', 'tripId')
      },
    })
  }
  return dbPromise
}

export async function addPendingExpense(entry: PendingExpense): Promise<void> {
  const db = await getDb()
  await db.put(STORE, entry)
}

export async function getPendingExpenses(tripId?: string): Promise<PendingExpense[]> {
  const db = await getDb()
  const all = await db.getAll(STORE)
  return tripId ? all.filter((e) => e.tripId === tripId) : all
}

export async function removePendingExpense(localId: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, localId)
}
