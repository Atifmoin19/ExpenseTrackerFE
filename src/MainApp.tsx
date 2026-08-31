import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, Spinner } from '@chakra-ui/react'
import { PrivateRoutes, PublicOnlyRoutes, RequireProfile, RequirePlatformAdmin } from 'RouteProtection'
import { AppShell } from 'Components/AppShell'
import { TripLayout } from 'Components/TripLayout'

const NotFound = lazy(() => import('Pages/NotFound'))
const Login = lazy(() => import('Pages/Login'))
const Onboarding = lazy(() => import('Pages/Onboarding'))
const InviteLanding = lazy(() => import('Pages/InviteLanding'))
const Home = lazy(() => import('Pages/Home'))
const CreateTrip = lazy(() => import('Pages/CreateTrip'))
const InviteMembers = lazy(() => import('Pages/InviteMembers'))
const ExpenseList = lazy(() => import('Pages/ExpenseList'))
const ExpenseDetail = lazy(() => import('Pages/ExpenseDetail'))
const AddExpense = lazy(() => import('Pages/AddExpense'))
const Dashboard = lazy(() => import('Pages/Dashboard'))
const Settlements = lazy(() => import('Pages/Settlements'))
const Profile = lazy(() => import('Pages/Profile'))
const Settings = lazy(() => import('Pages/Settings'))
const Admin = lazy(() => import('Pages/Admin'))

function LoadingFallback() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
      <Spinner size="xl" color="primary.500" />
    </Box>
  )
}

export const AppRouter = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      {/* Public-only routes — logged-in users are redirected to "/" */}
      <Route element={<PublicOnlyRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Invite deep link — reachable whether the visitor is signed in or not */}
      <Route path="/invite/:code" element={<InviteLanding />} />

      {/* Private routes — require isLoggedIn === true, else redirect to /login */}
      <Route element={<PrivateRoutes />}>
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Everything else additionally requires a completed profile */}
        <Route element={<RequireProfile />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/profile" element={<Profile />} />

            {/* Top-level, not trip-scoped — whole-app "super admin" only,
                separate from any /trips/:tripId nesting. Client-side gate;
                the backend independently 403s every /admin/* API call. */}
            <Route element={<RequirePlatformAdmin />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="/trips/:tripId" element={<TripLayout />}>
              <Route index element={<Navigate to="expenses" replace />} />
              <Route path="expenses" element={<ExpenseList />} />
              <Route path="expenses/new" element={<AddExpense />} />
              <Route path="expenses/:expenseId" element={<ExpenseDetail />} />
              <Route path="expenses/:expenseId/edit" element={<AddExpense />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settlements" element={<Settlements />} />
              <Route path="members" element={<InviteMembers />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
)
