import { appApi } from 'Services/Api/app.api'
import { TRIP_INVITES, INVITE_DETAIL, INVITE_ACCEPT } from 'Constants/endpoints'
import type { ApiEnvelope, Invite, InvitePreview, Trip } from 'Features/Schema/types'

export const invitesApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    createInvite: builder.mutation<ApiEnvelope<Invite>, string>({
      query: (tripId) => ({ url: TRIP_INVITES(tripId), method: 'POST' }),
      invalidatesTags: (_result, _error, tripId) => [{ type: 'Invite', id: tripId }],
    }),
    getInvitePreview: builder.query<ApiEnvelope<InvitePreview>, string>({
      query: (code) => ({ url: INVITE_DETAIL(code), method: 'GET' }),
      providesTags: (_result, _error, code) => [{ type: 'Invite', id: code }],
    }),
    acceptInvite: builder.mutation<ApiEnvelope<Trip>, string>({
      query: (code) => ({ url: INVITE_ACCEPT(code), method: 'POST' }),
      invalidatesTags: [{ type: 'TripList', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const { useCreateInviteMutation, useGetInvitePreviewQuery, useAcceptInviteMutation } = invitesApi
