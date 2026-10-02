"use client";

import { useState } from "react";
import { MAX_INSTRUCTIONS_LENGTH } from "@/lib/coverage/coverage";
import { Field } from "@/components/ui/field";

/**
 * The "Indicaciones para el paciente" input shared by every coverage. Unlike
 * Notas it is Patient-facing, so the hint says where it shows up, and a live
 * counter makes the one-line, MAX_INSTRUCTIONS_LENGTH limit visible (the
 * server sanitizes regardless).
 */
export function InstructionsField({
  label = "Indicaciones para el paciente",
  name = "instructions",
  defaultValue = "",
  className,
}: {
  label?: string;
  name?: string;
  defaultValue?: string;
  className?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);

  return (
    <Field
      label={label}
      className={className}
      hint={`Se muestran al paciente en el WhatsApp de confirmación y en su cita (las Notas no). ${length}/${MAX_INSTRUCTIONS_LENGTH}`}
    >
      <input
        name={name}
        defaultValue={defaultValue}
        maxLength={MAX_INSTRUCTIONS_LENGTH}
        onChange={(e) => setLength(e.target.value.length)}
      />
    </Field>
  );
}
