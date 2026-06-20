# PRD: Maraflamini Appointment Booking — Next.js + MongoDB build

Status: ready-for-agent

## Problem Statement

Maraflamini is a single-provider dermatology practice. Today the practice has only a
domain spec ([CONTEXT.md](../../CONTEXT.md)), two ADRs, and a dependency-light HTML/JS
prototype — no real application. The Professional needs a running system where:

- A Patient can find an open time and book an Appointment online without creating an
  account, re-entering their identification (first name, last name, phone, email) each
  time, and receive a WhatsApp Confirmation.
- A Patient can return only to cancel an Appointment, subject to the Cancellation Window.
- The Professional can sign in to a dashboard to see and cancel Appointments, and manage
  Work Schedule, Unavailable Days, accepted Health Insurance, and Self-Pay pricing.

There is no production-quality, persistent implementation of any of this.

## Solution

Build the application with **Next.js (App Router)** and **MongoDB**, structured around the
deep modules and seams the domain implies. The first build delivers the full booking and
management flow end-to-end. WhatsApp delivery is integrated behind a **Notification seam**
that is stubbed for now (an outbox + a fake adapter); the real always-on Baileys worker is
a later slice (see Out of Scope).

The architecture is a small set of deep modules tested through their interfaces:

- **Booking** — `book(bookingForm) → Appointment | Rejection`. Hides Visit Type / sub-type
  validation, coverage filtering, Deposit determination, the one-open-Appointment-per-phone
  rule, Time Slot availability checking, persistence, and enqueueing a Confirmation.
- **Availability** — `bookingWindow()` and `availableTimesFor(date) → Time Slot[]`. Hides
  Work Schedule expansion into 20-minute Time Slots, exclusion of weekends / fixed holidays
  / Unavailable Days, removal of already-booked times, and the tomorrow→+30-day window.
- **Appointment Status** — `statusOf(appointment, now) → Scheduled | Cancelled | Completed`.
  Hides the rule that an Appointment becomes Completed automatically once its date passes.
- **Cancellation** — `cancel(appointmentId, actor) → result`. Hides the Cancellation Window
  rule and enqueues a Cancellation Notice.

Two real seams (each with two adapters):

- **Appointment persistence** — a MongoDB repository adapter for production, an in-memory
  fake for tests.
- **Notifications** — `enqueue(notification)`. A DB-backed outbox + fake adapter now; the
  real Baileys worker drains the outbox later.

## User Stories

### Patient — booking

1. As a Patient, I want to see only the dates open for booking (tomorrow through 30 days
   ahead, excluding weekends, fixed holidays, Unavailable Days, and full days), so that I
   never pick a date I cannot actually book.
2. As a Patient, I want to choose a Visit Type (Consultation or Practice), so that the form
   asks me only for the relevant sub-type.
3. As a Patient choosing a Consultation, I want to choose a Consult Type (First Visit or
   Follow-up), so that the correct coverage and Deposit rules apply.
4. As a Patient choosing a Practice, I want to choose a Practice Type (Cryosurgery,
   Electrocoagulation, or Biopsy), so that the correct coverage and Deposit rules apply.
5. As a Patient, I want to pick a coverage option — an accepted Health Insurance or the
   relevant Self-Pay variant — so that pricing and Deposit are determined correctly.
6. As a Patient, I want to see only coverage options valid for my Visit Type (the
   _Particular_ variant for a Consultation, _Practica Particular_ for a Practice), so that I
   cannot pick an inapplicable option.
7. As a Patient, I want to see the available 20-minute Time Slots for a chosen date, so that
   I can pick a free time.
8. As a Patient booking a Self-Pay Practice, I want to be shown the Deposit (the option's
   full price) and asked to acknowledge it, so that I understand the upfront commitment.
9. As a Patient booking a Self-Pay First-Visit Consultation, I want to be shown the smaller
   Deposit the Professional set and asked to acknowledge it, so that I understand the
   commitment.
10. As a Patient booking a Follow-up, or any visit covered by Health Insurance, I want NOT
    to be asked for a Deposit, so that I am not charged for something that does not apply.
11. As a Patient, I want my booking rejected if my phone number already has an open
    Appointment, so that the one-open-Appointment-per-phone rule is enforced.
