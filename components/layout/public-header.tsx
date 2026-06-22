import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/components/ui/icons";
import styles from "./public-header.module.css";

/**
 * The public site header: a logo mark + the Professional's name and tagline
 * linking home, and an "Agendar visita" CTA into the booking flow. Shared across
 * the patient-facing pages (home, booking, cita).
 */
export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Mara Flamini — inicio">
          <span className={styles.mark} aria-hidden="true">
            M
          </span>
          <span className={styles.identity}>
            <span className={styles.name}>Mara Flamini</span>
            <span className={styles.tagline}>Dermatóloga</span>
          </span>
        </Link>
        <Button
          as={Link}
          href="/agendar-visita"
          variant="gradient"
          className={styles.cta}
        >
          <CalendarIcon size={18} />
          Agendar visita
        </Button>
      </div>
    </header>
  );
}
