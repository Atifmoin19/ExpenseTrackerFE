import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery, BASE_URL } from '../baseQuery'

/**
 * appApi — the main RTK Query API slice.
 *
 * Domain endpoints live in one file per area (trips.api.ts, expenses.api.ts, ...)
 * and are wired in via `appApi.injectEndpoints` — never create a second `createApi`.
 */
export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: [
    'Trip',
    'TripList',
    'Member',
    'Invite',
    'Expense',
    'ExpenseList',
    'Dashboard',
    'Timeline',
    'Settlement',
    'Notification',
    'Me',
    'AdminStats',
    'AdminTripList',
  ],
  endpoints: () => ({}),
})
