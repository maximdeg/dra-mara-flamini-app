import type { ReactNode } from "react";
import { cn } from "./cn";
import styles from "./alert.module.css";

export type AlertVariant = "error" | "success" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
};

/** An inline message block (form rejections, validation, confirmations). */
export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div role="alert" className={cn(styles.alert, styles[variant], className)}>
      {children}
    </div>
  );
}
