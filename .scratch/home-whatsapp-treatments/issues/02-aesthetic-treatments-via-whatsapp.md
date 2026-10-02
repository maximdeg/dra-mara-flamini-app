# Aesthetic Treatments reachable over WhatsApp

Status: ready-for-agent

## Parent

`.scratch/home-whatsapp-treatments/PRD.md`

## What to build

Add a new "Consultas por WhatsApp" section to the home page, between the hero and "Nuestros Servicios". It presents the four Aesthetic Treatments. None of them is a Visit Kind, so they can't be booked online, and each card sends the patient to WhatsApp to ask about it.

- **Heading:** H2 "Consultas por WhatsApp".
- **Subtitle:** "Estos tratamientos se coordinan por WhatsApp. Escríbenos al +54 9 3425 78-2344." The number appears as visible text.
- **Four cards**, built on the shared Card with the same layout as the Services section. Each has an H3 name, a one-line description, and a "Consultar por WhatsApp" link with a new WhatsApp icon. Names and descriptions:
  - Peeling: "Renovación de la capa superficial de la piel para mejorar textura, manchas y luminosidad."
  - Skinbooster: "Hidratación profunda con ácido hialurónico para una piel más firme y luminosa."
  - Toxina botulínica: "Suaviza las líneas de expresión del rostro con un resultado natural."
  - Plasma rico en plaquetas: "Estimula la regeneración de la piel a partir de factores de tu propia sangre."
- **Links:** each points to `https://wa.me/5493425782344?text=<encoded>` with the message "Hola, quisiera consultar por el tratamiento de <Nombre>.". Each opens in a new tab with `rel="noopener noreferrer"`.
- **Number:** one hard-coded constant, with a digits-only form and a display form, kept in a small pure helper that builds the link for the public site. The helper is separate from the WhatsApp notifications module.
- **Grid:** 1 column on mobile, 2 at mid widths, 4 on wide screens.

## Acceptance criteria

- [ ] The home page order is Hero → Consultas por WhatsApp → Nuestros Servicios → CTA band
- [ ] The section shows the H2, the subtitle with the visible display number, and four cards with the names and descriptions above
- [ ] Each card's link has the accessible name "Consultar por WhatsApp", targets `wa.me/5493425782344`, carries a decoded `text` naming that card's treatment, and opens in a new tab with `noopener`
- [ ] The helper has unit tests for the digits-only number in the path, URL-encoding of an accented message, and no `text` parameter for an empty message
- [ ] The section has an RTL unit test covering the heading, the number, the four H3s, and the four links (hrefs and new-tab attributes)
- [ ] The layout has no horizontal scroll at phone width
- [ ] The desktop and mobile home e2e snapshots are re-captured and the Playwright public suites pass
- [ ] Typecheck, lint and unit tests pass

## Blocked by

- `01-hero-states-site-purpose.md` (both re-capture the same home snapshots, so they run in sequence)
