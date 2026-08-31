import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100dvh"
      textAlign="center"
      p={8}
      bg="ink.50"
    >
      <Heading size="4xl" color="ink.200" fontFamily="heading">
        404
      </Heading>
      <Heading size="xl" mt={4} color="ink.900" fontFamily="heading">
        Page not found
      </Heading>
      <Text mt={3} color="ink.500" maxW="md">
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button mt={8} colorScheme="primary" size="lg" onClick={() => navigate('/', { replace: true })}>
        Go home
      </Button>
    </Box>
  )
}

export default NotFound
