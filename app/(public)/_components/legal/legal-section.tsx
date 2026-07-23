import type { ReactNode } from "react";
import styles from "./legal-page.module.css";

/**
 * A numbered section within a legal page: a small brand badge with the section
 * number sits beside the heading, over a hairline divider, followed by the
 * section body. Consumers pass the running number so the sequence stays
 * explicit at the call site.
 */
export function LegalSection({
  number,
  title,
  children,
}: {
  number: number;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionNum} aria-hidden>
          {number}
        </span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
