"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { resetPasswordAction } from "./actions";
import type { ResetPasswordState } from "./types";
import styles from "../auth-card.module.css";

/** The new-password form. The token from the emailed link rides along as a hidden field. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    {},
  );

  if (state.ok) {
    return (
      <>
        <p className={styles.message}>
          Tu contraseña se actualizó. Ya podés ingresar con la nueva.
        </p>
        <p className={styles.back}>
          <Link href="/admin/sign-in">Ir a Ingresar</Link>
        </p>
      </>
    );
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="token" value={token} />
      <Field label="Nueva contraseña" required>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      <Button type="submit" busy={pending} className={styles.submit}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
