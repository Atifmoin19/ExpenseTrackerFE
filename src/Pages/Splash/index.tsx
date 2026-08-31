import { Box, Text, VStack } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.96); }
`

/**
 * Shown while useAuthBootstrap resolves the initial session check.
 * Once resolved, App.tsx swaps this for <AppRouter/>, whose
 * PrivateRoutes/PublicOnlyRoutes then redirect based on auth state.
 */
function Splash() {
  return (
    <Box
      display="flex"
      minH="100dvh"
      alignItems="center"
      justifyContent="center"
      bg="primary.500"
      role="status"
      aria-live="polite"
      aria-label="Loading Expense Tracker"
    >
      <VStack spacing={4}>
        <Box
          w="64px"
          h="64px"
          borderRadius="18px"
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          animation={`${pulse} 1.6s ease-in-out infinite`}
          sx={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
        >
          <Text fontSize="2xl" fontWeight={800} color="primary.600">
            $
          </Text>
        </Box>
        <Text color="white" fontWeight={700} fontSize="lg" letterSpacing="0.01em">
          Expense Tracker
        </Text>
      </VStack>
    </Box>
  )
}

export default Splash
