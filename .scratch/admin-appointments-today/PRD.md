# Appointments tab opens on today

Status: ready-for-agent

## Problem Statement

When the Professional opens the Turnos (Appointments) tab in the admin panel, it lists **every Appointment ever booked**: past, future, and cancelled. The question they open it to answer is almost always "who's coming today?", and the answer is buried in a long table. Narrowing it to today means typing today's date into both Desde and Hasta every time.

## Solution

A fresh visit to the Turnos tab shows **only today's Appointments** (Argentina calendar), in every status. Desde and Hasta are pre-filled with today's date, so the active filter is visible and easy to change. Once the Professional submits the filter form, the tab shows exactly what the form says. Clearing both dates and pressing Filtrar shows all Appointments, as it does today.

Two shortcut links sit next to Filtrar:
- **Hoy** goes back to today's list.
- **Ver todos** shows every Appointment with no filters.

How the page tells a fresh visit from a submitted form: a fresh visit has **no filter keys at all** in the URL. Submitting the form always sends all four keys (`status`, `visitType`, `from`, `to`), even when they're empty. So "no keys" means default to today, and "keys present" means use them as given, with empty meaning "no limit".

## Commits

Each commit leaves the app building, type-checking, and green on `npm test`.

1. **Add a "today in Argentina" date helper.** Add a pure function to the Argentina datetime module that returns today's `YYYY-MM-DD` on the Argentine calendar. Rewrite "tomorrow in Argentina" on top of it. Tests cover the hours after UTC midnight, when the UTC date is already tomorrow but Argentina is still on today. The existing "tomorrow" tests must keep passing.

2. **Refactor: move the filter reading out of the page.** Move the page's "search params → AppointmentFilter" logic, unchanged, into a pure function in the appointments listing area. It handles the single/array/empty value handling and the Status / Visit Type validation. The page calls it. Behavior stays the same. Add tests for today's rules: empty values are ignored, and unknown status or visit type values are dropped.

3. **Default to today on a fresh visit.** Give the filter-reading function a "today" argument. When none of the four filter keys is in the URL, it returns a filter with from = to = today and no status or visit-type limit. When any key is present, it reads them exactly as before. The page passes today in Argentina. Desde/Hasta already show the filter's dates, so they're pre-filled with today with no extra work. Tests: no keys → today; keys present but all empty → no limits (all Appointments); a key present with a value → used as given; only some keys present → still treated as a submitted filter.

4. **Add the Hoy and Ver todos shortcuts.** Next to Filtrar, add two links styled as secondary buttons. **Hoy** points at the tab with no query string, which is the fresh-visit default. **Ver todos** points at the tab with all four keys present and empty, so the "keys present" rule shows everything. Building these links through the same key names the form uses keeps the two in sync. If the page has to be rendered to test the links, test their targets instead.

5. **Refresh the admin visual baseline.** The new links change the Turnos screenshot. The visual test already opens the tab with an explicit date range, so the default doesn't affect it. Regenerate only the `admin-appointments` baseline, in its own commit, as earlier UI changes did.

## Decision Document

- **Default rule:** the default applies only when the URL carries none of the keys `status`, `visitType`, `from`, `to`. Any one of them present means the form was used, and its values are honored as-is.
- **"Today"** is the Argentine calendar date (America/Argentina/Buenos_Aires), never the server's local or UTC date. Vercel runs in UTC, and between 21:00 and midnight in Argentina the UTC date is already tomorrow.
- **Default contents:** all statuses (Scheduled, Completed, Cancelled) and all Visit Types for today. Equivalent to choosing "Todos" in both selects with Desde = Hasta = today.
- **Visible default:** Desde and Hasta are pre-filled with today because the form already renders the active filter's dates. There's no extra banner.
- **Cleared dates** after a submit mean "no date limit", so all Appointments show. This matches current behavior.
- **Shortcuts:** "Hoy" = the bare tab URL. "Ver todos" = the tab URL with all four keys present and empty.
- **No changes** to the listing module's filtering, the repository, or derived Status. Only how the page turns the URL into a filter changes.
- **Links into the tab** (the admin nav and the Panel home card) point at the bare URL, so they get the today default without being changed.

## Testing Decisions

- Test external behavior: given URL search params and a "today", which filter comes out. Don't test how the page renders internals.
- Modules under test:
  - The "today in Argentina" helper (fixed instants, never the real clock).
  - The filter-reading function: no-keys default, empty-keys = no limits, explicit values honored, invalid status and visit type values dropped, array values take the first item.
- Prior art: `lib/datetime/argentina.test.ts` (time zone edge cases), `lib/appointments/appointment-listing.test.ts` (filter semantics), `e2e/admin.spec.ts` (the visual baseline, pinned to a fixed date window).
- The page component itself stays untested, as now. All of its logic lives in the pure function.
- The admin visual test keeps opening the tab with an explicit empty past window. Only its screenshot changes, because of the new links.

## Out of Scope

- The Calendar tab and the Panel home page.
- Remembering the Professional's last filter between visits (cookie or local storage).
- New filters (patient name or phone search), sorting, or pagination.
- "Next N days" or "this week" shortcuts.
- Changing what an empty date field means after a submit.

## Further Notes

- Bookmarks or links that already carry filter keys keep working exactly as before.
- After midnight Argentina time, a page that's still open keeps showing yesterday's dates until it's reloaded or Hoy is pressed. That's acceptable.
