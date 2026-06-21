# 03 — Confirmation + patient cancel (/cita/[id])

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the Appointment confirmation/details page at `/cita/[id]`. Introduce three shared
primitives that the admin surface will reuse: **StatusBadge** (maps an Appointment **Status**
— Scheduled / Cancelled / Completed — to a colored badge, where Completed is the derived
value per CONTEXT.md), **Dialog** (an accessible confirm modal — focus trap, Escape, backdrop)
for the patient cancel confirmation, and **Toast** (a provider + `toast.success/error/info`)
for feedback. The page presents the Appointment clearly as a record and communicates the
**Cancellation Window** (self-cancel allowed only more than 24 hours before the start) through
the cancel button's enabled/disabled state plus an explanation.

Presentation-only: the cancel action, the 24-hour rule, and the Status-driven content all
keep their existing behavior. Light, brand-consistent entrance polish (mirroring the
prototype's reveal animations) is welcome.

## Acceptance criteria

- [x] `/cita/[id]` is fully restyled; the Appointment details read clearly as a keepable record.
- [x] `StatusBadge` renders the correct label/variant for each derived Status (Scheduled / Cancelled / Completed).
- [x] `Dialog` is keyboard-accessible (focus trap, Escape, backdrop close, focus return) and gates the patient cancel.
- [x] `Toast` provider + `toast.success/error/info` API shows and auto-dismisses messages.
- [x] The Cancellation Window is communicated via cancel button state + explanation; the existing 24-hour rule behavior is unchanged.
- [x] Behavior tests cover StatusBadge (label/variant), Dialog (open/close/focus), and Toast (show/dismiss).
- [x] A DOM snapshot for the confirmation page is added once its structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)

## Comments

- 2026-06-21: Restyled `/cita/[id]`. Added three shared primitives under
  `components/ui/` (all reused by the admin slices): `StatusBadge` (derives its
  label from the domain's STATUS_LABELS so it can't drift), `Dialog` (portal modal:
  focus-in on open + focus-return on close, Tab trap, Escape + backdrop close), and
  `Toast` (a `ToastProvider` + `useToast` → `toast.success/error/info`, auto-dismiss).
  Mounted the ToastProvider in the `(public)` shell. Extracted a presentational
  `AppointmentDetails` (pure, data-only) — Card + status-aware title + StatusBadge +
  a styled detail list — so the confirmation structure is snapshot-testable without
  the DB/async server component. Rebuilt `CancelAppointment` to confirm via Dialog and
  report via Toast (success on cancel, error with the existing Rejection-message
  mapping); the Cancellation-Window note is preserved for the within-24h case. Moved
  the page into the `(public)` group (URL unchanged at `/cita/[id]`). Server cancel
  behavior, the 24-hour rule, and data flow are unchanged.
- Tests: StatusBadge (labels), Dialog (closed/open+focus, Escape, backdrop-vs-panel),
  Toast (show + close-button, auto-dismiss with fake timers), AppointmentDetails
  (badge + status-aware title + structure snapshot). `npm run typecheck` clean,
  `npm test` 141/141 (123 existing unchanged + 18 ui), `npm run build` exit 0 (the only
  warning is the pre-existing `jose`/Edge-Runtime one from next-auth middleware).
