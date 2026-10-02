# Refactor plan: Home page — booking clarification and WhatsApp treatments section

Status: ready-for-agent

Source: `instruction-changes.md` (client request, "Home Interface").

## Problem Statement

The client has asked for two changes to the public home page:

1. **What the site is for.** A visitor arriving at the home page sees a generic headline ("Tu Piel, Nuestra Especialidad") and a generic lead. Nothing says that this site exists to book visits with **Dra. Mara Flamini Prida**. The client wants that stated clearly at the point of arrival.
2. **Aesthetic treatments are not reachable.** The client offers four aesthetic treatments: **Peeling, Skinbooster, Toxina botulínica, Plasma rico en plaquetas**. None of them is a bookable Visit Kind (those are only Consulta · Primera vez/Seguimiento and Práctica · Criocirugía/Electrocoagulación/Biopsia), so a patient has no way to find or ask about them on the site. The client wants these treatments shown right below the hero, with a WhatsApp contact to **+54 9 3425 78-2344** for anyone interested.

## Solution

- Add a short **eyebrow line** above the hero headline: "Reserva de visitas con la Dra. Mara Flamini Prida". The headline, lead and "Agendar visita" CTA stay as they are.
- Add a new **"Consultas por WhatsApp"** section between the hero and "Nuestros Servicios". It has an H2, a subtitle that shows the number as visible text, and **four cards**, one per treatment. Each card has the treatment name, a one-line description and a **"Consultar por WhatsApp"** link. The link opens `wa.me/5493425782344` in a new tab with a message prefilled for that treatment.
- The page order becomes: Hero → Consultas por WhatsApp → Nuestros Servicios → CTA band.
- The WhatsApp number is a **hard-coded constant**. It is not admin-editable.

## Commits

1. **Hero eyebrow line.** Add a small eyebrow paragraph above the H1 in the hero, reading "Reserva de visitas con la Dra. Mara Flamini Prida", styled as a muted uppercase or small-caps label using the existing design tokens. Extend the hero unit test to assert the line is rendered. The H1 accessible name does not change, so the e2e locator keeps working. The page is still fully working; only the hero gains a line.

2. **WhatsApp contact-link helper.** Add a small pure helper for the public site. It takes a message and returns the `https://wa.me/5493425782344?text=<encoded message>` URL. The clinic WhatsApp number lives next to it as one constant, in international digits-only form, together with a display form ("+54 9 3425 78-2344") for the visible text. Unit-test the helper: digits-only number in the path, message URL-encoded (accents, spaces, punctuation), and no `text` parameter when the message is empty. Nothing uses the helper yet.

3. **WhatsApp icon.** Add a `WhatsAppIcon` to the shared icon set, following the same props/size conventions as the existing icons. Nothing renders it yet.

4. **Treatments section component (unmounted).** Add the "Consultas por WhatsApp" section component and its CSS module. Mirror the structure of the existing "Nuestros Servicios" section: a header with H2 and subtitle, a responsive card grid built on the shared `Card`, and a static array of treatments. Each card renders the H3 name, the description, and a "Consultar por WhatsApp" link (WhatsApp icon plus label, `target="_blank"`, `rel="noopener noreferrer"`). The link's href comes from the helper with the treatment's prefilled message. On mobile the grid uses 1 column, then 2, then 4 on wide screens. Add a unit test (see Testing Decisions). The component is not on the page yet, so the site does not change.

5. **Mount the section on the home page.** Insert the new section between Hero and Services in the home page.

6. **Refresh e2e home snapshots.** Re-capture the desktop and mobile home page screenshots, since the hero and the new section change the full-page image. Optionally, add an assertion in the home e2e tests that the "Consultas por WhatsApp" heading is visible.

7. **Domain doc.** Add an **Aesthetic Treatment** entry to `CONTEXT.md`: a treatment the practice offers that is *not* a Visit Kind, cannot be booked online, and is arranged with the patient over WhatsApp. List the four. This keeps future work from trying to model these as Visit Kinds.

## Decision Document

- **Clarification placement:** an eyebrow line above the hero H1. The headline, lead and CTA are unchanged.
- **Eyebrow copy:** "Reserva de visitas con la Dra. Mara Flamini Prida". "Visita" matches the existing "Agendar visita" wording.
- **New section:** a separate section placed after the hero. "Nuestros Servicios" is kept, not replaced.
- **Section heading:** H2 "Consultas por WhatsApp". Subtitle (draft): "Estos tratamientos se coordinan por WhatsApp. Escríbenos al +54 9 3425 78-2344." It uses the tú voice of the existing home copy.
- **Treatments and draft descriptions** (the client should review these, since they are medical copy):
  - Peeling: "Renovación de la capa superficial de la piel para mejorar textura, manchas y luminosidad."
  - Skinbooster: "Hidratación profunda con ácido hialurónico para una piel más firme y luminosa."
  - Toxina botulínica: "Suaviza las líneas de expresión del rostro con un resultado natural."
  - Plasma rico en plaquetas: "Estimula la regeneración de la piel a partir de factores de tu propia sangre."
- **Prefilled message per card:** "Hola, quisiera consultar por el tratamiento de <Nombre>."
- **Link behaviour:** one link per card, labelled "Consultar por WhatsApp", opening in a new tab with `rel="noopener noreferrer"`.
- **Number source:** a single hard-coded constant (international digits-only form plus display form) in the public-site WhatsApp helper. Changing it requires a deploy. Clinic Info is **not** extended.
- **Separation from notifications:** the helper is separate from the WhatsApp notifications module. That module covers system-sent messages through the Meta Cloud API; this helper only builds a `wa.me` link the patient opens.
- **Static content:** the treatment list is a static array in the section component, like the existing services list. It is not stored in the database.

## Testing Decisions

- Good tests check external behaviour: what a patient sees and can click (roles, accessible names, hrefs). They do not check markup structure, class names or internals.
- **Hero unit test** (extend the existing one): the eyebrow text is rendered, and the existing assertions still pass.
- **WhatsApp helper unit test:** URL shape, digits-only number, correct encoding of an accented message, and an empty message producing no `text` parameter.
- **Treatments section unit test:** the "Consultas por WhatsApp" H2 and the visible display number are rendered. All four treatment names are H3 headings. There are exactly four "Consultar por WhatsApp" links. Each link's href points to `wa.me/5493425782344` and its decoded `text` mentions that card's treatment. Each link opens in a new tab with `noopener`.
- **Prior art:** the section-level RTL tests next to the home sections (the hero and services tests) for component tests; the existing pure-function vitest tests under `lib/` for the helper; the Playwright full-page snapshot tests for the public pages (desktop and mobile) for visual regression.
- **E2E:** regenerate the home snapshots for both desktop and mobile. No new e2e flow is needed, because opening WhatsApp leaves the site.

## Out of Scope

- Making the WhatsApp number or the treatment list admin-editable (Clinic Info, database).
- Turning any of the four treatments into bookable Visit Kinds, or adding them to the booking form.
- Changing the existing "Nuestros Servicios" cards, the hero headline or lead, or the CTA band.
- Any change to WhatsApp notifications (Confirmation and Cancellation Notice).
- Images or icons per treatment beyond the shared WhatsApp icon. Analytics or click tracking on the WhatsApp links.

## Further Notes

- The card descriptions are drafts written for this plan and should be confirmed with the client before release. They are plain constants, so changing them is a one-line edit.
- `instruction-changes.md` has the number as "+54 9 3425 78-2344". The `wa.me` form is `5493425782344`.
