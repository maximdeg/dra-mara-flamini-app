# Refactor plan: availability and duration per Visit Kind

Status: ready-for-agent

Source: `instruction-changes.md` → "Add adaptive date and time availability depending on 'Tipo de consulta'".

## Problem Statement

The Professional runs different kinds of visits at different times. First Visits might happen only on Monday mornings, and procedures such as Biopsias only on Wednesday afternoons. They also take different amounts of time: a Biopsia needs longer than a Follow-up. Today the system can't express either:

- There is **one weekly Work Schedule**. Every time range accepts every kind of visit.
- Every Appointment lasts exactly one **20-minute Time Slot**, and start times sit on a fixed :00/:20/:40 grid.
- The booking form asks for the Visit Type and sub-type first, but the dates and times it offers **ignore that choice**. Availability doesn't know what is being booked.

The Professional needs to edit, from the admin, when each kind of visit can be booked and how long each kind takes.

## Solution

- Introduce the **Visit Kind**: the bookable combination of Visit Type and its required sub-type. There are five: Consulta · Primera vez, Consulta · Seguimiento, Práctica · Criocirugía, Práctica · Electrocoagulación, Práctica · Biopsia.
- Keep **one Work Schedule** and tag each time range with the Visit Kinds it accepts. The Horarios editor shows grouped checkboxes per range: a Consulta group and a Práctica group, each with a toggle to select the whole group. A row whose kinds are all ticked reads as "Todas". Stored ranges without tags accept every kind, so there's no migration.
- Give each Visit Kind a **duration** in multiples of 10 minutes (10–120). It's edited in a small table at the top of the Horarios page and starts at 20 minutes for every kind.
- Move availability to a **10-minute grid**. A start time is offered for a kind when the whole Appointment, from start to start plus duration, fits inside **one** range that accepts that kind without overlapping any Scheduled Appointment. One Professional means one shared agenda: a booked Appointment of any kind blocks its whole interval for every other kind.
- Copy the duration onto the Appointment at booking. A later duration edit doesn't move existing Appointments; legacy Appointments count as 20 minutes.
- The booking form loads dates and times **for the chosen Visit Kind**. Fecha stays disabled until the kind is complete, and changing the kind resets date and time. The server re-checks against the same kind.
- Reducing availability keeps today's rule. The Professional can't save a schedule change that strands a Scheduled Appointment until it's cancelled. "Fits" now means the whole interval sits inside a range that still accepts that Appointment's kind.

## Commits

Each commit leaves the app building, type-checking and passing tests.

### Part A — Domain foundation (no behavior change)

1. **Introduce Visit Kind.** Add the Visit Kind type (the five combinations), the list of all kinds, Spanish labels ("Consulta · Primera vez", …), and their grouping into Consulta and Práctica. Add a pure function that derives an Appointment's or Booking Form's kind from its Visit Type and sub-type. Unit tests: every combination maps to the right kind, and labels match the existing visit-type labels.
2. **Let time ranges carry accepted kinds.** A time range gains an optional list of accepted Visit Kinds. Add a pure reader where a missing list means "all kinds", so stored schedules keep behaving as today. The Work Schedule sanitizer keeps only known kinds, drops duplicates, and keeps a range only if it accepts at least one kind. Unit tests cover legacy ranges, unknown kinds, an empty list and duplicates. Availability doesn't read the tags yet.
3. **Enforce the 10-minute grid on schedule edits.** The sanitizer used for edits drops range ends that aren't on a 10-minute boundary. Ranges already stored off-grid are left alone, since reads don't go through this rule. Unit tests: 09:00–13:00 is kept, 09:05–13:00 is dropped.
4. **Add Visit Durations.** Add the Visit Durations settings (minutes per Visit Kind), a sanitizer (multiples of 10 between 10 and 120, otherwise falling back to 20), and a repository with in-memory and Mongo adapters. Missing settings read as 20 for every kind. Unit and repository tests, including a legacy or empty document. Nothing uses it yet.
5. **Copy the duration onto the Appointment at booking.** The Appointment gains an optional `durationMinutes`, and a pure reader treats a missing value as 20. Booking receives the Visit Durations as a dependency and stores the booked kind's duration. Booking tests: the duration is copied, and a later edit to the durations doesn't change it. Availability is still unchanged, and the durations are all 20, so behavior is identical.

