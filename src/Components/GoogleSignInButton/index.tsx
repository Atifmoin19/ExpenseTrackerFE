import { useEffect, useRef, useState } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
import { GOOGLE_CLIENT_ID } from 'Constants'

// Minimal ambient typing for the bit of Google Identity Services this app
// uses — https://accounts.google.com/gsi/client. No official npm types
// package is pulled in for such a small surface.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            ux_mode?: 'popup' | 'redirect'
            auto_select?: boolean
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
          cancel: () => void
        }
      }
    }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptLoadPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void
}

/**
 * Renders Google Identity Services' own sign-in button (loaded from
 * accounts.google.com/gsi/client) and forwards the resulting ID token to
 * `onCredential`, which POSTs it to /auth/google (see Services/auth.ts).
 * Replaces the old firebase/auth signInWithPopup(GoogleAuthProvider) flow.
 *
 * If VITE_GOOGLE_CLIENT_ID isn't configured yet, renders nothing rather than
 * a button that can never work.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredential(response.credential),
          ux_mode: 'popup',
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        })
        setIsReady(true)
      })
      .catch(() => setFailed(true))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!GOOGLE_CLIENT_ID || failed) return null

  return (
    <Box w="full" display="flex" justifyContent="center" minH="44px">
      {!isReady && (
        <Center w="full">
          <Spinner size="sm" color="ink.400" />
        </Center>
      )}
      <Box ref={containerRef} display={isReady ? 'block' : 'none'} />
    </Box>
  )
}
