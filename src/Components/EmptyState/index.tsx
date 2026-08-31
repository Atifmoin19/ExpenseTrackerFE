import { Box, Button, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <VStack
      spacing={3}
      py={12}
      px={6}
      textAlign="center"
      role="status"
      aria-live="polite"
    >
      {icon && (
        <Box fontSize="2.5rem" lineHeight={1} aria-hidden="true">
          {icon}
        </Box>
      )}
      <Text fontWeight={700} fontSize="md" color="ink.900">
        {title}
      </Text>
      {description && (
        <Text fontSize="sm" color="ink.500" maxW="xs">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button size="sm" mt={2} colorScheme="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </VStack>
  )
}
