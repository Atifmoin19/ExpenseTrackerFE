import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { AuthForm } from 'Components/AuthForm'
import { DemoButton } from 'Components/DemoButton'

function Logo() {
  return (
    <Box w="52px" h="52px" borderRadius="14px" bg="primary.500" display="flex" alignItems="center" justifyContent="center" mb={2}>
      <Text color="white" fontWeight={800} fontSize="xl">
        $
      </Text>
    </Box>
  )
}

function Login() {
  return (
    <Box
      minH="100dvh"
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      <Box
        display={{ base: 'none', lg: 'flex' }}
        flex="1"
        bgGradient="linear(160deg, primary.600, primary.800)"
        color="white"
        p={12}
        flexDirection="column"
        justifyContent="space-between"
      >
        <Text fontWeight={800} fontSize="lg">
          Expense Tracker
        </Text>
        <VStack align="flex-start" spacing={4} maxW="sm">
          <Heading size="xl" fontFamily="heading" lineHeight={1.15}>
            Split trip costs without the group-chat math.
          </Heading>
          <Text color="whiteAlpha.800" fontSize="md">
            Track who paid, who owes, and settle up in a couple of taps — built for group trips.
          </Text>
        </VStack>
        <Text fontSize="xs" color="whiteAlpha.600">
          © {new Date().getFullYear()} Expense Tracker
        </Text>
      </Box>

      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={{ base: 6, sm: 10 }}
        bg="ink.50"
      >
        <VStack spacing={6} w="full" maxW="380px" bg="white" p={{ base: 6, sm: 8 }} borderRadius="2xl" boxShadow="cardShadow">
          <VStack spacing={1}>
            <Logo />
            <Heading size="md" color="ink.900">
              Welcome back
            </Heading>
            <Text fontSize="sm" color="ink.500" textAlign="center">
              Sign in to see your trips and balances.
            </Text>
          </VStack>

          <AuthForm />
          <DemoButton />
        </VStack>
      </Box>
    </Box>
  )
}

export default Login
