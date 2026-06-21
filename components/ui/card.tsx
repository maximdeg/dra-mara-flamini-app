import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";
import styles from "./card.module.css";

/** A surface container for sections and forms. */
export function Card({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn(styles.card, className)} {...rest}>
      {children}
    </div>
  );
}
