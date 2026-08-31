import { HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'

export function TripCardSkeleton() {
  return (
    <VStack
      align="stretch"
      spacing={3}
      p={4}
      borderRadius="xl"
      bg="white"
      boxShadow="cardShadow"
      w="full"
    >
      <Skeleton height="18px" width="60%" borderRadius="md" />
      <Skeleton height="12px" width="40%" borderRadius="md" />
      <HStack justify="space-between" pt={2}>
        <Skeleton height="10px" width="30%" borderRadius="md" />
        <Skeleton height="20px" width="25%" borderRadius="md" />
      </HStack>
    </VStack>
  )
}

export function ExpenseRowSkeleton() {
  return (
    <HStack spacing={3} py={3} px={1} w="full">
      <SkeletonCircle size="10" />
      <VStack align="stretch" flex={1} spacing={2}>
        <Skeleton height="14px" width="50%" borderRadius="md" />
        <Skeleton height="10px" width="30%" borderRadius="md" />
      </VStack>
      <Skeleton height="16px" width="60px" borderRadius="md" />
    </HStack>
  )
}

export function CardSkeleton({ height = '90px' }: { height?: string }) {
  return <Skeleton height={height} borderRadius="xl" w="full" />
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <VStack align="stretch" spacing={1} w="full">
      {Array.from({ length: rows }).map((_, i) => (
        <ExpenseRowSkeleton key={i} />
      ))}
    </VStack>
  )
}
