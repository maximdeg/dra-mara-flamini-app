import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import styles from "./layout.module.css";

/**
 * The public app shell: the warm gradient background, the site header, and a
 * centered content column. Wraps the patient-facing pages (home, booking,
 * confirmation). The /admin dashboard has its own shell.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <PublicHeader />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
