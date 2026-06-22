# Email as a second Notification Channel, via nodemailer over Gmail

Every Patient Notification (Confirmation on booking, Cancellation Notice on any
cancellation) now goes out on **two Channels** — WhatsApp (ADR-0001) and
**Email** — sent independently from the same outbox, so one can succeed while the
other retries. Email is delivered with **nodemailer** over **Gmail**,
authenticated with a **Gmail App Password** from environment config, sent by the
same always-on worker that drains the outbox.

This extends the original model, where a Notification was WhatsApp-only (CONTEXT.md
once listed "Confirmation email" under _Avoid_). We added Email because WhatsApp via
Baileys carries real ban risk and is the clinic's primary human channel; an email
copy gives the Patient a durable record in their inbox that survives losing the
WhatsApp number, and reaches a Patient whose phone isn't on WhatsApp.

We chose a **Gmail App Password** over OAuth2 because the sender is a single clinic
mailbox at low volume: it is one environment variable and no token-refresh
machinery. OAuth2 is more robust and revocable, but heavier to set up and operate;
we deferred it. The official transactional-email providers (SES, SendGrid, etc.)
were out of proportion for the volume and add another vendor.

## Consequences

- **App Password prerequisite.** The Google account must have 2-Step Verification
  enabled to mint an App Password. If the account's security posture changes the
  password may need regenerating; treat it as a rotatable secret.
- **Gmail send cap.** A standard Gmail account is limited to ~500 messages/day —
  comfortably above clinic volume, but a ceiling to remember if usage grows.
- **Thin adapter behind the sender seam.** `EmailNotificationSender` maps the
  composed email onto a `MailTransport` and returns the provider message id; the
  real Gmail transport is the only untested-in-CI piece (verified manually against
  a real inbox). The field mapping and error behavior are unit-tested through a
  fake transport, like the other adapters.
- **Graceful when unconfigured.** With no `GMAIL_USER`/`GMAIL_APP_PASSWORD`, the
  worker falls back to the fake email sender so local dev runs without credentials.
- **Same decoupling guarantees.** A failed email send is recorded and retried by
  the worker (slice 02) and never blocks a booking or cancellation (ADR-0001).
