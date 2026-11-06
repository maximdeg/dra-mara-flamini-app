# Manual Appointments, and Plasma as an admin-only Practice Type

The Professional arranges visits by phone, in person or over WhatsApp, often outside the Work Schedule, and some are for Plasma, which Patients can't book online. We added **Manual Booking**, a sibling of online Booking rather than a mode flag on it. It writes ordinary Scheduled Appointments flagged `origin: "manual"`, so Turnos, Calendario, Reminders and cancellation need no changes, and online Time Slots step around them through the existing one-agenda rule. Its only external guard is that it never overlaps a Scheduled Appointment.

- **Admin-only Practice Types are not Visit Kinds.** Appointments may hold the wider set: the bookable Practice Types plus the admin-only ones, Plasma, Peeling, Skin Booster and Toxina Botulínica (the Aesthetic Treatments). Visit Kinds, and with them Visit Durations, Work Schedule tags, the public form and the availability API, stay on the bookable set. We rejected making them full Visit Kinds because they would appear to Patients.
- **The Horarios guard skips manual Appointments.** A Manual Appointment was placed regardless of the schedule, often outside it. Under the cancel-first rule, one at 20:00 or on a Saturday would otherwise block every later schedule edit. The Unavailable Day guard still includes them, since blocking the day really would strand the Patient.
- **"Otro" is its own coverage variant** (`kind: "other"`), never valid online even under an accepted insurer's name, with no Coverage Instructions or Deposit.

## Consequences

- Online Booking is no longer the only writer of Appointments, but it is still the only one that enforces the Booking Window, Time Slots, phone cap and Deposit.
- Every switch on coverage or Practice Type must handle `other` and the admin-only Practice Types.
- A past-dated Manual Appointment reads as Completed at once, through the derived Status, and sends nothing.
