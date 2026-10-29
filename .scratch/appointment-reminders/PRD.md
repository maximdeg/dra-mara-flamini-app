# Appointment Reminders — WhatsApp the day before at 08:00 (Argentina)

Status: ready-for-agent

## Problem Statement

Patients book appointments up to months ahead and get a single WhatsApp Confirmation at booking time. Nothing reminds them as the date gets close, so they forget appointments, show up late, or miss the 24-hour Cancellation Window and leave an empty slot that someone else could have booked. The Términos y Condiciones already promise reminder messages, and the WhatsApp opt-in covers them, but the app never sends one.

The clinic has submitted a Meta template for this, `confirmation_reminder` [es_AR, UTILITY]. Its body says "Te recordamos tu visita de mañana…" and takes 7 parameters: nombre, fecha, hora, tipo, obra social, notas, enlace. The template is still **PENDING** approval at Meta.

## Solution

Once a day at **08:00 Argentina time (11:00 UTC)**, a Vercel Cron Job calls a protected API route. The route finds every **Scheduled** Appointment dated **tomorrow** (Argentina calendar) whose Patient consented to WhatsApp and has not been reminded yet. Each one gets the `confirmation_reminder` template. Each successful send is recorded on the Appointment, so a second run never sends a duplicate. The Professional sees in the Appointments table which Patients were reminded.

Sending stays off behind `META_WHATSAPP_REMINDERS_ENABLED` until Meta approves the template. Until then the cron runs and sends nothing.

## Commits

Each commit leaves the app building, type-checking, and green on `npm test`.

1. **Docs: name the Reminder.** Add **Reminder** (UI: _Recordatorio_) to CONTEXT.md as a third Notification kind: the WhatsApp message sent the day before an Appointment at 08:00 Argentina time to Scheduled, consenting Patients. Update the Notification entry ("Three kinds"). Drop "Reminder" from the Confirmation's _Avoid_ list, since it now names a different message. Add a short "Reminders" section to ADR-0003: why there's a daily batch cron, the 11:00 UTC schedule (Argentina has no DST), CRON_SECRET auth, the enable flag, and bookkeeping on the Appointment.

2. **Appointment gains optional reminder bookkeeping.** Add two optional fields to the Appointment type: the instant the Reminder was sent, and its WhatsApp message id. A missing field means "not reminded", so existing documents need no migration. Type-only change, so behavior stays the same.

3. **Repository seam: record a sent Reminder.** Add a "mark reminder sent" method (id, sentAt, messageId) to the AppointmentRepository interface, mirroring "mark confirmation sent". Implement it in the in-memory adapter (with a test) and the Mongo adapter. Nothing calls it yet. No new query method is needed: "tomorrow's Scheduled Appointments" is the existing listing query with from = to = tomorrow and status = scheduled.

4. **Refactor: extract the shared Appointment detail parameters.** The Confirmation builder already computes nombre, fecha, hora, tipo, obra social, and the "Sin indicaciones adicionales." fallback for empty Instructions. Move that into a small shared helper inside the WhatsApp notifications module and have the Confirmation builder use it. Existing Confirmation tests must pass unchanged; this is a pure refactor.

5. **Pure Reminder builder.** Add a pure function that turns an Appointment plus its absolute manage link into a WhatsAppMessage for `confirmation_reminder` / `es_AR`. Parameters, in order: {{1}} nombre, {{2}} fecha DD/MM/YYYY, {{3}} hora, {{4}} tipo, {{5}} obra social, {{6}} Coverage Instructions (or the fallback), {{7}} the `/cita/[id]` link. The template name and language are constants in code, like the other templates; the `.env` var `META_WHATSAPP_CONFIRMATION_REMINDER` stays documentation and smoke-script input only. Unit tests cover the parameter order, the fallback when Instructions are empty or missing, and the Consulta/Práctica sub-type labels.

6. **"Tomorrow in Argentina" helper.** Add a pure date helper in the datetime module: given an instant, it returns tomorrow's `YYYY-MM-DD` on the `America/Argentina/Buenos_Aires` calendar. Vercel functions run in UTC, so the helper must not depend on the server's local time zone. Tests cover 11:00 UTC (08:00 ART), the hours around UTC midnight (the ART and UTC dates differ there), and month/year rollover.

