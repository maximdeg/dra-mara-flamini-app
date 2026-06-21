# PRD: Maraflamini Frontend — designed UI over the existing app

Status: ready-for-agent

## Problem Statement

The Maraflamini appointment-booking app is **functionally complete but visually
undesigned**. Every screen — the public booking flow (home, `agendar-visita`,
`cita/[id]`) and the entire `/admin` dashboard (appointments, calendar, profile,
schedule, unavailable-days, coverage, sign-in) — renders as raw, unstyled HTML
controls (`<select>`, `<input>`, `<button>`) with a few inline styles.
[app/layout.tsx](../../app/layout.tsx) is a bare `<body>`; there is no global
stylesheet, no design tokens, no shared components, and no styling dependency in
[package.json](../../package.json).

For a single-provider dermatology practice, this reads as untrustworthy: a Patient
landing on the booking form sees a 1995-era page, and the Professional manages the
practice through an equally bare dashboard. The plumbing works; it just doesn't
look like a real product.

## Solution

Lay a **cohesive visual design** over the existing, working application — both the
public booking site and the `/admin` dashboard — using **plain CSS Modules** and a
single design-tokens layer. The brand palette is copied verbatim from the
[frontend-prototype](../../frontend-prototype/) (a warm blush/rose, soft-clinical
system).

This is a **presentation-only** build. No domain logic, route handlers, server
actions, `lib/` modules, or data contracts change. All booking, availability,
cancellation, and admin wiring stays exactly as-is; existing behavior (and the
existing test suite) must remain intact. The work is: introduce a tokens layer,
build a small set of reusable styled primitives, add public and admin app shells,
and restyle each existing page on top of them.

The architecture is a thin presentation stack:

- **Design tokens layer** — one global stylesheet exposing the palette, typography,
  spacing, radii, and shadows as CSS custom properties. The single source of truth
  every component reads; a small, stable interface (CSS variables) hiding all
  palette and scale decisions.
- **Shared UI primitives** — hand-built React components wrapping native elements,
  each with its own `.module.css`, replacing the prototype's shadcn/Radix parts.
- **App shells** — a public layout and an `/admin` shell.
- **Page restyling** — apply primitives + shells to each existing page, changing
  markup/structure for layout but never behavior.

## User Stories

### Patient — public booking site

1. As a Patient, I want the booking site to look like a professional, trustworthy
   medical practice, so that I feel confident booking online.
2. As a Patient, I want a clear, attractive home page that introduces the practice
   and routes me to booking, so that I know where to start.
3. As a Patient, I want the booking form organized into legible sections
   (identification, Visit Type and its sub-type, coverage, Deposit, date/time), so
   that the conditional fields never feel confusing.
4. As a Patient, I want inputs, selects, and buttons with consistent styling, clear
   focus states, and disabled states, so that the form is easy and obvious to use.
5. As a Patient, I want Booking Rejections and validation errors shown as visible,
   styled alerts in Spanish, so that I understand what to fix.
6. As a Patient, I want the Deposit acknowledgment presented prominently (amount +
   checkbox), so that I notice and understand the upfront commitment.
7. As a Patient, I want the Appointment confirmation/details page to present my
   Appointment clearly with a Status indicator, so that I can keep it as a record.
8. As a Patient, I want the cancel action and the Cancellation Window (24-hour) rule
   communicated clearly via button state and explanation, so that I understand
   whether I can self-cancel.
9. As a Patient on a phone, I want the entire booking flow to be responsive, so that
   I can book comfortably from mobile.
