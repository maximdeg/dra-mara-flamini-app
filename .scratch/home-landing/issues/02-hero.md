# 02 — Hero

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Home page landing](../PRD.md)

## What to build

Replace the placeholder Card at the top of the home page (`/`) with the hero band.

- A two-column band on desktop (stacked on mobile): the Professional's photo beside the
  headline **"Tu Piel, Nuestra Especialidad"** (with "Especialidad" emphasized), a short
  reassurance paragraph, and a primary **"Agendar visita"** CTA → `/agendar-visita`.
- The photo uses `next/image` against a **committed placeholder asset** under `public/`
  (the real Professional photo drops in later at the same path), with a meaningful Spanish
  `alt` and a graceful fallback if it fails to load.
- Built on the existing tokens + `Button`/`Card`; reuses the icon components from slice 01.
  Stays server-rendered.

## Acceptance criteria

- [ ] The home page renders the hero headline, reassurance copy, and a primary "Agendar visita" CTA linking to `/agendar-visita`.
- [ ] The photo renders via `next/image` with a meaningful `alt`; layout doesn't break while it loads or if it fails.
- [ ] Two-column on desktop, single-column (stacked) on mobile.
- [ ] The home Playwright snapshot is regenerated and the diff eyeballed.
- [ ] A behavior test covers the hero (headline present, CTA → `/agendar-visita`).
- [ ] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [01 — Inline-SVG icons + restyled shared header](./01-icons-shared-header.md)
