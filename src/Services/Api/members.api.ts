import { appApi } from 'Services/Api/app.api'
import { TRIP_MEMBERS, TRIP_MEMBER_DETAIL, TRIP_MEMBER_ROLE } from 'Constants/endpoints'
import type { ApiEnvelope, MemberRole, TripMember } from 'Features/Schema/types'

export interface AddMemberPayload {
  email: string
}

export const membersApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    listMembers: builder.query<ApiEnvelope<TripMember[]>, string>({
      query: (tripId) => ({ url: TRIP_MEMBERS(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Member', id: tripId }],
    }),
    addMember: builder.mutation<ApiEnvelope<TripMember>, { tripId: string; body: AddMemberPayload }>({
      query: ({ tripId, body }) => ({ url: TRIP_MEMBERS(tripId), method: 'POST', body }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Member', id: tripId },
        { type: 'Trip', id: tripId },
      ],
    }),
    removeMember: builder.mutation<ApiEnvelope<null>, { tripId: string; uid: string }>({
      query: ({ tripId, uid }) => ({ url: TRIP_MEMBER_DETAIL(tripId, uid), method: 'DELETE' }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Member', id: tripId },
        { type: 'Trip', id: tripId },
        { type: 'Dashboard', id: tripId },
      ],
    }),
    updateMemberRole: builder.mutation<ApiEnvelope<TripMember>, { tripId: string; uid: string; role: MemberRole }>({
      query: ({ tripId, uid, role }) => ({ url: TRIP_MEMBER_ROLE(tripId, uid), method: 'PATCH', body: { role } }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Member', id: tripId },
        { type: 'Trip', id: tripId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useListMembersQuery, useAddMemberMutation, useRemoveMemberMutation, useUpdateMemberRoleMutation } =
  membersApi
