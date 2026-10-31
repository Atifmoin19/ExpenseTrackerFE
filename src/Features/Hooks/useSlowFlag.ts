import { useEffect, useState } from 'react'

/** True once `active` has stayed true for `delayMs` (resets when it goes
 *  false). Used to swap a spinner for a "waking the server" message when a
 *  cold-started backend is slow to answer. */
export function useSlowFlag(active: boolean, delayMs = 2500): boolean {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!active) {
      setSlow(false)
      return
    }
    const timer = setTimeout(() => setSlow(true), delayMs)
    return () => clearTimeout(timer)
  }, [active, delayMs])

  return slow
}
