import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/components/ui/icons";
import styles from "./public-header.module.css";

/**
 * The public site header, shared across the patient-facing pages (home,
 * booking, confirmation): a gradient medallion monogram + the practice
 * identity linking home, and an "Agendar visita" call to action.
 */
export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.medallion} aria-hidden>
            M
          </span>
          <span className={styles.identity}>
            <span className={styles.name}>Mara Flamini</span>
            <span className={styles.role}>Dermatóloga</span>
          </span>
        </Link>
        <Button as={Link} href="/agendar-visita" className={styles.cta}>
          <CalendarIcon size={18} />
          Agendar visita
        </Button>
      </div>
    </header>
  );
}
