# HVolt API (restructured)

Backend for **HVolt** — Node.js + Express + MongoDB + Socket.IO. Same functionality and
API surface as the original scaffold, reorganized into a conventional
**routes → controllers → services → models** layering for maintainability.

> Note: React is a frontend library and doesn't apply to a server. This backend stays
> Node/Express/MongoDB; see `../hvolt-react` for the React frontend.

## Getting started

```bash
cp .env.example .env      # fill in MONGO_URI, JWT secrets, CLIENT_URL
npm install
npm run seed               # creates sample neighborhoods + an admin user
npm run dev                 # starts the API on http://localhost:5000
```

Default seeded admin: `admin@hvolt.ng` / `ChangeMe123!` — **change this password
immediately** in any real deployment.

## Project structure

```
src/
  server.js                     App entry point — wires everything together
  config/db.js                  MongoDB connection
  models/                       User, Neighborhood, Report (Mongoose schemas)
  middleware/
    auth.js                     JWT auth + admin-role guard
    validate.js                 Shared express-validator error handler
    errorHandler.js             Centralized error + 404 handler
  services/
    tokenService.js             JWT sign/verify helpers
    lightScoreService.js        Light Score calculation algorithm
    neighborhoodService.js      Recomputes status + score, broadcasts updates
  controllers/                  Thin request handlers — one file per resource
    authController.js
    userController.js
    neighborhoodController.js
    reportController.js
    adminController.js
  routes/                       Route definitions + validation rules only
    authRoutes.js
    userRoutes.js
    neighborhoodRoutes.js
    reportRoutes.js
    adminRoutes.js
  sockets/index.js              Socket.IO rooms + real-time event wiring
  utils/seed.js                 Local dev seed data
```

## Why this layout

**Routes** declare the URL, HTTP method, and validation rules, then hand off to a
**controller**. **Controllers** read the request, call whatever **service** or model
method they need, and shape the HTTP response — they contain no business logic of
their own. **Services** hold logic that's reused across controllers or is complex
enough to deserve its own tests (Light Score math, JWT handling, the
status-recalculation-and-broadcast routine that runs after every report event).
This keeps any single file small and makes it obvious where to add new logic:
new business rule → a service; new HTTP endpoint → a route + controller method.

## Key design decisions

**Duplicate report prevention.** `reportController.create` rejects a new report from
the same user, for the same neighborhood and type, within
`DUPLICATE_REPORT_WINDOW_MINUTES` (default 5).

**Verification model.** Each report tracks `confirmations` and `flags` arrays. A
report auto-promotes to `verified` at `AUTO_VERIFY_CONFIRMATIONS` (default 5)
confirmations, and auto-escalates to `flagged` at 3 flags, at which point an admin
makes the final call via `PATCH /api/admin/reports/:id`.

**Light Score.** `services/lightScoreService.js` computes a 0–100 reliability score
per neighborhood from outage frequency, average outage duration, verification ratio,
and restoration speed over a trailing 30-day window. `services/neighborhoodService.js`
recalculates it after every new report, confirmation, or flag, and pushes the value
onto the neighborhood's `lightScore.history` for trend display.

**Real-time updates.** Clients join a `neighborhood:<id>` Socket.IO room (see
`sockets/index.js`) to receive `report:new`, `report:updated`, and
`neighborhood:update` events live. Signed-in users also join a private `user:<id>`
room for restoration notifications on neighborhoods they follow.

**Auth.** Stateless JWT in the `Authorization: Bearer <token>` header. Passwords are
hashed with bcrypt (12 rounds) and never returned from the API.

## API overview

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Log in |
| POST | /api/auth/forgot-password | – | Request reset link |
| POST | /api/auth/reset-password | – | Reset password with token |
| GET | /api/auth/me | user | Current user |
| GET | /api/neighborhoods | – | Search/filter neighborhoods |
| POST | /api/neighborhoods | admin | Add a neighborhood |
| GET | /api/reports | – | List reports (filterable) |
| POST | /api/reports | user | Report an outage or restoration |
| POST | /api/reports/:id/confirm | user | Confirm a report |
| POST | /api/reports/:id/flag | user | Flag a report as false |
| GET | /api/admin/reports | admin | Moderation queue |
| PATCH | /api/admin/reports/:id | admin | Verify/reject/flag a report |
| DELETE | /api/admin/reports/:id | admin | Remove a report |
| GET/PATCH | /api/admin/users | admin | Manage users |
| GET | /api/admin/analytics | admin | Dashboard analytics |

## What's not included (next steps)

- Email delivery for password resets (currently logs the link to the console — swap in
  SES/Postmark/etc. in `controllers/authController.js`).
- Cloud image storage for report photos (add an `imageUrl` field to `Report` and wire
  up S3/Cloudinary).
- Automated tests.
- Rate-limiting tuned for production traffic (current limits are conservative defaults).
