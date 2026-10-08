# Back-to-back starts, stepped by the Visit Duration

**Supersedes the start-time rule of [ADR-0004](0004-availability-per-visit-kind-on-a-10-minute-grid.md).** Tagged ranges, one shared agenda, and copying the duration at booking still hold.

On the 10-minute grid, a 20-minute Electrocoagulación in a 13:40–14:20 range was offered at 13:40, 13:50 and 14:00. Patients saw overlapping times. One booking at 13:50 then blocked both neighbours and cut the range to a single Appointment. The Professional expects her agenda to fill one Appointment after another.

- **Starts step by the kind's Visit Duration** from the range's own start: 13:40, 14:00, … for 20 minutes; 09:00, 09:30, … for 30. The whole Appointment must still fit inside **one** accepting range. Touching ranges never combine.
- **A booked Appointment is stepped around, not skipped over on the grid.** When a start would overlap a Scheduled Appointment (of any kind), the next start is where that booking ends. So a 20-minute kind after a 30-minute Biopsia booked at 09:00 starts at 09:30, with no gap. This also covers Appointments booked on the old 10-minute grid.

## Consequences

- **Fewer, non-overlapping times for Patients.** With every duration at 20, starts go back to :00/:20/:40-style steps from each range's start.
- **Range ends stay on 10-minute boundaries.** Durations are multiples of 10, so the Horarios editor's 10-minute rule is kept. A range whose length isn't a multiple of the duration leaves its remainder unused (a 13:40–14:30 range fits 13:40 and 14:00 for 20 minutes).
- **Mixed-length kinds in one range can leave a short gap**, when a short kind is booked where a longer one would have fit. We accept this rather than search for an optimal packing.
