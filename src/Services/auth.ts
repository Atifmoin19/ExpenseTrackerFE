import axios from 'axios'
import { BASE_URL } from 'Constants'
import { AUTH_OTP_REQUEST, AUTH_OTP_VERIFY, AUTH_GOOGLE, AUTH_REFRESH, AUTH_LOGOUT } from 'Constants/endpoints'
import type { ApiEnvelope, User } from 'Features/Schema/types'

/**
 * Services/auth.ts — replaces Services/firebase.ts.
 *
 * Plain REST calls against the backend's JWT auth endpoints (CONTRACT.md
 * "Auth model"). No SDK, no client-side token verification — the backend
 * issues and verifies everything. Callers store the returned tokens/user in
 * Redux (Features/Store/authSlice + userSlice); Services/baseQuery.ts reads
 * the access token from there and handles silent refresh on 401.
 */

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Raw shape of the `user` object as returned by the backend (camelCase, per
// the rest of this codebase's REST envelope convention). `id` is normalized
// to `uid` below to match the rest of the frontend's existing `User` type.
interface RawUser {
  id: string
  email: string
  displayName?: string | null
  photoUrl?: string | null
  createdAt: string
  updatedAt: string
}

interface AuthResponse extends AuthTokens {
  user: RawUser
}

function normalizeUser(raw: RawUser): User {
  return {
    uid: raw.id,
    email: raw.email,
    displayName: raw.displayName ?? '',
    photoUrl: raw.photoUrl ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope?.success || envelope.data == null) {
    throw new Error(envelope?.error?.message ?? 'Request failed')
  }
  return envelope.data
}

/** POST /auth/otp/request — always resolves (backend never leaks whether the email exists). */
export async function requestOtp(email: string): Promise<void> {
  await axios.post(`${BASE_URL}${AUTH_OTP_REQUEST}`, { email })
}

/** POST /auth/otp/verify — returns fresh tokens + the upserted user. */
export async function verifyOtp(email: string, code: string): Promise<{ tokens: AuthTokens; user: User }> {
  const { data } = await axios.post<ApiEnvelope<AuthResponse>>(`${BASE_URL}${AUTH_OTP_VERIFY}`, { email, code })
  const payload = unwrap(data)
  return {
    tokens: { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
    user: normalizeUser(payload.user),
  }
}

/** POST /auth/google — body is the Google Identity Services ID token, not a Firebase credential. */
export async function loginWithGoogle(idToken: string): Promise<{ tokens: AuthTokens; user: User }> {
  const { data } = await axios.post<ApiEnvelope<AuthResponse>>(`${BASE_URL}${AUTH_GOOGLE}`, { idToken })
  const payload = unwrap(data)
  return {
    tokens: { accessToken: payload.accessToken, refreshToken: payload.refreshToken },
    user: normalizeUser(payload.user),
  }
}

/** POST /auth/refresh — rotates the refresh token, returns a fresh pair. */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await axios.post<ApiEnvelope<AuthTokens>>(`${BASE_URL}${AUTH_REFRESH}`, { refreshToken })
  return unwrap(data)
}

/** POST /auth/logout — revokes the refresh token row. Best-effort: local state is cleared regardless. */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await axios.post(`${BASE_URL}${AUTH_LOGOUT}`, { refreshToken })
  } catch {
    // ignore — caller clears local auth state unconditionally
  }
}

// ── Pending invite code (localStorage) ────────────────────────────────────────
// Carried over from the Firebase-era build: a logged-out visitor who opens
// /invite/{code} needs that code remembered across the OTP/Google round trip
// so it can be auto-accepted once they're signed in (see
// Features/Hooks/useAcceptPendingInvite.ts and Pages/InviteLanding).
const PENDING_INVITE_KEY = 'expenseTracker:pendingInviteCode'

export function setPendingInviteCode(code: string) {
  window.localStorage.setItem(PENDING_INVITE_KEY, code)
}

export function consumePendingInviteCode(): string | null {
  const code = window.localStorage.getItem(PENDING_INVITE_KEY)
  if (code) window.localStorage.removeItem(PENDING_INVITE_KEY)
  return code
}

export function peekPendingInviteCode(): string | null {
  return window.localStorage.getItem(PENDING_INVITE_KEY)
}
