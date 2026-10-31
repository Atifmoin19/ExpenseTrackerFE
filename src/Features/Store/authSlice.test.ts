import { describe, expect, it } from 'vitest'
import { authReducer, clearTokens, setDemo, setTokens } from 'Features/Store/authSlice'

describe('authSlice isDemo', () => {
  it('survives token refreshes and is cleared on logout', () => {
    let state = authReducer(undefined, setTokens({ accessToken: 'a', refreshToken: 'r' }))
    state = authReducer(state, setDemo(true))
    state = authReducer(state, setTokens({ accessToken: 'a2', refreshToken: 'r2' }))
    expect(state.isDemo).toBe(true)
    state = authReducer(state, clearTokens())
    expect(state).toEqual({ accessToken: null, refreshToken: null, isDemo: false })
  })
})
