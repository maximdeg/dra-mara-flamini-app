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

- [ ] `Notification`/`OutboxEntry` carry a `channel` and the composed message payload.
- [ ] The composer is a pure function with unit tests: Confirmation body contains date, time,
      Visit Type/sub-type, coverage, Deposit (when applicable), and the exact `/cita/{id}` cancel link.
- [ ] The Cancellation Notice body omits the cancel link; both kinds render in Spanish.
- [ ] Email payloads include a subject and both `html` and `text` parts.
- [ ] A successful booking enqueues exactly two entries (whatsapp + email) for the Confirmation;
      a cancellation enqueues two for the Cancellation Notice.
- [ ] CONTEXT.md updated to describe the two Channels and the new term.
- [ ] `npm test` and `npm run build` are green.

## Blocked by

- None - can start immediately.
