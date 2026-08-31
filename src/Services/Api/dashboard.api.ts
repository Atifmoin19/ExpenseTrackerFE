import { appApi } from 'Services/Api/app.api'
import { DASHBOARD_SUMMARY, DASHBOARD_CHARTS, TRIP_TIMELINE } from 'Constants/endpoints'
import type { ApiEnvelope, DashboardCharts, DashboardSummary, TimelineActivity } from 'Features/Schema/types'

export interface ListTimelineParams {
  tripId: string
  limit?: number
  cursor?: string
}

export const dashboardApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<ApiEnvelope<DashboardSummary>, string>({
      query: (tripId) => ({ url: DASHBOARD_SUMMARY(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Dashboard', id: tripId }],
    }),
    getDashboardCharts: builder.query<ApiEnvelope<DashboardCharts>, string>({
      query: (tripId) => ({ url: DASHBOARD_CHARTS(tripId), method: 'GET' }),
      providesTags: (_result, _error, tripId) => [{ type: 'Dashboard', id: tripId }],
    }),
    getTripTimeline: builder.query<ApiEnvelope<TimelineActivity[]>, ListTimelineParams>({
      query: ({ tripId, ...params }) => ({ url: TRIP_TIMELINE(tripId), method: 'GET', params }),
      providesTags: (_result, _error, { tripId }) => [{ type: 'Timeline', id: tripId }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetDashboardSummaryQuery, useGetDashboardChartsQuery, useGetTripTimelineQuery } = dashboardApi
