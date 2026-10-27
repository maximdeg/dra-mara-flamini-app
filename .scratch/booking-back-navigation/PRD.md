Status: ready-for-agent

# Back navigation on the booking page (Agendar una visita)

## Problem Statement

A Patient on the booking page (`/agendar-visita`) has no visible way back to the home page except the site header logo or the browser's own back button. Patients who change their mind, or who arrived to check something first (an Aesthetic Treatment, the coverage list), have to guess how to leave. Patients who opened the page directly, from a WhatsApp link or a bookmark, have no history to go back to at all.

## Solution

Two "Volver" controls on the booking page, both going to the home page (`/`):

1. **Top:** a small "← Volver" text link with a left arrow, above the page title "Agendar una visita".
2. **Bottom:** a secondary-style "← Volver" button in the same row as the "Agendar" submit button, to its left. On phones the two stack full-width, with "Agendar" on top and "Volver" below it.

Leaving does not ask for confirmation, even when the form is partly filled.

## Commits

1. **Add a left-arrow icon.** Add an `ArrowLeftIcon` to the shared icon set, the mirror image of the existing right arrow, with the same size and stroke conventions. If the icon test file covers each icon, extend it. Nothing uses it yet, so the app is unchanged.

2. **Top "Volver" link.** Above the page title, inside the page intro, render a link to `/` showing the left arrow and the text "Volver". Style it as a quiet text link (muted colour, brand colour on hover and focus, visible focus ring) with enough padding for a comfortable tap target. Add a unit test that the page renders a "Volver" link pointing to `/` before the heading. Update the page's structure snapshot.

3. **Bottom "Volver" button next to Agendar.** Wrap the two buttons in a new row inside the form's actions area. The error Alert stays above that row, unchanged. Render "Volver" as the shared Button in its secondary variant, as a link to `/` with the left arrow. Being a link, it can never submit the form. "Agendar" stays exactly as it is (busy state, disabled until the form is complete, submit behaviour). Desktop: one row, Volver on the left, Agendar on the right, both their natural width, aligned to the start like Agendar is today. At the existing ≤520px breakpoint: stack both full-width with Agendar visually first. Add a unit test that there are two "Volver" links to `/`, and that the bottom one is not a submit control and stays enabled while Agendar is disabled. Update the structure snapshot.

4. **Refresh the visual regression baselines.** Re-generate the booking form screenshots (desktop and mobile: initial, and the Deposit-shown state) and review them by eye: top link above the title, desktop row order, mobile stacking order. Commit only the updated booking-page images.

Every commit leaves the page working; commit 1 is invisible, and commits 2 and 3 can each ship on their own.

## Decision Document

- **Destination is always the home page**, not browser history. It's predictable and works when there is no history (direct links from WhatsApp, bookmarks). Patients coming from their appointment page via "Agendar otra cita" also land on home, which is acceptable.
- **Label is "Volver"** in both places, matching the wording used across the app ("Volver", "Volver al inicio").
- **Top control is an arrow plus text**, not icon-only, for clarity and a bigger tap target.
- **Bottom control uses the existing secondary Button rendered as a link**, the same pattern as "Volver al inicio" on the appointment page. No new button variant.
- **No confirmation on leaving** with a partly filled form.
- **Order in the page source is Volver then Agendar**, matching the desktop left-to-right reading and tab order. On phones the visual order is reversed so the primary action stays on top. Keyboard order then differs from visual order on phones only, which is acceptable for a two-button row.
- **The error Alert stays above the buttons** and is not moved into the new row.
- **The page stays a client component** and nothing in its booking logic, state or API calls changes. Changes are limited to the page markup, its stylesheet and the shared icon set.

## Testing Decisions

- Good tests here check what the Patient sees and can do (links by accessible name and destination, which controls submit or are disabled), not class names or markup details.
- **Booking page unit tests** (React Testing Library, already in place for this page): add cases for both "Volver" links pointing to `/`, the bottom one not being a submit control, and it staying enabled while "Agendar" is disabled. The existing structure snapshot is updated intentionally in commits 2 and 3.
- **Icon test:** extend it for the new arrow only if it already checks each icon.
- **Visual regression** (Playwright, desktop and mobile projects): the existing booking-form screenshots cover the new layout. Baselines are regenerated and reviewed in commit 4. No new screenshot tests are needed.
- Prior art: the appointment page's actions component (secondary "Volver al inicio" link-button) and its tests.

## Out of Scope

- Back navigation on any other page (appointment page, legal pages, admin).
- Changing the public site header.
- Browser-history-based back behaviour.
- A "you will lose your data" confirmation.
- Saving partly filled form data between visits.
- Any change to booking logic, validation or the "Agendar" button's behaviour.

## Further Notes

- The new left arrow should mirror the existing right arrow exactly so the two read as a pair across the site.
