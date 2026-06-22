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

- [ ] Five inline-SVG icon components exist, sized via a prop and inheriting `currentColor`; no new dependency.
- [ ] The shared header shows the logo mark, "Mara Flamini" + "Dermatóloga", and an "Agendar visita" CTA linking to `/agendar-visita`; the brand links to `/`.
- [ ] The CTA and brand are keyboard-focusable with a visible focus state.
- [ ] Affected Playwright snapshots (home, booking, sign-in/cita) are regenerated and the diffs eyeballed.
- [ ] A behavior test covers the header (brand → `/`, CTA → `/agendar-visita`).
- [ ] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- None - can start immediately.
