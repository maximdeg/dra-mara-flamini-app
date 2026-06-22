# 01 — Inline-SVG icons + restyled shared header

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Home page landing](../PRD.md)

## What to build

The icon primitive and the restyled shared site header — the first visible piece of the
landing, and the one that flows through every public page.

- **Inline-SVG icon components** for the five glyphs the landing uses: `calendar`,
  `arrow-right`, `shield`, `users`, `award`. Authored locally as small React components
  driven by `currentColor` and a size prop — no icon dependency, no client JS.
- **Restyle the shared `PublicHeader`**: a logo monogram (in a brand-gradient circle),
  "Mara Flamini" with the "Dermatóloga" tagline, and an "Agendar visita" CTA (the shared
  `Button`, `as={Link}`) routing to `/agendar-visita`. The brand still links to `/`.
- Built on the existing design tokens + `Button`; CSS Modules, not Tailwind.

Because the header is shared, the new look appears on the booking and cita pages too — so
their visual snapshots change along with the home one.

## Acceptance criteria

- [x] Five inline-SVG icon components exist, sized via a prop and inheriting `currentColor`; no new dependency.
- [x] The shared header shows the logo mark, "Mara Flamini" + "Dermatóloga", and an "Agendar visita" CTA linking to `/agendar-visita`; the brand links to `/`.
- [x] The CTA and brand are keyboard-focusable with a visible focus state.
- [x] Affected Playwright snapshots are regenerated and the diffs eyeballed. _(home, booking-initial, booking-deposit changed; sign-in is standalone with no PublicHeader and was unchanged; there is no cita snapshot in the suite.)_
- [x] A behavior test covers the header (brand → `/`, CTA → `/agendar-visita`).
- [x] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- None - can start immediately.

## Comments

- 2026-06-22: Implemented on branch `home-landing` (off `main`). Added `components/ui/icons.tsx` —
  hand-authored inline-SVG icon components (calendar, arrow-right, shield, users, award) sharing a
  small `Icon` wrapper: `currentColor`, sized via a `size` prop, `aria-hidden`, no dependency, no
  client JS. Restyled `PublicHeader`: a brand-gradient monogram mark, "Mara Flamini" + "Dermatóloga",
  and an "Agendar visita" CTA (the shared `Button`, `as={Link}`) → `/agendar-visita`; the brand links
  `/` (with an `aria-label`). Built on the existing tokens + `Button` (CSS Modules). Added
  `public-header.test.tsx` (brand → `/`, CTA → `/agendar-visita`, mocking `next/link` like
  `admin-nav.test.tsx`). typecheck + build clean; vitest 168/168.
- **Deliberate deviation from the prototype:** the CTA reuses the app's `Button` primary (solid
  `--brand-dark`, app radius) rather than the prototype's gradient pill — to stay consistent with the
  Button primitive approved in frontend-design slice 01 and avoid a global button restyle. The warm
  prototype feel comes from the gradient monogram mark.
- Snapshots regenerated on **win32** via `npx playwright test --project=public --update-snapshots`
  (home, booking-initial, booking-deposit). The admin specs were not run (they need a seeded
  Professional); their pages don't use `PublicHeader`, so they're unaffected.
