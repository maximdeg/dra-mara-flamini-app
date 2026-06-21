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

- [x] `/admin/profile` is restyled with profile and change-password as clear forms.
- [x] `Tabs` exists as a reusable, keyboard-operable primitive (arrow-key navigation, `aria-selected`) and groups the two forms.
- [x] Saves show Toast feedback (success/error); the underlying actions and validation are unchanged.
- [x] The page is usable at tablet width and up.
- [x] A behavior test covers Tabs selection (panel switch + `aria-selected`).
- [x] A DOM snapshot for the profile page is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)

## Comments

- 2026-06-21: Restyled `/admin/profile`. Added the `Tabs` primitive
  (`components/ui/tabs.tsx`): a `tablist` of `tab` buttons over `tabpanel`s, roving
  tabindex with Arrow/Home/End keyboard nav, `aria-selected`/`aria-controls` wiring;
  all panels stay mounted (inactive `hidden`) so form state survives switching. A
  `ProfileTabs` client component groups the two forms ("Datos" / "Contraseña") under
  it, inside a Card. Both forms keep their `useActionState` + `<form action>` server
  actions (`updateProfileAction`/`changePasswordAction`) and now use Field/Button;
  feedback moved to Toast (success/error) via an effect on the action result. Email is
  shown as a disabled Field (identity, not editable). Dropped the redundant "← Panel"
  link.
- Tests: Tabs click-select + `aria-selected` + panel visibility and Arrow-key nav;
  ProfileTabs tab-switch + structure snapshot (actions mocked, ToastProvider wrapper).
  `npm run typecheck` clean, `npm test` 162/162 (123 existing unchanged + 39 ui),
  `npm run build` exit 0 (only the pre-existing `jose`/Edge-Runtime warning).
- Minor adds: the change-password form now `form.reset()`s on success (clears the
  password inputs). Test note: a required Field renders its `*` as aria-hidden text in
  the wrapping label, so `getByLabelText` needs a regex/substring for required fields
  (the control's accessible name is still the clean label).
