import { AppRouter } from './MainApp'
import Splash from 'Pages/Splash'
import { useAppSelector } from 'Features/Store/common'
import { useAuthBootstrap } from 'Features/Hooks/useAuthBootstrap'
import { useOfflineSync } from 'Features/Hooks/useOfflineSync'
import { useAcceptPendingInvite } from 'Features/Hooks/useAcceptPendingInvite'

function App() {
  useAuthBootstrap()
  useOfflineSync()
  useAcceptPendingInvite()

  const authChecked = useAppSelector((state) => state.app.authChecked)

  if (!authChecked) return <Splash />

  return <AppRouter />
}

export default App
