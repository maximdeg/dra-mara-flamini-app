# 04 — Admin shell + sign-in

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Build the **`/admin` shell** and restyle the sign-in page so the dashboard reads as part of
the same product. The shell is a persistent navigation surface linking the dashboard
sections (Appointments, Calendar, Work Schedule, Unavailable Days, Profile, Coverage) with a
sign-out affordance, wrapping all `/admin/*` pages; "Admin"/"dashboard" is a UI surface, not
a separate role (CONTEXT.md). The sign-in page (`/admin/sign-in`) is restyled with the
tokens, Card, Field, and Button primitives, brand-consistent with the public site. The
dashboard is usable from tablet width up.

Presentation-only: the Auth.js credential flow, middleware guard on `/admin`, and sign-in
behavior are unchanged.

## Acceptance criteria

- [x] An `/admin` shell provides consistent navigation to all dashboard sections + sign-out, wrapping `/admin/*` pages.
- [x] `/admin/sign-in` is restyled using tokens + Card + Field + Button, consistent with the public brand.
- [x] The shell and sign-in are usable at tablet width and up.
- [x] Existing inner admin pages render inside the shell without behavior change (their own restyle lands in later slices).
- [x] The Auth.js sign-in flow and `/admin` guard behavior are unchanged.
- [x] A DOM snapshot for the shell + sign-in is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)

## Comments

- 2026-06-21: Built the admin shell. To keep the signed-out sign-in page free of
  dashboard chrome, the authed pages were moved into an `app/admin/(dashboard)/`
  route group (URL-transparent — `/admin`, `/admin/appointments`, … all unchanged)
  with the shell as that group's `layout.tsx`; `app/admin/sign-in/` stays outside it.
  The shell is a sidebar with the brand, an `AdminNav` (client; `usePathname` marks
  the active section via `aria-current`), the signed-in email, and the sign-out
  server action; it mounts a ToastProvider for the admin slices to come, and
  collapses to a top bar at ≤720px. The overview page lost its now-duplicated nav and
  sign-out (both live in the shell) and became a welcome + quick-link Cards. The
  sign-in page is a centered Card on the brand gradient using Field/Button/Alert; its
  Auth.js `signIn` flow and copy are unchanged. The inner admin pages were only
  relocated — their content is untouched (slices 05–10 restyle them).
- Tests: AdminNav active-state + nav snapshot; sign-in rejected-credentials behavior
  + form snapshot (`signIn`/router mocked). `npm run typecheck` clean, `npm test`
  145/145 (123 existing unchanged + 22 ui), `npm run build` exit 0 (only the
  pre-existing `jose`/Edge-Runtime warning); all `/admin` URLs resolve unchanged.
