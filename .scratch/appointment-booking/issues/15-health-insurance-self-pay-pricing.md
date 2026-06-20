# 15 — Health Insurance CRUD + Self-Pay pricing + First-Visit Deposit amount

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The Professional maintains the coverage and pricing that feed the booking flow. They manage
the accepted **Health Insurance** list (add, edit, delete — name, price, notes). The two
fixed **Self-Pay** variants (_Particular_ for a Consultation, _Practica Particular_ for a
Practice) always exist and **cannot be renamed or removed**, but their prices are editable.
The Professional also sets the smaller **Deposit** amount for a Self-Pay First-Visit
Consultation. These feed the coverage picker (slice 3) and Deposit amounts (slice 4).

## Acceptance criteria

- [x] The Professional can add, edit, and delete Health Insurance entries (name, price, notes).
- [x] The two Self-Pay variants cannot be renamed or deleted; their prices are editable.
- [x] The Professional can set the First-Visit Consultation Deposit amount.
- [x] Changes are reflected in the public booking coverage picker and in Deposit determination.
- [x] Tests cover the CRUD paths and the Self-Pay immutability constraint.

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)

## Comments

- 2026-06-20: Coverage and pricing are now persisted and Professional-managed, closing the loop opened by slices 3–4. `HealthInsurance` gained `price` + `notes`; the accepted-insurer list and the Self-Pay pricing are each a **single document** (mirroring the Work Schedule): `HealthInsuranceRepository.list()/save()` and `SelfPayPricingRepository.get()/save()`, with Mongo + in-memory adapters and composition roots, each falling back to the seeded default only until first saved — so deleting every insurer persists an empty list rather than resurrecting the seed. CRUD is pure list transforms in `coverage.ts` (`addInsurance` — replace-by-name case-insensitive, `removeInsurance`, `editInsurance` — supports rename); `sanitizeSelfPayPricing` is the trust boundary for price edits (non-negative whole pesos). **Self-Pay immutability is structural**: the two variants live in code (`SelfPayVariant`), never in the editable insurer list, so they can't be renamed or removed — only the three amounts (Particular price, Practica Particular price, First-Visit Consultation Deposit) are editable. Wiring: `getBookingDeps` and both public GET routes (`/api/health-insurances`, `/api/self-pay-pricing`) now read the repos, so edits flow into the booking coverage picker and Deposit determination; the admin actions `revalidatePath('/agendar-visita')` on save. UI: guarded `/admin/coverage` — a Self-Pay price form and per-insurer edit/delete forms + an add form, all server-action driven. Dashboard links to it. Tests (11 new): the list transforms (add/replace/remove/rename), Self-Pay always offered even with an empty insurer list (immutability), `sanitizeSelfPayPricing` (floor/clamp), and both seam round-trips incl. the no-resurrection guarantee. `npm test` 123/123 green; `npm run typecheck` clean; `npm run build` clean (`/admin/coverage` compiled). This was the last slice — 01–15 complete.
