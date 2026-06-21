"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { updateProfileAction } from "./actions";
import type { ProfileFormState } from "./types";
import styles from "./profile.module.css";

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
  const toast = useToast();
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Perfil guardado.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, toast]);

  return (
    <form action={action} className={styles.form}>
      <Field label="Email">
        <input defaultValue={email} disabled />
      </Field>
      <Field label="Nombre">
        <input name="name" defaultValue={name} />
      </Field>
      <Field label="Teléfono">
        <input name="phone" defaultValue={phone} />
      </Field>
      <Field label="WhatsApp">
        <input name="whatsappNumber" defaultValue={whatsappNumber} />
      </Field>
      <Button type="submit" busy={pending} className={styles.submit}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
