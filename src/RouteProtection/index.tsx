import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from 'Features/Store/common'

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
 * If logged in, redirects to /.
 */
export const PublicOnlyRoutes = () => {
  const { isLoggedIn } = useAppSelector((state) => state.app)
  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />
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
