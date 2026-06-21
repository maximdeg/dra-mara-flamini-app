"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";
import type { ProfileFormState } from "./types";

export function ProfileForm({
  email,
  name,
  phone,
  whatsappNumber,
}: {
  email: string;
  name: string;
  phone: string;
  whatsappNumber: string;
}) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {},
  );

  return (
    <form action={action} style={{ display: "grid", gap: "0.75rem", maxWidth: 380 }}>
      <p style={{ margin: 0 }}>Email: {email}</p>
      <label>
        Nombre
        <br />
        <input name="name" defaultValue={name} />
      </label>
      <label>
        Teléfono
        <br />
        <input name="phone" defaultValue={phone} />
      </label>
      <label>
        WhatsApp
        <br />
        <input name="whatsappNumber" defaultValue={whatsappNumber} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {state.ok ? <p>Guardado.</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
