import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";
import styles from "../auth-card.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v ?? "";
}

// Step 2 of password recovery, opened from the emailed link. Reads the token
// from the query and hands it to the client form. Unprotected (see
// lib/auth/guard) so a locked-out Professional can reach it.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const token = one((await searchParams).token);

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <header className={styles.header}>
          <span className={styles.brand}>Dra. Mara Flamini</span>
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Elegí una contraseña para tu panel.</p>
        </header>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <>
            <p className={styles.message}>
              El enlace está incompleto. Pedí uno nuevo desde la página de
              recuperación.
            </p>
            <p className={styles.back}>
              <Link href="/admin/forgot-password">Recuperar contraseña</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
