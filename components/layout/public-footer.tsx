import Link from "next/link";
import styles from "./public-footer.module.css";

/**
 * The public site footer: the practice name and a discreet link to the
 * Professional's sign-in. Shared across the patient-facing pages, sitting at the
 * bottom of the public shell as the page's contentinfo landmark.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>Mara Flamini — Dermatología</p>
        <p className={styles.meta}>
          © {year} ·{" "}
          <Link href="/admin/sign-in" className={styles.adminLink}>
            Panel del profesional
          </Link>
        </p>
      </div>
    </footer>
  );
}
