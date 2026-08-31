import { useToast, type UseToastOptions } from '@chakra-ui/react'
import { useCallback } from 'react'

interface ApiErrorShape {
  status?: number
  data?: unknown
  message?: string
}

function extractMessage(err: unknown, fallback: string): string {
  if (!err) return fallback
  const shaped = err as ApiErrorShape
  if (typeof shaped.message === 'string' && shaped.message) return shaped.message
  if (typeof shaped.data === 'string') return shaped.data
  if (shaped.data && typeof shaped.data === 'object') {
    const nested = shaped.data as { error?: { message?: string }; message?: string }
    if (nested.error?.message) return nested.error.message
    if (nested.message) return nested.message
  }
  return fallback
}

/**
 * Thin wrapper around Chakra's useToast for consistent success/error styling
 * across the app, and a helper that turns an RTK Query error into a message.
 */
export function useAppToast() {
  const toast = useToast()

  const success = useCallback(
    (title: string, description?: string, options?: UseToastOptions) =>
      toast({ title, description, status: 'success', duration: 3000, isClosable: true, position: 'top', ...options }),
    [toast],
  )

  const error = useCallback(
    (title: string, err?: unknown, fallback = 'Something went wrong. Please try again.') =>
      toast({
        title,
        description: extractMessage(err, fallback),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      }),
    [toast],
  )

  const info = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, status: 'info', duration: 3500, isClosable: true, position: 'top' }),
    [toast],
  )

  return { success, error, info }
}
