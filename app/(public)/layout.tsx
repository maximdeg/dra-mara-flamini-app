import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { ToastProvider } from "@/components/ui/toast";
import styles from "./layout.module.css";

/**
 * The public app shell: the warm gradient background, the site header, and a
 * centered content column. Wraps the patient-facing pages (home, booking,
 * confirmation). The /admin dashboard has its own shell. The ToastProvider here
 * lets patient-facing client components surface feedback.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className={styles.shell}>
        <PublicHeader />
        <main className={styles.main}>{children}</main>
      </div>
    </ToastProvider>
  );
}