### Part B — Availability per Visit Kind

6. **Read booked intervals from the repository.** Add a repository method that returns each Scheduled Appointment's start time and duration on a date, for both adapters, with legacy Appointments as 20 minutes. Repository tests. The old times-only method stays until commit 8.
7. **Kind- and duration-aware Time Slots.** Availability's "free times for a date" takes a Visit Kind and its duration. It offers every 10-minute start inside a range that accepts the kind, such that start plus duration is no later than the range end, and the interval doesn't overlap any booked interval. Off-grid legacy ranges step from their own start. Unit tests:
   - a kind excluded from a range gets nothing there;
   - a 40-minute kind isn't offered within 30 minutes of a range end;
   - a booked 40-minute Appointment blocks overlapping starts for every kind;
   - two touching ranges don't combine;
   - the weekend, holiday and Unavailable Day rules still hold.
8. **Booking Window and the server-side guard take the kind.** The Booking Window ("dates with at least one start for this kind") and the date/time classification both take the Visit Kind and duration. Booking derives the kind from the form, looks up its duration, and passes both into classification. Remove the old times-only repository method. Tests: the Booking Window differs per kind, and classification rejects a time valid for another kind but not this one ("slot-taken").
9. **Kind-aware public endpoints.** The availability and available-times endpoints require a `kind` parameter and return a 400 for a missing or unknown kind. They resolve the duration server-side from Visit Durations, never from the client.
10. **Booking form follows the chosen kind.** Fecha and Hora stay disabled until Visit Type and its sub-type are chosen. The form then fetches dates and times for that kind, and changing the kind clears date and time and refetches. Update the booking page tests: dates are fetched with the kind, and a kind change resets date and time. Update the snapshot and regenerate the booking-form e2e screenshots.

### Part C — Admin editing

11. **Collisions respect kind and duration.** "Fits the schedule" now means the Appointment's whole interval, from start to start plus its copied duration, lies inside one range that accepts its kind. Tests: removing a kind from a range collides with a Scheduled Appointment of that kind; shortening a range so a 40-minute Appointment would overrun collides; Past and Cancelled Appointments never collide.
12. **Per-range Visit Kind checkboxes in the Horarios editor.** Each range shows the grouped checkboxes with "all of Consulta / all of Práctica" toggles, and collapses to "Todas" when every kind is ticked. A range needs at least one kind to be saved. Time inputs step by 10 minutes. The existing collision dialog appears when tags are narrowed under booked Appointments. Editor tests and the snapshot.
13. **Durations table on the Horarios page.** A small table above the weekly schedule has one row per Visit Kind and a duration picker (10–120, step 10). It saves through a server action that runs the sanitizer, with a success toast. Changing a duration never creates collisions, because existing Appointments keep their copied duration. Say so in a hint. Editor tests and the snapshot.
14. **Show end times in the admin.** The appointments list and the calendar day view show "HH:MM–HH:MM" using each Appointment's copied duration. Tests and snapshots.

### Part D — Docs

15. **Domain docs and ADR.**
   - CONTEXT.md gains **Visit Kind** and **Visit Duration**. It redefines **Time Slot** as a bookable start time for a Visit Kind on a 10-minute grid, rather than a fixed 20-minute interval. **Work Schedule** now says ranges accept specific Visit Kinds, and **Booking Window** is per kind.
   - A new ADR records the 10-minute grid, every-10-minutes start times, the one-range rule, the shared agenda across kinds, and copying the duration at booking.

