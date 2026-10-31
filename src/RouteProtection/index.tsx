import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from 'Features/Store/common'
import { APP_HOME } from 'Constants/routes'

/**
 * PrivateRoutes
 * Wrap routes that require the user to be logged in.
 * If not logged in, redirects to /login.
 */
export const PrivateRoutes = () => {
  const { isLoggedIn } = useAppSelector((state) => state.app)
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * PublicOnlyRoutes
 * Wrap routes that logged-in users should not access (e.g. Login page).
 * If logged in, redirects to the app home.
 */
export const PublicOnlyRoutes = () => {
  const { isLoggedIn } = useAppSelector((state) => state.app)
  return isLoggedIn ? <Navigate to={APP_HOME} replace /> : <Outlet />
}

/**
 * RequireProfile
 * Wrap the main app routes (nested inside PrivateRoutes). Redirects a
 * signed-in-but-incomplete-profile user (no displayName yet, e.g. fresh
 * email-OTP sign-up) to /onboarding before they can reach any other screen.
 */
export const RequireProfile = () => {
  const profile = useAppSelector((state) => state.user.profile)
  if (profile && !profile.displayName) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

/**
 * RequirePlatformAdmin
 * Wrap /admin (nested inside PrivateRoutes + RequireProfile). Redirects
 * anyone whose profile isn't flagged `isPlatformAdmin` back to the app home — this is
 * a whole-app "super admin" role (users.is_platform_admin on the backend),
 * completely separate from any per-trip `role: 'admin'` on a TripMember.
 * Client-side only: the backend independently 403s every /admin/* API call
 * regardless of this guard.
 */
export const RequirePlatformAdmin = () => {
  const profile = useAppSelector((state) => state.user.profile)
  if (!profile?.isPlatformAdmin) return <Navigate to={APP_HOME} replace />
  return <Outlet />
}
