import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { ToastProvider } from "@/components/ui/toast";
import { SiteFooter } from "./_sections/site-footer";
import styles from "./layout.module.css";

/**
 * The public app shell: the warm gradient background, the site header, a
 * centered content column, and the brand footer. Wraps the patient-facing pages
 * (home, booking, confirmation), so the footer — and its legal links — appears
 * on every public page. The /admin dashboard has its own shell. The
 * ToastProvider here lets patient-facing client components surface feedback.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className={styles.shell}>
        <PublicHeader />
        <main className={styles.main}>{children}</main>
        <SiteFooter />
      </div>
    </ToastProvider>
  );
}
