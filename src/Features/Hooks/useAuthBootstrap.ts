import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from 'Features/Store/common'
import { setLoggedIn, setAuthChecked } from 'Features/Store/appReducer.slice'
import { setUserProfile } from 'Features/Store/userSlice'
import { authApi } from 'Services/Api/auth.api'

/**
 * Runs once at app boot — replaces the old Firebase `onAuthStateChanged`
 * listener (useAuthListener.ts). There's no async SDK to wait on anymore:
 * redux-persist has already rehydrated `state.auth` (accessToken/
 * refreshToken, see authSlice) from sessionStorage by the time this runs
 * (App.tsx renders inside <PersistGate>), so "is the user logged in" is
 * just "is there a refresh token" — synchronous, no listener needed.
 *
 * It still does one thing asynchronously: if a session exists, it fetches
 * the current profile (GET /auth/me) to refresh Redux's cached copy. This
 * doubles as a lightweight validity check — baseQuery's 401 interceptor
 * silently refreshes an expired access token, or clears auth state and
 * redirects to /login if the session is truly dead.
 */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch()
  const refreshToken = useAppSelector((state) => state.auth.refreshToken)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    if (!refreshToken) {
      dispatch(setLoggedIn(false))
      dispatch(setAuthChecked(true))
      return
    }

    dispatch(setLoggedIn(true))
    dispatch(authApi.endpoints.getMe.initiate())
      .unwrap()
      .then((result) => {
        if (result?.data) dispatch(setUserProfile(result.data))
      })
      .catch(() => {
        // A hard auth failure is already handled by baseQuery's 401
        // interceptor (clears tokens + redirects to /login itself); a
        // transient network error just leaves the persisted profile as-is.
      })
      .finally(() => dispatch(setAuthChecked(true)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
