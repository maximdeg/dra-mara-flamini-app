import { STATUS_LABELS, type DerivedStatus } from "@/lib/appointments/status";
import { cn } from "./cn";
import styles from "./status-badge.module.css";

/**
 * A colored badge for an Appointment's derived Status. The label comes from the
 * domain's single STATUS_LABELS source, so the badge can never drift from it.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: DerivedStatus;
  className?: string;
}) {
  return (
    <span className={cn(styles.badge, styles[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
