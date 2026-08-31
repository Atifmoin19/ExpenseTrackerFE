import { useEffect } from 'react'

/**
 * Warns before an accidental tab close/refresh while a form has unsaved
 * edits. Router-level (in-app) navigation isn't covered here since this is a
 * client-only SPA without a navigation-blocker API wired up app-wide — this
 * covers the highest-cost case (losing everything on an accidental refresh).
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])
}
