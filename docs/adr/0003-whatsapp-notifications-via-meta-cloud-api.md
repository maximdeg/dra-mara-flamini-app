# WhatsApp notifications via the Meta Cloud API, not Baileys

**Supersedes [ADR-0001](0001-whatsapp-notifications-via-baileys.md).**

We send Patient Notifications (the Confirmation on booking; the Cancellation Notice is planned) over the **official Meta WhatsApp Cloud API**, from the clinic's own verified business number ("Dra Mara Flamini Prida"), using **pre-approved message templates** — currently `appointment_confirmation_1` [es_AR]. Each message is a template reference plus its ordered body parameters, POSTed to `graph.facebook.com/v23.0/{phone-number-id}/messages`.

We reverse ADR-0001 (which chose the unofficial Baileys library to avoid templates, verification, and per-message cost) because the clinic has now completed WhatsApp Business verification and had its templates approved, and the official API removes the ban risk that ADR-0001 called out as its central liability — losing the clinic's primary human-contact channel. The template constraint that ADR-0001 avoided is an acceptable cost for a supported, ToS-compliant channel that will not get the number banned.

## Consequences

- **Templates gate every message.** Business-initiated messages must use a template Meta has approved for that exact `name` + `language`. Adding or changing Patient-facing copy means submitting a template and waiting for approval; the app cannot send free-form text outside a 24-hour customer-service window. The approved-template names/languages and their parameter counts are a contract the code must match (a name/language mismatch is rejected 132001; a parameter-count mismatch 100).
- **The send seam mirrors email, not the outbox.** A rendered `WhatsAppMessage` (`to` + `templateName` + `language` + ordered `params`) is built by a pure function from the Appointment and delivered by a `WhatsAppSender` — the same pure-builder / injectable-adapter / lazy-factory shape as the email path (`get-whatsapp-sender` ⇄ `get-email-sender`). The generic `Notification`/outbox seam from ADR-0001 is left in place for the not-yet-migrated Cancellation path.
- **Best-effort and decoupled is retained.** As under ADR-0001, a WhatsApp send failure (or missing Meta config) is swallowed by Booking's best-effort catch and never costs a Patient their Appointment. The sender factory reads env lazily, so builds and tests stay decoupled from Meta.
- **Config:** requires `META_WHATSAPP_PHONE_NUMBER_ID` and `META_WHATSAPP_ACCESS_TOKEN` (set in the environment / Vercel). The access token must be a long-lived System User token — temporary tokens expire after 24 hours. The sender number must be a verified business number, so `hello_world` (test-number-only) cannot be used as a production smoke test.

## Phone numbers are normalized to E.164 at the Booking seam

The Cloud API only accepts recipients in E.164 (`+549…`) and rejects anything
else as undeliverable. Patients type their number the way they say it — `0342 15
578-2402`, `(342) 15-5782402` — so Booking normalizes `patientPhone` through
`lib/phone` before it stores an Appointment, and refuses a number it cannot read
with the `InvalidPhone` Rejection. Because normalization happens before the
one-open-Appointment-per-phone check (ADR-0002), two spellings of one number are
now correctly one Patient rather than two.

## Usage against the messaging limit is recorded and shown

Meta caps business-initiated conversations on a rolling 24-hour window; the
clinic's number is at `TIER_250`. Past the cap the Cloud API rejects sends
(131049 / 130429) — and since Booking sends best-effort, those rejections would
otherwise be invisible. A `LoggedWhatsAppSender` decorator records every attempt
(delivered or rejected, with its Cloud API error code) to a `whatsappSends`
collection, and the Panel's landing page renders used / remaining / reset-time
for the window. The decorator swallows its own storage failures, so bookkeeping
can never cost a Confirmation.

The log is a record, not a throttle: it does not refuse to send as the cap
approaches, it makes the cap visible before it bites.

## The Cancellation Notice picks its template from the actor

Cancellation already knew who cancelled — the Professional may cancel at any
time, a Patient only inside the Cancellation Window — so the Notice now uses
that same `CancellationActor` to choose between two approved [es_AR] templates:
`appointment_cancellation_by_doctor` when the clinic cancels (apologising, and
inviting the Patient to rebook) and `appointment_cancellation_by_patient1` when
the Patient does (acknowledging their own cancellation). Both take the same three
body parameters — {{1}} nombre, {{2}} fecha, {{3}} hora — and carry the rebooking
link inside the template body rather than as a parameter.

This replaces the last `FakeNotificationSender` in a production path: the
outbox-based `notifyCancellation` is no longer composed by
`getCancellationDeps`, leaving the generic outbox seam unused by production code
(it is kept, per the note above, rather than removed in this change). Like the
Confirmation, the Cancellation WhatsApp is best-effort and records no
Appointment-level bookkeeping — the `whatsappSent` fields track the Confirmation
specifically, matching what the Cancellation email already does. The attempt is
still recorded in the Send Log, so it counts against the messaging limit shown
in the Panel.

## Patient consent is captured at booking and gates every send

Meta requires a Patient to have opted in before a business sends them a
template. Nothing in the booking flow previously told Meta — or us — that a
Patient had agreed, so every Confirmation relied on enforcement being lax.
Sending unsolicited templates invites blocks and reports, which drive down the
number's quality rating and can tighten the messaging tier: the cost of getting
this wrong is the clinic's whole WhatsApp channel, which is the same liability
ADR-0001 worried about for a different reason.

The booking form now carries a pre-ticked opt-in ("Quiero recibir la
confirmación … por WhatsApp"), and `book()` stores `whatsappConsentAt` — the
instant consent was given, rather than a bare boolean, so the clinic can show
*when* a Patient agreed. A Patient who unticks it is stored as `null`.

`whatsappConsentGiven` is the single predicate both send paths consult, and it
treats three states distinctly: a timestamp is consent, `null` is a refusal, and
an absent field is an Appointment booked before the checkbox existed — treated
as consented, because refusing those would silently cut off Confirmations for
Appointments already in the book. The Appointments table marks a Patient who
declined, so the clinic knows that Confirmation went out by email only.

Pre-ticked rather than blank is a deliberate choice: the Patient is booking a
medical visit and expects to hear about it, the email Confirmation goes out
either way, and unticking is one click. If the clinic ever needs documented
affirmative consent (rather than merely honoured refusals), this is the decision
to revisit.
