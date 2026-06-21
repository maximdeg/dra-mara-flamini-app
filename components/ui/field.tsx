import type { ReactNode } from "react";
import { cn } from "./cn";
import styles from "./field.module.css";

type FieldProps = {
  /** The visible label text. */
  label: ReactNode;
  /** The control — a native input, select, or similar. */
  children: ReactNode;
  /** Marks the field visually as required. */
  required?: boolean;
  /** Helper text shown below the control when there is no error. */
  hint?: ReactNode;
  /** Error message shown below the control; announced to assistive tech. */
  error?: string | null;
  className?: string;
};

/**
 * A labelled form control. The label wraps the control, so the association is
 * implicit (clicking the label focuses the control, and the control takes the
 * label as its accessible name). Errors render in an alert region so screen
 * readers announce them as they appear.
 */
export function Field({
  label,
  children,
  required = false,
  hint,
  error,
  className,
}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label}>
        <span className={styles.labelText}>
          {label}
          {required ? (
            <span aria-hidden="true" className={styles.required}>
              {" *"}
            </span>
          ) : null}
        </span>
        {children}
      </label>
      {hint && !error ? <p className={styles.hint}>{hint}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
