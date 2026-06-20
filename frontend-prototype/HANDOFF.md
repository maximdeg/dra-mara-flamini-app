# Handoff reference — Maraflamini screens

This prototype is a **developer/designer handoff reference** for four screens of
the MaxTurnos / Maraflamini Next.js app. It is a static HTML/CSS/JS mockup with
no backend; all data is mocked in the browser. Use it to understand the
structure, interactions, and business rules of these screens before rebuilding
them elsewhere.

Each page shows a toggleable **"Handoff" panel** (bottom-left) with its real
route, source file, key behaviors, and what's faked. Hide it for screenshots
(state is remembered in `localStorage`).

---

## Route → source map

| Prototype file | Real route | Real source |
| --- | --- | --- |
| `index.html` | `/` (the home page) | `app/page.tsx` → `app/ProviderPageClient.tsx` |
| `agendar-visita.html` | `/agendar-visita` | `app/agendar-visita/page.tsx` → `components/agendar-visita/AppointmentForm.tsx`, `AvailableTimesComponentImproved.tsx`, `FooterRoot.tsx` |
| `cita.html` | `/cita/[id]` | `app/cita/[id]/page.tsx` |
| `admin.html` | `/admin` | `app/admin/page.tsx` |

This prototype is single-provider: `maraflamini`'s page is the site **home page**
(served at `/`), not a `[username]` route param. Booking and confirmation live
directly under the root (`/agendar-visita`, `/cita/[id]`). The provider is
resolved to a single `user_account_id` rather than looked up per username.

---

## Business rules (must be reproduced accurately)

These are the rules a rebuild must preserve — verified against the source:

- **Time slots: 20-minute intervals.** Generated from each working-day slot's
  `start_time`→`end_time`, minus already-booked `scheduled` times.
  Source: `generateTimeSlots()` in `app/api/available-times/[date]/route.ts`.
- **Booking date window: today → +31 days.** Past dates rejected; the validation
  message says "no más de 30 días" but the code uses `+31`. Source:
  `AppointmentForm.tsx` zod refine + `isDateDisabled`.
- **Non-bookable dates:** weekends, days the provider marked unavailable, and
  hardcoded holidays **`MM-01-01` (Año Nuevo)** and **`MM-12-25` (Navidad)**.
- **Visit types:** `Consulta` (id `1`) → requires *Tipo de Consulta*
  (`Primera vez` id `1` / `Seguimiento` id `2`). `Práctica` (id `2`) → requires
  *Tipo de Práctica* (`Criocirugía` `1` / `Electrocoagulación` `2` / `Biopsia` `3`).
- **Obra social filtering:** `Consulta` hides `"Practica Particular"`;
  `Práctica` hides `"Particular"`. Field is disabled until a visit type is chosen.
- **Deposit (seña) acknowledgment** required to submit when:
  - `Práctica` + `Practica Particular` → **$35.000**, or
  - `Consulta` + `Primera vez` → **$20.000**.
  The confirmation page repeats this as a transfer instruction (CBU/alias).
- **Cancellation (patient side):** allowed only when `can_cancel` — i.e. **more
  than 24 hours** before the appointment. The provider dashboard cancel has no
  such restriction.
- **Confirmation page** varies by `status` (`scheduled` / `cancelled` /
  `completed`): icon, title, badge, and which sections render.

> Naming note: the real data model stores the visit type as **`"Practica"`
> (no accent)** for logic checks (`visit_type_name === 'Practica'`), while the UI
> displays "Práctica". This mockup uses the accented "Práctica" consistently.

---

## Appointment data contract

Shape used across the dashboard (`Appointment` interface in
`app/admin/page.tsx`) and what the mockup's `MockStore` mirrors:

