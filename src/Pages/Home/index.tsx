import { Button, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useListTripsQuery } from 'Services/Api/trips.api'
import { TripCard } from 'Components/TripCard'
import { TripCardSkeleton } from 'Components/LoadingSkeleton'
import { EmptyState } from 'Components/EmptyState'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useEffect } from 'react'

function Home() {
  const { data, isLoading, isError, error } = useListTripsQuery()
  const toast = useAppToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isError) toast.error('Could not load your trips', error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  const trips = data?.data ?? []
  const activeTrips = trips.filter((t) => t.status === 'active')
  const archivedTrips = trips.filter((t) => t.status === 'archived')

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="center">
        <Heading size="lg" fontFamily="heading" color="ink.900">
          Your trips
        </Heading>
        <Button as={RouterLink} to="/trips/new" colorScheme="primary" size={{ base: 'sm', md: 'md' }}>
          New trip
        </Button>
      </HStack>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </SimpleGrid>
      ) : trips.length === 0 ? (
        <EmptyState
          icon="🧳"
          title="No trips yet"
          description="Create a trip to start tracking shared expenses with friends."
          actionLabel="Create your first trip"
          onAction={() => navigate('/trips/new')}
        />
      ) : (
        <VStack align="stretch" spacing={6}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {activeTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </SimpleGrid>

          {archivedTrips.length > 0 && (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" fontWeight={700} color="ink.500">
                Archived
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                {archivedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </SimpleGrid>
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  )
}

export default Home
