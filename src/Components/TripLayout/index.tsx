import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { FiChevronLeft, FiCompass } from 'react-icons/fi'
import { useGetTripQuery } from 'Services/Api/trips.api'
import { useListMembersQuery } from 'Services/Api/members.api'
import { useAppSelector } from 'Features/Store/common'
import { EmptyState } from 'Components/EmptyState'
import type { Trip, TripMember } from 'Features/Schema/types'

export interface TripOutletContext {
  trip: Trip
  members: TripMember[]
  isAdmin: boolean
  currentUid: string
}

const TABS = [
  { to: 'expenses', label: 'Expenses' },
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'settlements', label: 'Settle up' },
  { to: 'members', label: 'Members' },
]

// Matches /trips/:tripId/expenses/new and /trips/:tripId/expenses/:expenseId/edit —
// the add/edit expense form gets its own distraction-free screen (just a back
// link, no tab bar) instead of living inside the "Expenses" tab, which used
// to make that one tab do two different, confusing jobs (list vs. edit form).
const EXPENSE_FORM_PATTERN = /\/expenses\/(new|[^/]+\/edit)$/

export function TripLayout() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const location = useLocation()
  const isExpenseForm = EXPENSE_FORM_PATTERN.test(location.pathname)
  const { data: tripData, isLoading: isTripLoading, isError } = useGetTripQuery(tripId, { skip: !tripId })
  const { data: membersData } = useListMembersQuery(tripId, { skip: !tripId })
  const profile = useAppSelector((state) => state.user.profile)

  const trip = tripData?.data
  const members = membersData?.data ?? []
  const currentUid = profile?.uid ?? ''
  const isAdmin = !!trip?.adminIds.includes(currentUid)

  if (isTripLoading) {
    return (
      <VStack align="stretch" spacing={4}>
        <Skeleton height="28px" width="220px" borderRadius="md" />
        <Skeleton height="36px" borderRadius="lg" />
        <Skeleton height="200px" borderRadius="xl" />
      </VStack>
    )
  }

  if (isError || !trip) {
    return (
      <EmptyState
        icon={<FiCompass size={40} color="var(--chakra-colors-ink-400)" />}
        title="Trip not found"
        description="This trip may have been removed, or you no longer have access."
      />
    )
  }

  const tabs = isAdmin ? [...TABS, { to: 'settings', label: 'Settings' }] : TABS

  return (
    <VStack align="stretch" spacing={5}>
      <VStack align="flex-start" spacing={1}>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color="ink.900" fontFamily="heading">
          {trip.name}
        </Text>
        <Text fontSize="sm" color="ink.500">
          {trip.currency} · {members.length} {members.length === 1 ? 'member' : 'members'}
        </Text>
      </VStack>

      {isExpenseForm ? (
        <HStack
          as={RouterLink}
          to={`/trips/${tripId}/expenses`}
          spacing={1}
          color="ink.600"
          fontSize="sm"
          fontWeight={600}
          w="fit-content"
          _hover={{ color: 'primary.600' }}
        >
          <FiChevronLeft aria-hidden="true" />
          <Text>Back to expenses</Text>
        </HStack>
      ) : (
        <Box overflowX="auto" css={{ scrollbarWidth: 'none' }}>
          <HStack spacing={1} bg="ink.100" borderRadius="lg" p={1} w="max-content" minW="full">
            {tabs.map((tab) => (
              <NavLink key={tab.to} to={tab.to} end={false}>
                {({ isActive }) => (
                  <Text
                    px={4}
                    py={1.5}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight={600}
                    whiteSpace="nowrap"
                    color={isActive ? 'primary.700' : 'ink.600'}
                    bg={isActive ? 'white' : 'transparent'}
                    boxShadow={isActive ? 'cardShadow' : 'none'}
                    transition="background-color 150ms ease-out, color 150ms ease-out"
                  >
                    {tab.label}
                  </Text>
                )}
              </NavLink>
            ))}
          </HStack>
        </Box>
      )}

      <Outlet context={{ trip, members, isAdmin, currentUid } satisfies TripOutletContext} />
    </VStack>
  )
}
