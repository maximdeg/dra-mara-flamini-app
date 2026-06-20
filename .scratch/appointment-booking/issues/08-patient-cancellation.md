# 08 — Patient cancellation + Cancellation Notice

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The **Cancellation** module for the Patient path: `cancel(appointmentId, actor=Patient)`.
A Patient opens their Appointment by its link and may cancel only **more than 24 hours**
before the start time (the **Cancellation Window**); within 24 hours self-cancellation is
blocked. Cancelling transitions Scheduled → Cancelled, frees the Time Slot, and enqueues a
**Cancellation Notice** through the Notification seam. After cancellation the phone may book
again.

## Acceptance criteria

- [x] A Patient can cancel when more than 24 hours before the start time.
- [x] Self-cancellation within 24 hours is blocked with a clear message.
- [x] A cancelled Appointment frees its Time Slot for re-booking.
- [x] Cancellation enqueues a Cancellation Notice.
- [x] After cancellation, the phone's open-Appointment gate is cleared.
- [x] Tests cover inside vs. outside the 24-hour window and the Notice enqueue.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)
- [06 — Confirmation via the Notification seam](./06-confirmation-notification-seam.md)

## Comments

- 2026-06-20: Cancellation module added under `lib/appointments/cancellation.ts` — `cancel(appointmentId, actor, deps) → CancellationResult`, the `patientCanCancel` Cancellation-Window predicate (strictly >24h, exported and reused by the confirmation page), and typed rejections (`NotFound` / `AlreadyCancelled` / `AlreadyCompleted` / `OutsideCancellationWindow`). The Professional path is unrestricted; the Patient path enforces the window. State is read through the derived `statusOf` (slice 07), so a past Appointment rejects as `AlreadyCompleted` rather than being cancellable. The repository seam grew `markCancelled(id)` (Cancelled is the only persisted status change — Completed stays derived), implemented in both the in-memory and Mongo adapters. Cancelling frees the Time Slot (Availability counts only Scheduled times) and clears the one-open-per-phone gate — both asserted in tests. A Cancellation Notice is enqueued through the Notification seam via `notifyCancellation` (best-effort, ADR-0001 — a Notice failure never blocks the cancellation), composed in `getCancellationDeps`. Public surface: `POST /api/appointments/[id]/cancel` (Patient actor; rejection → 404/422) and a `CancelAppointment` control on the `/cita/[id]` confirmation page that hides itself outside the window and shows the rule. `npm test` 60/60 green (12 cancellation tests); `npm run build` clean. Unblocks the Professional-cancel reuse in slices 10/13/14.
