import { appApi } from 'Services/Api/app.api'
import { TRIP_SETTLEMENTS, TRIP_SETTLEMENTS_SUGGESTED } from 'Constants/endpoints'
import type { ApiEnvelope, Settlement, SettlementMethod, SuggestedSettlement } from 'Features/Schema/types'

export interface CreateSettlementPayload {
  fromUid: string
  toUid: string
  amount: number
  method: SettlementMethod
  note?: string
}

export const settlementsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    listSettlements: builder.query<ApiEnvelope<Settlement[]>, string>({
      query: (tripId) => ({ url: TRIP_SETTLEMENTS(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Settlement', id: tripId }],
    }),
    getSuggestedSettlements: builder.query<ApiEnvelope<SuggestedSettlement[]>, string>({
      query: (tripId) => ({ url: TRIP_SETTLEMENTS_SUGGESTED(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Settlement', id: `${tripId}-suggested` }],
    }),
    createSettlement: builder.mutation<
      ApiEnvelope<Settlement>,
      { tripId: string; body: CreateSettlementPayload; settledBy: string }
    >({
      query: ({ tripId, body }) => ({ url: TRIP_SETTLEMENTS(tripId), method: 'POST', body }),
      async onQueryStarted({ tripId, body, settledBy }, { dispatch, queryFulfilled }) {
        const optimistic: Settlement = {
          id: `optimistic-${Date.now()}`,
          tripId,
          fromUid: body.fromUid,
          toUid: body.toUid,
          amount: body.amount,
          method: body.method,
          note: body.note,
          settledBy,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }
        const patch = dispatch(
          settlementsApi.util.updateQueryData('listSettlements', tripId, (draft) => {
            if (draft?.data) draft.data.unshift(optimistic)
          }),
        )
        // optimistically drop/shrink the matching suggested transaction
        const suggestedPatch = dispatch(
          settlementsApi.util.updateQueryData('getSuggestedSettlements', tripId, (draft) => {
            if (!draft?.data) return
            draft.data = draft.data
              .map((s) => {
                if (s.fromUid === body.fromUid && s.toUid === body.toUid) {
                  const remaining = Math.round((s.amount - body.amount) * 100) / 100
                  return remaining > 0.01 ? { ...s, amount: remaining } : null
                }
                return s
              })
              .filter((s): s is SuggestedSettlement => s !== null)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
          suggestedPatch.undo()
        }
      },
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Settlement', id: tripId },
        { type: 'Settlement', id: `${tripId}-suggested` },
        { type: 'Dashboard', id: tripId },
        { type: 'Timeline', id: tripId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useListSettlementsQuery, useGetSuggestedSettlementsQuery, useCreateSettlementMutation } =
  settlementsApi
