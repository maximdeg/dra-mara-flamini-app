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

- [ ] Three service cards render from a typed constant, each with icon, title, and description.
- [ ] The CTA band renders a final "Agendar visita" CTA linking to `/agendar-visita`.
- [ ] A footer renders as a `<footer>` landmark with clinic-appropriate content.
- [ ] The home Playwright snapshot is regenerated and the diff eyeballed.
- [ ] A behavior test covers the three service titles, the second CTA → `/agendar-visita`, and the footer.
- [ ] `npm test`, `npm run typecheck`, and `npm run build` are green.

## Blocked by

- [02 — Hero](./02-hero.md)
