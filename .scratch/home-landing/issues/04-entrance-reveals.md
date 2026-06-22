# 04 — Entrance reveals + visual-suite stabilization

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Home page landing](../PRD.md)

## What to build

The prototype's scroll-in entrance motion, added as a safe enhancement, plus making the
visual-regression suite deterministic now that the page animates.

- A small client **`Reveal` wrapper** using `IntersectionObserver` to add an `is-visible`
  class that drives a CSS transition. It must render children **visible by default**
  (SSR / no-JS / no `IntersectionObserver`) — content is only *enhanced*, never hidden —
  and respect `prefers-reduced-motion` (no transform/opacity animation). Apply it to the
  home page sections; the page otherwise stays a server component (`Reveal` is the only
  `"use client"`).
- **Stabilize the Playwright visual suite**: ensure the home screenshot is deterministic
  with reveals present (settle the reveals or disable transitions before the screenshot),
  then regenerate.

## Acceptance criteria

- [x] Home page sections animate in on scroll where motion is allowed.
- [x] With no JS / no `IntersectionObserver`, all content is fully visible and the page is usable.
- [x] With `prefers-reduced-motion`, no entrance animation runs.
- [x] The page stays server-rendered except the `Reveal` wrapper.
- [x] A test confirms `Reveal` renders its children visible without an `IntersectionObserver`.
- [x] The home Playwright snapshot is deterministic with reveals and the visual suite is green. _(Under reduced motion the page renders the same fully-visible layout, so no baseline changed.)_
- [x] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [03 — Services + CTA band + footer](./03-services-cta-footer.md)

## Comments

- 2026-06-22: Implemented on branch `home-landing`. Added `components/ui/reveal.tsx` — a client
  `Reveal` wrapper that flips `data-revealed` via `IntersectionObserver` once a section scrolls into
  view, with a CSS transition in `reveal.module.css`. The hidden-until-revealed state is gated on
  **both** `@media (prefers-reduced-motion: no-preference)` **and** `:global(html.js)`, so the content
  is visible by default for a no-JS / no-`IntersectionObserver` / reduced-motion visitor — it only ever
  *enhances*. The `(public)` layout sets the `html.js` marker via a tiny inline script that runs
  synchronously before paint (no visible→hidden flash). Home sections are wrapped in `<Reveal>`; the
  page stays a server component (`Reveal` is the only `"use client"`), and when there's no
  `IntersectionObserver` the wrapper reveals immediately.
- Visual determinism: the e2e `shot` helper now calls `page.emulateMedia({ reducedMotion: "reduce" })`
  before each full-page screenshot, so the scroll-reveal animations are off and below-the-fold sections
  are fully visible. (Tried `reducedMotion` in `playwright.config` `use` but this Playwright version's
  types reject it there; `emulateMedia` is the type-safe equivalent.) The **public visual suite passes
  against the existing slice-03 baselines unchanged** — reduced motion renders the same fully-visible
  layout — so no PNGs were regenerated. `reveal.test.tsx` covers the no-`IntersectionObserver`
  fallback. typecheck + build clean; vitest 176/176.
- **Feature complete:** slices 01–04 of `home-landing` are all done.
