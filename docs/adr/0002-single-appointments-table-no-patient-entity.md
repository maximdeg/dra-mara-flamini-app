# Single Appointments table, no Patient entity, a cap of open Appointments per phone

There is no Patient table and no login. Patient identification (first name, last name, phone number, and an optional email) is captured on the booking form and stored on each **Appointment**. A phone number may hold at most two **open** Appointments at a time (Scheduled with a date still in the future); once it holds two, the phone is free to book again when one of them is Cancelled or Completed (Completed being automatic once its date passes).

We chose this over a first-class, deduplicated Patient entity because the practice does not need cross-visit patient records in this tool, and a login-free flow where the Patient re-enters their details each booking is far simpler to build and operate.

## Consequences

- **No patient history.** "Show this patient's past visits" is impossible by design — Appointments from the same person are unrelated rows. Adding it later means introducing a real Patient entity.
- **Phone is the identity key.** The open-Appointments cap is enforced on the Appointments table at booking time, not via a uniqueness column on a Patient row. Family members sharing a phone share its cap.
- **Booking must enforce the rule.** Creating an Appointment must reject a phone that already holds the maximum open Appointments — a check that must exist server-side.

## Amendments

- **2026-10-02 — cap raised from one to two.** At the client's request a phone may now hold two open Appointments (for example a Consultation and a follow-up Practice). The cap is a single constant owned by Booking; "open" keeps its meaning.
- **2026-10-02 — email optional.** Also at the client's request, the Patient may leave the email blank; it is stored as `null`. Appointments booked earlier keep their email.
