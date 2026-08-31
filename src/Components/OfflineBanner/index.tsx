import { Box, Text } from '@chakra-ui/react'
import { useAppSelector } from 'Features/Store/common'

export function OfflineBanner() {
  const isOnline = useAppSelector((state) => state.app.isOnline)

  if (isOnline) return null

  return (
    <Box bg="ink.900" color="white" textAlign="center" py={1.5} fontSize="xs" fontWeight={600} role="status">
      <Text>You're offline — changes will sync automatically when you're back online.</Text>
    </Box>
  )
}