```ts
interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;          // digits only, AR with +54 country code
  appointment_date: string;       // "YYYY-MM-DD"
  appointment_time: string;       // "HH:MM" (24h)
  visit_type: string;             // "Consulta" | "Práctica" (DB: "Practica")
  consult_type: string | null;    // when Consulta
  practice_type: string | null;   // when Práctica
  health_insurance: string;       // obra social name
  status: 'scheduled' | 'cancelled' | 'completed';
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null; // present ⇒ "Mensaje recibido" (double check)
  whatsapp_message_id: string | null;
  created_at: string;
}
```

The booking **POST** (`/api/appointments/create`) sends *ids*, not labels:
`first_name`, `last_name`, `phone_number`, `visit_type_id`, `consult_type_id`,
`practice_type_id`, `health_insurance` (name), `appointment_date`,
`appointment_time`, `user_account_id`, `notes`. On success it returns
`appointment_info.id` + `cancellation_token` and redirects to
`/cita/{id}?token=…`.

Other shapes (see `MockStore` in `js/data.js`): `profile`, `workSchedule[]`
(`day_of_week`, `is_working_day`, `available_slots[]{start_time,end_time}`),
`unavailableDays[]{date}`, `healthInsurances[]{name,price,notes}`.

---

## Real API endpoints (mocked here by MockStore)

Public (patient-facing booking):
- `GET /api/health-insurance` — obras sociales list.
- `GET /api/work-schedule` — working days + unavailable dates.
- `GET /api/available-times/[date]?user_account_id=…` — available 20-min slots.
- `POST /api/appointments/create` — create appointment.
- `GET /api/appointments/[id]?token=…` — appointment details (confirmation page).
- `POST /api/appointments/[id]/cancel` — cancel (`cancelled_by: 'patient' | 'provider'`).

Admin dashboard (Bearer token in `localStorage` — **auth removed in mockup**):
- `GET/PUT /api/admin/profile`, `PUT /api/admin/profile/password`
- `GET /api/admin/appointments`
- `GET /api/admin/calendar?year=&month=`
- `GET /api/admin/work-schedule`, `PUT /api/admin/work-schedule/[day]`,
  `POST /api/admin/work-schedule/[day]/slots`,
  `DELETE /api/admin/work-schedule/slots/[id]`
- `GET/POST /api/admin/unavailable-days`, `DELETE /api/admin/unavailable-days/[id]`
- `GET/POST/PUT/DELETE /api/admin/health-insurance`

---

## What's faked / placeholder

- **No backend / DB / auth.** Dashboard auth gate is removed; all data is the
  in-browser `MockStore` (`localStorage`, in-memory fallback for `file://`).
- **Sensitive copy is `[PLACEHOLDER]`** on `cita.html`: clinic phone numbers,
  CBU/alias, and the per-visit-type documentation specifics (IAPOS bonos,
  coseguro, etc.). The real strings are hardcoded in
  `app/cita/[id]/page.tsx`.
- **Seed data is fabricated:** patient names, the obras-sociales list, work
  schedule, and the hero image (real app uses `/images/maraflaminipic.jpg`).
- **DB-driven vs hardcoded in the real app:**
  - DB-driven: obras sociales, work schedule, unavailable days, appointments, profile.
  - Hardcoded in the real components: the landing "Servicios" cards, the
    confirmation page's documentation/contact text, and the holiday list.

---

## Component fidelity notes

The real app uses **shadcn/ui** (Radix) + Tailwind. This mockup approximates
those with plain elements, so a rebuild should map:

- shadcn `Select` (Radix popover) → native `<select>` here.
- shadcn `Calendar` (react-day-picker) + `Popover` → native `<input type="date">`.
- shadcn `Tabs` (Radix) → custom buttons + `aria-selected`.
- shadcn `AlertDialog` → the custom modal in `admin.html`.
- `sonner` toasts → `js/toast.js`.
- `framer-motion` entrance animations → CSS transitions + `IntersectionObserver`.
- `lucide-react` icons → Lucide via CDN (`data-lucide` + `lucide.createIcons()`).

See `README.md` for how to run, and the per-page Handoff panels for quick
in-context notes.
