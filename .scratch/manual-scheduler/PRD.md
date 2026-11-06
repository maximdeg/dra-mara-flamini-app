# Manual scheduler in the admin panel

Status: done

## Problem Statement

The Professional can only get an Appointment onto the agenda when a Patient books it online, and online booking is tightly fenced: only Visit Kinds offered in the Work Schedule, only Time Slots inside working ranges, only dates from tomorrow to the end of the Booking Window, at most two open Appointments per phone, and a Seña step for Self-Pay. In practice the Professional also arranges visits by phone, in person or over WhatsApp, often at times outside the regular schedule (a Saturday, 20:00, today). Some are for Plasma (Plasma rico en plaquetas), which patients can't book online at all. Those visits live in her head or on paper. They don't show in Turnos or Calendario, and nothing stops a Patient from booking online into the same time.

## Solution

A new admin tab, **Agendar turno**, placed right after Turnos, with a form where the Professional enters an Appointment by hand:

- Nombre, Apellido, Teléfono
- Tipo de visita, then Tipo de consulta (Primera vez / Seguimiento) or Tipo de práctica (Criocirugía / Electrocoagulación / Biopsia / **Plasma**, which only appears here)
- Obra social: the Self-Pay variant for the Visit Type, every accepted Health Insurance, and **Otro**, which shows a free-text box for any other coverage name
- Fecha: any date, past, today or future, including weekends, holidays, Días no laborables and dates beyond the Booking Window
- Hora: any start time (HH:MM)
- Duración: 10–120 minutes in steps of 10. Pre-filled with the chosen kind's Visit Duration (20 for Plasma, which has no Visit Duration) and editable
- A checkbox "El paciente acepta recibir WhatsApp"

On save, the system creates an ordinary Scheduled Appointment flagged as **manual**. It appears in Turnos and Calendario like any other. Its interval blocks the agenda: online Time Slots already step around every Scheduled Appointment, so no Patient can book a start that overlaps it. If the chosen interval overlaps an existing Scheduled Appointment, the save is refused ("Ese horario ya está ocupado"). There is never a double-booking.

When consent is ticked and the start is still in the future, the Patient gets the usual WhatsApp Confirmation now and the usual Reminder the day before. Past or already-started Appointments send nothing. After a successful save the Professional sees a "Turno agendado" toast with a link to Turnos filtered to that date, and the form clears for the next entry.

## Commits

Each step leaves the app working and its tests green.

1. **Introduce Plasma as an admin-only Practice Type.** Split the Practice Types into the bookable set (Criocirugía, Electrocoagulación, Biopsia; unchanged and still what Visit Kinds are built from) and a wider set that an Appointment may hold, which adds Plasma. Give Plasma its Spanish label "Plasma". The Appointment's practice type accepts the wider set. Visit Kinds, the durations, the Horarios kind picker, the public booking form and the availability API stay on the bookable set. Tests: Plasma is not a Visit Kind and is refused when parsed from a URL; the label map covers Plasma.

2. **Teach every label consumer about Plasma.** The Turnos table, the cita page details, the WhatsApp Confirmation/Reminder/Cancellation parameters and the email templates all read the wider label map, so a Plasma Appointment renders "Práctica · Plasma" everywhere. Tests: the existing label/parameter tests get a Plasma case.

