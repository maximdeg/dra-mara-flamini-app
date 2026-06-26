"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { requestPasswordResetAction } from "./actions";
import type { RequestResetState } from "./types";
import styles from "../auth-card.module.css";

// Step 1 of password recovery: the Professional enters their email. The response
// is the same neutral confirmation whether or not the email matches an account,
// so the page never reveals whether one exists. Unprotected (see lib/auth/guard)
// so a locked-out Professional can reach it.
export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<RequestResetState, FormData>(
    requestPasswordResetAction,
    {},
  );

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <header className={styles.header}>
          <span className={styles.brand}>Dra. Mara Flamini</span>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.subtitle}>
            Te enviaremos un enlace para restablecerla.
          </p>
        </header>

        {state.ok ? (
          <p className={styles.message}>
            Si el email corresponde a una cuenta, te enviamos un enlace para
            restablecer la contraseña. Revisá tu casilla (y el spam).
          </p>
        ) : (
          <form action={action} className={styles.form}>
            <Field label="Email" required>
              <input type="email" name="email" required autoComplete="email" />
            </Field>
            {state.error ? <Alert variant="error">{state.error}</Alert> : null}
            <Button type="submit" busy={pending} className={styles.submit}>
              {pending ? "Enviando…" : "Enviar enlace"}
            </Button>
          </form>
        )}

        <p className={styles.back}>
          <Link href="/admin/sign-in">Volver a Ingresar</Link>
        </p>
      </Card>
    </div>
  );
}
