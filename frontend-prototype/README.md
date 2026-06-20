# Maraflamini — Frontend Prototype

A standalone, dependency-light **HTML/CSS/JS mockup** of four screens from the
MaxTurnos / Maraflamini app. No backend, no login, no real database — all data
is mocked client-side. Built as a **developer/designer handoff reference**.

> See **`HANDOFF.md`** for the route→source map, data contracts, business rules,
> API endpoints, and what's faked. Each page also shows a toggleable **"Handoff"
> panel** (bottom-left) with in-context notes — hide it for screenshots.

## Pages

| File | Mirrors | Description |
| --- | --- | --- |
| `index.html` | `/` | Public landing page (hero, services, CTAs) — the home page. |
| `agendar-visita.html` | `/agendar-visita` | Patient appointment booking form. |
| `cita.html` | `/cita/[id]` | Appointment confirmation/details (with a state previewer). |
| `admin.html` | `/admin` | Provider dashboard with 5 tabs. |

## How to run

**Easiest:** double-click `index.html` (or any page) to open it in your browser.
Everything works from `file://`, including the mock data (it falls back to
in-memory storage if `localStorage` is blocked).

**Recommended (so `localStorage` persists across the 3 pages):** serve the
folder over HTTP, e.g. from this directory:

```bash
npx serve .
# or
python -m http.server 8080
```

then open `http://localhost:8080/index.html`.

> Requires internet access on first load for the Tailwind and Lucide CDN
> `<script>` tags. Everything else is local.

## What's interactive

- **Booking form:** conditional Consulta/Práctica sub-fields, obra-social
  filtering, date picker (today → +31 days, weekends/holidays/blocked days
  disabled), 20-minute time slots, conditional deposit checkbox
  ($35.000 / $20.000), full validation, and a mock submit that **adds the
  appointment to the shared store** and **redirects to `cita.html`** (mirroring
  the real `router.push('/cita/[id]')`).
- **Confirmation (`cita.html`):** renders the booked appointment; the Handoff
  panel includes a **state previewer** to switch `scheduled / cancelled /
  completed` and toggle `can_cancel` (>24h) so every conditional layout is visible.
- **Dashboard:** all 5 tabs work — *Citas* (filters + cancel), *Calendario*
  (month grid + summary + day details), *Perfil* (edit info / change password),
  *Horarios* (working days, time slots, unavailable days), *Obras sociales*
  (add / edit / delete). Changes to obras sociales and blocked days are reflected
  back on the booking page (shared `localStorage`).

## Resetting the mock data

Data is seeded into `localStorage` under the key `maraflamini_prototype_v1`.
To start fresh, clear site data in your browser dev tools, or run in the console:

```js
localStorage.removeItem('maraflamini_prototype_v1'); location.reload();
```

## Structure

```
frontend-prototype/
  index.html / agendar-visita.html / cita.html / admin.html
  HANDOFF.md            route map, data contracts, business rules, API endpoints
  css/styles.css        custom styles (gradient, reveals, toasts, tabs, modal)
  js/
    data.js             shared mock store (localStorage + in-memory fallback)
    toast.js            tiny toast helper (replaces sonner)
    handoff.js          toggleable on-page handoff-notes banner
    landing.js          landing page interactions
    agendar.js          booking form logic
    cita.js             confirmation page + state previewer
    admin.js            dashboard tabs + CRUD
```
