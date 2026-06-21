import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";
import styles from "./table.module.css";

/** A styled table. Wrapped so it scrolls horizontally on narrow viewports. */
export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className={styles.wrap}>
      <table className={cn(styles.table, className)} {...props} />
    </div>
  );
}

export function THead(props: ComponentPropsWithoutRef<"thead">) {
  return <thead className={styles.thead} {...props} />;
}

export function TBody(props: ComponentPropsWithoutRef<"tbody">) {
  return <tbody {...props} />;
}

export function TR({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn(styles.tr, className)} {...props} />;
}

export function TH({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return <th className={cn(styles.th, className)} {...props} />;
}

export function TD({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td className={cn(styles.td, className)} {...props} />;
}
