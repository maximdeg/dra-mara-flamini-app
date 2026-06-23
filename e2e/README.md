# Visual-regression suite

Full-page screenshot tests (Playwright) that guard the design system against
unintended visual regressions. They complement the per-screen DOM snapshots in
the Vitest suite — those track structure; these track pixels.

## Prerequisites

1. **MongoDB** running and reachable per `.env` (`MONGODB_URI`).
2. **A seeded Professional** for the admin specs to sign in:
   ```
   npm run seed:professional
   ```
   (defaults: `mara@example.com` / `change-me` from `.env`)
3. **The chromium browser** for Playwright:
   ```
   npx playwright install chromium
   ```

The Playwright `webServer` builds nothing itself — it runs `npm run start`, so
build first: `npm run build`.

## Running

```
npm run test:visual          # compare against committed baselines
npm run test:visual:update   # regenerate baselines (after an intended change)
```

## Coverage

- **public** (`public.spec.ts`): home, sign-in, booking form (initial), booking
  form (Self-Pay Practice → Deposit shown).
- **admin** (`admin.spec.ts`, authenticated): appointments list, calendar (pinned
  to a fixed past month so "today" never drifts the baseline).

## Notes & gotchas

- **Baselines are platform-specific.** Playwright tags each baseline with the OS
  + browser (e.g. `…-chromium-win32.png`). Regenerate on the platform you assert
  on; a Linux CI needs its own baselines (generate them there, ideally in the
  Playwright Docker image).
- **Stability is by design.** We only screenshot views that don't drift:
  collapsed native selects hide the day-to-day booking window; the calendar uses a
  fixed month; the appointments list is pinned to a fixed empty date window
  (`?from=2000-01-01&to=2000-01-01`) so it renders the same empty state on any
  database — it no longer assumes the `appointments` collection is empty.
- **Confirmation page (`/cita/[id]`) is intentionally not covered here.** Its
  content is date-driven (the Appointment date sits inside the booking window and
  moves daily) and needs a seeded Appointment per Status. A stable baseline would
  require a pinned clock + fixtures; until then its structure is covered by the
  `appointment-details` DOM snapshot in the Vitest suite (slice 03).
