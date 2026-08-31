import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ── State shape ───────────────────────────────────────────────────────────────
// Backend-issued JWT session (see Services/auth.ts + CONTRACT.md "Auth model").
// Persisted via the store's existing redux-persist config (sessionStorage) so
// a page reload doesn't log the user out — only closing the tab does.
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
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
    },
  },
})

export const { setTokens, clearTokens } = authSlice.actions
export const authReducer = authSlice.reducer
