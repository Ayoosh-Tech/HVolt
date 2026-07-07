# HVolt — Frontend (React)

The HVolt community electricity-monitoring UI. This version is wired to the real
**HVolt API** (see `../hvolt-backend-v2`) instead of local mock data — every
neighborhood, report, and user you see comes from the backend over HTTP.

## Getting started

```bash
cp .env.example .env      # set VITE_API_URL if your API isn't on localhost:5000
npm install
npm run dev                # http://localhost:5173
```

You'll need the backend running too — see `../hvolt-backend-v2/README.md`
(`npm install && npm run seed && npm run dev`). Without it, the map/dashboard will
just show empty states and a toast explaining the API couldn't be reached.

## Project structure

```
index.html
src/
  main.jsx                       App bootstrap, global CSS imports
  App.jsx                        Layout shell + view router
  api/
    client.js                    Low-level fetch wrapper (auth header, errors)
    endpoints.js                 One function per backend route (authApi, reportsApi, ...)
    normalize.js                 Adapts API documents into the shape components expect
  context/AppContext.jsx         All shared state, now synced with the API
  i18n/                          English + Hausa string tables, useTranslation() hook
  utils/
    helpers.js                   Pure functions (status derivation, formatting)
    icons.jsx                    Shared SVG icon components
  styles/                        main.css / components.css / responsive.css
  components/
    Layout/                      Logo, Sidebar, TopBar, BottomNav
    Auth/AuthModal.jsx           Login / register / forgot-password
    Map/                         MapPage, MapPanel, MapView (Leaflet), NeighborhoodList
    Dashboard/                   Dashboard, LightScoreGauge, OutageChart
    Report/ReportForm.jsx
    Admin/AdminDashboard.jsx     Reports / Users / Analytics tabs
    Toast/ToastContainer.jsx
```

## How data flows now

There is no more `src/data/mockData.js` — it's been deleted. Instead:

- **On load**, `AppContext` fetches `GET /api/neighborhoods` and `GET /api/reports`
  (public routes, no auth needed), and — if a JWT is already saved from a previous
  session — calls `GET /api/auth/me` to restore the logged-in user.
- **Login / register / forgot password** call `POST /api/auth/login`,
  `/register`, `/forgot-password` directly. The returned JWT is stored in
  `localStorage` (`hvolt.token`) so a session survives a page reload — a real app
  needs this, unlike a self-contained demo.
- **Reporting an outage/restoration** calls `POST /api/reports` with the selected
  neighborhood's coordinates, then refetches reports + neighborhoods so the map,
  dashboard, and Light Score gauges reflect the server's latest calculation.
- **Confirm / flag** (the buttons in the map popup) resolve the neighborhood back
  to its most recent report and call `POST /api/reports/:id/confirm` or
  `/:id/flag` — the map popup itself didn't need to change, since it only ever
  dealt with a neighborhood id.
- **Admin actions** (verify/reject/remove a report, promote/suspend a user) call
  the `/api/admin/*` routes with the JWT, and the user list is fetched lazily the
  first time the admin's "Users" tab is opened.
- `api/normalize.js` is what makes all of this invisible to the existing
  components: it converts MongoDB's nested documents (`location.coordinates`,
  `lightScore.value`, populated `reporter`/`neighborhood` objects, a
  `confirmations` array) into the same flat shape (`{ id, name, lat, lng, score }`,
  `{ id, neighborhoodId, reporter, confirmations, ts }`, etc.) the components were
  already built against — so **no component beyond `ReportForm.jsx` needed to
  change** (see below).

## The one necessary component change

`ReportForm.jsx`'s submit handler now `await`s `submitReport(...)` instead of
treating it as synchronous, since it's a real network call. Its default selected
neighborhood also now fills in via a `useEffect` once the list arrives from the
API, rather than at mount (when the list is still empty). Everything else —
Dashboard, MapView, AdminDashboard, Sidebar, etc. — is unchanged.

## Known trade-offs

- Backend validation/error messages (e.g. "Invalid email or password.") come
  through in English regardless of the active language, since they're generated
  server-side. Everything else in the UI is still fully bilingual.
- After any report action, the app refetches the full neighborhoods + reports
  lists rather than patching state locally, for simplicity and correctness. This
  is fine at demo/community scale; a higher-traffic deployment would want the
  backend to push updates over the Socket.IO connection it already sets up
  (see `hvolt-backend-v2/src/sockets/index.js`) instead of polling on every
  mutation.
