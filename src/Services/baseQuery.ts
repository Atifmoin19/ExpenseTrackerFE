import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { BASE_URL } from 'Constants'
import { setTokens, clearTokens } from 'Features/Store/authSlice'
import { refreshTokens } from 'Services/auth'
import type { AppDispatch, RootState } from 'Features/Store/store'

export { BASE_URL }

interface AxiosBaseQueryArgs {
  url: string
  method?: AxiosRequestConfig['method']
  body?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

interface ApiError {
  status?: number
  data?: unknown
  message?: string
}

function toApiError(err: unknown): { error: ApiError } {
  if (axios.isAxiosError(err)) {
    const responseData = err.response?.data as { error?: { code?: string; message?: string } } | undefined
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data ?? err.message,
        message: responseData?.error?.message ?? err.message,
      },
    }
  }
  return { error: { status: 500, data: 'An unexpected error occurred' } }
}

// Dedupes concurrent 401s onto a single in-flight POST /auth/refresh instead
// of firing one refresh call per failed request.
let refreshInFlight: Promise<string | null> | null = null

function performRefresh(getState: () => RootState, dispatch: AppDispatch): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const currentRefreshToken = getState().auth.refreshToken
      if (!currentRefreshToken) return null
      try {
        const tokens = await refreshTokens(currentRefreshToken)
        dispatch(setTokens(tokens))
        return tokens.accessToken
      } catch {
        dispatch(clearTokens())
        return null
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/**
 * axiosBaseQuery — drop-in RTK Query baseQuery using axios.
 *
 * Attaches `Authorization: Bearer <accessToken>` from the Redux-stored
 * session (Features/Store/authSlice, populated by OTP/Google login — see
 * Services/auth.ts) on every request; Firebase's `getIdToken()` is gone.
 *
 * On a 401, attempts one silent `POST /auth/refresh` and retries the
 * original request once. If refresh also fails (no refresh token, or the
 * refresh call itself 401s), clears auth state and hard-redirects to
 * /login — a plain redirect rather than a router navigate because this
 * runs outside React/Router context.
 *
 * Usage:
 *   createApi({ baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }) })
 */
export const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string }): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = 'GET', body, params, headers }, { getState, dispatch }) => {
    const typedGetState = getState as () => RootState
    const typedDispatch = dispatch as AppDispatch

    const request = (token: string | null) =>
      axios({
        url: baseUrl + url,
        method,
        data: body,
        params,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      })

    try {
      const result = await request(typedGetState().auth.accessToken)
      return { data: result.data }
    } catch (err) {
      const is401 = axios.isAxiosError(err) && err.response?.status === 401
      if (!is401) return toApiError(err)

      const newAccessToken = await performRefresh(typedGetState, typedDispatch)
      if (!newAccessToken) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return toApiError(err)
      }

      try {
        const retryResult = await request(newAccessToken)
        return { data: retryResult.data }
      } catch (retryErr) {
        return toApiError(retryErr)
      }
    }
  }