3. **Make the Visit Kind of a Plasma Appointment explicit.** Working out the Visit Kind of an Appointment returns "none" for Plasma (it isn't a Visit Kind). Every caller already handles "none", so behavior is unchanged. Test that.

4. **Add the manual flag to the Appointment.** An optional origin field: "manual" for Professional-entered Appointments, absent for online bookings (so no migration is needed). Persistence passes it through. Nothing reads it yet.

5. **Exempt manual Appointments from the Horarios guard.** When a proposed Work Schedule is checked for collisions, manual Appointments are skipped, since they never depended on the schedule. Adding a Día no laborable still collides with manual Appointments on that date (they must be cancelled first, each sending a Cancellation Notice). Tests: a manual Appointment on a Saturday or at 20:00 doesn't block a schedule save; a manual Appointment on a date does block adding that date as a Día no laborable; online Appointments behave exactly as before.

6. **Manual Booking module: walking skeleton.** A new domain operation, separate from online Booking. It takes the manual form plus injected dependencies (the repository, id generator, clock) and persists a Scheduled Appointment flagged manual, with the given date, time and duration, no email, no Seña. It doesn't check the phone cap, the Booking Window or the Work Schedule. It normalizes the phone the same way online Booking does (refusing an invalid one) and requires a non-blank Nombre and Apellido. It returns a typed result union like online Booking. Tests run through its interface with the in-memory repository.

7. **Sub-type validation.** A Consultation requires a Consult Type, and a Practice requires a Practice Type from the wider set (Plasma allowed). The unused sub-type is normalized to none. Tests mirror the online Booking ones, plus a Plasma case.

8. **Date, time and duration validation.** Refuse a malformed or non-existent calendar date, a time that isn't a valid 24-hour HH:MM, a duration outside the Duración options, and an interval that runs past midnight. Any valid date is accepted, past ones included. Tests for each refusal.

9. **Overlap refusal.** Read the intervals Scheduled Appointments occupy on that date, through the same repository method Availability uses, and refuse with "slot taken" when the new interval overlaps any of them. This works regardless of the Work Schedule. Touching intervals (one ends when the next starts) are allowed. Tests: overlap at start, end, fully inside, fully covering; touching allowed; a Cancelled Appointment doesn't block.

10. **Coverage, including Otro.** Accept the Self-Pay variant matching the Visit Type, any accepted Health Insurance, or an "other" coverage carrying a non-blank, trimmed, length-capped name. Copy Coverage Instructions as online Booking does: the variant's or insurer's own, empty for "other". Tests: wrong-type Self-Pay refused, unknown insurer refused unless sent as "other", blank "other" refused, instructions copied.

11. **Confirmation for manual Appointments.** When consent is given, store the consent instant (same field as online). When the start (date + time, Argentina time) is still in the future, send the WhatsApp Confirmation and the email channel best-effort, exactly as online Booking does. A notification failure never undoes the save. Without consent, or with a past start, nothing is sent. The existing Reminder batch picks the Appointment up unchanged. Tests with fake notifiers: sent for future + consent, skipped for past, skipped without consent, failure swallowed.

12. **Composition root.** Production wiring for Manual Booking: the Mongo repository, the accepted Health Insurances, Self-Pay instructions, Visit Durations (for the form's default) and the WhatsApp/email senders, built lazily as the online composition root does.

13. **Server action.** An admin server action behind the same Professional session check as every other admin mutation. It parses the submitted form, calls Manual Booking, revalidates Turnos and Calendario, and returns either success (with the new Appointment's date) or the typed refusal. It returns unauthorized when there's no session.

14. **The form component.** A client form with the fields above. The sub-type select follows the Tipo de visita, and Plasma shows only here. The Obra social select ends with "Otro", which reveals a text field. Duración pre-fills from the chosen kind's Visit Duration, or 20 for Plasma, until the Professional changes it by hand. Native date and time inputs, with no min/max. Each refusal maps to a Spanish inline message. Component test: Plasma present only under Práctica; Otro reveals the text field; the duration follows the kind until edited; the refusal messages render.

15. **Page and nav tab.** The Agendar turno page loads the coverage list and Visit Durations and renders the form. The nav gets "Agendar turno" right after Turnos. Update the nav snapshot.

16. **Success feedback.** On success: the "Turno agendado" toast with a link to Turnos filtered to that date (Desde = Hasta = the date), then reset the form. Component test for the reset and the link.

17. **End-to-end baseline.** A Playwright test opens the new tab and screenshots the empty form, pinned to a deterministic state like the existing admin baselines. Refresh baselines only for the new screenshot and the nav change.

18. **Domain docs.** Update the glossary: a **Manual Appointment** entry (entered by the Professional; bypasses the Booking Window, Work Schedule, phone cap and Seña; still never overlaps the agenda; exempt from the Horarios guard but not the Día no laborable guard). Add Plasma to Practice Type as admin-only. Amend the Aesthetic Treatment entry: Plasma is still not bookable online, but the Professional may enter it manually. Add an ADR recording the admin-only practice type and the Horarios-guard exemption.

## Decision Document

- **New module: Manual Booking**, a sibling of online Booking, not a mode flag on it. Online Booking's guards (Booking Window, Time Slot match, phone cap, Seña) stay untouched, and the manual path has its own small set. Both write ordinary Appointments through the same repository seam. Online Booking is no longer the *only* writer of new Appointments; update its doc comment.
- **Manual Booking interface:** takes a manual form (first name, last name, phone, Visit Type, Consult Type or Practice Type, coverage, date, time, duration in minutes, WhatsApp consent) and dependencies (repository, accepted Health Insurances, Self-Pay instructions, confirmation and email notifiers, optional id generator and clock). Returns ok with the Appointment, or a typed refusal: missing name, invalid phone, missing consult type, missing practice type, invalid date, invalid time, invalid duration, overruns midnight, invalid coverage, slot taken.
- **Practice Types:** two sets. The bookable set (unchanged) defines Visit Kinds and everything availability-related. The wider set (bookable + Plasma) is what an Appointment may hold and what labels cover. Plasma has no Visit Duration, no Work Schedule presence and no public visibility. Stored as the canonical value "Plasma" with a matching Spanish label.
- **Schema changes (Appointment document, all additive, no migration):** an optional origin field ("manual", absent means online). The practice type may now hold "Plasma". Coverage gains a third variant, "other", with a free-text name, used only by manual Appointments. Every coverage label and deposit check must handle it (label = the typed name; never a Seña).
- **Duration:** chosen by the Professional from the existing Duración options (10–120 in tens), defaulting to the kind's Visit Duration, or 20 for Plasma. Stored on the Appointment as for online bookings.
- **Agenda blocking:** no change to Availability. Manual Appointments are Scheduled Appointments, so online Time Slots already step around them. A manual Appointment outside working ranges simply never meets a slot.
- **Overlap rule:** strict. The manual interval may not overlap any Scheduled Appointment's interval on that date, whether online or manual. Touching is fine.
- **Collision guards:** the Horarios (Work Schedule) guard ignores manual Appointments. The Día no laborable guard still includes them.
- **Dates and times:** any valid calendar date (past allowed) and any valid HH:MM. The interval must end by 24:00. A past-dated manual Appointment reads as Completed immediately through the existing derived Status.
- **Bypassed rules:** phone cap, Seña, Booking Window, weekends/holidays/Días no laborables, Work Schedule ranges and kind tags.
- **Notifications:** consent checkbox, Confirmation only for a future start, Reminder via the existing batch, Cancellation Notice via the existing cancellation flow. All best-effort.
- **Email:** not collected. Stored as none.
- **UI:** a new admin tab "Agendar turno" right after Turnos. Success shows a toast with a link to Turnos filtered to the date, then the form resets.
- **Authorization:** the new page sits under the existing admin middleware, and the server action repeats the Professional session check.

## Testing Decisions

- Good tests exercise external behavior through a module's public interface (what it accepts, returns and persists), never its internals. Domain modules are tested by swapping in the in-memory adapters, not by mocking.
- **Manual Booking module:** full TDD through its interface with the in-memory Appointment repository and fake notifiers, covering every refusal, persistence of the manual flag/duration/coverage/instructions, overlap edge cases and notification gating. Prior art: the online Booking tests.
- **Collision guards:** extend the Work Schedule update and Día no laborable tests with manual Appointments. Prior art: the collision, update-work-schedule and add-unavailable-day tests.
- **Visit types and kinds:** Plasma excluded from Visit Kinds and from parsing, labels cover it. Prior art: the visit-kind tests.
- **Labels in notifications and views:** add Plasma cases to the WhatsApp parameter, email confirmation, cita details and appointments table tests. Prior art: those modules' existing tests and snapshots.
- **Form component:** a React Testing Library test for conditional fields, the duration default and refusal messages. Prior art: the schedule editor, coverage editor and unavailable-days manager tests.
- **Nav:** update the admin nav snapshot.
- **E2E:** a Playwright visual baseline for the empty Agendar turno form. Prior art: the admin spec's deterministic, pinned-state screenshots.

## Out of Scope

- Editing or rescheduling an existing Appointment (manual or online). Cancel and re-enter instead.
- A Patient entity, search, or autocomplete from past Appointments (ADR-0002 still holds).
- Making Plasma or any other Aesthetic Treatment bookable online, or giving it a Visit Duration or Work Schedule presence.
- Recording payments or a Seña for manual Appointments.
- Overriding the overlap rule (double-booking).
- Locking against two simultaneous saves landing on the same time (online Booking has the same race today).
- A "manual" badge or filter in Turnos/Calendario. The flag is stored, so this can be added later.
- Collecting an email on the manual form.

## Further Notes

- This reverses part of the Aesthetic Treatment definition in the glossary for Plasma only, and only on the admin side. The home page keeps sending Patients to WhatsApp for it.
- A same-day manual Appointment in the next few hours can be cancelled only by the Professional (the Patient's 24-hour Cancellation Window applies as usual).
- The Confirmation's cita link lets the Patient self-cancel a manual Appointment under the normal Cancellation Window. That's intended.
