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

- [ ] An `/admin` shell provides consistent navigation to all dashboard sections + sign-out, wrapping `/admin/*` pages.
- [ ] `/admin/sign-in` is restyled using tokens + Card + Field + Button, consistent with the public brand.
- [ ] The shell and sign-in are usable at tablet width and up.
- [ ] Existing inner admin pages render inside the shell without behavior change (their own restyle lands in later slices).
- [ ] The Auth.js sign-in flow and `/admin` guard behavior are unchanged.
- [ ] A DOM snapshot for the shell + sign-in is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)
