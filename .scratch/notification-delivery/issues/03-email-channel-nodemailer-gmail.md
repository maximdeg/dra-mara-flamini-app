# 03 — Real Email channel (nodemailer / Gmail App Password)

Status: ready-for-agent
Type: HITL

## Parent

[PRD: Notification Delivery](../PRD.md)

## What to build

Make the email Channel real: swap its `FakeNotificationSender` for a nodemailer adapter that sends
through Gmail, so the worker delivers actual Confirmation and Cancellation-Notice emails.

- An **email `NotificationSender`** built on nodemailer's Gmail transport
  (`createTransport({ service: "gmail", auth: { user, pass } })`), where `pass` is a Gmail
  **App Password** (the Google account must have 2-Step Verification enabled). It sends the
  composed `subject`/`html`/`text` to the Patient's email and returns the provider message id as
  the outbox entry's `messageId`.
- Wire it into the Channel router for the `email` channel; the worker from slice 02 now sends real
  email on that Channel.
- New env in `.env.example`: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM` (display name + address),
  and `PUBLIC_BASE_URL` (the public deployment origin — cancel links must not be `localhost`).
- Add **ADR-0003** recording the Email Channel and the Gmail/App-Password choice (OAuth2 considered
  and deferred), and note the daily Gmail send cap.

This is HITL: it needs real Gmail credentials and a manual check that the email lands in a test
inbox with the right content and a working cancel link.

## Acceptance criteria

- [ ] An email adapter sends via Gmail using an App Password from environment config.
- [ ] A booked Appointment produces a Confirmation email with correct details and a working
      `/cita/{id}` cancel link; a cancellation produces a Cancellation-Notice email.
- [ ] The provider message id is recorded on the outbox entry; an SMTP failure marks the entry
      `failed` and is retried (per slice 02), never blocking booking.
- [ ] `.env.example` documents `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM`, `PUBLIC_BASE_URL`.
- [ ] ADR-0003 added.
- [ ] Verified manually against a real test inbox.

## Blocked by

- [02 — Decoupled worker + outbox draining](./02-decoupled-worker-outbox-draining.md)
