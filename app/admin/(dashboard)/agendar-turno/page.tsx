import { getVisitDurationsRepository } from "@/lib/availability/get-visit-durations-repository";
import { toPublicHealthInsurance } from "@/lib/coverage/coverage";
import { getHealthInsuranceRepository } from "@/lib/coverage/get-health-insurance-repository";
import { ManualBookingForm } from "./manual-booking-form";
import styles from "./page.module.css";

// Reads the accepted coverage and Visit Durations on every request.
export const dynamic = "force-dynamic";

export default async function ManualBookingPage() {
  const [insurances, durations] = await Promise.all([
    getHealthInsuranceRepository().then((r) => r.list()),
    getVisitDurationsRepository().then((r) => r.get()),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Agendar turno</h1>
        <p className={styles.subtitle}>
          Cargá un turno a mano, en cualquier fecha y hora. Aparece en Turnos y
          en el Calendario, y ese horario deja de estar disponible para los
          pacientes.
        </p>
      </header>
      <ManualBookingForm
        insurances={insurances.map(toPublicHealthInsurance)}
        durations={durations}
      />
    </div>
  );
}
