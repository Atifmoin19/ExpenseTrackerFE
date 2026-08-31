import { appApi } from 'Services/Api/app.api'
import { NOTIFICATIONS, NOTIFICATIONS_REGISTER_DEVICE, NOTIFICATION_READ } from 'Constants/endpoints'
import type { ApiEnvelope, AppNotification } from 'Features/Schema/types'

export interface ListNotificationsParams {
  limit?: number
  cursor?: string
}

/** Web Push subscription shape (PushSubscription.toJSON()) — replaces the old `{fcmToken}` body. */
export interface RegisterDevicePayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number | null
}

export const notificationsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query<ApiEnvelope<AppNotification[]>, ListNotificationsParams | void>({
      query: (params) => ({ url: NOTIFICATIONS, method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((n) => ({ type: 'Notification' as const, id: n.id })),
              { type: 'Notification' as const, id: 'LIST' },
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    registerDevice: builder.mutation<ApiEnvelope<null>, RegisterDevicePayload>({
      query: (body) => ({ url: NOTIFICATIONS_REGISTER_DEVICE, method: 'POST', body }),
    }),
    markNotificationRead: builder.mutation<ApiEnvelope<AppNotification>, string>({
      query: (id) => ({ url: NOTIFICATION_READ(id), method: 'PATCH' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData('listNotifications', undefined, (draft) => {
            const item = draft?.data?.find((n) => n.id === id)
            if (item) item.read = true
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: (_result, _error, id) => [{ type: 'Notification', id }],
    }),
  }),
  overrideExisting: false,
})

export const { useListNotificationsQuery, useRegisterDeviceMutation, useMarkNotificationReadMutation } =
  notificationsApi
