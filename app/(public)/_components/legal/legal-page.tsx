import type { ReactNode } from "react";
import styles from "./legal-page.module.css";

/** A labelled key/value shown in the meta bar at the top of a legal page. */
export type LegalMetaItem = { label: string; value: ReactNode };

/**
 * The shared shell for a legal document page: a brand header band with an
 * eyebrow + title + lead, an optional meta bar of key/value facts, and a
 * centered content column for the sections. Both the Privacy Policy and the
 * Terms & Conditions pages compose their content inside this shell so the two
 * stay visually consistent.
 */
export function LegalPage({
  eyebrow = "Documento legal",
  title,
  lead,
  meta,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  meta?: LegalMetaItem[];
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.band}>
        <div className={styles.bandInner}>
          {eyebrow != null && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.title}>{title}</h1>
          {lead != null && <p className={styles.lead}>{lead}</p>}
        </div>
      </header>

      <div className={styles.body}>
        {meta != null && meta.length > 0 && (
          <dl className={styles.meta}>
            {meta.map((item) => (
              <div key={String(item.label)} className={styles.metaItem}>
                <dt className={styles.metaLabel}>{item.label}</dt>
                <dd className={styles.metaValue}>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className={styles.sections}>{children}</div>
      </div>
    </div>
  );
}
