import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import type { Trip } from 'Features/Schema/types'
import { formatCurrency } from 'Features/Schema/splitUtils'

interface TripCardProps {
  trip: Trip
}

function safeFormat(date: string, pattern: string) {
  try {
    return format(new Date(date), pattern)
  } catch {
    return date
  }
}

export function TripCard({ trip }: TripCardProps) {
  const isArchived = trip.status === 'archived'
  const hasBalance = typeof trip.yourBalance === 'number'
  const balance = trip.yourBalance ?? 0

  return (
    <Box
      as={RouterLink}
      to={`/trips/${trip.id}/expenses`}
      display="block"
      bg="white"
      borderRadius="xl"
      boxShadow="cardShadow"
      p={4}
      transition="transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1)"
      _hover={{ boxShadow: 'cardShadowHover', transform: 'translateY(-2px)' }}
      _focusVisible={{ boxShadow: '0 0 0 3px var(--chakra-colors-primary-200)', outline: 'none' }}
      _active={{ transform: 'scale(0.99)' }}
    >
      <HStack justify="space-between" align="flex-start" spacing={3}>
        <VStack align="flex-start" spacing={1} minW={0} flex={1}>
          <HStack spacing={2}>
            <Text fontWeight={700} fontSize="md" color="ink.900" noOfLines={1}>
              {trip.name}
            </Text>
            {isArchived && (
              <Badge colorScheme="gray" fontSize="0.6rem" borderRadius="full">
                Archived
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="ink.500">
            {safeFormat(trip.startDate, 'MMM d')} – {safeFormat(trip.endDate, 'MMM d, yyyy')}
          </Text>
          <Text fontSize="xs" color="ink.400">
            {trip.memberIds.length} {trip.memberIds.length === 1 ? 'member' : 'members'} · {trip.currency}
          </Text>
        </VStack>

        {hasBalance ? (
          <VStack align="flex-end" spacing={0} flexShrink={0}>
            <Text fontSize="xs" color="ink.500">
              {balance >= 0 ? 'you get' : 'you owe'}
            </Text>
            <Text
              fontWeight={800}
              fontSize="md"
              color={balance >= 0 ? 'positive.700' : 'negative.700'}
              fontFamily="heading"
            >
              {formatCurrency(Math.abs(balance), trip.currency)}
            </Text>
          </VStack>
        ) : (
          <Text fontSize="xs" color="ink.400" flexShrink={0}>
            View trip →
          </Text>
        )}
      </HStack>
    </Box>
  )
}
