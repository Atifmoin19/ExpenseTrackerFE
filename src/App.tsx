import { useEffect } from 'react'
import { AppRouter } from './MainApp'
import Splash from 'Pages/Splash'
import { useAppSelector } from 'Features/Store/common'
import { useAuthBootstrap } from 'Features/Hooks/useAuthBootstrap'
import { useOfflineSync } from 'Features/Hooks/useOfflineSync'
import { useAcceptPendingInvite } from 'Features/Hooks/useAcceptPendingInvite'
import { CHUNK_RELOAD_FLAG } from 'Components/ErrorBoundary'

function App() {
  useAuthBootstrap()
  useOfflineSync()
  useAcceptPendingInvite()

  // If ErrorBoundary just auto-reloaded once to recover from a stale
  // post-deploy chunk, clear that flag once the app has been healthily
  // mounted for a bit — so a *future* deploy can still trigger one more
  // auto-heal, without risking a reload loop if the error persists.
  useEffect(() => {
    const timer = setTimeout(() => sessionStorage.removeItem(CHUNK_RELOAD_FLAG), 5000)
    return () => clearTimeout(timer)
  }, [])

  const authChecked = useAppSelector((state) => state.app.authChecked)

  if (!authChecked) return <Splash />

  return <AppRouter />
}

export default App
