import styles from "./loading.module.css";

// Shown automatically (via the App Router Suspense boundary) while a Panel
// section loads its data, so clicking a section always gives immediate feedback
// instead of a frozen screen. Every /admin section is a dynamic server read;
// this skeleton stands in until that read lands.
export default function AdminSectionLoading() {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.srOnly}>Cargando…</span>
      <div className={styles.title} />
      <div className={styles.card}>
        <div className={styles.row} />
        <div className={styles.row} />
        <div className={styles.row} />
      </div>
    </div>
  );
}
