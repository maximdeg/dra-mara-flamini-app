# Availability per Visit Kind, on a 10-minute grid

The Professional needs different kinds of visit at different times, and of different lengths: First Visits on Monday mornings, Biopsias on Wednesday afternoons, a Biopsia taking longer than a Follow-up. We model this as **one Work Schedule whose ranges are tagged with the Visit Kinds they accept**, plus a **Visit Duration** per kind, on a **10-minute grid of start times**.

- **Tagged ranges, not a schedule per kind.** Each range lists its accepted Visit Kinds; an untagged range (everything saved before this) accepts all, so no migration was needed. We rejected one schedule per kind: with one Professional there is one agenda, and parallel schedules make overlaps easy to create and the week hard to read at a glance.
- **10-minute grid, every start that fits.** A start is offered every 10 minutes wherever the whole Appointment — start to start plus its kind's duration — fits inside **one** range that accepts the kind, without overlapping any Scheduled Appointment. Touching ranges never combine: a range's end is a hard stop. This packs the agenda tightly around existing bookings. Edited range ends must sit on 10-minute boundaries; ranges stored off-grid before this keep working, stepping from their own start.
- **One shared agenda.** A booked Appointment blocks its whole interval for every kind — there is only one Professional.
- **Duration copied at booking.** An Appointment stores the duration it was booked with; ones booked before durations existed count as 20 minutes. Editing a duration therefore never moves or collides with existing Appointments — it only changes which future starts fit.

## Consequences

- **Start times changed for Patients even before any edit.** Moving from fixed 20-minute slots (:00/:20/:40) to a 10-minute grid means starts like 09:10 appear as soon as this shipped, with every duration still at 20.
- **The availability endpoints need the kind.** `GET /api/availability` and `GET /api/available-times/[date]` take a required `?kind=`; the duration is resolved server-side, never trusted from the client. The booking form loads dates only once the kind is complete.
- **Reducing availability keeps the cancel-first rule** (ADR-0002's collision guard), now on whole intervals and kinds: unticking a kind from a range, or shortening a range so a booked Appointment would overrun, collides until those Appointments are cancelled.
- **Not modelled:** per-date overrides beyond whole-day Unavailable Days, Appointments spanning touching ranges, and buffers between Appointments.
