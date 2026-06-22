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

- [x] The home page renders the hero headline, reassurance copy, and a primary "Agendar visita" CTA linking to `/agendar-visita`.
- [x] The photo renders via `next/image` with a meaningful `alt`; layout doesn't break while it loads or if it fails.
- [x] Two-column on desktop, single-column (stacked) on mobile.
- [x] The home Playwright snapshot is regenerated and the diff eyeballed.
- [x] A behavior test covers the hero (headline present, CTA → `/agendar-visita`).
- [x] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [01 — Inline-SVG icons + restyled shared header](./01-icons-shared-header.md)

## Comments

- 2026-06-22: Implemented on branch `home-landing`. Replaced the placeholder Card at `/` with the
  hero: a two-column grid (photo left / copy right on desktop, stacked on mobile with the headline
  first in DOM order), the headline "Tu Piel, Nuestra **Especialidad**" (accent on _Especialidad_),
  a reassurance paragraph, and a primary "Agendar visita" CTA → `/agendar-visita` reusing the slice-01
  calendar + arrow icons. The photo uses `next/image` (`fill`, `priority`) against a **committed
  brand-gradient placeholder** generated with sharp at `public/images/mara-hero.jpg` (real photo drops
  in later at the same path); it sits in a fixed `aspect-ratio` frame with a brand-gradient backdrop,
  so the layout never shifts while loading and degrades to brand color rather than a broken frame —
  keeping the page server-rendered (no client `onError`). Added `app/(public)/page.test.tsx` (headline,
  CTA href, photo alt; `next/image`/`next/link` mocked). Updated the e2e home assertion from the old
  "Maraflamini" heading to "Tu Piel, Nuestra" and regenerated `home-public-win32.png` (sign-in +
  booking snapshots unchanged — the hero only touches `/`). typecheck + build clean; vitest 171/171.
- Placeholder is an abstract warm gradient (no stock photo); swap in the real Professional photo at
  `public/images/mara-hero.jpg` when available — no code change needed.
