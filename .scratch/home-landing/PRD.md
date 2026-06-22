# PRD: Home page landing — restyle `/` from the frontend prototype

Status: ready-for-agent

## Problem Statement

The public home page (`/`) is a placeholder: a single centered Card with an eyebrow,
the wordmark "Maraflamini", one line of copy, and an "Agendar una visita" button. It
introduces nothing about the Professional or the practice and gives a Patient no reason
to trust the clinic before booking.

The team already has a finished landing design — `frontend-prototype/index.html` — that the
visual system was originally derived from (frontend-design slice 01 copied its palette into
`app/globals.css` verbatim). But only the tokens were adopted; the actual landing — a hero
with the practice's promise and photo, a services overview, a closing call-to-action, and a
footer — was never built. The prototype itself is throwaway (Tailwind CDN, lucide CDN,
mock data); it can't ship as-is.

We want the real home page to look and feel like that prototype, built properly on the
app's own design system (CSS Modules + design tokens + the shared `Button`/`Card`
primitives), with no new runtime dependencies.

## Solution

Rebuild the public home page as a warm, single-Professional dermatology landing, faithful
to the prototype but implemented in the app's conventions:

- **A restyled shared site header** — a logo mark (monogram), "Mara Flamini" with the
  "Dermatóloga" tagline, and an "Agendar visita" CTA that routes to `/agendar-visita`.
  Because the header is shared, this look also flows through the booking and cita pages.
- **A hero** — a two-column band: the Professional's photo beside the headline "Tu Piel,
  Nuestra Especialidad", a short reassuring paragraph, and a primary "Agendar visita" CTA.
- **A services overview** — three cards (Dermatología General, Dermatología Estética,
  Cirugía Dermatológica), each with an icon, title, and one-line description. Static
  marketing content, not domain data.
