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

- [ ] `/admin/coverage` is restyled with a styled Health Insurance list (add/edit/delete with price + notes) and the Self-Pay/Deposit price fields.
- [ ] The two Self-Pay variants are presented as fixed — editable price, but no rename/delete affordance.
- [ ] Deleting a Health Insurance goes through a confirm Dialog; all saves show Toast feedback; underlying behavior is unchanged.
- [ ] Domain vocabulary is honored in visible copy (Health Insurance / _Obra Social_, Self-Pay / _Particular_ / _Practica Particular_, Deposit / _Seña_).
- [ ] The editor is usable at tablet width and up.
- [ ] A DOM snapshot for the coverage editor is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
