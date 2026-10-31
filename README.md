# All Square (frontend)

Split group trip expenses with friends, see who owes whom, and settle up in as few payments as possible. Installable PWA that keeps working offline.

- Live: https://expense-tracker-fe-xi.vercel.app
- Backend: [ExpenseTrackerBE](https://github.com/Atifmoin19/ExpenseTrackerBE) (FastAPI + Postgres)
- Case study: [CASE_STUDY.md](./CASE_STUDY.md)

## Features

- Trips with members, invite links (`/invite/:code`), and per-trip admin roles
- Expenses with four split modes: equal, exact amounts, percentages, shares
- Receipts uploaded straight to S3-compatible storage through presigned URLs
- Dashboard: member balances plus spend by category, by member, and over time (recharts)
- Suggested settlements that minimise the number of payments, plus recorded settlements
- Email OTP and Google sign-in, with silent JWT refresh
- Web Push notifications (VAPID) when someone adds an expense, settles up, or joins
- Offline: cached reads, and expenses added offline are queued and synced on reconnect
- Platform admin analytics at `/admin` (separate from trip admin)

## Stack

React 18, TypeScript, Vite 5, Chakra UI 2, Redux Toolkit + RTK Query, react-hook-form + zod, recharts, react-router 7, idb, Workbox 7 (via `vite-plugin-pwa`, `injectManifest` strategy), deployed on Vercel.

## Getting started

Requires Node 18+ (tested on Node 22) and a running backend (see the backend README; it runs fine against a local Postgres).

```bash
npm install
cp .env.example .env.local   # point VITE_BASE_URL at your backend
npm run dev                  # http://localhost:5173
```

| Variable | Purpose |
| --- | --- |
| `VITE_BASE_URL` | Backend origin, no trailing slash, e.g. `http://localhost:8000` |
| `VITE_APP_ENV` | `development` or `production` (Redux devtools, persist key) |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Services client id. Blank hides Google sign-in |
| `VITE_VAPID_PUBLIC_KEY` | Must match the backend `VAPID_PUBLIC_KEY`. Blank disables push |

All `VITE_*` values end up in the public bundle, so never put secrets in them.

Local login: with EmailJS unset on the backend and `ENV=development`, requesting an OTP returns the code in the API response and logs it in the backend console.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server. The service worker is disabled in dev |
| `npm run build` | Type-check (`tsc -b`) and build to `build/`, including `sw.js` |
| `npm run preview` | Serve the production build (use this to test PWA, offline, push) |
| `npm run lint` | ESLint |

There is no frontend test suite yet. The backend has an end-to-end pytest suite covering the main flows.

## Project layout

```
src/
  Pages/           route screens (lazy-loaded), see MainApp.tsx for the route table
  Components/      shared UI (AppShell, TripLayout, AuthForm, ChartCard, ...)
  Features/
    Store/         Redux store, auth/user/app slices, redux-persist (per-tab sessionStorage)
    Schema/        zod schemas and shared types
    Hooks/         useOfflineSync, useAssetUrl, ...
  Services/
    Api/           RTK Query endpoints (one file per resource)
    baseQuery.ts   axios base query with deduped 401 -> refresh -> retry
    offlineDb.ts   IndexedDB store for expenses created offline
    offlineQueue.ts foreground replay of queued expenses
    uploads.ts     presigned upload flow
  Constants/       env-derived config and API endpoint paths
  RouteProtection/ private, public-only, profile and platform-admin guards
  sw.ts            service worker: precache, runtime caching, background sync, push
```

## Deployment

Vercel builds with `npm run build` and serves `build/`. `vercel.json` rewrites every non-asset path to `index.html` so client-side routes work on refresh. Set the `VITE_*` variables in the Vercel project settings.
