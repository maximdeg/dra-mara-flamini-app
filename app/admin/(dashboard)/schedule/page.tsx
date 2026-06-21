import { getWorkScheduleRepository } from "@/lib/availability/get-work-schedule-repository";
import { ScheduleEditor } from "./schedule-editor";
import styles from "./page.module.css";

// Reads the persisted Work Schedule on every request.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const repository = await getWorkScheduleRepository();
  const schedule = await repository.get();

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Horarios de atención</h1>
        <p className={styles.subtitle}>
          Marcá los días que atendés y sus rangos horarios. Reducir la agenda
          cuando hay turnos agendados requiere cancelarlos primero.
        </p>
      </header>
      <ScheduleEditor initial={schedule} />
    </div>
  );
}
