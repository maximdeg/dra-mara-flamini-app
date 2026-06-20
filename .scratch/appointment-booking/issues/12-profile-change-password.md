# 12 — Professional profile + change password

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The Professional edits their profile (name, contact, WhatsApp number) and changes their
password from the dashboard.

## Acceptance criteria

- [x] The Professional can view and update profile fields, including the WhatsApp number.
- [x] Changing the password requires the current password and stores the new one hashed.
- [x] A wrong current password is rejected.
- [x] Tests cover profile update and password change (including the wrong-current-password case).

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)

## Comments

- 2026-06-20: The Professional seam (slice 09) grew two targeted updates — `updateProfile(email, profile)` and `updatePassword(email, hash)` (plus a `ProfessionalProfile = Pick<…, "name" | "phone" | "whatsappNumber">` type) — in the interface and both adapters, matching the Appointment seam's targeted-update style rather than clobbering via `upsert`. The deep, testable core is `lib/auth/change-password.ts`: `changePassword(email, current, new, deps) → { ok } | { ok:false; reason: "NotFound" | "WrongCurrentPassword" }`, which verifies the current password against the stored hash before hashing+persisting the new one; a wrong current password leaves the hash untouched. UI: guarded `/admin/profile` loads the Professional via the session email + `findByEmail`, and renders two client forms driven by `useActionState` server actions — profile (name, contact phone, WhatsApp number; trims input) and change password (current + new, surfaces the wrong-current-password message). Both actions re-check the session (defense-in-depth). Form-state types live in a plain `types.ts` because a `"use server"` module may only export async functions. Dashboard links to it. Tests (5 new): change-password happy path (new hash verifies, old no longer does), wrong-current rejection (hash unchanged), unknown Professional; and the seam round-trip for `updateProfile`/`updatePassword` via the in-memory fake. `npm test` 91/91 green; `npm run typecheck` clean; `npm run build` clean (`/admin/profile` compiled). Runtime caveat unchanged (live Mongo needs `MONGODB_URI` + a seeded Professional).
