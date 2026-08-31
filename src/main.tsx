import { createRoot } from 'react-dom/client'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { store, persistor } from 'Features/Store/store'
import { theme } from 'Styles'
import App from 'App'
import { ErrorBoundary } from 'Components/ErrorBoundary'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

function EmotionProvider({ children }: { children: React.ReactNode }) {
  const cache = createCache({ key: 'chakra' })
  return <CacheProvider value={cache}>{children}</CacheProvider>
}

// Registers the vite-plugin-pwa service worker (precaching, runtime caching,
// and the offline-expense background sync queue defined in src/sw.ts).
if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}

createRoot(document.getElementById('root')!).render(
  <EmotionProvider>
    <ChakraProvider resetCSS theme={theme}>
      <Provider store={store}>
        <Router>
          <PersistGate loading={null} persistor={persistor}>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </PersistGate>
        </Router>
      </Provider>
    </ChakraProvider>
  </EmotionProvider>,
)
