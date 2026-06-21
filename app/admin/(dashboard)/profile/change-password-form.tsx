"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { changePasswordAction } from "./actions";
import type { PasswordFormState } from "./types";
import styles from "./profile.module.css";

export function ChangePasswordForm() {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(
    changePasswordAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Contraseña actualizada.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={action} className={styles.form}>
      <Field label="Contraseña actual" required>
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="Nueva contraseña" required>
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          required
        />
      </Field>
      <Button type="submit" busy={pending} className={styles.submit}>
        {pending ? "Cambiando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
