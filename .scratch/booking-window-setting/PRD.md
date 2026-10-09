# Refactor plan: Professional-configurable Booking Window length

Status: ready-for-agent

## Problem Statement

The Booking Window is fixed in code: Patients can book from tomorrow up to 30 days ahead. The Professional can't change that. Some periods call for a longer horizon, for example opening agenda three months out so Patients can book follow-ups well ahead. Other periods call for a shorter one. Every change today needs a code change and a deploy.

The 30-day limit is a constant used in two places, and the two must agree:

- the list of open dates the booking form offers for a Visit Kind
- the server-side guard that rejects a booking with "OutsideBookingWindow"

A longer window also exposes a cost the 30-day limit hid. Building the list of open dates reads the Scheduled Appointments one day at a time, so a 180-day window would mean about 180 database round trips every time a Patient picks a Visit Kind.

## Solution

- Add a **Booking Window length** setting. It is one global value for every Visit Kind, measured in days, and the Professional picks it from a fixed list of presets: 14, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180.
- The default is 30. Until the Professional saves a value, behavior is the same as today.
- The Professional edits it on the Horarios page (/admin/schedule) in a new card next to "Duración de cada tipo de visita". The card has its own save button.
- Both the open-dates list and the booking guard read the setting through the existing Availability dependencies, so they cannot disagree.
- Shrinking the window never touches existing Appointments. It only limits new bookings, the same way Visit Duration edits work. There are no collisions and no cancel prompts.
- The scheduled-interval read for the open-dates list becomes one query over the whole date range instead of one query per day.

## Commits

1. **Introduce the Booking Window length domain module (no behavior change).** Create a small settings module next to Visit Durations. It exports:
   - the list of allowed day counts (14, then 30 to 180 in steps of 15)
   - the default (30)
   - a Spanish label for each option
   - a sanitizer that turns untrusted input into a valid length, falling back to the default for anything off the list

   Add unit tests for the options, the default, the labels, and the sanitizer, modeled on the Visit Durations tests. Nothing uses the module yet.

2. **Add the Booking Window length repository seam.** Add:
   - a repository interface with `get` and `save`
   - an in-memory adapter for tests and dev
   - a Mongo adapter: a singleton settings document in its own collection, read through the sanitizer, returning the default when missing
   - a production factory

   Add an in-memory repository test (returns the default until saved, then returns what was saved). Nothing reads it yet.

3. **Make Availability take the window length as a dependency, defaulting to 30.** Add an optional booking-window-days field to the Availability dependencies. When it is absent, both the open-dates list and the date/time classifier use the default (30). Replace the hardcoded constant in both functions with the dependency.

   Existing tests keep passing unchanged. Add tests that pass a different length (e.g. 90) and check that:
   - the open-dates list reaches day 90 and stops there
   - the classifier accepts day 90 and rejects day 91
   - a shorter length (14) rejects day 15

4. **Wire the persisted setting into production Availability.** Read the repository in the Availability composition root in parallel with the other reads, and pass the value through. Booking already builds on these dependencies, so the booking guard follows automatically. Behavior in production is unchanged because the stored value defaults to 30.

5. **Retire the exported constant.** Remove the `BOOKING_WINDOW_DAYS` export (or alias it to the new default) and update the test that asserts it equals 30 to assert the default instead. Update the doc comments on the open-dates list and the classifier: they should no longer say "30 days" and should instead refer to the configured length.

6. **Add the server action to save the length.** Add a server action on the schedule page that:
   - requires the Professional
   - sanitizes the input
   - saves it
   - revalidates the Horarios page and the booking page

   It never collides, so it returns `{ saved: true }` or `{ error }` like the durations action.

7. **Add the admin editor card.** Add a client component titled "Ventana de reservas" (or similar) on the Horarios page, rendered between the intro and the durations card, with:
   - a short hint explaining that Patients can book from tomorrow up to the chosen length, and that existing appointments are not affected
   - one select with the preset labels
   - a save button with a pending state and success or error toasts

   The page reads the current value in parallel with its existing reads. Add a component test and snapshot modeled on the durations editor test.

8. **Add a range read for scheduled intervals at the repository seam.** Add a method to the Appointment repository that returns the intervals Scheduled Appointments occupy across an inclusive date range, grouped by date. Implement it:
   - in the in-memory adapter
   - in the Mongo adapter, as one query filtered on a date range and status "scheduled", projecting date, time, and duration

   Cover it with tests against the in-memory adapter. Nothing calls it yet.

9. **Use the range read when building the open-dates list.** Add an optional range reader to the Availability dependencies. When it is present, the open-dates list fetches the whole window's intervals once and hands each day's intervals to the per-day time-slot computation. When it is absent, the list falls back to the per-day reader, so existing tests and the single-date endpoint are unaffected. Wire the range reader in the production composition root.

   Add a test that the open-dates list produces the same result through either path, and one that checks the range reader is called once, not once per day.

