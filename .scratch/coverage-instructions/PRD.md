# Refactor plan: Coverage Instructions (Indicaciones) on the Confirmation and the cita page

Status: ready-for-agent

Source: `instruction-changes.md` → "Add 'obra social' specifics for each one".

## Problem Statement

Each coverage has requirements the Patient should know before the visit: a Health Insurance (Obra Social) might need a prior authorization, a specific card, or a co-payment; a Self-Pay visit might mean bringing cash. Today the Professional has nowhere to write this that reaches the Patient:

- The only free-text field on a Health Insurance is **Notas**, documented as "notes for the Professional". It's an internal remark, yet the public `GET /api/health-insurances` already returns it to anyone.
- Self-Pay (Particular / Practica Particular) has no text field at all, only prices.
- The WhatsApp Confirmation is the Meta-approved template `appointment_confirmation_1` with six parameters, and none of them can carry coverage-specific instructions. The /cita page has nothing coverage-specific either.

The client wants each coverage's specifics to appear in the **Confirmation message** and on the **cita page**. The Professional has already edited the template in Meta. Its body now uses `{{6}}` for the instructions and `{{7}}` for the /cita link, with `{{1}}`–`{{5}}` unchanged. The edit is **pending Meta review**.

## Solution

- Add a new Patient-facing text called **Coverage Instructions** (UI: *Indicaciones para el paciente*) to **every coverage**: each Health Insurance, and each of the two fixed Self-Pay variants. The existing **Notas** stays internal and is removed from the public API.
- Instructions are a **single line of at most 300 characters**. They're sanitized on save (line breaks stripped, whitespace collapsed, trimmed, capped), so they're always a valid WhatsApp template parameter and the message stays under Meta's 1024-character body limit.
- At booking, Booking **copies** the chosen coverage's Instructions onto the Appointment. The cita page and the WhatsApp then always show what applied when the Patient booked, even if the Professional later edits, renames or removes the coverage.
- The cita page shows the copied Instructions as a callout while the Appointment is Scheduled, if there are any.
- The WhatsApp Confirmation builder supports the new 7-parameter body: `{{6}}` is the Instructions, or a fixed fallback ("Sin indicaciones adicionales.") when there are none, because Meta rejects empty parameters, and `{{7}}` is the link. Because the template edit is still under review, the 7-parameter body sits behind an env flag, **off by default**. Today's 6-parameter message keeps going out until the Professional flips the flag in Vercel after Meta approves.

## Commits

Each commit leaves the app building, type-checking and passing tests.

### Part A — Model and admin editing

1. **Add the Instructions sanitizer.** Add a pure function to the coverage module that turns raw admin input into valid Instructions: replace line breaks and tabs with spaces, collapse runs of whitespace into one space, trim, and cap at 300 characters. Export the 300 limit as a named constant. Unit tests: a multi-line input becomes one line, a 4+ space run collapses, over-long input is cut to 300, blank becomes empty. Nothing uses it yet.
2. **Add Instructions to the Health Insurance model.** Health Insurance gains an `instructions` field. The repository treats stored documents without the field as having empty Instructions, so there's no migration. The seeded insurers get empty Instructions. Adding, editing (including renaming) and removing an insurer carry Instructions through. Update the doc comment on **Notas** to say it is internal and never shown to Patients. Tests: extend the existing coverage and repository tests, including a legacy document without the field.
3. **Edit Health Insurance Instructions in the admin.** The coverage editor gets an "Indicaciones para el paciente" single-line input with a 300-character limit and a visible character counter, on both the add and edit forms. A short hint says the text reaches the Patient in the WhatsApp and on the cita page, while "Notas" stays internal. The server actions run input through the sanitizer before saving. Tests: extend the coverage editor tests to cover saving Instructions, and update its snapshot.
4. **Add Instructions to the two Self-Pay variants.** The persisted Self-Pay settings, currently prices only, gain one Instructions field per variant (Particular, Practica Particular). Missing fields read as empty, so there's no migration. The coverage editor's Self-Pay section gets the same input and counter next to each variant's price, sanitized on save. Tests: repository tests covering the legacy-document default, plus editor tests and the snapshot.
5. **Stop exposing internal Notas publicly.** The public Health Insurance endpoint returns a Patient-safe view of each insurer (name and price), without **Notas** or Instructions; the booking picker needs neither. Put the projection in a small pure function in the coverage module and unit-test that Notas never appears in it. The booking form keeps working unchanged.

