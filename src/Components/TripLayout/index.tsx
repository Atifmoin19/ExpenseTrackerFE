import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
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

export function TripLayout() {
  const { tripId = '' } = useParams<{ tripId: string }>()
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
        icon="🧭"
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

      <Outlet context={{ trip, members, isAdmin, currentUid } satisfies TripOutletContext} />
    </VStack>
  )
}
