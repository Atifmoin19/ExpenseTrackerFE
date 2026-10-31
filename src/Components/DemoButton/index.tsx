import { useState } from 'react'
import { Button, Text, VStack, type ButtonProps } from '@chakra-ui/react'
import { startDemo } from 'Services/auth'
import { useAppDispatch } from 'Features/Store/common'
import { setDemo, setTokens } from 'Features/Store/authSlice'
import { setUserProfile } from 'Features/Store/userSlice'
import { setLoggedIn } from 'Features/Store/appReducer.slice'
import { useAppToast } from 'Features/Hooks/useAppToast'
import { useSlowFlag } from 'Features/Hooks/useSlowFlag'

export const DEMO_ENABLED = import.meta.env.VITE_DEMO_ENABLED === 'true'

/** "Try the demo" — signs into a seeded, throwaway sandbox account. Renders
 *  nothing unless VITE_DEMO_ENABLED=true. */
interface DemoButtonProps {
  /** Overrides for the button's look (the sign-in screen uses the outline default). */
  buttonProps?: ButtonProps
  /** Called after a successful sign-in (the landing page navigates into the app). */
  onStarted?: () => void
}

export function DemoButton({ buttonProps, onStarted }: DemoButtonProps = {}) {
  const dispatch = useAppDispatch()
  const toast = useAppToast()
  const [isLoading, setIsLoading] = useState(false)
  const isSlow = useSlowFlag(isLoading)

  if (!DEMO_ENABLED) return null

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const { tokens, user } = await startDemo()
      dispatch(setTokens(tokens))
      dispatch(setDemo(true))
      dispatch(setUserProfile(user))
      dispatch(setLoggedIn(true))
      onStarted?.()
    } catch (err) {
      toast.error('Could not start the demo', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack spacing={1} w="full">
      <Button variant="outline" size="lg" w="full" {...buttonProps} isLoading={isLoading} onClick={handleClick}>
        Try the demo
      </Button>
      {isSlow && (
        <Text fontSize="xs" color="ink.500" role="status">
          Waking the server, this can take a few seconds
        </Text>
      )}
    </VStack>
  )
}
