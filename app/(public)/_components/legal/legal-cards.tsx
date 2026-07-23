import type { ReactNode } from "react";
import styles from "./legal-page.module.css";

/**
 * A responsive grid of small cards. Used for the "your rights" summary on the
 * Privacy Policy, where each card names a right and describes it in a line.
 */
export function RightsGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

/** One card in a {@link RightsGrid}: a decorative icon, a title, and a line. */
export function RightCard({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.card}>
      {icon != null && (
        <span className={styles.cardIcon} aria-hidden>
          {icon}
        </span>
      )}
      <strong className={styles.cardTitle}>{title}</strong>
      <p className={styles.cardText}>{children}</p>
    </div>
  );
}

/**
 * The dark, brand-forest contact block that closes each legal page: an eyebrow,
 * a heading, an intro line, and a list of contact channels.
 */
export function ContactCard({
  eyebrow = "Contacto",
  title,
  intro,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.contact}>
      {eyebrow != null && (
        <span className={styles.contactEyebrow}>{eyebrow}</span>
      )}
      <h2 className={styles.contactTitle}>{title}</h2>
      {intro != null && <p className={styles.contactIntro}>{intro}</p>}
      <ul className={styles.contactList}>{children}</ul>
    </section>
  );
}
