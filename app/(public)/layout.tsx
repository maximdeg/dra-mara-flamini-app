import type { ReactNode } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
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
      {/* Marks JS as available before paint, so the scroll-reveal animations
          (components/ui/reveal) only ever hide content when JS can reveal it —
          a no-JS visitor sees everything. */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('js')",
        }}
      />
      <div className={styles.shell}>
        <PublicHeader />
        <main className={styles.main}>{children}</main>
        <PublicFooter />
      </div>
    </ToastProvider>
  );
}