- **A closing CTA band** — "¿Listo para Cuidar tu Piel?" with a final "Agendar visita" CTA.
- **A footer** — a simple, clinic-appropriate footer (not the prototype's "MaxTurnos
  prototype" text).
- **Lightweight entrance reveals** — sections fade/slide in on scroll via a small
  IntersectionObserver wrapper, honoring `prefers-reduced-motion` and degrading to
  fully-visible content without JS.

Icons are hand-added as small inline-SVG React components (no icon dependency). Everything
reads the existing design tokens; the prototype's Tailwind utilities are translated to CSS
Modules. This is **presentation-only** — no domain logic, route handlers, server actions,
`lib/` modules, or data contracts change.

## User Stories

### Patient (visitor)

1. As a prospective Patient, I want the home page to clearly present the Professional and the practice, so that I trust who I'm booking with.
2. As a prospective Patient, I want a prominent "Agendar visita" button above the fold, so that I can start booking immediately.
3. As a prospective Patient, I want a second "Agendar visita" button further down the page, so that I can book after reading without scrolling back up.
4. As a prospective Patient, I want every "Agendar visita" CTA to take me to the booking flow (`/agendar-visita`), so that the path to book is obvious and consistent.
5. As a prospective Patient, I want to see the Professional's photo, so that the practice feels personal and real.
6. As a prospective Patient, I want a short, reassuring description of the care offered, so that I feel confident before booking.
7. As a prospective Patient, I want a clear overview of the main services, so that I understand what the practice does.
8. As a prospective Patient, I want the page in Spanish, so that it matches how I speak and the rest of the site.
9. As a Patient on a phone, I want the layout to adapt to a small screen (hero stacking, single-column services), so that it's comfortable to read and tap.
10. As a Patient on a slow connection, I want the photo to load without breaking the layout, so that the page stays usable while it loads.
11. As a returning visitor, I want the header brand to link home, so that I can always get back to the start.
12. As a visitor who finds the photo missing, I want a graceful fallback in its place, so that the hero never looks broken.

### Accessibility & motion

13. As a Patient using a keyboard, I want the CTAs and links to show a visible focus state, so that I can navigate without a mouse.
14. As a Patient using a screen reader, I want proper landmarks (header, main, footer) and a meaningful photo alt, so that the page is navigable and described.
15. As a Patient with reduced-motion preferences, I want entrance animations suppressed, so that motion doesn't bother me.
16. As a Patient with JavaScript disabled, I want all content visible and the page fully usable, so that nothing is hidden behind an animation that never runs.
17. As a Patient, I want sufficient text/background contrast, so that the copy is legible against the warm palette.

### Professional / maintainer

18. As the Professional, I want the home page to reflect my single-provider practice (one dermatologist, my name and tagline), so that it's accurate.
19. As the Professional, I want a discreet way to reach the admin sign-in, so that I can get to my dashboard from the public site. _(Implementation may place this in the footer; optional.)_
20. As a maintainer, I want the landing built on the existing tokens and `Button`/`Card` primitives, so that it stays consistent with the rest of the restyle.
21. As a maintainer, I want no new runtime dependency for icons or animation, so that the app stays dependency-light.
22. As a maintainer, I want the home page to remain server-rendered (only the reveal wrapper is a client component), so that it stays fast and simple.
23. As a maintainer, I want the services content as a typed constant in one place, so that editing the three cards is trivial.
24. As a maintainer, I want the Playwright visual snapshots regenerated for the home page (and the pages the shared header touches), so that the visual-regression suite reflects the new design.

## Implementation Decisions

### Scope & conventions

- **Presentation-only.** No changes to `lib/`, route handlers, server actions, or data
  contracts. The home page stays at `/` (`app/(public)/page.tsx`).
- **CSS Modules + tokens, not Tailwind.** The prototype's Tailwind utilities map onto the
  existing custom properties in `app/globals.css` — the brand gradient on CTAs
  (`--brand → --brand-dark`), `--radius-full` pill buttons, `--brand-soft` section
  backgrounds, soft shadows, and the page gradient (`--gradient-from → --gradient-to`).
  Reuse the shared `Button` (primary variant; `as={Link}` for CTAs) and `Card` primitives.

### Components (all presentational, under the existing UI/layout conventions)

- **Restyled `PublicHeader`** (shared): logo mark (a monogram in a brand-gradient circle),
  "Mara Flamini" + "Dermatóloga" tagline, and an "Agendar visita" `Button` linking to
  `/agendar-visita`. The header is shared, so booking and cita inherit the new look. The
  brand still links to `/`.
- **Hero**: two-column on desktop (photo + copy), stacked on mobile; headline "Tu Piel,
  Nuestra Especialidad" (with "Especialidad" emphasized), reassurance paragraph, primary CTA.
- **Services**: three `Card`s from a typed constant `{ icon, title, description }[]` —
  Dermatología General / Estética / Cirugía Dermatológica (copy from the prototype).
- **CTA band**: "¿Listo para Cuidar tu Piel?" + final CTA.
- **Site footer**: clinic-appropriate footer text (replacing the prototype's "MaxTurnos /
  Prototipo de demostración"); may include a discreet admin sign-in link.

### Icons

- Hand-authored **inline-SVG React components** for the five glyphs the design uses
  (calendar, arrow-right, shield, users, award), driven by `currentColor` and sized via a
  prop. No icon dependency, no client JS.

### Entrance reveals

- A small **client `Reveal` wrapper** using `IntersectionObserver` to add an `is-visible`
  class that drives a CSS transition. It must:
  - render children **visible by default** (SSR / no-JS / no-IntersectionObserver), only
    *enhancing* with motion — content is never hidden behind a reveal;
  - respect `prefers-reduced-motion` (no transform/opacity animation).
- The page stays a server component; only `Reveal` is `"use client"`.

### Hero image

- Use `next/image` against a **committed placeholder asset** under `public/` (the real
  Professional photo can be dropped in later at the same path) with a meaningful Spanish
  `alt` and a graceful fallback treatment if it fails to load.

## Testing Decisions

- **Test external behavior, not markup.** Assert what a visitor experiences, not class
  names or DOM structure. Use the established **Testing-Library + jsdom** toolchain (set up
  in frontend-design slice 01).
- **Home page**: renders the hero headline; renders all three service titles; both
  "Agendar visita" CTAs resolve to `/agendar-visita`; the footer renders. **Header**: brand
  links to `/`; the "Agendar visita" CTA links to `/agendar-visita`.
- **`Reveal`**: renders its children, and they are present/visible without an
  `IntersectionObserver` (jsdom has none) — proving content never hides if the observer
  never runs. This is the one piece with logic worth a focused test.
- **Prior art**: the `Button` behavior tests and the frontend-design component tests
  (e.g. `appointment-details.test.tsx`, `schedule-editor.test.tsx`) and the
  `vitest.setup.ts` jsdom project.
- **Visual regression (Playwright, slice 11)**: the `home` snapshot in
  `e2e/public.spec.ts-snapshots/` will change and must be regenerated with
  `npm run test:visual:update`; the booking and sign-in/cita snapshots also change because
  the **shared header** changes — regenerate those too and eyeball the diffs.

## Out of Scope

- Any domain/booking behavior, route handlers, server actions, or `lib/` changes.
- CMS- or DB-driven services — the three cards are hardcoded marketing content.
- Sourcing the real Professional photo (a placeholder ships now; the real image is dropped
  in later at the same path).
- Localization beyond Spanish.
- New analytics, tracking, or third-party embeds.
- Restyling the booking form, cita page, or admin dashboard beyond the visual flow-through
  of the shared header.
- A full design-token overhaul — the palette/scale from slice 01 is reused as-is.

## Further Notes

- The prototype is the **visual reference only**; its Tailwind/lucide CDNs, mock data store,
  and handoff scaffolding are not adopted. The palette already lives in `app/globals.css`
  (`--brand #ba8c84`, `--brand-dark #9e7162`, `--brand-soft #f7e8e4`, gradient
  `#fff3f0 → #e8d4cd`); the prototype's `brand-bg #e8d4cd` is the existing `--gradient-to`.
- The services copy, the headline, and "three hardcoded service cards" mirror the prototype
  (and, per the prototype's own handoff note, the real app treats these as hardcoded too —
  not domain data).
- Reduced-motion and no-JS safety is a hard requirement for the reveals: the home page must
  be fully legible and bookable with animations disabled.
- Because the shared header gains a CTA, the booking route will show an "Agendar visita"
  button in its header; that is acceptable, though the implementation may choose to suppress
  it on `/agendar-visita`.
