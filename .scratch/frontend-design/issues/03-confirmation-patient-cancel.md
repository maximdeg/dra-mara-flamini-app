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

- [ ] `/cita/[id]` is fully restyled; the Appointment details read clearly as a keepable record.
- [ ] `StatusBadge` renders the correct label/variant for each derived Status (Scheduled / Cancelled / Completed).
- [ ] `Dialog` is keyboard-accessible (focus trap, Escape, backdrop close, focus return) and gates the patient cancel.
- [ ] `Toast` provider + `toast.success/error/info` API shows and auto-dismisses messages.
- [ ] The Cancellation Window is communicated via cancel button state + explanation; the existing 24-hour rule behavior is unchanged.
- [ ] Behavior tests cover StatusBadge (label/variant), Dialog (open/close/focus), and Toast (show/dismiss).
- [ ] A DOM snapshot for the confirmation page is added once its structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)