## Decision Document

- **Visit Kind:** the five combinations of Visit Type and sub-type, the unit of availability and duration. The Spanish label is "<Tipo de visita> · <sub-type>". Derived from an Appointment or Booking Form, never stored separately.
- **One schedule, tagged ranges:** each range in the single Work Schedule lists its accepted Visit Kinds. A missing list means all kinds (legacy-safe), and an edited range must accept at least one. No per-date overrides; Unavailable Days stay whole-day blocks for every kind.
- **Visit Durations:** one value per Visit Kind, a multiple of 10 between 10 and 120 minutes, defaulting to 20. A separate settings record with its own repository (in-memory and Mongo), edited on the Horarios page.
- **Grid and start times:** availability works on a 10-minute grid. A start is offered when the whole interval fits inside a single accepting range and overlaps no Scheduled Appointment's interval. Touching ranges never combine. Legacy off-grid ranges step from their own start; new edits must use 10-minute boundaries.
- **Shared agenda:** one Professional, so any Scheduled Appointment blocks its interval for every kind.
- **Copied at booking:** Appointments gain an optional `durationMinutes`, copied from Visit Durations; missing means 20. Duration edits never move or collide with existing Appointments.
- **API contracts:** the public availability endpoints take a required `kind` (Visit Kind identifier), answer 400 when it's missing or unknown, and look up the duration server-side. Booking's 422 rejection set is unchanged; a time that's invalid for the chosen kind is reported as `SlotTaken`, or `OutsideBookingWindow` when the whole day is closed for that kind.
- **Collisions:** an Appointment fits a proposed schedule when its whole interval lies inside one range that accepts its kind. Narrowing kinds or shortening ranges under booked Appointments goes through the existing cancel-first dialog.
- **Behavior change to communicate:** start times move from :00/:20/:40 to every 10 minutes even before any duration is edited. With all durations at 20, a Patient may now book 09:10. That's intended, because it follows from the 10-minute grid.
- **WhatsApp and email:** unchanged. "Hora" stays the start time.

## Testing Decisions

- Good tests exercise **external behavior through public interfaces**: the times and dates Availability returns for a kind, what `book()` stores and refuses, what the repositories return (including legacy documents), which Appointments collide, and what editors and the booking form render and submit. They don't test the slot-expansion internals.
- **Visit Kind, range tags, the grid rule, the Visit Durations sanitizer:** pure unit tests. Prior art: the existing work-schedule and deposit sanitizer tests.
- **Availability:** extensive unit tests over kinds, durations, range ends, overlaps and legacy ranges. Prior art: the existing availability tests.
- **Repositories** (Visit Durations, booked intervals): in-memory adapter tests, including legacy documents. Prior art: the existing repository tests in availability and deposit.
- **Booking:** copying the duration, and kind-aware classification through the injected dependencies. Prior art: the existing booking tests.
- **Collisions and the schedule update flow.** Prior art: the existing collision and update-work-schedule tests.
- **Horarios editor and booking form:** React Testing Library plus snapshots. Prior art: the schedule editor tests and the booking page tests, including the full-submission style. Regenerate the booking-form e2e screenshots.

## Out of Scope

- Per-date availability overrides (beyond whole-day Unavailable Days).
- Appointments spanning two touching ranges.
- Buffers or breaks between Appointments.
- Durations or availability that depend on coverage.
- Changing the Notification templates, which still show only the start time.
- Rescheduling existing Appointments when durations change.

## Further Notes

- Part A is behavior-neutral and can merge alone. Part B changes what Patients see (the 10-minute starts) and should ship together with Part C, so the Professional can actually configure kinds and durations.
- The Mongo adapters read missing tags and durations as defaults, so production data needs no migration.
- The pre-existing flaky `schedule-editor` test (a 5s timeout under full-suite load, reproducible on `main`) lives in the editor this plan changes. Commit 12 is a good moment to look at it.