7. **Send one Reminder.** Add a "send Reminder WhatsApp" step for a single Appointment, shaped like the Confirmation and Cancellation steps. If the Patient declined WhatsApp (consent predicate), or the Appointment already has a Reminder recorded, it does nothing. Otherwise it builds the message, sends it through the WhatsAppSender, and records the sent Reminder on the Appointment. Sender failures propagate to the caller. Tests use the fake sender and the in-memory repository.

8. **Send tomorrow's Reminders (the batch).** Add a function that takes the repository, sender, and a clock. It computes tomorrow in Argentina, lists that day's Scheduled Appointments, and runs the single-Reminder step on each one, one after another. Each Appointment is best-effort: a failure is caught and counted, and the batch moves on. It returns a summary of sent, skipped (declined or already reminded), and failed counts, with the failed Appointment ids. Tests: only tomorrow's Appointments are reminded (not today's, not the day after); Cancelled ones are skipped; one failing send doesn't stop the others; running twice sends nothing new.

9. **Enable flag.** Add a predicate in the WhatsApp notifications module, like the Confirmation "with instructions" flag. It is on only when `META_WHATSAPP_REMINDERS_ENABLED` is exactly `"true"`. Tests cover the on value, off/missing, and unexpected values. Nothing reads it yet.

10. **Composition root.** Add the production wiring for the batch: the Mongo appointment repository, the Meta sender (already wrapped with the Send Log, so Reminders count toward the 250/24h usage shown in the Panel), and the real clock. Like the booking wiring, the sender is built lazily, so missing Meta config fails inside the run rather than at import time.

11. **Cron route.** Add a GET API route under an `api/cron` path, marked dynamic. It refuses with 401 unless the request carries `Authorization: Bearer <CRON_SECRET>`. Vercel sends this header automatically when CRON_SECRET is set. If CRON_SECRET is unset, the route refuses every request instead of running unprotected. When the flag is off, it answers 200 `{ enabled: false }` and sends nothing. When on, it runs the batch and answers 200 with the summary. Route tests (composition root mocked, like the availability route test): missing or wrong secret → 401; flag off → no sends; flag on → summary returned.

12. **Schedule it: `vercel.json`.** Add `vercel.json` with one cron entry pointing at the route, schedule `0 11 * * *` (08:00 ART, exact on the Pro plan). Vercel runs crons on the production deployment only.

13. **Panel: show who was reminded.** In the Appointments table, next to the existing "sin WhatsApp" marker, add a small indicator for a Scheduled Appointment that has a recorded Reminder (e.g. "recordatorio enviado", with the send time in its tooltip). Update the component test and snapshot. If the visual-regression suite covers the table, refresh its baselines in a separate follow-up commit, as the booking-form work did.

14. **Ops (no code; do at release).** Set `CRON_SECRET` (a random string of 16+ characters) and `META_WHATSAPP_REMINDERS_ENABLED` (leave unset or `false` for now) in Vercel → Project → Settings → Environment Variables for Production. Add both, commented, to the local `.env` block. Once Meta approves `confirmation_reminder`, set the flag to `true` and redeploy. Confirm the first run in Vercel → Cron Jobs logs and in the Panel's Send Log usage.

## Decision Document

