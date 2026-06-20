# 09 — Professional authentication + guarded /admin shell

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

Authenticated access to the dashboard for the single **Professional**, using **Auth.js
(NextAuth)** with a credentials provider backed by the `professional` document (email,
hashed password, `email_verified`). Middleware guards the `/admin` routes, and an
authenticated Professional sees a minimal dashboard shell. Patients are never authenticated
anywhere. This unblocks all dashboard slices.

## Acceptance criteria

- [x] The Professional can sign in with email + password; bad credentials are rejected.
- [x] `/admin` routes redirect to sign-in when unauthenticated.
- [x] An authenticated Professional sees a dashboard shell.
- [x] A single `professional` record is seeded with the password stored hashed.
- [x] Integration tests cover guarded vs. unguarded access.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)

## Comments

- 2026-06-20: Auth.js (NextAuth v5) wired with a Credentials provider over a new **Professional repository seam** (`lib/professional/`: `Professional` type, interface, in-memory fake + Mongo adapter keyed on email, `getProfessionalRepository` composition root) — mirrors the Appointment seam exactly. The testable core lives in `lib/auth/`: `verifyProfessionalCredentials(email, password, deps)` (email normalized, unknown-email and wrong-password both return null), `password.ts` (bcryptjs hash/verify — pure-JS, no native build), and `guard.ts` (`isProtectedAdminPath` / `canAccess` — the pure access decision). NextAuth uses the **split-config** pattern so the middleware stays edge-safe: `auth.config.ts` (pages + `authorized` callback delegating to `canAccess`, no Node-only imports) drives `middleware.ts` (matcher `/admin`, `/admin/:path*`); the full `auth.ts` (Credentials provider + bcrypt + repo, JWT sessions) backs `app/api/auth/[...nextauth]/route.ts`. UI: `/admin` dashboard shell (shows the signed-in email + server-action sign-out) and an unprotected `/admin/sign-in` client page (generic error, no field disclosure). Seeding: `scripts/seed-professional.mjs` (`npm run seed:professional`) upserts the single `professional` doc with a bcrypt-hashed password from `SEED_PROFESSIONAL_*` env; `AUTH_SECRET` added to `.env.example`. Tests (14 new): credentials accept/reject/normalize/empty, the `canAccess`/`isProtectedAdminPath` guard matrix, and the real NextAuth `authorized` callback for guarded-vs-unguarded access. `npm test` 74/74 green; `npm run typecheck` clean; `npm run build` clean (Middleware + `/admin` + `/api/auth/[...nextauth]` all compiled). Unblocks 10–15.
- Testing note: the guarded-vs-unguarded decision is covered at the NextAuth `authorized`-callback boundary (`auth-config.test.ts`) and as a pure unit, plus credentials through the in-memory fake — consistent with the seam-testing approach (no full HTTP server spin-up; the middleware/JWT glue is verified by the build). The live sign-in→Mongo path still needs a real `MONGODB_URI` + seeded Professional to exercise at runtime, same caveat as slice 01.