10. As a Patient, I want light, brand-consistent entrance/transition polish
    (mirroring the prototype's reveal animations), so that the site feels modern.

### Professional — admin dashboard

11. As the Professional, I want a styled sign-in page consistent with the brand, so
    that the dashboard feels like part of the same product.
12. As the Professional, I want a consistent dashboard shell with clear navigation
    between Appointments, Calendar, Profile, Work Schedule, Unavailable Days, and
    Coverage, so that I can move between management tasks easily.
13. As the Professional, I want the Appointments list as a readable table with
    Status badges (Scheduled / Cancelled / Completed) and the existing filters, so
    that I can scan my day.
14. As the Professional, I want the calendar view styled to show Appointments per
    day at a glance, so that I can see my workload.
15. As the Professional, I want the Work Schedule, Unavailable Days, Health Insurance,
    and Self-Pay/Deposit editors presented as clear forms and cards, so that managing
    them is straightforward.
16. As the Professional, I want destructive actions (cancel an Appointment, the
    collision-driven cancellations when reducing availability, delete an insurer or
    Unavailable Day) to use clear confirmation dialogs, so that I never act by
    accident.
17. As the Professional, I want success and error feedback shown as toasts/alerts, so
    that I know whether my changes were saved.
18. As the Professional, I want the dashboard usable on a tablet, so that I can manage
    the practice from different devices.

### Cross-cutting

19. As either user, I want consistent typography, spacing, and the warm blush/rose
    brand palette across every page, so that the product feels coherent.
20. As either user, I want accessible components — labels tied to inputs,
    keyboard-operable dialogs and tabs, visible focus, sufficient color contrast — so
    that the site is usable for everyone.
21. As a developer, I want a single design-tokens layer and a set of reusable styled
    primitives, so that future pages stay visually consistent without re-implementing
    styles.
22. As a developer, I want the restyle to touch presentation only — no domain logic,
    server actions, or API contracts — so that existing behavior and tests remain
    intact.

## Implementation Decisions

### Styling approach

- **Plain CSS Modules** (`*.module.css`) for component styles, plus **one global
  stylesheet** for tokens and base/reset styles, imported once in the root layout.
  **No CSS framework and no shadcn/Radix** — this deliberately diverges from the
  prototype's Tailwind-CDN + shadcn approach. The prototype is a **visual reference
  only** (palette, screen structure, interactions), not a code source.
- Keep the prototype's **system font stack** (`-apple-system, BlinkMacSystemFont,
  'Segoe UI', Roboto, Helvetica, Arial, sans-serif`) as the default to avoid layout
  shift. Adopting a web font is an open question, not required.
- **Presentation-only constraint:** do not modify route handlers under `app/api/`,
  server actions, `lib/` domain modules, Auth.js config, or any data contract. Page
  components may be restructured for layout, but their data flow, state, fetch calls,
  Spanish copy, and the Rejection-message mapping must be preserved.

### Design tokens (copied verbatim from the prototype)

Expose as CSS custom properties on `:root`:

- `--brand: #ba8c84` — muted mauve-rose, primary brand.
- `--brand-dark: #9e7162` — deeper terracotta, primary actions and emphasis.
- `--brand-soft: #f7e8e4` — light blush, soft card/section backgrounds.
- Page gradient: `linear-gradient(to bottom right, #fff3f0, #e8d4cd)` (the
  prototype's `.gradient-background`).
- Neutrals: white surfaces, `#d1d5db` (gray-300) borders, text `#111827`/`#4b5563`/
  `#6b7280` (gray-900/600/500).
- Semantic: error `#dc2626`, success `#16a34a`, info `#4b5563`.
- Plus a small typography scale, spacing scale, border-radius, and shadow tokens
  (implementer's choice of values, defined once and reused).

Source of these values:
[frontend-prototype/css/styles.css](../../frontend-prototype/css/styles.css) and the
`brand`/`brand-dark`/`brand-soft` theme tokens declared in the prototype HTML files.

### Shared UI primitives

Each is a React component wrapping native elements with a `.module.css`, with a
small, stable prop interface. They replace the shadcn parts noted in
[frontend-prototype/HANDOFF.md](../../frontend-prototype/HANDOFF.md):

- **Button** — variants (`primary` = `--brand-dark`, `secondary`, `destructive`,
  `ghost`); supports `disabled` and a loading/busy state.
- **Field** — label + control wrapper that associates `<label>` with its input/select
  via `htmlFor`/`id`, renders helper and error text. Wraps native `<input>` and
  `<select>` (replaces shadcn `Select`; native `<input type="date">`/`<select>`
  remain the controls, matching the prototype's mapping).
- **Card** — surface container for sections/forms.
- **StatusBadge** — maps an Appointment **Status** (`Scheduled` | `Cancelled` |
  `Completed`) to a colored badge. Status is the **derived** value (Completed is
  computed, never stored) per [CONTEXT.md](../../CONTEXT.md).
- **Dialog** — accessible modal for confirmations (focus trap, Escape to close,
  backdrop), replacing the prototype's `AlertDialog`/custom modal.
- **Toast** — a toast provider + `toast.success/error/info` API, replacing the
  prototype's `js/toast.js` and `sonner`.
- **Tabs** — keyboard-operable tabs with `aria-selected`, for surfaces that group
  content.
- **Table** — styled table for the Appointments list.

### App shells

- **Public layout** — applies the font, the gradient background, and a simple header;
  wraps the home, `agendar-visita`, and `cita/[id]` pages.
- **Admin shell** — a persistent navigation surface linking the dashboard sections
  (Appointments, Calendar, Profile, Work Schedule, Unavailable Days, Coverage) and a
  sign-out affordance; wraps all `/admin/*` pages. "Admin"/"dashboard" is a UI
  surface, not a separate role (CONTEXT.md).

### Pages to restyle (existing routes, unchanged behavior)

- Public: `/` (home), `/agendar-visita` (booking form with its conditional Visit
  Type / sub-type / coverage / Deposit fields), `/cita/[id]` (confirmation +
  patient cancel).
- Admin: `/admin/sign-in`, `/admin` (overview), `/admin/appointments`,
  `/admin/calendar`, `/admin/profile`, `/admin/schedule`,
  `/admin/unavailable-days`, `/admin/coverage`.

### Responsiveness & accessibility

- Public flow is **mobile-first**; admin is usable from **tablet width up**.
- All interactive primitives keyboard-operable; labels tied to controls; visible
  focus rings; color contrast meets WCAG AA against the chosen tokens.

## Testing Decisions

- **Test external behavior, never styling.** Do not assert on CSS class names or
  inline styles — those are implementation details that churn with the design.
- **Add the component-test toolchain:** `@testing-library/react`,
  `@testing-library/jest-dom`, and a `jsdom` environment for Vitest (the repo already
  uses Vitest). Establish this setup as the reference pattern for future UI tests.
- **Behavior tests for the shared primitives** (their observable contract):
  - *StatusBadge*: renders the correct label/variant for each derived Status
    (Scheduled / Cancelled / Completed).
  - *Dialog*: opens, closes on Escape and backdrop, traps focus, returns focus on
    close.
  - *Field*: the rendered label is associated with its control; error/helper text is
    exposed to assistive tech.
  - *Tabs*: selecting a tab updates `aria-selected` and the visible panel; arrow-key
    navigation works.
  - *Toast*: `toast.success/error/info` shows a message and it dismisses.
- **Snapshot tests:** serialized-DOM snapshots (`toMatchSnapshot`) for the shared
  primitives and key pages (home, the booking form in representative states,
  confirmation, the admin appointments table and calendar), to catch unintended
  structural regressions. Accept early churn while the design stabilizes — gate these
  behind the point where each screen's structure settles (a later sub-issue may own
  them) so snapshots don't thrash during active design.
- **Visual-regression tests:** add Playwright `toHaveScreenshot` coverage for the
  same key pages, to catch pixel-level regressions the DOM snapshots can't. This is
  the heaviest piece and is best scoped as its own sub-issue once the visual design is
  agreed.
- **Keep the existing suite green.** Because this is presentation-only, every current
  Vitest test must still pass unchanged; a failing pre-existing test signals the
  restyle leaked into behavior.

## Out of Scope

- **Any change to domain logic or contracts** — the Booking, Availability,
  Appointment Status, and Cancellation modules, all `app/api/` route handlers, server
  actions, Auth.js config, and request/response shapes stay exactly as they are.
- **New features or new screens** — this restyles the existing routes only; it adds
  no booking capability, no admin capability, and no new pages.
- **The real Baileys WhatsApp worker / Notification backend** — unrelated to the UI;
  out per ADR-0001 and the existing build's scope.
- **Internationalization / locale switching** — UI copy stays Spanish with canonical
  English terms in code; no i18n framework.
- **Dark mode** — not built unless it falls out for free from the token layer.
- **A separately published design-system package** — primitives live in-repo
  alongside the app.
- **Adopting Tailwind or shadcn** — explicitly rejected in favor of plain CSS Modules
  (the prototype's stack is reference-only).

## Further Notes

- [frontend-prototype/](../../frontend-prototype/) is the **visual and interaction
  reference**: screen structure, the booking form's conditional fields, status-driven
  confirmation page, reveal animations, and toasts. It is a shadcn/Tailwind/CDN
  mockup — map its components to our plain-CSS primitives using the table in
  [frontend-prototype/HANDOFF.md](../../frontend-prototype/HANDOFF.md). Do not copy
  its Tailwind classes; copy only the palette and structure.
- Use the domain vocabulary from [CONTEXT.md](../../CONTEXT.md) in any visible copy
  (Patient, Professional, Appointment, Visit Type, Consultation, Practice, Consult
  Type, Practice Type, Status, Health Insurance, Self-Pay, Deposit, Work Schedule,
  Time Slot, Booking Window, Unavailable Day, Cancellation Window, Notification,
  Confirmation, Cancellation Notice). Avoid the forbidden synonyms.
- Display nuance to preserve: the UI shows "Práctica" (accented) while logic stores
  `Practica` (no accent) — a restyle must not "fix" one into the other.
- ADRs are not expected to be affected (this is presentation-only), but honor
  [ADR-0001](../../docs/adr/0001-whatsapp-notifications-via-baileys.md) and
  [ADR-0002](../../docs/adr/0002-single-appointments-table-no-patient-entity.md) if
  any copy or layout implies otherwise.
- **Open question:** keep the system font stack (default) or adopt a web font for the
  brand. Defaulting to the system stack unless decided otherwise.
- **Risk:** snapshot/visual tests churn heavily during early design iteration —
  sequence them after each screen's structure is agreed rather than writing them up
  front.
