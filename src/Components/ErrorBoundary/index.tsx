import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { FiAlertTriangle } from 'react-icons/fi'
import { APP_HOME } from 'Constants/routes'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// A lazy-loaded route chunk from a previous deploy can 404 once a newer
// deploy has replaced it with different hashed filenames — the tab was just
// open across the deploy. Self-heal with one automatic reload instead of
// showing an error screen; a session flag stops an infinite loop if the
// failure recurs for a genuine reason (offline, real 404).
const CHUNK_ERROR_PATTERN = /fetch dynamically imported module|loading chunk|importing a module script failed/i
export const CHUNK_RELOAD_FLAG = 'expenseTracker:chunkReloadAttempted'

function isChunkLoadError(error: Error): boolean {
  return CHUNK_ERROR_PATTERN.test(error.message ?? '')
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)

    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
      window.location.reload()
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign(APP_HOME)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" minH="100dvh" alignItems="center" justifyContent="center" p={6} bg="ink.50">
          <VStack spacing={4} maxW="sm" textAlign="center">
            <FiAlertTriangle size={40} color="var(--chakra-colors-negative-500)" aria-hidden="true" />
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
