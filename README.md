# Citizens Reporting Solution

A citizens incident-reporting app: users submit incidents (accidents, fighting, rioting, fire, theft, vandalism, medical, other) with a photo and geolocation, and every other logged-in user sees them appear live.

- **`backend/`** — NestJS + TypeScript API, Prisma + PostgreSQL (Neon), JWT auth, Socket.IO for live push, image uploads.
- **`mobile/`** — Expo (React Native + TypeScript) app: login/register, live incident feed with category filters, add-incident form (camera + gallery + GPS), my-reports, in-app push-style notification toast.

## How the requirements map to the code

| Requirement | Where |
|---|---|
| Add a new incident | `mobile/src/screens/AddIncidentScreen.tsx` → `POST /api/incidents` |
| Browse all submitted incidents | `mobile/src/screens/FeedScreen.tsx` → `GET /api/incidents` |
| Auto-post so others see it immediately | `backend/src/incidents/incidents.gateway.ts` emits `incident:new` over Socket.IO the moment an incident is created |
| Get notified when a new incident is added | `mobile/src/context/SocketContext.tsx` + `mobile/src/components/NotificationToast.tsx` — a live toast appears app-wide and the feed prepends the new item without a refresh |
| Browse by category | Category chips in `FeedScreen.tsx`, filtered server-side via `GET /api/incidents?category=` |
| Geolocation (lat/lng) | `expo-location` captures GPS coords + reverse-geocoded address in `AddIncidentScreen.tsx`; stored as `latitude`/`longitude` on `Incident` |
| Picture of the incident | `expo-image-picker` (camera or library) → uploaded as multipart form data → served from `backend/uploads` |
| Login so users can see what they submitted | JWT auth (`backend/src/auth`) + `mobile/src/screens/MyReportsScreen.tsx` (`GET /api/incidents/mine`) |

## Prerequisites

- Node.js 18+ (this was built and tested on Node 24)
- A phone with the **Expo Go** app installed (App Store / Play Store), on the **same Wi-Fi network** as your computer — this is the fastest way to see the app running with no Android Studio / Xcode setup
- Your computer's firewall must allow inbound connections on port `3000` (Windows will usually prompt the first time the backend starts)

## 1. Run the backend

```bash
cd backend
npm install          # already done if you're reading this right after setup
npx prisma migrate deploy   # applies migrations to the Postgres database in DATABASE_URL
npm run start:dev
```

`backend/.env` already points `DATABASE_URL` at a dedicated Neon Postgres database (`citizens_reporting`) created specifically for this app — it does not touch any other project's data.

You should see `Citizens Reporting API running on http://0.0.0.0:3000/api`. Leave this running.

The API is a standard REST + WebSocket service:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/incidents`, `GET /api/incidents?category=FIRE`, `GET /api/incidents/mine`, `GET /api/incidents/:id`
- `POST /api/incidents` (multipart form: `title`, `description`, `category`, `latitude`, `longitude`, `address?`, `image?`)
- `DELETE /api/incidents/:id` (only the reporter can delete their own report)
- Socket.IO on the same port/host, event `incident:new`

## 2. Run the mobile app

In a second terminal:

```bash
cd mobile
npm install          # already done if you're reading this right after setup
npx expo start
```

Scan the QR code with the Expo Go app on your phone (Android: use the Expo Go "scan QR" option; iOS: scan with the regular Camera app).

The app automatically points itself at your computer's IP by reusing the same host Expo's dev server printed in the QR code (see `mobile/src/config.ts`) — no manual IP editing needed, as long as your phone and computer are on the same network and the backend is running on port 3000 on that same computer.

If the app can't reach the server (a banner will say so on login), double check:
- The backend terminal is still running and shows no errors
- Your phone and computer are on the same Wi-Fi (not phone data, not a guest network that isolates devices)
- Windows Firewall isn't blocking Node — allow it when prompted

## Trying it out

1. Register two different accounts (e.g. on your phone and in an emulator/second device, or just two accounts on one phone to see "my reports" vs "others' reports").
2. From one account, submit an incident with a photo and your current location.
3. On the other account's Feed tab, the new incident appears instantly with a notification toast — no pull-to-refresh needed.
4. Use the category chips to filter the feed (Accident, Fighting, Rioting, Fire, Theft, Vandalism, Medical, Other).
5. Open "My Reports" to see only what that logged-in user submitted, and tap into a report to delete it.

## Deploying to production (backend on Render + Android APK)

### A. Backend on Render — done

Deployed at **https://citizens-reporting-api.onrender.com** (Blueprint `exs-da0gr90jo6nc73egom80`, built from `backend/`'s `Dockerfile` via `render.yaml`). Health check: `https://citizens-reporting-api.onrender.com/api/health` → `{"status":"ok"}`.

Note: the free plan's disk is ephemeral — uploaded incident photos are lost if the service restarts/redeploys (registered users and incidents are safe, since those live in Postgres). Fine for a demo; revisit with persistent/object storage if this needs to be permanent.

### B. Mobile app pointed at the deployed backend — done

`mobile/eas.json`'s `preview` and `production` build profiles already set `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_SOCKET_URL` to the Render URL above, and `mobile/app.json` already has the EAS project linked (`extra.eas.projectId: 85c1ec5c-a80e-42ec-bfb5-5223d0620f25`).

### C. Build the APK with EAS — needs your login

This is the one step that needs you personally: EAS builds require an authenticated Expo account, and login is interactive (I can't complete it on your behalf). Once you're logged in here, I can trigger and monitor the actual build.

```bash
cd mobile
npx eas-cli login          # log in to your Expo account — do this yourself, interactively
npx eas-cli whoami          # confirms you're logged in
```

Then tell me you're logged in and I'll run:

```bash
npx eas-cli build -p android --profile preview --non-interactive
```

`eas build` prints a progress URL and, when done, a download link for the `.apk`. Install it on any Android phone (enable "install from unknown sources" if prompted) — it'll talk to the Render-hosted backend directly, from any network, no Expo Go or dev server needed.

## Project layout

```
backend/
  prisma/schema.prisma       User + Incident models (PostgreSQL)
  src/auth/                  register/login/JWT
  src/incidents/             CRUD + category filtering + image upload + Socket.IO gateway
  uploads/                   uploaded incident photos, served at /uploads/<file>
mobile/
  src/api/                   axios client + typed endpoints
  src/context/                AuthContext (session), SocketContext (live updates/notifications)
  src/navigation/             auth stack vs. main tabs, switched automatically on login state
  src/screens/                Login, Register, Feed, Add, My Reports, Profile, Incident Detail
  src/components/             IncidentCard, CategoryChip/Badge, NotificationToast, form inputs
  src/theme/                  colors, spacing, category color/icon mapping
```
