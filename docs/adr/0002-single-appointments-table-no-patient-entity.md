# Single Appointments table, no Patient entity, one open Appointment per phone

There is no Patient table and no login. Patient identification (first name, last name, phone number, email) is captured on the booking form and stored on each **Appointment**. A phone number may hold only one **open** Appointment at a time (Scheduled with a date still in the future); the phone is free to book again once that Appointment is Cancelled or Completed (Completed being automatic once its date passes).

We chose this over a first-class, deduplicated Patient entity because the practice does not need cross-visit patient records in this tool, and a login-free flow where the Patient re-enters their details each booking is far simpler to build and operate.

## Consequences

- **No patient history.** "Show this patient's past visits" is impossible by design — Appointments from the same person are unrelated rows. Adding it later means introducing a real Patient entity.
- **Phone is the identity key.** The "one open Appointment" rule is enforced on the Appointments table at booking time, not via a uniqueness column on a Patient row. Family members sharing a phone cannot both hold an open Appointment at once.
- **Booking must enforce the rule.** Creating an Appointment must reject a phone that already has an open one — a check that must exist server-side.
