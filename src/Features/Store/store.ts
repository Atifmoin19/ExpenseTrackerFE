import persistReducer from 'redux-persist/es/persistReducer'
import { persistStore, type PersistConfig } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { appReducer } from './appReducer.slice'
import { userReducer } from './userSlice'
import { authReducer } from './authSlice'
import { appApi } from 'Services/Api/app.api'

/**
 * Tab isolation: each tab gets a unique persist key so state from
 * one tab never leaks into another tab (e.g. different user sessions).
 */
const TAB_ID_KEY = '__app_tab_id__'
let tabId = sessionStorage.getItem(TAB_ID_KEY)
if (!tabId) {
  tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  sessionStorage.setItem(TAB_ID_KEY, tabId)
}

const rootReducer = combineReducers({
  app: appReducer,
  user: userReducer,
  auth: authReducer,
  [appApi.reducerPath]: appApi.reducer,
})

// Derive RootState from rootReducer (before persisting) so types stay clean
export type RootState = ReturnType<typeof rootReducer>

const persistConfig: PersistConfig<RootState> = {
  key: `app-store_${import.meta.env.VITE_APP_ENV}_${tabId}`,
  storage: storageSession,
  blacklist: [
    appApi.reducerPath, // Never persist RTK Query cache
  ],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
      serializableCheck: false,
      immutableCheck: import.meta.env.VITE_APP_ENV === 'development',
    }).concat(appApi.middleware),
  devTools: import.meta.env.VITE_APP_ENV !== 'production',
})

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
