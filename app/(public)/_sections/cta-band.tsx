import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/icons";
import styles from "./cta-band.module.css";

/** The closing call-to-action band. */
export function CtaBand() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.title}>¿Listo para Cuidar tu Piel?</h2>
        <p className={styles.body}>
          Agenda tu cita hoy mismo y comienza tu camino hacia una piel más
          saludable y radiante.
        </p>
        <Button as={Link} href="/agendar-visita" className={styles.cta}>
          <CalendarIcon size={20} />
          Agendar visita
          <ArrowRightIcon size={18} />
        </Button>
      </div>
    </section>
  );
}
