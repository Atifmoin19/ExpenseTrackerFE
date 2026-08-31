// API endpoint paths — mirrors CONTRACT.md exactly. Prefix: /api/v1

const API = '/api/v1'

// Auth (backend-owned JWT auth — email OTP + Google Identity Services, no Firebase)
export const AUTH_OTP_REQUEST = `${API}/auth/otp/request`
export const AUTH_OTP_VERIFY = `${API}/auth/otp/verify`
export const AUTH_GOOGLE = `${API}/auth/google`
export const AUTH_REFRESH = `${API}/auth/refresh`
export const AUTH_LOGOUT = `${API}/auth/logout`
export const AUTH_ME = `${API}/auth/me`

// Trips
export const TRIPS = `${API}/trips`
export const TRIP_DETAIL = (tripId: string) => `${API}/trips/${tripId}`
export const TRIP_SETTINGS = (tripId: string) => `${API}/trips/${tripId}/settings`

// Members
export const TRIP_MEMBERS = (tripId: string) => `${API}/trips/${tripId}/members`
export const TRIP_MEMBER_DETAIL = (tripId: string, uid: string) => `${API}/trips/${tripId}/members/${uid}`
export const TRIP_MEMBER_ROLE = (tripId: string, uid: string) => `${API}/trips/${tripId}/members/${uid}/role`

// Invites
export const TRIP_INVITES = (tripId: string) => `${API}/trips/${tripId}/invites`
export const INVITE_DETAIL = (code: string) => `${API}/invites/${code}`
export const INVITE_ACCEPT = (code: string) => `${API}/invites/${code}/accept`

// Expenses
export const TRIP_EXPENSES = (tripId: string) => `${API}/trips/${tripId}/expenses`
export const TRIP_EXPENSE_DETAIL = (tripId: string, expenseId: string) => `${API}/trips/${tripId}/expenses/${expenseId}`

// Dashboard
export const DASHBOARD_SUMMARY = (tripId: string) => `${API}/trips/${tripId}/dashboard/summary`
export const DASHBOARD_CHARTS = (tripId: string) => `${API}/trips/${tripId}/dashboard/charts`
export const TRIP_TIMELINE = (tripId: string) => `${API}/trips/${tripId}/timeline`

// Settlements
export const TRIP_SETTLEMENTS = (tripId: string) => `${API}/trips/${tripId}/settlements`
export const TRIP_SETTLEMENTS_SUGGESTED = (tripId: string) => `${API}/trips/${tripId}/settlements/suggested`

// Uploads (presigned-URL flow — see Services/uploads.ts)
export const UPLOADS_PRESIGN = `${API}/uploads/presign`
export const UPLOAD_VIEW = (key: string) => `${API}/uploads/${key}/view`

// Notifications
export const NOTIFICATIONS = `${API}/notifications`
export const NOTIFICATIONS_REGISTER_DEVICE = `${API}/notifications/register-device`
export const NOTIFICATION_READ = (id: string) => `${API}/notifications/${id}/read`

// Platform admin analytics (whole-app "super admin" only — see CONTRACT.md)
export const ADMIN_STATS_SUMMARY = `${API}/admin/stats/summary`
export const ADMIN_STATS_SIGNUPS = `${API}/admin/stats/signups`
export const ADMIN_TRIPS = `${API}/admin/trips`
