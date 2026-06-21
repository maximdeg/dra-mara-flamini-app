import { getUnavailableDaysRepository } from "@/lib/availability/get-unavailable-days-repository";
import { UnavailableDaysManager } from "./unavailable-days-manager";
import styles from "./page.module.css";

// Reads the persisted Unavailable Days on every request.
export const dynamic = "force-dynamic";

export default async function UnavailableDaysPage() {
  const repository = await getUnavailableDaysRepository();
  const days = await repository.list();

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Días no laborables</h1>
        <p className={styles.subtitle}>
          Bloqueá fechas puntuales aunque caigan en un día que atendés. Bloquear
          un día con turnos agendados requiere cancelarlos primero.
        </p>
      </header>
      <UnavailableDaysManager days={days} />
    </div>
  );
}
