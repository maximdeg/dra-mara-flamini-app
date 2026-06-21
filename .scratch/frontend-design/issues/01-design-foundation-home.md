# 01 — Design foundation + home page

Status: ready-for-human
Type: HITL

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

The foundational tracer bullet for the whole restyle: establish the visual system and
prove it on one complete screen. Introduce a single **global tokens stylesheet** (imported
once in the root layout) exposing the brand palette, typography, spacing, radii, and shadows
as CSS custom properties; the **public app shell** (system font, the warm gradient
background, a simple header); the first two shared primitives — **Button** and **Card** — as
React components with their own `.module.css`; and the **component-test toolchain**
(`@testing-library/react`, `@testing-library/jest-dom`, a `jsdom` Vitest environment). Then
fully restyle the **home page (`/`)** on top of them.

Palette copied verbatim from the prototype: `--brand #ba8c84`, `--brand-dark #9e7162`
(primary actions), `--brand-soft #f7e8e4`, page gradient `#fff3f0 → #e8d4cd`, neutral
borders/text from gray-300/900/600/500, semantic error `#dc2626` / success `#16a34a` /
info `#4b5563`.

This is **presentation-only**: no domain logic, route handlers, server actions, `lib/`
modules, or data contracts change.

This slice is **HITL**: a human reviews and approves the token values, visual direction, the
CSS-Modules conventions, and the Button/Card primitive API before slices 02–11 build on
them.

## Acceptance criteria

- [x] A global tokens stylesheet defines the full palette + type/spacing/radius/shadow scale as CSS custom properties, imported once in the root layout.
- [x] Public app shell applies the system font, gradient background, and a header to the public pages. _Established as the `(public)` route group; the home page is moved into it. agendar-visita and cita inherit the shell when slices 02/03 move them into the group._
- [x] `Button` (variants: primary=`--brand-dark`, secondary, destructive, ghost; disabled + busy states) and `Card` exist as CSS-Module components.
- [x] The home page (`/`) is fully restyled and introduces the practice + routes to booking.
- [x] Testing-Library + jsdom Vitest setup is in place as the reference pattern for UI tests.
- [x] At least one behavior test for a primitive (e.g. Button renders, fires onClick, respects disabled) passes (4 Button tests).
- [x] The existing Vitest suite still passes unchanged (no behavior leaked).
- [x] A human has reviewed and approved the token values, visual direction, CSS-Modules conventions, and primitive API.

## Blocked by

None — can start immediately.

## Comments

- 2026-06-21: Foundation built. Added `app/globals.css` (the design-tokens layer:
  brand palette copied verbatim from the prototype — `--brand #ba8c84`,
  `--brand-dark #9e7162`, `--brand-soft #f7e8e4`, gradient `#fff3f0→#e8d4cd`,
  neutrals, semantics — plus type/space/radius/shadow scales and a base reset),
  imported once in the root layout. Established the public shell as a `(public)`
  route group (`app/(public)/layout.tsx` + `components/layout/public-header.tsx`)
  carrying the gradient background, header, and centered column; moved the home page
  into it (`app/(public)/page.tsx`, URL unchanged at `/`). Added the first primitives
  under `components/ui/`: polymorphic `Button` (variants primary/secondary/
  destructive/ghost, `busy`, `as` for link-buttons) and `Card`, each with a
  `.module.css`. Stood up the UI test toolchain — `@testing-library/react`@16 +
  jest-dom + jsdom, wired via a two-project Vitest config (`lib` node, `ui` jsdom) and
  `vitest.setup.ts`; 4 Button behavior tests. `npm run typecheck` clean, `npm test`
  127/127 green (123 existing unchanged + 4 new), `npm run build` clean (`/` still
  prerendered static). Presentation-only — no lib/API/route changes.
- 2026-06-21: **HITL review approved** — maintainer signed off on the palette and the
  design foundation. Slice complete; unblocks 02, 03, 04.
