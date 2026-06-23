import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, HomeIcon } from "@/components/ui/icons";
import styles from "./appointment-actions.module.css";

/** Post-confirmation navigation: book another Appointment or return home. */
export function AppointmentActions() {
  return (
    <div className={styles.actions}>
      <Button as={Link} href="/agendar-visita" variant="primary">
        <CalendarIcon size={18} />
        Agendar otra cita
      </Button>
      <Button as={Link} href="/" variant="secondary">
        <HomeIcon size={18} />
        Volver al inicio
      </Button>
    </div>
  );
}
