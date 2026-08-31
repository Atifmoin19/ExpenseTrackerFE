import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ── State shape ───────────────────────────────────────────────────────────────
interface AppState {
  isLoggedIn: boolean
  /** true once useAuthBootstrap's initial session check has resolved (splash gate) */
  authChecked: boolean
  isOnline: boolean
}

const initialState: AppState = {
  isLoggedIn: false,
  authChecked: false,
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.authChecked = action.payload
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    resetApp: (state) => {
      state.isLoggedIn = false
      // authChecked stays true — we've already resolved the initial auth state once
    },
  },
})

export const { setLoggedIn, setAuthChecked, setOnline, resetApp } = appSlice.actions
export const appReducer = appSlice.reducer