### Part B — Copy onto the Appointment and show it on the cita page

6. **Resolve a coverage's Instructions.** Add a pure function that takes a chosen coverage, the accepted Health Insurances and the Self-Pay settings, and returns that coverage's Instructions (empty when none). Unit tests: insurer match, insurer with empty Instructions, each Self-Pay variant, and an unknown insurer (empty).
7. **Copy Instructions onto the Appointment at booking.** The Appointment gains `coverageInstructions` (a string, empty when none). It's optional on the type, because Appointments booked before this change don't have it and readers treat that as empty. Booking resolves it from the dependencies it already receives (accepted Health Insurances and Self-Pay settings) and stores it. Booking tests: a Health Insurance booking stores that insurer's Instructions; a Self-Pay booking stores its variant's; editing the insurer after booking doesn't change the stored value.
8. **Show Instructions on the cita page.** While the Appointment is Scheduled and its copied Instructions aren't empty, the cita page's information section shows a callout headed with the coverage name, for example "Indicaciones para OSDE", that holds the Instructions. Hide it for Cancelled or Completed Appointments, empty Instructions, and legacy Appointments without the field. Tests: extend the appointment info tests and update the snapshot.

### Part C — WhatsApp Confirmation with Instructions (behind a flag)

9. **Teach the Confirmation builder the 7-parameter body.** The pure Confirmation builder takes an option for whether the template includes Instructions. When it's off, it emits today's six parameters unchanged. When it's on, it emits seven: `{{1}}`–`{{5}}` as today, `{{6}}` the Appointment's copied Instructions or the named fallback constant ("Sin indicaciones adicionales.") when empty or missing, and `{{7}}` the manage link. Tests: the existing 6-parameter tests stay, plus 7-parameter order, the fallback for empty and missing Instructions, and the existing "no newline or 4+ space run" guarantee in both modes.
10. **Wire the flag.** Add a flag reader for `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS`, enabled only when the value is exactly `"true"`, and unit-test it. The Booking composition root reads it and passes it through the Confirmation send path to the builder. With it off, production behavior is identical to today.
11. **Let the smoke test cover both shapes.** The Meta smoke-test script sends seven parameters, including a sample Instructions value, when the flag is set, and six otherwise. That way the Professional can prove the approved template accepts the new shape before flipping the flag in production.
12. **Docs.** Add **Coverage Instructions** to CONTEXT.md under Coverage & payment: Patient-facing, per Health Insurance and per Self-Pay variant, copied onto the Appointment at booking, distinct from internal Notas. Add a dated amendment to ADR-0003 recording the template's new 7-parameter body, the fallback rule, and the flag-gated cutover. Add a short cutover section to the manual test notes: once Meta approves, run the smoke test with the flag set, then set the flag in Vercel.

### Part D — Cutover (HITL, after Meta approval)

13. **Flip the flag (no code).** Once Meta approves the edited `appointment_confirmation_1`: run the smoke test with the flag set, set `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS=true` in Vercel, and book a test Appointment to confirm the WhatsApp arrives with the Instructions line. Do it promptly. As soon as the approved template expects seven parameters, the old 6-parameter sends fail with error 100. Booking is unaffected because sends are best-effort, but those Patients get no Confirmation.
14. **Remove the flag (follow-up).** After the flag has been on in production for a while, delete the flag and the 6-parameter path so the builder always emits seven. Update the tests and docs.

## Decision Document