- **Trigger:** a Vercel Cron Job, once daily at `0 11 * * *` UTC = 08:00 America/Argentina/Buenos_Aires. Argentina has no DST, so the UTC schedule never drifts. The project is on Vercel Pro, so the run fires at 08:00 to the minute.
- **Selection rule:** every Appointment with persisted status Scheduled whose date is tomorrow on the Argentina calendar, whose Patient consented to WhatsApp (`whatsappConsentGiven`: legacy Appointments with no consent field count as consented), and with no recorded Reminder. Recent bookings are not skipped: a Patient who booked tomorrow's slot early this morning gets both a Confirmation and a Reminder.
- **Template:** `confirmation_reminder`, language `es_AR`, 7 body parameters in the order nombre, fecha, hora, tipo, obra social, indicaciones, enlace. Values are produced exactly as the Confirmation produces them (date DD/MM/YYYY, time HH:MM, the same tipo label, the same coverage label, the same empty-Instructions fallback, an absolute `/cita/[id]` link from `siteUrl`). The template name is a constant in code, per the repo convention that the code is the contract with Meta.
- **Enable flag:** `META_WHATSAPP_REMINDERS_ENABLED`, on only when `"true"`. It exists because the template is PENDING and Meta rejects sends to it (132001). A temporary flag, like `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS`; remove it once the template is live and proven.
- **Idempotency:** the Appointment gets optional `reminderSentAt` / `reminderMessageId`-style fields, written through a new repository method that mirrors `markConfirmationSent`. The single-Reminder step skips Appointments that already have one. A second cron firing or a manual trigger therefore never double-sends. A send that Meta rejected records nothing, so the Patient is retried only if the route is triggered again the same day.
- **Failure handling:** best-effort per Appointment. One failure never stops the batch. Every attempt (delivered or rejected) still goes through `LoggedWhatsAppSender` into the Send Log, so it shows in the Panel's messaging-limit usage. The route reports counts in its JSON response, which Vercel's cron logs keep.
- **Auth:** the route requires `Authorization: Bearer ${CRON_SECRET}` and fails closed when CRON_SECRET is unset. The admin middleware only matches `/admin`, so the route needs no middleware changes.
- **Time zone:** "tomorrow" uses an explicit `America/Argentina/Buenos_Aires` time zone (Intl), never the server's local zone, because Vercel functions run in UTC.
- **Execution:** sends run one at a time. Daily volume is tens of Appointments, well within the function's duration and the TIER_250 messaging limit.
- **Panel:** the Appointments table shows a reminder-sent indicator. There is no new column, filter, or manual "send reminder" button.

## Testing Decisions

- Good tests check external behavior through the module's public function: which messages were sent, to whom, with which template and parameters, and what got recorded on the Appointment. They don't assert on internals. The in-memory repository and `FakeWhatsAppSender` are swapped in at the existing seams; nothing is mocked past them.
- Modules under test:
  - Reminder message builder (pure).
  - "Tomorrow in Argentina" date helper (pure; fixed instants, never the real clock).
  - Single-Reminder step: consent gate, already-reminded skip, bookkeeping, failure propagation.
  - Batch: date selection, status filtering, per-Appointment isolation of failures, idempotency across two runs, summary counts.
  - Enable-flag predicate.
  - In-memory repository's new "mark reminder sent" method.
  - Cron route: auth (missing, wrong, and unset secret), flag off, and flag on, with the composition root mocked.
  - Appointments table: reminder indicator rendering (component test + snapshot).
- Prior art: `send-confirmation-whatsapp.test.ts` and `send-cancellation-whatsapp.test.ts` (builder + fake sender + in-memory repo); `confirmation-template.test.ts` (env flag predicate); `app/api/availability/route.test.ts` (route test with `vi.mock` of the composition root); `appointments-table.test.tsx` (table snapshot); `lib/datetime/format.test.ts` (date helpers).
- No live Meta call in tests. A manual smoke script is out of scope; the first real run after approval is checked in Vercel's cron logs and the Send Log.

## Out of Scope

- Reminder emails (email notifications are flagged off; WhatsApp only).
- Configurable send time or lead time (it's fixed: the day before, at 08:00).
- Several reminders per Appointment (e.g. one week before plus one day before).
- Handling Patient replies to the reminder (confirm/cancel by reply). The template says not to reply, and inbound webhooks don't exist.
- A Panel button to resend or trigger reminders by hand, and any reminder filter or column beyond the indicator.
- Retrying failed sends later the same day (Vercel Cron does not retry).
- Removing the unused Notification outbox seam.
- Hobby-plan timing concerns (the project is on Pro).

## Further Notes

- The template example shows hora as "12:30 hs". The plan sends plain "HH:MM", like the Confirmation, for consistency. If the clinic wants "hs", change only the Reminder builder.
- The template copy says "visita de mañana", which only holds because the batch selects tomorrow's Appointments. Keep that coupling in mind if the lead time ever changes.
- An Appointment booked after today's 08:00 run for tomorrow gets only its Confirmation. That's acceptable, since the Confirmation arrived minutes earlier.
- Vercel only runs crons on the production deployment, so preview deployments never send reminders.
