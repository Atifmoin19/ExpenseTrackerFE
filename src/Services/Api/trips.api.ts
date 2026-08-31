import { appApi } from 'Services/Api/app.api'
import { TRIPS, TRIP_DETAIL, TRIP_SETTINGS } from 'Constants/endpoints'
import type { ApiEnvelope, ExpensePermission, Trip } from 'Features/Schema/types'

export interface CreateTripPayload {
  name: string
  description?: string
  startDate: string
  endDate: string
  currency: string
}

export type UpdateTripPayload = Partial<CreateTripPayload>

export interface TripSettingsPayload {
  expensePermission: ExpensePermission
  allowedMemberIds: string[]
}

export const tripsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    listTrips: builder.query<ApiEnvelope<Trip[]>, void>({
      query: () => ({ url: TRIPS, method: 'GET' }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((t) => ({ type: 'Trip' as const, id: t.id })), { type: 'TripList' as const, id: 'LIST' }]
          : [{ type: 'TripList' as const, id: 'LIST' }],
    }),
    getTrip: builder.query<ApiEnvelope<Trip>, string>({
      query: (tripId) => ({ url: TRIP_DETAIL(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Trip', id: tripId }],
    }),
    createTrip: builder.mutation<ApiEnvelope<Trip>, CreateTripPayload>({
      query: (body) => ({ url: TRIPS, method: 'POST', body }),
      invalidatesTags: [{ type: 'TripList', id: 'LIST' }],
    }),
    updateTrip: builder.mutation<ApiEnvelope<Trip>, { tripId: string; body: UpdateTripPayload }>({
      query: ({ tripId, body }) => ({ url: TRIP_DETAIL(tripId), method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
        { type: 'TripList', id: 'LIST' },
      ],
    }),
    deleteTrip: builder.mutation<ApiEnvelope<null>, string>({
      query: (tripId) => ({ url: TRIP_DETAIL(tripId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, tripId) => [
        { type: 'Trip', id: tripId },
        { type: 'TripList', id: 'LIST' },
      ],
    }),
    updateTripSettings: builder.mutation<ApiEnvelope<Trip>, { tripId: string; body: TripSettingsPayload }>({
      query: ({ tripId, body }) => ({ url: TRIP_SETTINGS(tripId), method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { tripId }) => [{ type: 'Trip', id: tripId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useUpdateTripSettingsMutation,
} = tripsApi