12. As a Patient, I want my booking rejected if the chosen Time Slot was taken in the
    meantime, so that two Patients cannot hold the same slot.
13. As a Patient, I want a Confirmation sent to my WhatsApp after booking, so that I have a
    record of the date, time, and details.
14. As a Patient, I want my booking to succeed even if WhatsApp is temporarily unavailable,
    so that I never lose an Appointment because of a messaging problem.
15. As a Patient, I want to land on a confirmation/details page after booking, so that I can
    see and keep my Appointment details.

### Patient — cancellation

16. As a Patient, I want to open my Appointment by its link and cancel it when I am more
    than 24 hours before the start time, so that I can free the slot if my plans change.
17. As a Patient, I want to be prevented from self-cancelling within 24 hours of the start
    time, so that the Cancellation Window rule is respected.
18. As a Patient, I want a Cancellation Notice sent to my WhatsApp when my Appointment is
    cancelled, so that I have confirmation it is cancelled.
19. As a Patient, I want to book again once my previous Appointment is Cancelled or
    Completed, so that the open-Appointment rule does not lock me out permanently.

### Professional — authentication & profile

20. As the Professional, I want to sign in to the dashboard with my credentials, so that
    only I can manage the practice.
21. As the Professional, I want Patients to never need an account, so that booking stays
    frictionless.
22. As the Professional, I want to edit my profile (name, contact, WhatsApp number), so that
    my details stay current.
23. As the Professional, I want to change my password, so that I can keep my account secure.

### Professional — appointments

24. As the Professional, I want to see all Appointments with their Status (Scheduled,
    Cancelled, Completed), so that I can manage my day.
25. As the Professional, I want to filter Appointments (e.g. by Status, date, Visit Type),
    so that I can find what I need.
26. As the Professional, I want to see Appointments become Completed automatically once their
    date passes, so that I never have to mark them by hand.
27. As the Professional, I want a calendar view of Appointments by day, so that I can see my
    workload at a glance.
28. As the Professional, I want to cancel any Appointment at any time with no 24-hour
    restriction, so that I can manage emergencies and closures.
29. As the Professional, I want each cancellation I make to send the Patient a Cancellation
    Notice, so that the Patient is always informed.

### Professional — Work Schedule & availability

30. As the Professional, I want to set which weekdays I work, so that the Booking Window
    reflects my real availability.
31. As the Professional, I want to set time ranges within each working weekday, so that Time
    Slots are generated correctly.
32. As the Professional, I want to add Unavailable Days (one-off blocked dates), so that I
    can close on specific days that fall on working weekdays.
33. As the Professional, I want to remove Unavailable Days, so that I can reopen a date.
34. As the Professional, when I reduce availability (un-mark a working weekday, remove a time
    range, or add an Unavailable Day) in a way that collides with existing Scheduled
    Appointments, I want to be required to cancel those Appointments first, so that I never
    silently strand a booked Patient. Each such cancellation sends a Cancellation Notice.

### Professional — coverage & pricing

35. As the Professional, I want to maintain the list of accepted Health Insurance (add, edit,
    delete, with price and notes), so that Patients see current coverage options.
36. As the Professional, I want the two Self-Pay variants to always exist and never be
    renamed or removed, so that Deposit and filtering logic can rely on them.
37. As the Professional, I want to edit the price of each Self-Pay variant, so that Self-Pay
    pricing stays current.
38. As the Professional, I want to set the smaller Deposit amount for a Self-Pay First-Visit
    Consultation, so that it reflects my current policy.

## Implementation Decisions

### Stack & app shape

- **Next.js (App Router)** for both the public booking site and the authenticated `/admin`
  dashboard. **MongoDB** for persistence (official Node driver or Mongoose — implementer's
  choice, kept behind the repository seam either way).
- The dashboard surface lives under `/admin`; "Admin"/"dashboard" is a UI surface, not a
  separate role or person (CONTEXT.md). There is exactly one Professional per deployment.

### Modules & interfaces

- **Booking** module exposes `book(bookingForm) → Appointment | Rejection`. It is the only
  writer of new Appointments. It performs, in order: validate Visit Type + required
  sub-type; validate the chosen coverage option is valid for the Visit Type; determine
  whether a Deposit applies and its amount; re-check Time Slot availability; enforce the
  one-open-Appointment-per-phone rule; persist; enqueue a Confirmation. Rejections are
  typed (e.g. `PhoneHasOpenAppointment`, `SlotTaken`, `OutsideBookingWindow`,
  `InvalidCoverageForVisitType`).
