/**
 * Domain types mirroring CONTRACT.md's REST envelope and Postgres schema.
 * Every API slice in Services/Api consumes these — keep field names identical
 * to what the backend returns, do not rename.
 */

// ── API envelope ────────────────────────────────────────────────────────────
export interface ApiError {
  code: string
  message: string
}

export interface ApiMeta {
  cursor?: string | null
  hasMore?: boolean
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  error: ApiError | null
  meta?: ApiMeta | null
}

// ── users (Postgres `users` table; `uid` here maps to the backend's `id`) ────
export interface User {
  uid: string
  email: string
  displayName: string
  /** private object storage key (see Services/uploads.ts), resolved to a
   *  viewable URL via useAssetUrl before being passed to an <img>/<Avatar> */
  photoUrl?: string
  /** Whole-app "super admin" flag — a property of the user, completely
   *  separate from any per-trip `role: 'admin'` on a TripMember. Gates the
   *  /admin route and its "Platform Admin" nav entry. */
  isPlatformAdmin?: boolean
  /** "Try the demo" sandbox account, purged at demoExpiresAt. */
  isDemo?: boolean
  demoExpiresAt?: string | null
  createdAt: string
  updatedAt: string
}

// ── trips/{tripId} ───────────────────────────────────────────────────────────
export type ExpensePermission = 'admin_only' | 'all_members' | 'selected_members'
export type TripStatus = 'active' | 'archived'

export interface Trip {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  currency: string
  createdBy: string
  adminIds: string[]
  memberIds: string[]
  expensePermission: ExpensePermission
  allowedMemberIds: string[]
  status: TripStatus
  createdAt: string
  updatedAt: string
  yourBalance?: number
}

// ── trips/{tripId}/members/{uid} ─────────────────────────────────────────────
export type MemberRole = 'admin' | 'member'
export type MemberStatus = 'active' | 'removed'

export interface TripMember {
  uid: string
  role: MemberRole
  displayName: string
  photoUrl?: string
  joinedAt: string
  status: MemberStatus
  email?: string
}

// ── trips/{tripId}/expenses/{expenseId} ──────────────────────────────────────
export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares'

export interface ExpenseSplit {
  uid: string
  amount: number
  percentage?: number
  shares?: number
}

export interface Expense {
  id: string
  tripId: string
  description: string
  amount: number
  currency: string
  category?: string
  notes?: string
  tags: string[]
  receiptUrl?: string
  paidBy: string
  splitType: SplitType
  splits: ExpenseSplit[]
  createdBy: string
  date: string
  createdAt: string
  updatedAt: string
  /** client-only: true while an offline-queued expense hasn't synced yet */
  pendingSync?: boolean
}

// ── trips/{tripId}/settlements/{settlementId} ────────────────────────────────
export type SettlementMethod = 'cash' | 'upi' | 'bank'

export interface Settlement {
  id: string
  tripId: string
  fromUid: string
  toUid: string
  amount: number
  method: SettlementMethod
  note?: string
  settledBy: string
  status: 'completed'
  createdAt: string
}

export interface SuggestedSettlement {
  fromUid: string
  toUid: string
  amount: number
}

// ── invites/{inviteCode} ─────────────────────────────────────────────────────
export interface Invite {
  code: string
  tripId: string
  createdBy: string
  expiresAt: string
  maxUses?: number
  usedBy: string[]
  createdAt: string
}

export interface InvitePreview {
  code: string
  tripName: string
  startDate: string
  endDate: string
  memberCount: number
}

// ── notifications/{notificationId} ───────────────────────────────────────────
export interface AppNotification {
  id: string
  userId: string
  tripId?: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

// ── dashboard ────────────────────────────────────────────────────────────────
export interface MemberBalance {
  uid: string
  name: string
  net: number
}

export interface DashboardSummary {
  totalExpense: number
  yourExpense: number
  youOwe: number
  youGet: number
  memberBalances: MemberBalance[]
}

export interface CategoryChartEntry {
  category: string
  amount: number
}

export interface MemberChartEntry {
  uid: string
  name: string
  amount: number
}

export interface TimelineChartEntry {
  date: string
  amount: number
}

export interface DashboardCharts {
  byCategory: CategoryChartEntry[]
  byMember: MemberChartEntry[]
  timeline: TimelineChartEntry[]
}

export interface TimelineActivity {
  id: string
  type: string
  title: string
  body: string
  actorUid?: string
  actorName?: string
  createdAt: string
}

// ── platform admin analytics (/api/v1/admin/*, platform-admin only) ─────────
export interface AdminCurrencyVolume {
  currency: string
  totalAmount: number
}

export interface AdminStatsSummary {
  totalUsers: number
  activeTrips: number
  archivedTrips: number
  totalTrips: number
  totalExpenses: number
  totalVolumeByCurrency: AdminCurrencyVolume[]
  activeUsers7d: number
  activeUsers30d: number
}

export interface AdminSignupBucket {
  period: string
  count: number
}

export interface AdminSignups {
  bucket: 'daily' | 'weekly'
  days: number
  series: AdminSignupBucket[]
}

export interface AdminTripSummary {
  id: string
  name: string
  status: TripStatus
  currency: string
  memberCount: number
  expenseCount: number
  totalVolume: number
  createdAt: string
}
