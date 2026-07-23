import Image from "next/image";
import Link from "next/link";
import styles from "./site-footer.module.css";

/** A tasteful minimal brand footer for the public site. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Image
          src="/logos/footer-logo.png"
          alt="Dra. Mara Flamini · Dermatología y Estética"
          width={160}
          height={160}
          className={styles.logo}
        />
        <p className={styles.brand}>Dra. Mara Flamini · Dermatología</p>
        <nav className={styles.links} aria-label="Enlaces legales">
          <Link href="/politica-de-privacidad">Política de Privacidad</Link>
          <Link href="/terminos-y-condiciones">Términos y Condiciones</Link>
        </nav>
        <p className={styles.fine}>© {year} · Todos los derechos reservados</p>
      </div>
    </footer>
  );
}