- **Availability** module exposes `bookingWindow() → Date[]` and
  `availableTimesFor(date) → TimeSlot[]`. Time Slots are 20-minute intervals expanded from
  the Work Schedule of that weekday, minus times taken by Scheduled Appointments. The
  prototype encodes the expansion precisely (carried over as a decision):

  ```
  for each slot (start_time..end_time): step by 20 minutes, emit "HH:MM";
  then drop times already taken by Scheduled Appointments on that date.
  ```

  The Booking Window is tomorrow → +30 days, excluding weekends, fixed annual holidays
  (New Year, Christmas), Unavailable Days, and any day with zero remaining Time Slots.
- **Appointment Status** is **derived, not stored as Completed**. Persisted Status is only
  `Scheduled` or `Cancelled`; `statusOf(appointment, now)` returns `Completed` for a
  Scheduled Appointment whose date has passed. This keeps "never set by hand" (CONTEXT.md)
  true and makes the re-booking gate and the dashboard agree from one place. (The prototype
  stored a literal `completed` value; that was mock-seed convenience and is superseded here.)
- **Cancellation** module exposes `cancel(appointmentId, actor) → result`, where `actor` is
  `Patient` or `Professional`. A Patient may cancel only more than 24 hours before the start
  time (Cancellation Window); the Professional may cancel at any time. It transitions
  Scheduled → Cancelled and enqueues a Cancellation Notice regardless of who cancelled.

### Seams

- **Appointment persistence (repository seam).** A MongoDB adapter in production; an
  in-memory fake for tests. The one-open-Appointment-per-phone rule is enforced server-side
  at booking time (ADR-0002), not via a uniqueness column on a Patient row (there is no
  Patient row). "Open" = Scheduled with a future date.
- **Notification seam.** `enqueue(notification)` writes to a DB-backed **outbox**
  collection. A fake adapter (used in tests and dev) marks entries as sent; the real Baileys
  worker that drains the outbox is a later slice. Booking and Cancellation always succeed
  regardless of Notification state (ADR-0001): notifications are best-effort and decoupled.
  Two Notification kinds: Confirmation (on booking) and Cancellation Notice (on any
  cancellation).

### Data model (no Patient entity — ADR-0002)

- **appointments** collection: Patient identification (first name, last name, phone, email)
  stored on each Appointment; `visit_type`, `consult_type`/`practice_type`, coverage
  (Health Insurance name or Self-Pay variant), `appointment_date`, `appointment_time`,
  persisted `status` (`scheduled` | `cancelled`), Deposit acknowledgment, and Notification
  bookkeeping fields (e.g. `whatsapp_sent`, `whatsapp_sent_at`, `whatsapp_message_id`).
  No Patient collection; Appointments from the same person are unrelated rows.
- **professional** (single document): credentials for Auth.js (email, hashed password,
  `email_verified`), profile fields, WhatsApp number.
- **workSchedule**: per-weekday `is_working_day` and a list of time ranges.
- **unavailableDays**: one-off blocked dates.
- **healthInsurances**: Professional-editable list (name, price, notes). Excludes the
  Self-Pay variants.
- **selfPay / pricing**: the two fixed, system-defined Self-Pay variants (_Particular_ for
  Consultation, _Practica Particular_ for Practice) with editable prices, plus the
  configurable First-Visit Consultation Deposit amount. These two variants cannot be renamed
  or removed.
- **notificationOutbox**: enqueued Notifications (kind, target Appointment, payload, send
  state).

### Authentication

- **Auth.js (NextAuth) credentials provider** backed by the `professional` document for the
  single Professional. Middleware guards `/admin` routes. Patients are never authenticated
  anywhere.

### Deposit rules (CONTEXT.md)

- Deposit applies to Self-Pay only: **every** Self-Pay Practice (amount = the option's full
  price), and a Self-Pay Consultation **only** when it is a First Visit (amount = the
  separate smaller value the Professional sets). Never for Follow-ups; never when a Health
  Insurance covers the visit. The platform captures only the Patient's **acknowledgment**;
  the transfer happens off-platform.

