# WhatsApp notifications via the Meta Cloud API, not Baileys

**Supersedes [ADR-0001](0001-whatsapp-notifications-via-baileys.md).**

We send Patient Notifications (the Confirmation on booking; the Cancellation Notice is planned) over the **official Meta WhatsApp Cloud API**, from the clinic's own verified business number ("Dra Mara Flamini Prida"), using **pre-approved message templates** — currently `appointment_confirmation_1` [es_AR]. Each message is a template reference plus its ordered body parameters, POSTed to `graph.facebook.com/v23.0/{phone-number-id}/messages`.

We reverse ADR-0001 (which chose the unofficial Baileys library to avoid templates, verification, and per-message cost) because the clinic has now completed WhatsApp Business verification and had its templates approved, and the official API removes the ban risk that ADR-0001 called out as its central liability — losing the clinic's primary human-contact channel. The template constraint that ADR-0001 avoided is an acceptable cost for a supported, ToS-compliant channel that will not get the number banned.

## Consequences

- **Templates gate every message.** Business-initiated messages must use a template Meta has approved for that exact `name` + `language`. Adding or changing Patient-facing copy means submitting a template and waiting for approval; the app cannot send free-form text outside a 24-hour customer-service window. The approved-template names/languages and their parameter counts are a contract the code must match (a name/language mismatch is rejected 132001; a parameter-count mismatch 100).
- **The send seam mirrors email, not the outbox.** A rendered `WhatsAppMessage` (`to` + `templateName` + `language` + ordered `params`) is built by a pure function from the Appointment and delivered by a `WhatsAppSender` — the same pure-builder / injectable-adapter / lazy-factory shape as the email path (`get-whatsapp-sender` ⇄ `get-email-sender`). The generic `Notification`/outbox seam from ADR-0001 is left in place for the not-yet-migrated Cancellation path.
- **Best-effort and decoupled is retained.** As under ADR-0001, a WhatsApp send failure (or missing Meta config) is swallowed by Booking's best-effort catch and never costs a Patient their Appointment. The sender factory reads env lazily, so builds and tests stay decoupled from Meta.
- **Config:** requires `META_WHATSAPP_PHONE_NUMBER_ID` and `META_WHATSAPP_ACCESS_TOKEN` (set in the environment / Vercel). The access token must be a long-lived System User token — temporary tokens expire after 24 hours. The sender number must be a verified business number, so `hello_world` (test-number-only) cannot be used as a production smoke test.
