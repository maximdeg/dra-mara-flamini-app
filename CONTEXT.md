# Maraflamini — Appointment Booking

A single-provider dermatology practice. Patients book appointments online with one Professional, who manages availability and appointments from a dashboard. Canonical terms are English; the Spanish term shown in the UI is noted in parentheses.

## Language

### People

**Patient** (UI: _Paciente_):
A person who books an appointment, identified by first name, last name, phone number, and email entered on the booking form. There is no separate Patient record and no login — the identification lives on the Appointment itself, and the Patient re-enters it for every booking, returning to the app only to cancel. A given phone number may hold only one **open** Appointment at a time — open meaning Scheduled with a date still in the future. The Patient cannot book again until that Appointment ends: either Cancelled, or Completed once its date passes.
_Avoid_: Client, User, Customer

**Professional** (UI: _Profesional_):
The single dermatologist who offers appointments and owns all availability and accepted coverage. There is exactly one per deployment.
_Avoid_: Provider, Proveedor, Doctor, User, Account, Admin
(_"Admin" / "dashboard" is the UI surface the Professional uses — not a separate person or role._)

### The appointment

**Appointment** (UI: _Cita_):
A scheduled meeting between a Patient and the Professional at a specific date and time. The central entity of the domain.
_Avoid_: Booking, Turno, Visit, Reservation
(_"Booking" is the **act** of creating an Appointment, not the Appointment itself._)

**Visit Type** (UI: _Tipo de Visita_):
What an Appointment is for — a Consultation or a Practice. Selecting it determines the required sub-type, which coverage options are offered, and whether a Deposit applies.
_Avoid_: Appointment type, Service

**Consultation** (UI: _Consulta_):
A Visit Type for examination or advice. Requires a Consult Type.

**Practice** (UI: _Práctica_, stored without the accent as `Practica`):
A Visit Type for a procedure. Requires a Practice Type.
_Avoid_: Procedure

**Consult Type** (UI: _Tipo de Consulta_):
The kind of Consultation: First Visit (_Primera vez_) or Follow-up (_Seguimiento_).

**Practice Type** (UI: _Tipo de Práctica_):
The kind of Practice: Cryosurgery (_Criocirugía_), Electrocoagulation (_Electrocoagulación_), or Biopsy (_Biopsia_).

**Status**:
The lifecycle state of an Appointment: Scheduled, Cancelled, or Completed. A new booking is Scheduled; it becomes **Completed automatically once its date has passed** (never set by hand), or **Cancelled** when the Patient or Professional cancels it. Because the system stores only Appointments — no Patient table — this status is also what gates re-booking for a phone number (see Patient).

### Coverage & payment

**Health Insurance** (UI: _Obra Social_):
A third-party insurer that covers part of an Appointment's cost. The Professional maintains the list of accepted insurers (Self-Pay is separate and not part of this list).
_Avoid_: Coverage, Insurer (as the canonical term), OS

**Self-Pay** (UI: _Particular_ / _Practica Particular_):
The out-of-pocket option a Patient picks when no Health Insurance applies — they pay the full fee themselves. A distinct, **system-defined** concept: its two variants are fixed and cannot be renamed or removed, so deposit and filtering logic can rely on them — though the Professional may edit each one's price. One variant per Visit Type: _Particular_ for a Consultation, _Practica Particular_ for a Practice. Offered in the same picker as Health Insurance, but not part of the Professional-editable insurer list.
_Avoid_: Private, Out-of-pocket

**Deposit** (UI: _Seña_):
An upfront payment a Patient commits to for **Self-Pay** Appointments only: every Self-Pay Practice, and a Self-Pay Consultation when it is a First Visit (never for Follow-ups, and never when a Health Insurance covers the visit). For a Self-Pay Practice the Deposit is the option's full price; for a Self-Pay First-Visit Consultation it is a separate, smaller amount the Professional sets. The platform captures only the Patient's **acknowledgment**; the actual transfer happens off-platform.
_Avoid_: Down payment, Booking fee

### Scheduling & availability

**Work Schedule** (UI: _Horarios_):
The Professional's recurring weekly availability — which weekdays are worked and the time ranges within each working day. Reducing availability — un-marking a working weekday, removing a time range, or adding an Unavailable Day — that collides with existing Scheduled Appointments requires the Professional to cancel those Appointments first; each cancellation sends a Cancellation Notice.
_Avoid_: Hours, Calendar

**Time Slot**:
A 20-minute bookable interval derived from the Work Schedule for a given day, minus times already taken by Scheduled Appointments.
_Avoid_: Slot time, Appointment slot

**Booking Window**:
The range of dates open for booking: from **tomorrow** (same-day booking is not allowed) up to 30 days ahead. Weekends, holidays, Unavailable Days, and days with no remaining Time Slots are excluded from it.
_Avoid_: Booking range, Availability window

**Unavailable Day** (UI: _Día no laborable_):
A specific calendar date the Professional has blocked, making it non-bookable even though it falls on a working weekday.
_Avoid_: Day off, Holiday, Blocked day
(_Weekends and fixed annual holidays — New Year, Christmas — are non-bookable separately; an Unavailable Day is a one-off the Professional sets._)

**Cancellation Window**:
The period before an Appointment in which a Patient may cancel it themselves — more than 24 hours before the start time. The Professional may cancel at any time, with no such restriction. (Because same-day booking is disallowed but next-morning booking is not, an Appointment booked within 24 hours of its slot cannot be self-cancelled at all — only the Professional can cancel it.)
_Avoid_: Cancellation policy, Grace period

### Notifications

**Notification**:
A message the system sends to the Patient about their Appointment, over both Channels (WhatsApp and Email). Two kinds: a Confirmation and a Cancellation Notice. Each kind is sent on both Channels, tracked independently so one can succeed while the other retries.
_Avoid_: Alert, SMS

**Channel**:
How a Notification reaches the Patient — **WhatsApp** (from the clinic's number via Baileys, ADR-0001) or **Email** (via Gmail/nodemailer). Every Notification goes out on both.
_Avoid_: Medium, Transport

**Confirmation** (UI: _Confirmación_):
The Notification sent to the Patient immediately after an Appointment is booked, confirming its date, time, and details, and carrying a link to cancel the Appointment. Sent on both Channels.
_Avoid_: Receipt, Reminder

**Cancellation Notice**:
The Notification sent to the Patient when an Appointment becomes Cancelled — regardless of whether the Patient or the Professional cancelled it. Sent on both Channels; unlike the Confirmation it carries no cancel link.
_Avoid_: (—)
