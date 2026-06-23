import type { ReactNode } from "react";
import { cn } from "./cn";
import styles from "./callout.module.css";

export type CalloutTone = "info" | "success" | "warning" | "danger";

/**
 * A left-border emphasis box for an informational note. The `tone` maps to the
 * app's design tokens (info → brand, success, warning → amber, danger → error);
 * `data-tone` exposes it for tests without coupling to class names. The optional
 * `icon` is decorative; `title` renders as the callout's heading.
 */
export function Callout({
  tone = "info",
  icon,
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(styles.callout, styles[tone], className)}
      data-tone={tone}
    >
      {title != null && (
        <h3 className={styles.title}>
          {icon != null && (
            <span className={styles.icon} aria-hidden>
              {icon}
            </span>
          )}
          {title}
        </h3>
      )}
      {children != null && <div className={styles.body}>{children}</div>}
    </section>
  );
}
