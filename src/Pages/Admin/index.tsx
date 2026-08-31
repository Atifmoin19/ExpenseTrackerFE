import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { FiShield } from 'react-icons/fi'
import { useGetAdminStatsSummaryQuery, useGetAdminTripsQuery } from 'Services/Api/admin.api'
import { CardSkeleton, ListSkeleton } from 'Components/LoadingSkeleton'
import { EmptyState } from 'Components/EmptyState'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { formatCurrency } from 'Features/Schema/splitUtils'
import type { AdminTripSummary } from 'Features/Schema/types'

interface StatTileProps {
  label: string
  value: string
  helpText?: string
}

function StatTile({ label, value, helpText }: StatTileProps) {
  return (
    <VStack align="flex-start" spacing={1} p={4} borderRadius="xl" bg="white" boxShadow="cardShadow" minW={0}>
      <Text fontSize="xs" fontWeight={600} color="ink.500" textTransform="uppercase" letterSpacing="0.04em">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight={800} color="ink.900" fontFamily="heading" noOfLines={1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      {helpText && (
        <Text fontSize="xs" color="ink.500">
          {helpText}
        </Text>
      )}
    </VStack>
  )
}

const TRIPS_PAGE_SIZE = 20

function Admin() {
  const toast = useAppToast()

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useGetAdminStatsSummaryQuery()

  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined])
  const cursor = cursorStack[cursorStack.length - 1]
  const {
    data: tripsData,
    isLoading: isTripsLoading,
    isFetching: isTripsFetching,
    isError: isTripsError,
    error: tripsError,
  } = useGetAdminTripsQuery({ limit: TRIPS_PAGE_SIZE, cursor })

  useEffect(() => {
    if (isSummaryError) toast.error('Could not load platform stats', summaryError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSummaryError])

  useEffect(() => {
    if (isTripsError) toast.error('Could not load trips', tripsError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTripsError])

  const summary = summaryData?.data
  const trips: AdminTripSummary[] = tripsData?.data ?? []
  const hasMore = tripsData?.meta?.hasMore ?? false
  const nextCursor = tripsData?.meta?.cursor ?? undefined

  const totalVolumeLabel = summary?.totalVolumeByCurrency.length
    ? summary.totalVolumeByCurrency.map((v) => formatCurrency(v.totalAmount, v.currency)).join('  ·  ')
    : '—'

  return (
    <VStack align="stretch" spacing={6}>
      <HStack spacing={3} align="center">
        <FiShield size={22} color="var(--chakra-colors-primary-600)" />
        <Heading size="lg" fontFamily="heading" color="ink.900">
          Platform Admin
        </Heading>
      </HStack>

      {isSummaryLoading ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} height="90px" />
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <StatTile label="Total users" value={String(summary?.totalUsers ?? 0)} />
          <StatTile
            label="Total trips"
            value={String(summary?.totalTrips ?? 0)}
            helpText={`${summary?.activeTrips ?? 0} active · ${summary?.archivedTrips ?? 0} archived`}
          />
          <StatTile label="Total expense volume" value={totalVolumeLabel} helpText={`${summary?.totalExpenses ?? 0} expenses`} />
          <StatTile
            label="Active users"
            value={String(summary?.activeUsers7d ?? 0)}
            helpText={`last 7 days · ${summary?.activeUsers30d ?? 0} in last 30`}
          />
        </SimpleGrid>
      )}

      <VStack align="stretch" spacing={3} bg="white" borderRadius="xl" boxShadow="cardShadow" p={4}>
        <Text fontWeight={700} fontSize="sm" color="ink.900">
          All trips
        </Text>

        {isTripsLoading ? (
          <ListSkeleton rows={5} />
        ) : trips.length === 0 ? (
          <EmptyState title="No trips yet" description="Trips created across the platform will show up here." />
        ) : (
          <VStack align="stretch" spacing={3}>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th isNumeric>Members</Th>
                  <Th isNumeric>Expenses</Th>
                  <Th isNumeric>Volume</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {trips.map((trip) => (
                  <Tr key={trip.id}>
                    <Td fontWeight={600} color="ink.800">
                      {trip.name}
                    </Td>
                    <Td isNumeric>{trip.memberCount}</Td>
                    <Td isNumeric>{trip.expenseCount}</Td>
                    <Td isNumeric sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(trip.totalVolume, trip.currency)}
                    </Td>
                    <Td>
                      <Badge colorScheme={trip.status === 'active' ? 'green' : 'gray'} borderRadius="md">
                        {trip.status}
                      </Badge>
                    </Td>
                    <Td color="ink.500" whiteSpace="nowrap">
                      {(() => {
                        try {
                          return format(new Date(trip.createdAt), 'MMM d, yyyy')
                        } catch {
                          return ''
                        }
                      })()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Wrap justify="space-between" align="center">
              <WrapItem>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={cursorStack.length <= 1 || isTripsFetching}
                  onClick={() => setCursorStack((stack) => stack.slice(0, -1))}
                >
                  Previous
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!hasMore || isTripsFetching}
                  isLoading={isTripsFetching}
                  onClick={() => setCursorStack((stack) => [...stack, nextCursor])}
                >
                  Next
                </Button>
              </WrapItem>
            </Wrap>
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

export default Admin