10. **Update the domain docs.** In CONTEXT.md, rewrite the Booking Window entry: from tomorrow up to a Professional-set number of days ahead (30 by default, 14 to 180), set on the Horarios page, and changing it never affects existing Appointments. Add the UI term for the setting. Optionally add a short ADR recording two decisions: fixed day counts instead of calendar months, and no collision handling when the window shrinks.

11. **Refresh visual snapshots if affected.** If the Horarios page is covered by Playwright visual regression, update the admin snapshots after the new card lands.

Commits 1 to 5 are a pure refactor: behavior is identical with the default of 30. Commits 6 and 7 deliver the feature. Commits 8 and 9 are the performance change and can ship independently. Commit 10 can be folded into 7.

## Decision Document

- **One global setting, not per Visit Kind.** A single number of days applies to every kind.
- **Unit is days, from presets.** Allowed values: 14, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180. A "month" is a fixed 30-day count, not a calendar month, so the existing day arithmetic is all that's needed.
- **Default is 30 days.** It applies when nothing is stored, and it is the fallback for any stored or submitted value that isn't on the list. Deploying changes nothing until the Professional edits it.
- **Admin labels use approximate weeks and months:** 14 → "2 semanas", 30 → "1 mes", 45 → "1 ½ meses", 60 → "2 meses", 75 → "2 ½ meses", 90 → "3 meses", 105 → "3 ½ meses", 120 → "4 meses", 135 → "4 ½ meses", 150 → "5 meses", 165 → "5 ½ meses", 180 → "6 meses".
- **The window still opens tomorrow.** Same-day booking stays disallowed. Only the far end becomes configurable. The window is inclusive: with N days, today + N is bookable and today + N + 1 is not.
- **Shrinking keeps existing Appointments.** The window limits new bookings only. There is no collision check, unlike Work Schedule reductions and Unavailable Days, and there are no Cancellation Notices.
- **Persistence:** a new singleton settings document in its own collection, following the Visit Durations pattern (a fixed key, upsert on save, read through the sanitizer). There is no migration, because a missing document means the default.
- **Availability interface:** the dependencies gain an optional window length and an optional range reader for scheduled intervals. Both are optional, so callers and tests that don't care are unaffected. The open-dates list and the classifier both read the same length from the same dependency object, so they can't drift apart.
- **Appointment repository interface:** gains one range-read method. The per-day method stays, because the time-slot endpoint for a single date and the classifier still use it.
- **Booking:** no interface change. It already classifies dates through Availability, which now carries the configured length. The rejection stays "OutsideBookingWindow".
- **Admin UI:** a new card on the Horarios page with its own save button, next to the durations card. The server action requires the Professional and revalidates the Horarios and booking pages.
- **Public API:** the open-dates endpoint response is unchanged (a list of dates). It just returns more dates when the window is longer.

## Testing Decisions

- Good tests check external behavior through the module's interface: which dates the open-dates list returns, what the classifier answers for a given date, what the repository returns after a save, and what the editor submits. They shouldn't check internals such as loop structure or how intervals are grouped. Fake persistence by swapping in the in-memory adapters at the repository seam. Don't mock past it.
- **Booking Window length module:** unit tests for the option list, the default, the labels, and the sanitizer (valid values pass, and off-list, non-numeric, or missing values become 30). Prior art: the Visit Durations tests.
- **Repository:** in-memory adapter tests for "default until saved" and "returns saved value". Prior art: the Visit Durations repository test.
- **Availability:** extend the existing open-dates-list and classifier tests with an injected length, covering the inclusive upper bound and a short window. Add a test that the range-read path gives the same result as the per-day path, and one that it reads once. Prior art: the existing availability tests, which already inject a clock and fake dependencies.
- **Appointment repository range read:** in-memory adapter tests checking that only Scheduled appointments within the inclusive range are returned, grouped by date, and with the default duration when one is missing. Prior art: the existing repository and cancellation tests that read scheduled intervals.
- **Open-dates API route:** the existing route test should keep passing. Optionally add one case with a longer injected window.
- **Admin editor:** a component test that it renders the current value, offers every preset label, and calls the save action with the chosen number of days, plus a snapshot. Prior art: the durations editor test.
- **End-to-end:** none required. Refresh existing visual snapshots only if the Horarios page is captured.

## Out of Scope

- A different window per Visit Kind.
- Calendar-month arithmetic, such as "3 months from Oct 9 = Jan 9".
- Configuring the start of the window: same-day booking stays disallowed, and there is no minimum notice in hours.
- Changing the Patient's date picker. It stays a plain list of dates. A calendar-style picker or grouping by month would be a separate frontend issue, since a 180-day window can mean over 100 entries.
- Cancelling or notifying Appointments that fall outside a shrunk window.
- Any change to the Cancellation Window, the two-open-appointments-per-phone limit, or Visit Durations.

## Further Notes

- The single-date time-slot endpoint applies no window check of its own, and that doesn't change. It only computes times for the date it is given. The booking guard is what enforces the window at submit time.
- Commits 8 and 9 (range read) are separate from the setting so the feature can ship without them if needed. They become worthwhile once the window goes beyond about 60 days.
