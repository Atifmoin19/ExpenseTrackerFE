import { Box, Text } from '@chakra-ui/react'
import { useAppSelector } from 'Features/Store/common'

export function DemoBanner() {
  const isDemo = useAppSelector((state) => state.auth.isDemo)

  if (!isDemo) return null

  return (
    <Box bg="primary.600" color="white" textAlign="center" py={1.5} px={4} fontSize="xs" fontWeight={600} role="status">
      <Text>Demo sandbox. Resets in 24 hours. Uploads and notifications are off.</Text>
    </Box>
  )
}
