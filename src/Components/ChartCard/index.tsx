import { Box, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  height?: number
  children: ReactNode
  isEmpty?: boolean
  emptyMessage?: string
}

export function ChartCard({ title, subtitle, height = 240, children, isEmpty, emptyMessage }: ChartCardProps) {
  return (
    <VStack align="stretch" spacing={3} bg="white" borderRadius="xl" boxShadow="cardShadow" p={4} w="full">
      <VStack align="flex-start" spacing={0}>
        <Text fontWeight={700} fontSize="sm" color="ink.900">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="xs" color="ink.500">
            {subtitle}
          </Text>
        )}
      </VStack>
      {isEmpty ? (
        <Box
          h={`${height}px`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="ink.400"
          fontSize="sm"
        >
          {emptyMessage ?? 'Not enough data yet'}
        </Box>
      ) : (
        <Box h={`${height}px`} w="full">
          {children}
        </Box>
      )}
    </VStack>
  )
}
