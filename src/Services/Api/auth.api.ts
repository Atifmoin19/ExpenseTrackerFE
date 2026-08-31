import { appApi } from 'Services/Api/app.api'
import { AUTH_ME } from 'Constants/endpoints'
import type { ApiEnvelope, User } from 'Features/Schema/types'

export interface UpdateMePayload {
  displayName?: string
  photoUrl?: string
}

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiEnvelope<User>, void>({
      query: () => ({ url: AUTH_ME, method: 'GET' }),
      providesTags: ['Me'],
    }),
    // Replaces the old Firebase-client-side profile update (updateProfile +
    // POST /auth/sync) — the backend is now the sole source of truth for the
    // profile, updated directly via PATCH /auth/me.
    updateMe: builder.mutation<ApiEnvelope<User>, UpdateMePayload>({
      query: (body) => ({ url: AUTH_ME, method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetMeQuery, useLazyGetMeQuery, useUpdateMeMutation } = authApi
