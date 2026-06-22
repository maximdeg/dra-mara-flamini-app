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

- [ ] Home page sections animate in on scroll where motion is allowed.
- [ ] With no JS / no `IntersectionObserver`, all content is fully visible and the page is usable.
- [ ] With `prefers-reduced-motion`, no entrance animation runs.
- [ ] The page stays server-rendered except the `Reveal` wrapper.
- [ ] A test confirms `Reveal` renders its children visible without an `IntersectionObserver`.
- [ ] The home Playwright snapshot is deterministic with reveals and regenerated; the visual suite is green.
- [ ] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [03 — Services + CTA band + footer](./03-services-cta-footer.md)
