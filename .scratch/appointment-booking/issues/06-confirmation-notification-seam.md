# 06 — Confirmation via the Notification seam (stubbed)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The **Notification seam**: `enqueue(notification)` writes to a `notificationOutbox`
collection. On a successful booking, Booking enqueues a **Confirmation**. A **fake adapter**
(dev/tests) marks outbox entries as sent and writes the bookkeeping fields
(`whatsapp_sent`, `whatsapp_sent_at`, `whatsapp_message_id`) onto the Appointment.

Per ADR-0001, Notifications are decoupled and best-effort: a booking always succeeds
regardless of Notification state, and a send failure never costs a Patient their
Appointment. The real always-on Baileys worker that drains the outbox is a later slice
(out of scope here).

## Acceptance criteria

- [x] `enqueue(notification)` persists the Notification to the outbox.
- [x] A successful booking enqueues exactly one Confirmation.
- [x] The fake adapter marks the entry sent and updates the Appointment bookkeeping fields.
- [x] A simulated Notification failure does not fail or roll back the booking.
- [x] Tests cover enqueue-on-booking and the decoupling guarantee using the fake adapter.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)

## Comments

- 2026-06-19: Added `lib/notifications/` — the **outbox seam** (`NotificationOutbox.enqueue`/`markSent`, with Mongo + in-memory adapters writing the `notificationOutbox` collection), the **sender seam** (`NotificationSender` with `FakeNotificationSender`; real Baileys deferred), and `notifyConfirmation(appointment, deps)` — the inline stand-in for the decoupled worker: enqueue → send → markSent → record bookkeeping. Appointment gained `whatsappSent`/`whatsappSentAt`/`whatsappMessageId` (set at booking, updated on send via the new `markConfirmationSent` repository method). `book()` calls `notifyConfirmation` **best-effort** (try/catch swallow) so a Notification failure never costs the Patient their Appointment (ADR-0001); `getBookingDeps` composes it from the outbox + fake sender + repository. Confirmation page shows the WhatsApp status. `npm test` 44/44 green; `npm run build` clean.
- Deferred to the worker slice: the real Baileys sender, persistent session/QR pairing, and moving delivery into a decoupled always-on process draining the outbox (`pending()`/`markFailed` will be added to the seam then). For now delivery happens inline via the fake so the flow is observable end-to-end.
