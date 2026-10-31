import { appApi } from 'Services/Api/app.api'
import { AUTH_ME } from 'Constants/endpoints'
import type { ApiEnvelope, User } from 'Features/Schema/types'
import { normalizeUser, type RawUser } from 'Services/auth'

// The backend's user object uses `id`; the rest of the app keys users by
// `uid`. Without this, a page reload (which re-fetches /auth/me) left
// profile.uid undefined: "Paid by" was blank and trip admin checks failed.
const toUserEnvelope = (res: ApiEnvelope<RawUser>): ApiEnvelope<User> => ({
  ...res,
  data: res.data ? normalizeUser(res.data) : (res.data as unknown as User),
})

export interface UpdateMePayload {
  displayName?: string
  photoUrl?: string
}

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiEnvelope<User>, void>({
      query: () => ({ url: AUTH_ME, method: 'GET' }),
      transformResponse: toUserEnvelope,
      providesTags: ['Me'],
    }),
    // Replaces the old Firebase-client-side profile update (updateProfile +
    // POST /auth/sync) — the backend is now the sole source of truth for the
    // profile, updated directly via PATCH /auth/me.
    updateMe: builder.mutation<ApiEnvelope<User>, UpdateMePayload>({
      query: (body) => ({ url: AUTH_ME, method: 'PATCH', body }),
      transformResponse: toUserEnvelope,
      invalidatesTags: ['Me'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetMeQuery, useLazyGetMeQuery, useUpdateMeMutation } = authApi
