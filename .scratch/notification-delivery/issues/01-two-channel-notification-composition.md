# 01 — Two-channel Notification model + message composition

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Notification Delivery](../PRD.md)

## What to build

Promote the **Notification** from a WhatsApp-only concept to a two-**Channel** one
(`whatsapp` | `email`), and give it a real composed body.

- Extend the `Notification`/`OutboxEntry` shape with a `channel` and the composed message
  payload, so a persisted entry is a full record of what was (or will be) sent.
- A **pure message composer**: `(Appointment, kind, baseUrl) →` per-channel payloads —
  a WhatsApp `text`, and an email `subject` + `html` + `text`. The **Confirmation** carries the
  cancel link `${baseUrl}/cita/${appointment.id}`; the **Cancellation Notice** omits it. Copy is
  in Spanish and includes Patient first name, date, time, Visit Type + sub-type, coverage label,
  and Deposit acknowledgment when one applies.
- Booking and Cancellation now enqueue **one entry per Channel** (whatsapp + email) with bodies
  composed at enqueue time. Delivery still goes through the existing inline `FakeNotificationSender`
  for both channels so the flow stays green end-to-end (the decoupled worker is slice 02).
- Update **CONTEXT.md**: the Notification/Confirmation/Cancellation-Notice terms now span WhatsApp
  **and** email; introduce the term **Channel**; drop "Confirmation email" from the _Avoid_ list.

## Acceptance criteria

- [x] `Notification`/`OutboxEntry` carry a `channel` and the composed message payload.
- [x] The composer is a pure function with unit tests: Confirmation body contains date, time,
      Visit Type/sub-type, coverage, Deposit (when applicable), and the exact `/cita/{id}` cancel link.
- [x] The Cancellation Notice body omits the cancel link; both kinds render in Spanish.
- [x] Email payloads include a subject and both `html` and `text` parts.
- [x] A successful booking enqueues exactly two entries (whatsapp + email) for the Confirmation;
      a cancellation enqueues two for the Cancellation Notice.
- [x] CONTEXT.md updated to describe the two Channels and the new term.
- [x] `npm test` and `npm run build` are green.

## Blocked by

- None - can start immediately.

## Comments

- 2026-06-22: Implemented on branch `notification-delivery`. `Notification` is now a
  discriminated union on `channel` (`whatsapp` | `email`), each variant carrying its recipient
  and composed `message` (WhatsApp `text`; Email `subject`/`html`/`text`); the outbox adapters
  store it opaquely and were untouched. Added `compose.ts` — a pure composer (Appointment + kind
  + baseUrl → one WhatsApp + one Email Notification) reusing the existing
  visit-type/coverage/deposit label helpers, Spanish copy, HTML-escaped values, Confirmation
  carrying the `/cita/{id}` cancel link and the Cancellation Notice omitting it. `notifyConfirmation`
  / `notifyCancellation` compose both Channels and dispatch one entry each (Confirmation bookkeeping
  recorded from the WhatsApp send); delivery still runs inline via `FakeNotificationSender` (decoupled
  worker is slice 02). `baseUrl` comes from `PUBLIC_BASE_URL` via `base-url.ts` at the deps roots
  (localhost fallback; `.env.example` documentation deferred to slice 03). CONTEXT.md updated:
  Notification spans two Channels, new **Channel** term, "Confirmation email" dropped from _Avoid_.
  Tests: new `compose.test.ts` (9) + `notify-cancellation.test.ts`, updated `notify-confirmation.test.ts`
  and `cancellation.test.ts`. typecheck + build clean; full suite 176/176.
