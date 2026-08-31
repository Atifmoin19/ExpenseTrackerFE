import { useCallback, useEffect, useState } from 'react'
import { VAPID_PUBLIC_KEY } from 'Constants'
import { useRegisterDeviceMutation, type RegisterDevicePayload } from 'Services/Api/notifications.api'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

/**
 * Web Push subscribe/unsubscribe — replaces the old FCM `requestPushToken`
 * flow. Subscribes via the app's single PWA service worker (src/sw.ts,
 * which now also has the `push`/`notificationclick` listeners — no separate
 * firebase-messaging-sw.js) and registers the resulting subscription with
 * the backend (POST /notifications/register-device).
 */
export function usePushSubscription() {
  const [registerDevice] = useRegisterDeviceMutation()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    Boolean(VAPID_PUBLIC_KEY)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      if (!isSupported) {
        setIsChecking(false)
        return
      }
      try {
        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        if (!cancelled) setIsSubscribed(Boolean(existing))
      } catch {
        // treat as unsubscribed
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }
    void check()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !('Notification' in window)) return false
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await registerDevice(subscription.toJSON() as RegisterDevicePayload).unwrap()
    setIsSubscribed(true)
    return true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported])

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()
    setIsSubscribed(false)
  }, [])

  return { isSupported, isSubscribed, isChecking, subscribe, unsubscribe }
}
