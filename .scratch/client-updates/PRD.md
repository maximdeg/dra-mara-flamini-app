# Refactor plan: Client updates — two open Appointments per phone, optional email, email sending off

Status: ready-for-agent

Source: `instruction-changes.md` (client request).

## Problem Statement

The client has asked for three changes to the booking flow:

1. **Phone limit.** Today a phone number can hold only **one** open Appointment (Scheduled, date still in the future). Patients who need two visits, such as a Consultation and a follow-up Practice, can't book the second until the first ends. The client wants **two** open Appointments per phone.
2. **Email is mandatory, and emails are sent.** The booking form requires an email. Each booking sends a Confirmation email and each cancellation sends a Cancellation email, alongside WhatsApp. The client wants email to be **optional** on the form and wants the app to **stop sending** Confirmation and Cancellation emails. The email code itself should stay, so it can be turned back on later.
3. **Health Insurance notes in the Confirmation.** Each Health Insurance (Obra Social) has a free-text notes field in the admin. The client wants those notes to appear in the Confirmation message. **This is explicitly deferred** (see Out of Scope).

## Solution

- Turn the one-open-Appointment rule into a **cap of open Appointments per phone**. The cap is a named constant set to 2. "Open" keeps its current meaning: the derived Status is Scheduled, so past (Completed) and Cancelled Appointments don't count. The rejection becomes `PhoneAtOpenAppointmentLimit`, and its Spanish message mentions the limit.
- Add an **email-notifications feature flag**, read from an env var (`EMAIL_NOTIFICATIONS_ENABLED`). It is **off unless the value is exactly `"true"`**. The Booking and Cancellation composition roots check it and skip the email channel when it's off. `book()` and `cancel()` keep their interfaces and their best-effort email step. Turning email back on is just an env change.
- Make the Patient's email **optional**. The type becomes `patientEmail: string | null`. A blank or whitespace-only value is stored as `null`. A non-blank value must look like an email address, or Booking rejects it with `InvalidEmail`. The email senders skip silently when there's no recipient, so turning the flag back on can never try to mail `null`.
- The Patient's /cita page **hides the Email row** when no email was given. It **hides the "Confirmación por email" row** whenever email notifications are off, so it never shows a "Pendiente" for an email that will never be sent.

## Commits

Each commit leaves the app building, type-checking and passing tests.

### Part A — Two open Appointments per phone

1. **Generalize the open-Appointment check without changing behavior.** Replace the yes/no "phone has an open Appointment" helper with one that counts open Appointments from a phone's Scheduled list, given "now". Add a second helper that answers "is this phone at the cap?" for a given cap. Booking's dependency becomes "is this phone at its open-Appointment limit". The Booking composition root wires it with a cap of **1**, so behavior is unchanged. Move the existing helper tests over to the new helpers: today/future counts, past doesn't, an empty list is zero.
2. **Rename the rejection code.** Rename `PhoneHasOpenAppointment` to `PhoneAtOpenAppointmentLimit` in Booking's rejection union, the booking page's Spanish message map, and the tests. No behavior change, and the cap is still 1.
3. **Introduce the cap constant and raise it to 2.** Add a named constant for the maximum open Appointments per phone, set to 2, next to Booking, and have the composition root use it. Update the Spanish message to something like "Este teléfono ya tiene 2 turnos agendados. Cancelá uno para reservar otro." Interpolate it from the constant so copy and rule can't drift. Add Booking tests: a phone with 1 open Appointment can book; a phone with 2 is rejected; 2 past (Completed) plus 0 open can book; the cap is checked against the **normalized** phone, as today's rule is.
4. **Update the domain docs.** In CONTEXT.md, change the **Patient** and **Status** entries from "only one open Appointment" to "at most two open Appointments". Update ADR-0002's wording the same way and add a short dated note saying the cap was raised at the client's request. Docs only.

### Part B — Turn off email sending behind a flag

5. **Add the email-notifications flag reader.** Add a small function in the email notifications module that reports whether Patient email notifications are enabled. It's true only when the env var is exactly `"true"`; missing, empty or any other value means off. Unit-test those cases. Nothing uses it yet.
6. **Gate the Confirmation email in the Booking composition root.** When the flag is off, the composition root supplies a no-op for the Confirmation email instead of building the Gmail sender. When it's on, wiring is as today. Put the "pick the real sender or a no-op" decision in a small pure helper so it can be unit-tested without Mongo or Gmail. Test it: off means the real send is never called; on means it is.
7. **Gate the Cancellation email in the Cancellation composition root.** Same pattern with the same helper. When the flag is off, it also skips the clinic-info read that only exists to fill the email's contact block.
8. **Document the flag.** Mention `EMAIL_NOTIFICATIONS_ENABLED` wherever env vars are documented (manual test notes, deploy notes), and say that it defaults to off. The **password-reset email for the Professional is unaffected** and still sends. Add a one-line comment at the flag reader saying so.

### Part C — Optional email on the booking form

