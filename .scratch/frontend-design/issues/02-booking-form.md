# 02 — Booking form (/agendar-visita)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Fully restyle the public booking form at `/agendar-visita` on top of the foundation from
slice 01. Introduce the **Field** primitive (a label-plus-control wrapper that associates
`<label>` with its native `<input>`/`<select>` and renders helper and error text), and lay
the form out in clear Card sections following the booking journey: identification → Visit
Type and its required sub-type (Consult Type / Practice Type) → coverage → Deposit → date and
time. The Deposit acknowledgment (amount + checkbox) is styled prominently. Server-side
Booking **Rejections** and validation errors render as visible, styled alerts in Spanish.
The whole flow is mobile-first responsive.

All existing behavior is preserved exactly: the conditional field logic, the coverage
filtering by Visit Type, the Deposit-applies matrix, the fetch calls, and the Spanish
Rejection-message mapping. Markup may be restructured for layout; data flow and copy may not
change.

## Acceptance criteria

- [x] `/agendar-visita` is fully restyled using the tokens + Card + Button + the new Field primitive.
- [x] `Field` associates each label with its control and exposes helper/error text to assistive tech.
- [x] The form reads as clear sections (identification, Visit Type + sub-type, coverage, Deposit, date/time); conditional fields appear/disappear exactly as before.
- [x] The Deposit acknowledgment is visually prominent (amount + required checkbox).
- [x] Rejections and validation errors render as styled, legible Spanish alerts; the existing Rejection-message mapping is unchanged.
- [x] The flow is usable and laid out correctly on mobile widths.
- [x] A behavior test covers `Field` label association and error exposure.
- [x] A DOM snapshot for the booking form is added once its structure is settled.
- [x] The existing Vitest suite still passes unchanged; no fetch/data flow or copy changed.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)

## Comments

- 2026-06-21: Restyled `/agendar-visita`. Added two primitives under
  `components/ui/`: `Field` (wrapping-label control with hint/error, error in an
  alert region) and `Alert` (error/success/info inline block). Rebuilt the form as
  three `Card` sections (Tus datos / Tu visita / Fecha y hora) using Field for every
  control, the prominent Deposit acknowledgment as an info Alert with the amount +
  required checkbox, form-level Rejections as an error Alert, and the submit as the
  `Button` primitive (busy on submit). Moved the page into the `(public)` route group
  so it inherits the shell (URL unchanged at `/agendar-visita`). **All state, fetch,
  router, the Rejection-message mapping, and copy are byte-for-byte the same** — only
  markup/primitives changed. Tests: 3 `Field` behavior tests + a structure-only DOM
  snapshot of the booking form (class attributes stripped; router + fetch mocked).
  `npm run typecheck` clean, `npm test` 131/131 (123 existing unchanged + 8 ui),
  `npm run build` clean (`/agendar-visita` still prerendered). Vitest UI project now
  also globs `app/**/*.test.tsx`.
