"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import type { PasswordFormState } from "./types";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={action} style={{ display: "grid", gap: "0.75rem", maxWidth: 380 }}>
      <label>
        Contraseña actual
        <br />
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        Nueva contraseña
        <br />
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          required
        />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Cambiando…" : "Cambiar contraseña"}
      </button>
      {state.ok ? <p>Contraseña actualizada.</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
