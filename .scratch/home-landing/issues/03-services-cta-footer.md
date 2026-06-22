# 03 — Services + CTA band + footer

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Home page landing](../PRD.md)

## What to build

The rest of the landing, below the hero.

- **Services**: three `Card`s rendered from a typed constant `{ icon, title, description }[]`
  — Dermatología General, Dermatología Estética, Cirugía Dermatológica — each with its icon
  (shield / users / award) and one-line Spanish description. Static marketing content, not
  domain data; editable in one place.
- **CTA band**: a "¿Listo para Cuidar tu Piel?" section with a final "Agendar visita" CTA →
  `/agendar-visita`.
- **Footer**: a simple, clinic-appropriate site footer (replacing the prototype's "MaxTurnos
  / Prototipo" text), optionally with a discreet admin sign-in link.
- Built on the existing tokens + `Button`/`Card` and the slice-01 icons; stays server-rendered.

## Acceptance criteria

- [x] Three service cards render from a typed constant, each with icon, title, and description.
- [x] The CTA band renders a final "Agendar visita" CTA linking to `/agendar-visita`.
- [x] A footer renders as a `<footer>` landmark with clinic-appropriate content.
- [x] The home Playwright snapshot is regenerated and the diff eyeballed.
- [x] A behavior test covers the three service titles, the second CTA → `/agendar-visita`, and the footer.
- [x] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [02 — Hero](./02-hero.md)

## Comments

- 2026-06-22: Implemented on branch `home-landing`. Added the **services** section to the home page —
  three `Card`s from a typed `SERVICES` const (Dermatología General / Estética / Cirugía
  Dermatológica), each with its slice-01 icon (shield / users / award) in a gradient circle and a
  one-line Spanish description; 1-column on mobile, 3-column on desktop. Added the closing **CTA band**
  ("¿Listo para Cuidar tu Piel?" + a final "Agendar visita" CTA → `/agendar-visita`) on a
  `--brand-soft` background. Added **`PublicFooter`** (practice name + a discreet "Panel del profesional"
  link to `/admin/sign-in`) and wired it into the shared `(public)` layout **after `<main>`**, so it's a
  true `contentinfo` landmark and consistent chrome — which means booking and cita gain the footer too.
- Tests: home page asserts the three service titles and that **every** Agendar-visita CTA (hero +
  band) routes to `/agendar-visita` (`getAllByRole`); new `public-footer.test.tsx` (contentinfo
  landmark + sign-in link). Regenerated `home`, `booking-initial`, `booking-deposit` snapshots
  (booking pages gained the footer); `sign-in` is standalone (no public layout) and unchanged.
  typecheck + build clean; vitest 174/174. **Eyeballed** the full landing — hero → services → CTA band
  → footer reads cleanly.
- Decision: the footer lives in the layout (not the home page) so it's a real landmark and shared site
  chrome, mildly widening the slice's snapshot scope to the booking pages — a deliberate, consistent choice.
