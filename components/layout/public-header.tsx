import Link from "next/link";
import styles from "./public-header.module.css";

/** The public site header: brand wordmark linking home, with the practice tagline. */
export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Maraflamini
        </Link>
        <span className={styles.tagline}>Consultorio de dermatología</span>
      </div>
    </header>
  );
}
