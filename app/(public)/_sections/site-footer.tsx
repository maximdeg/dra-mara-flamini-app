import styles from "./site-footer.module.css";

/** A tasteful minimal brand footer for the public site. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>Mara Flamini · Dermatología</p>
        <p className={styles.fine}>© {year} · Todos los derechos reservados</p>
      </div>
    </footer>
  );
}
