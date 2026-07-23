import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/components/ui/icons";
import styles from "./public-header.module.css";

/**
 * The public site header, shared across the patient-facing pages (home,
 * booking, confirmation): the brand logo mark + the practice identity linking
 * home, and an "Agendar visita" call to action.
 */
export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logos/mark-icon.png"
            alt="Dra. Mara Flamini"
            width={40}
            height={40}
            className={styles.medallion}
            priority
          />
          <span className={styles.identity}>
            <span className={styles.name}>Dra. Mara Flamini</span>
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