### API contracts (route handlers / server actions)

- **Public:** list bookable days (Booking Window); available times for a date; create
  booking (POST, returns the created Appointment or a typed Rejection); fetch an Appointment
  by id; Patient cancel (subject to the Cancellation Window).
- **Professional (authed):** list/filter Appointments; cancel an Appointment; read/update
  profile; change password; Work Schedule CRUD (with the collision-requires-cancellation
  guard); Unavailable Days CRUD; Health Insurance CRUD; edit Self-Pay prices and the
  First-Visit Deposit amount.

## Testing Decisions

- **Test external behavior through module interfaces, not implementation details.** Each
  deep module is exercised through its interface (`book`, `availableTimesFor`/`bookingWindow`,
  `statusOf`, `cancel`), so internal helpers can be refactored freely.
- **Replace, don't layer, at the seams.** Swap the MongoDB repository adapter for the
  in-memory fake, and the Baileys/Notification adapter for the fake, when testing Booking,
  Cancellation, and Availability. Do not mock past the interface.
- **Modules to cover:**
  - *Booking*: each Rejection path (open Appointment exists, slot taken, outside Booking
    Window, invalid coverage for Visit Type), Deposit determination across the full matrix
    (Self-Pay Practice / Self-Pay First-Visit / Follow-up / Health-Insurance), and the happy
    path enqueueing a Confirmation.
  - *Availability*: slot expansion (20-minute steps), exclusion of weekends/holidays/
    Unavailable Days/full days, removal of booked times, and the tomorrow→+30 boundary
    (no same-day booking).
  - *Appointment Status*: `Scheduled` with a past date derives `Completed`; future stays
    `Scheduled`; `Cancelled` stays `Cancelled`. The re-booking gate reads the derived value.
  - *Cancellation*: Patient inside vs. outside the 24-hour window; Professional with no
    restriction; both enqueue a Cancellation Notice.
  - *Work Schedule reduction*: a change colliding with Scheduled Appointments is blocked
    until those are cancelled; non-colliding changes apply.
- **Prior art:** none in-repo yet (greenfield). Establish the in-memory repository fake and
  the fake Notification adapter as the reference patterns the rest of the suite reuses.
  Integration tests for route handlers run against the in-memory repo (or
  `mongodb-memory-server`).

## Out of Scope

- **The real Baileys WhatsApp worker** — persistent session, QR/pairing, retry, throttling,
  always-on (non-serverless) hosting (ADR-0001). This build only writes the Notification
  outbox and uses a fake adapter; draining the outbox over Baileys is a later slice.
- **Patient login and patient history / cross-visit records** — impossible by design
  (ADR-0002). Would require introducing a real Patient entity.
- **Payment processing** — the Deposit is an acknowledgment only; money moves off-platform.
- **Multiple Professionals / roles** — exactly one Professional per deployment.
- **Reminders or other Notification kinds** — only Confirmation and Cancellation Notice.
- **Full i18n framework** — UI strings are Spanish with canonical English terms in code; no
  locale-switching system is being built.

## Further Notes

- Use the domain vocabulary from [CONTEXT.md](../../CONTEXT.md) throughout (Patient,
  Professional, Appointment, Visit Type, Consultation, Practice, Consult Type, Practice
  Type, Status, Health Insurance, Self-Pay, Deposit, Work Schedule, Time Slot, Booking
  Window, Unavailable Day, Cancellation Window, Notification, Confirmation, Cancellation
  Notice). Avoid the listed forbidden synonyms (Client/User, Provider/Doctor, Booking as the
  entity, Slot/Calendar, etc.).
- The existing [frontend-prototype](../../frontend-prototype/) (especially `js/data.js`,
  `js/agendar.js`, and `HANDOFF.md`) is the reference for screen layouts, the booking form's
  conditional fields, and data shapes — but it is a mock; this build supersedes its
  client-side store with the modules and seams above.
- Honor both ADRs:
  [0001 — WhatsApp via Baileys](../../docs/adr/0001-whatsapp-notifications-via-baileys.md)
  and
  [0002 — single Appointments table, no Patient entity](../../docs/adr/0002-single-appointments-table-no-patient-entity.md).
