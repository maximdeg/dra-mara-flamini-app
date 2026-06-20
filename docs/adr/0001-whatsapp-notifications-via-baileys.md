# WhatsApp notifications via Baileys, not the official Business API

We send Patient Notifications (Confirmation on booking, Cancellation Notice on any cancellation) over **Baileys**, an unofficial WhatsApp-Web library, logged in as the clinic's **existing secretaries' number** as a linked companion device, through a single always-on worker decoupled from the booking flow.

We chose this over Meta's official WhatsApp Business API because the official path requires pre-approved message templates, business verification, a dedicated number, and per-message cost — whereas the clinic wants free-form messages from the number patients already know, at low volume.

## Consequences

- **ToS / ban risk.** Baileys violates WhatsApp's Terms of Service, so the number carries ban risk — and because it's the clinic's primary channel, a ban takes down human contact too. Mitigate with throttling/human-like pacing; treat the number as something that could be lost.
- **Persistent session is the architectural heart.** Auth state must be persisted (SQL/Redis/file) and held by a long-running process (not serverless). If the session drops it must be re-paired (QR/pairing code) before any message sends.
- **Decoupled, non-blocking.** Booking and cancellation always succeed regardless of WhatsApp state; messages are enqueued and sent best-effort with retry. A send failure never costs a Patient their Appointment.
- **Config note:** set `markOnlineOnConnect: false` so the bot connecting doesn't suppress incoming-message notifications on the secretaries' phone.
