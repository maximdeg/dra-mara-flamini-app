# 10 — Coverage editor (/admin/coverage)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the coverage and pricing editor at `/admin/coverage` inside the admin shell. Two
concerns: the Professional-editable **Health Insurance** list (add / edit / delete, with price
and notes), and the two fixed, system-defined **Self-Pay** variants (_Particular_ for a
Consultation, _Practica Particular_ for a Practice) whose prices are editable but which can
never be renamed or removed, plus the configurable First-Visit Consultation **Deposit**
amount. Present these as clear Card/Field/Button forms; deleting a Health Insurance uses a
confirm **Dialog** and all saves show **Toast** feedback. The Self-Pay variants must be
visibly non-removable/non-renamable.

Presentation-only: the CRUD behavior, the system-defined Self-Pay constraint, and the Deposit
amount logic are unchanged.

## Acceptance criteria

- [x] `/admin/coverage` is restyled with a styled Health Insurance list (add/edit/delete with price + notes) and the Self-Pay/Deposit price fields.
- [x] The two Self-Pay variants are presented as fixed — editable price, but no rename/delete affordance.
- [x] Deleting a Health Insurance goes through a confirm Dialog; all saves show Toast feedback; underlying behavior is unchanged.
- [x] Domain vocabulary is honored in visible copy (Health Insurance / _Obra Social_, Self-Pay / _Particular_ / _Practica Particular_, Deposit / _Seña_).
- [x] The editor is usable at tablet width and up.
- [x] A DOM snapshot for the coverage editor is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)

## Comments

- 2026-06-21: Restyled `/admin/coverage` into a client `CoverageEditor`. The four
  `void` FormData form-actions were refactored to typed args
  (`addInsuranceAction`/`editInsuranceAction(originalName, input)`/
  `removeInsuranceAction(name)`/`saveSelfPayPricingAction(input)`) — same auth checks,
  same `addInsurance`/`editInsurance`/`removeInsurance`/`sanitizeSelfPayPricing` logic,
  same `revalidatePath`. The editor updates its list optimistically by reusing those
  same lib pure transforms, so the on-screen state matches what the server persists.
  Self-Pay pricing is a Card form (3 number Fields) with the fixed-variants note and
  no rename/delete affordance; Obras Sociales are a Card list of per-row edit forms
  (Guardar) + a Quitar that opens a delete-confirm Dialog, plus an add form. Every
  action reports via Toast (precios guardados / obra social agregada / actualizada /
  eliminada). Domain vocabulary preserved (Obra Social, Particular / Practica
  Particular, Seña). Dropped the redundant "← Panel" link.
- Tests: self-pay save→toast, add→optimistic-row+toast, delete→confirm-dialog→toast,
  and an editor structure snapshot (actions mocked, ToastProvider wrapper).
  `npm run typecheck` clean, `npm test` 166/166 (123 existing unchanged + 43 ui),
  `npm run build` exit 0 (only the pre-existing `jose`/Edge-Runtime warning).
- Note: like slices 05/07/08, the CRUD now requires JS (Dialog + Toast); the FormData
  form-action signatures changed to typed args (behavior identical).
