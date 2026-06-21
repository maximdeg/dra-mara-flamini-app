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

- [ ] `/agendar-visita` is fully restyled using the tokens + Card + Button + the new Field primitive.
- [ ] `Field` associates each label with its control and exposes helper/error text to assistive tech.
- [ ] The form reads as clear sections (identification, Visit Type + sub-type, coverage, Deposit, date/time); conditional fields appear/disappear exactly as before.
- [ ] The Deposit acknowledgment is visually prominent (amount + required checkbox).
- [ ] Rejections and validation errors render as styled, legible Spanish alerts; the existing Rejection-message mapping is unchanged.
- [ ] The flow is usable and laid out correctly on mobile widths.
- [ ] A behavior test covers `Field` label association and error exposure.
- [ ] A DOM snapshot for the booking form is added once its structure is settled.
- [ ] The existing Vitest suite still passes unchanged; no fetch/data flow or copy changed.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)
