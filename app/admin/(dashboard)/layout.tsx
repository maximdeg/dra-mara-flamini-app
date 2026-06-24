import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/ui/toast";
import { AdminNav } from "./admin-nav";
import styles from "./layout.module.css";

// The authenticated dashboard shell. Reaching it at all means the middleware let
// the request through (the Professional is signed in). It owns the navigation,
// the signed-in identity, and sign-out for every /admin section. The sign-in
// page lives outside this group, so it never shows this chrome.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <ToastProvider>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <span className={styles.brand}>Dra. Mara Flamini</span>
            <span className={styles.brandSub}>Panel</span>
          </div>

          <AdminNav />
        </aside>

        <main className={styles.main}>{children}</main>

        {/* The signed-in identity + sign-out. Its own grid cell so it sits at the
            bottom of the sidebar column on desktop, and at the bottom of the page
            on mobile (where the sidebar collapses to a top bar). */}
        <div className={styles.account}>
          {session?.user?.email ? (
            <span className={styles.email}>{session.user.email}</span>
          ) : null}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/sign-in" });
            }}
          >
            <Button type="submit" variant="ghost" className={styles.signOut}>
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>
    </ToastProvider>
  );
}
