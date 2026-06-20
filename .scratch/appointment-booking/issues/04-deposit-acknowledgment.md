# 04 — Deposit determination + acknowledgment

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

Determine whether a **Deposit** applies and capture the Patient's acknowledgment. A Deposit
applies to **Self-Pay only**: every Self-Pay Practice (amount = the option's full price), and
a Self-Pay Consultation **only** when it is a First Visit (amount = the separate, smaller
value the Professional sets — seeded for now). Never for Follow-ups, and never when a Health
Insurance covers the visit.

The UI shows the Deposit and requires the Patient to acknowledge it before proceeding; the
acknowledgment is stored on the Appointment. The platform captures the **acknowledgment
only** — the transfer happens off-platform (no payment processing).

## Acceptance criteria

- [x] Self-Pay Practice → Deposit equals the option's full price (seeded $35.000); acknowledgment required to book.
- [x] Self-Pay First-Visit Consultation → Deposit equals the seeded smaller amount ($20.000); acknowledgment required.
- [x] Follow-up Consultation or any Health-Insurance visit → no Deposit shown or required.
- [x] The acknowledgment is persisted on the Appointment (`deposit: { amount, acknowledged } | null`).
- [x] Tests cover the full Deposit matrix (Self-Pay Practice / Self-Pay First-Visit / Follow-up / Health-Insurance).

## Blocked by

- [03 — Visit Type + coverage selection](./03-visit-type-coverage-selection.md)

## Comments

- 2026-06-19: Added `lib/deposit/deposit.ts` — `SelfPayPricing` config (seeded), `depositAmountFor(context, pricing)` implementing the full matrix, `Deposit` type, and `formatPesos`. Threaded through `book()`: a new `selfPayPricing` dependency, a `DepositNotAcknowledged` rejection when a Deposit applies but the form did not acknowledge it, and the committed `deposit` persisted on the Appointment. Booking form fetches pricing, computes the Deposit client-side from the same `depositAmountFor`, shows the amount + a required acknowledgment checkbox; confirmation page shows the confirmed Seña. New `/api/self-pay-pricing` route (seeded; slice 15 makes pricing editable). `npm test` 29/29 green; `npm run build` clean.
