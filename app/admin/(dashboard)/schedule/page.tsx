import { getBookingWindowLengthRepository } from "@/lib/availability/get-booking-window-length-repository";
import { getVisitDurationsRepository } from "@/lib/availability/get-visit-durations-repository";
import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { BookingWindowEditor } from "./booking-window-editor";
import { DurationsEditor } from "./durations-editor";
import { ScheduleEditor } from "./schedule-editor";
import styles from "./page.module.css";

// Reads the persisted Work Schedule, Visit Durations, and Booking Window length
// on every request.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  // Independent reads, so they run in parallel.
  const [schedule, durations, bookingWindowDays] = await Promise.all([
    getWorkScheduleRepository().then((r) => r.get()),
    getVisitDurationsRepository().then((r) => r.get()),
    getBookingWindowLengthRepository().then((r) => r.get()),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Horarios de atención</h1>
        <p className={styles.subtitle}>
          Marcá los días que atendés, sus rangos horarios y qué tipos de visita
          acepta cada rango. Reducir la agenda cuando hay turnos agendados
          requiere cancelarlos primero.
        </p>
      </header>
      <BookingWindowEditor initial={bookingWindowDays} />
      <DurationsEditor initial={durations} />
      <ScheduleEditor initial={schedule} />
    </div>
  );
}
