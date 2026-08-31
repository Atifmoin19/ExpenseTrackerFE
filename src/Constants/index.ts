export const BASE_URL          = import.meta.env.VITE_BASE_URL ?? ''
export const APP_ENV           = import.meta.env.VITE_APP_ENV  ?? 'development'
export const IS_PROD           = APP_ENV === 'production'
export const IS_DEV            = APP_ENV === 'development'

// Google Identity Services OAuth client id. Blank until the user configures
// it in .env — callers must hide/disable Google sign-in when this is empty
// rather than erroring (see Components/GoogleSignInButton).
export const GOOGLE_CLIENT_ID  = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

// Must byte-for-byte match the backend's VAPID_PUBLIC_KEY (see CONTRACT.md).
export const VAPID_PUBLIC_KEY  = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''
