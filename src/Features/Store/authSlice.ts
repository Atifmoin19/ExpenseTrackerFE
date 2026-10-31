import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ── State shape ───────────────────────────────────────────────────────────────
// Backend-issued JWT session (see Services/auth.ts + CONTRACT.md "Auth model").
// Persisted via the store's existing redux-persist config (sessionStorage) so
// a page reload doesn't log the user out — only closing the tab does.
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  // True for a "Try the demo" sandbox session (POST /auth/demo). Separate from
  // setTokens so silent token refreshes don't touch it.
  isDemo: boolean
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isDemo: false,
}

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    clearTokens: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.isDemo = false
    },
    setDemo: (state, action: PayloadAction<boolean>) => {
      state.isDemo = action.payload
    },
  },
})

export const { setTokens, clearTokens, setDemo } = authSlice.actions
export const authReducer = authSlice.reducer
