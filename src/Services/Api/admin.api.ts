import { appApi } from 'Services/Api/app.api'
import { ADMIN_STATS_SUMMARY, ADMIN_STATS_SIGNUPS, ADMIN_TRIPS } from 'Constants/endpoints'
import type { AdminSignups, AdminStatsSummary, AdminTripSummary, ApiEnvelope } from 'Features/Schema/types'

export interface GetAdminSignupsParams {
  days?: number
  bucket?: 'daily' | 'weekly'
}

export interface ListAdminTripsParams {
  limit?: number
  cursor?: string
}

export const adminApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStatsSummary: builder.query<ApiEnvelope<AdminStatsSummary>, void>({
      query: () => ({ url: ADMIN_STATS_SUMMARY, method: 'GET' }),
      providesTags: ['AdminStats'],
    }),
    getAdminSignups: builder.query<ApiEnvelope<AdminSignups>, GetAdminSignupsParams | void>({
      query: (params) => ({ url: ADMIN_STATS_SIGNUPS, method: 'GET', params: params ?? undefined }),
      providesTags: ['AdminStats'],
    }),
    getAdminTrips: builder.query<ApiEnvelope<AdminTripSummary[]>, ListAdminTripsParams | void>({
      query: (params) => ({ url: ADMIN_TRIPS, method: 'GET', params: params ?? undefined }),
      providesTags: ['AdminTripList'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAdminStatsSummaryQuery, useGetAdminSignupsQuery, useGetAdminTripsQuery } = adminApi