- **New domain term: Coverage Instructions** (UI: *Indicaciones para el paciente*). Patient-facing text attached to each Health Insurance and to each Self-Pay variant. **Notas** stays as internal Professional-only text and is never shown to Patients or returned by public endpoints.
- **Format:** a single line, at most 300 characters (a named constant), sanitized server-side on save: line breaks and tabs become spaces, whitespace runs collapse, the text is trimmed and capped. The admin input enforces the limit with a counter, but the server sanitizer is what counts. Sanitizing guarantees a valid WhatsApp parameter (no newline, no 4+ space run).
- **Storage:** the Health Insurance gains `instructions`, and the Self-Pay settings record (today prices only) gains one Instructions field per variant. A missing field reads as empty, so there's no migration.
- **Copied at booking:** the Appointment gains an optional `coverageInstructions`, resolved by Booking from the coverage data it already receives. Later edits don't touch existing Appointments. Legacy Appointments without the field behave as empty.
- **Public API:** the Health Insurance endpoint returns a Patient-safe projection (name and price) and no longer leaks Notas.
- **WhatsApp template contract:** `appointment_confirmation_1` [es_AR]. Once approved, its body is `{{1}}` name, `{{2}}` date, `{{3}}` time, `{{4}}` type, `{{5}}` Obra Social, `{{6}}` Instructions, `{{7}}` /cita link. Empty Instructions are sent as the fallback "Sin indicaciones adicionales." (a constant), because Meta rejects empty parameters.
- **Cutover:** `META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS` is enabled only when exactly `"true"` and defaults to off. It's read in the Booking composition root and passed to the pure builder, which stays free of env. It's temporary and removed in a follow-up once the 7-parameter template is live.
- **Cancellation Notices are unchanged:** their templates and parameters stay as they are.
- **The Confirmation email is untouched.** It's switched off by the email flag, and adding Instructions to it is out of scope.

## Testing Decisions

- Good tests exercise **external behavior through public interfaces**: the sanitizer's output, what the repositories return (including legacy documents), what `book()` stores, the builder's emitted parameters, and what components render. They don't test private helpers or call order.
- **Coverage module** (sanitizer, add/edit/remove with Instructions, Instructions resolution, public projection): pure unit tests. Prior art: the existing coverage tests.
- **Repositories** (Health Insurance, Self-Pay settings): in-memory repository tests, including a document missing the new fields. Prior art: the Health Insurance repository and Self-Pay pricing repository tests.
- **Booking:** Vitest with the in-memory repository, checking that Instructions are copied and stay put after a later edit. Prior art: the existing booking tests.
- **WhatsApp Confirmation builder:** 6-parameter and 7-parameter modes, the fallback, and the newline/space guarantee. Prior art: the existing WhatsApp confirmation and send-confirmation tests.
- **Flag reader:** pure unit tests over env values. Prior art: the email notifications flag tests.
- **Admin coverage editor and cita info section:** React Testing Library plus snapshots. Prior art: the coverage editor tests and the appointment info tests.
- No new e2e tests. The Meta smoke test (manual) proves the approved template before cutover.

## Out of Scope

- Instructions in the Confirmation **email** (email notifications are switched off).
- Changing the Cancellation Notice templates.
- Showing Instructions on the booking form before the Patient books (a possible follow-up).
- Rich text, links or multi-line Instructions.
- Showing Notas anywhere Patient-facing.
- Submitting or approving the template in Meta. The Professional has done the submission, and approval is Meta's.

## Further Notes

- Parts A and B can ship right away; they don't depend on Meta. Part C can also ship right away because the flag defaults to off. Only Part D waits on approval.
- Error 100 risk: while the flag is off and Meta approves the edited template, 6-parameter sends start failing until the flag is flipped. Keep that window short (commit 13). The Panel's WhatsApp usage log records the rejected attempts with their error code, which is a quick way to spot a missed flip.
- If Meta **rejects** the edit, the flag simply stays off. Instructions are still shown on the cita page, which the current Confirmation already links to.