9. **Make the Appointment's email nullable at the type level.** Change `patientEmail` to `string | null` on the Appointment and the Booking Form. Fix every compile error by handling `null` explicitly. The Confirmation and Cancellation email senders return early without sending when there's no email, and they don't mark the email as sent. Add a test for each sender: a `null` email means nothing is sent and no bookkeeping is written. Existing fixtures keep their string emails. Booking still passes through whatever it receives, so behavior is unchanged for current clients.
10. **Normalize and validate the email in Booking.** Booking trims the email, turns blank or whitespace-only into `null`, and rejects a non-blank value that isn't a plausible email with a new `InvalidEmail` rejection. Use a simple check (one `@`, non-empty local part and domain with a dot), not a full RFC parser. Add the Spanish message to the booking page's map. Tests: blank → stored `null`; whitespace → `null`; valid → stored trimmed; malformed → rejected with no Appointment created; an omitted field (older API clients) → `null`.
11. **Make the email field optional on the booking form.** Drop `required` from the email input, label it as optional (for example "Email (opcional)"), keep `type="email"` for browser hints, and submit a blank value as is so Booking normalizes it. Update the booking page test and its snapshot. The public e2e visual snapshots of the booking form will change because of the label. Regenerate them in this commit and say so in the commit message.
12. **Hide the Email row on the /cita page when there's no email.** The appointment details component leaves out the Email row when `patientEmail` is `null`. Add tests and update the snapshot.
13. **Hide the "Confirmación por email" row when email notifications are off.** The /cita server page reads the flag and passes it to the details component as a prop. The component shows the row only when the flag is on, so the component stays pure and testable. Tests cover both states. Update the snapshot.
14. **Update the domain docs for optional email.** In CONTEXT.md, the **Patient** entry lists email as optional. Make the same change in ADR-0002's list of identification fields. Docs only.

## Decision Document

- **Phone cap:** a named constant (2) owned by the Booking module. It is not configurable from the dashboard. "Open" = derived Status Scheduled (Scheduled and date not yet passed), so the definition is unchanged. Only the count changes, from 1 to 2.
- **Booking dependency shape:** Booking asks its dependencies a single question: "is this normalized phone at its open-Appointment limit?" The composition root combines the repository's Scheduled-by-phone query, the clock and the cap constant. Booking itself still doesn't know about the repository query.
- **Rejection codes:** `PhoneHasOpenAppointment` is renamed to `PhoneAtOpenAppointmentLimit`, and a new `InvalidEmail` code is added. Both are returned through the existing 422 `{ rejection }` API contract. The booking page maps both to Spanish copy.
- **Email flag:** env var `EMAIL_NOTIFICATIONS_ENABLED`. It is enabled only when the value is exactly `"true"` and defaults to off. It is read in the composition roots and the /cita server page, never inside `book()` or `cancel()`. Domain functions keep their best-effort email step and dependency interfaces unchanged.
- **Email code stays:** templates, senders, the nodemailer adapter and the email bookkeeping fields (`emailSent`, `emailSentAt`, `emailMessageId`) all stay. Bookkeeping simply stays false/null while the flag is off.
- **Password-reset email is out of the flag's reach.** It's a Professional auth flow, not a Patient Notification.
- **Schema:** `patientEmail` becomes nullable. No migration: existing Mongo documents keep their string emails, and new ones may store `null`. Readers handle both.
- **Email validation:** trim, blank → `null`, light format check server-side. The browser's `type="email"` is only a hint, not the source of truth.
- **/cita page:** the Email row shows only when present. The email-confirmation row shows only when the flag is on, and the flag reaches the component as a prop from the server page.

## Testing Decisions

- Good tests exercise **external behavior through public interfaces**: `book()` results and what the in-memory repository holds afterward, what the fake email sender received, and what a component renders. They don't test private helpers or call order.
- **Booking** (Vitest, in-memory repository, fake senders): cap behavior at 0, 1 and 2 open Appointments, past Appointments not counting, the normalized-phone check, email normalization and `InvalidEmail`. Prior art: the existing booking tests for the open-Appointment rule, phone normalization and WhatsApp consent.
- **Open-Appointment counting helpers:** pure unit tests, moved over from the existing helper tests.
- **Email flag reader and sender-gating helper:** pure unit tests over env values and on/off selection.
- **Email senders:** a `null` recipient means no send and no bookkeeping. Prior art: the existing send-confirmation and send-cancellation email tests with the fake email sender.
- **Booking page and /cita details component:** React Testing Library plus the existing snapshot tests. Prior art: the booking page test, the appointment details tests and the appointment info tests.
- **Cancellation:** existing cancellation tests should pass unchanged, which confirms the domain interface didn't move.
- No new e2e tests. Existing visual snapshots of the booking form are regenerated in commit 11.

## Out of Scope

- **Showing Health Insurance (Obra Social) notes in the Confirmation message.** The client deferred this. It will likely need a new or changed Meta WhatsApp template (ADR-0003) and a change of meaning for the notes field, which is documented today as "notes for the Professional". That deserves its own plan.
- Deleting or rewriting any email code, templates or bookkeeping fields.
- Making the phone cap configurable from the dashboard.
- Extra limits such as "not two on the same day".
- Changing the WhatsApp Confirmation or Cancellation Notice content or templates.
- The Professional's password-reset email.
- Changing how the admin appointments list shows Patient contact details.

## Further Notes

- Parts A, B and C are independent and can ship in any order or as separate branches. Within each part, keep the commit order.
- Before deploying Part B, make sure production **doesn't** set `EMAIL_NOTIFICATIONS_ENABLED=true`. Gmail credentials can stay in place without harm.
- When the Obra Social notes work starts, CONTEXT.md's **Health Insurance** entry and the coverage model's notes comment will need to say the notes are Patient-facing.
