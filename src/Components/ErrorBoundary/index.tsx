import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" minH="100dvh" alignItems="center" justifyContent="center" p={6} bg="ink.50">
          <VStack spacing={4} maxW="sm" textAlign="center">
            <Text fontSize="3xl">⚠️</Text>
            <Heading size="md" color="ink.900">
              Something went wrong
            </Heading>
            <Text color="ink.600" fontSize="sm">
              An unexpected error interrupted the page. Your data is safe — try reloading.
            </Text>
            <Button colorScheme="primary" onClick={this.handleReload}>
              Reload app
            </Button>
          </VStack>
        </Box>
      )
    }
    return this.props.children
  }
}
