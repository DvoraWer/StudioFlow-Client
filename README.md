# StudioFlow — React client

Minimal front end for the StudioFlow API. It exists to demonstrate the backend
end to end (spec §39–§42); it is intentionally small and unstyled beyond the basics.

## Prerequisites

- Node.js 20+ and npm
- The StudioFlow API running locally on `http://localhost:5235`
  (from the `StudioFlow.API` project — it also starts PostgreSQL migrations + seed in Development)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The Vite dev server proxies `/api/*` to `http://localhost:5235`, so the browser
talks to the client's own origin and no CORS setup is needed on the API.

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/login` | Login / Register | New accounts are always Members. JWT is stored in `localStorage`. |
| `/classes` | Classes | Search + status/date filters + **server-side** pagination. |
| `/classes/:id` | Class details | Tags, seat counts; role-aware **Register / Join Waitlist / Cancel** buttons. |
| `/me/registrations` | My registrations | Member only; cancel from here. |

## Demo users

All use password **`Password123!`**:

- `admin@studioflow.local` — Admin
- `instructor@studioflow.local` — Instructor
- `member1@studioflow.local` … `member3@studioflow.local` — Members

## The concurrency case (spec §41)

When two members race for the last seat, the loser's `POST /register` returns
HTTP 409 with `code: "CONCURRENCY_CONFLICT"`. The details page shows:

> The last available seat was taken by another user. Please refresh the class.

…and never a generic "something went wrong".

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Deploying (Render Static Site)

A production build has no dev proxy, so it must know where the API lives.
Set **`VITE_API_BASE_URL`** to the API's origin (e.g. `https://<api>.onrender.com`,
no trailing `/api`). Vite bakes it in at **build time**. When it is unset (local
dev) requests stay relative and go through the proxy.

Render settings:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL` = the API URL
- **Redirects/Rewrites:** source `/*`, destination `/index.html`, action **Rewrite**.
  The app uses `BrowserRouter`, so without this a refresh on a route such as
  `/classes/5` returns 404.

The API must allow this site's origin: set `Cors__AllowedOrigins` on the API
service to the static site's URL.
