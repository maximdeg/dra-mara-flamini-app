# 09 — Profile + change password (/admin/profile)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the Professional profile page at `/admin/profile` inside the admin shell. It groups
two concerns — editing profile details (name, contact, WhatsApp number) and changing the
password — which is a natural place to introduce the **Tabs** primitive (keyboard-operable,
`aria-selected`). Both forms use Field/Button/Card and show **Toast** feedback on save.

Presentation-only: the profile and password server actions, validation, and the
single-Professional model are unchanged.

## Acceptance criteria

- [ ] `/admin/profile` is restyled with profile and change-password as clear forms.
- [ ] `Tabs` exists as a reusable, keyboard-operable primitive (arrow-key navigation, `aria-selected`) and groups the two forms.
- [ ] Saves show Toast feedback (success/error); the underlying actions and validation are unchanged.
- [ ] The page is usable at tablet width and up.
- [ ] A behavior test covers Tabs selection (panel switch + `aria-selected`).
- [ ] A DOM snapshot for the profile page is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
