"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import {
  consultTypeOptions,
  EMPTY_FIELDS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  OTHER_COVERAGE,
  practiceTypeOptions,
  toManualBookingForm,
  withDuration,
  withSubType,
  withVisitType,
  type ManualFields,
} from "@/lib/appointments/manual-booking-fields";
import {
  VISIT_TYPE_LABELS,
  VISIT_TYPES,
  type VisitType,
} from "@/lib/appointments/visit-type";
import {
  DURATION_OPTIONS,
  type VisitDurations,
} from "@/lib/availability/visit-durations";
import {
  coverageOptionsFor,
  type PublicHealthInsurance,
} from "@/lib/coverage/coverage";
import { formatDateAR } from "@/lib/datetime/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { bookManuallyAction } from "./actions";
import { MANUAL_BOOKING_ERRORS } from "./types";
import styles from "./manual-booking-form.module.css";

/**
 * The manual scheduler: the Professional enters an Appointment at any date and
 * time. It still never overlaps another Scheduled Appointment, and once saved
 * its time is gone from the public booking form.
 */
export function ManualBookingForm({
  insurances,
  durations,
}: {
  insurances: PublicHealthInsurance[];
  durations: VisitDurations;
}) {
  const toast = useToast();
  const [fields, setFields] = useState<ManualFields>(EMPTY_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set(patch: Partial<ManualFields>) {
    setFields((current) => ({ ...current, ...patch }));
    setError(null);
  }

  const subTypeOptions =
    fields.visitType === "Consultation"
      ? consultTypeOptions()
      : fields.visitType === "Practice"
        ? practiceTypeOptions()
        : [];
  const coverageOptions = fields.visitType
    ? coverageOptionsFor(fields.visitType, insurances)
    : [];

  function submit(event: FormEvent) {
    event.preventDefault();
    const form = toManualBookingForm(fields);
    if (!form) {
      setError("Completá el tipo de visita, su tipo y la obra social.");
      return;
    }
    startTransition(async () => {
      const result = await bookManuallyAction(form);
      if (!result.ok) {
        setError(MANUAL_BOOKING_ERRORS[result.rejection]);
        return;
      }
      setFields(EMPTY_FIELDS);
      setError(null);
      toast.success(
        <span>
          Turno agendado para el {formatDateAR(result.date)}.{" "}
          <Link
            href={`/admin/appointments?from=${result.date}&to=${result.date}`}
          >
            Ver en Turnos
          </Link>
        </span>,
      );
    });
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={submit} noValidate>
        <section>
          <h2 className={styles.sectionTitle}>Paciente</h2>
          <div className={styles.grid}>
            <Field label="Nombre" required>
              <input
                value={fields.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
                autoComplete="off"
              />
            </Field>
            <Field label="Apellido" required>
              <input
                value={fields.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
                autoComplete="off"
              />
            </Field>
            <Field
              label="Teléfono (opcional)"
              hint="Con código de área, sin 0 ni 15. Sin teléfono no se envía WhatsApp."
            >
              <input
                type="tel"
                inputMode="tel"
                value={fields.phone}
                onChange={(e) => set({ phone: e.target.value })}
                autoComplete="off"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Visita</h2>
          <div className={styles.grid}>
            <Field label="Tipo de visita" required>
              <select
                value={fields.visitType}
                onChange={(e) => {
                  setFields((f) =>
                    withVisitType(f, e.target.value as VisitType | "", durations),
                  );
                  setError(null);
                }}
              >
                <option value="">Elegí…</option>
                {VISIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {VISIT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
            {fields.visitType ? (
              <Field
                label={
                  fields.visitType === "Consultation"
                    ? "Tipo de consulta"
                    : "Tipo de práctica"
                }
                required
              >
                <select
                  value={fields.subType}
                  onChange={(e) => {
                    setFields((f) =>
                      withSubType(
                        f,
                        e.target.value as ManualFields["subType"],
                        durations,
                      ),
                    );
                    setError(null);
                  }}
                >
                  <option value="">Elegí…</option>
                  {subTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            {fields.visitType ? (
              <Field label="Obra social" required>
                <select
                  value={fields.coverage}
                  onChange={(e) => set({ coverage: e.target.value })}
                >
                  <option value="">Elegí…</option>
                  {coverageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value={OTHER_COVERAGE}>Otro</option>
                </select>
              </Field>
            ) : null}
            {fields.coverage === OTHER_COVERAGE ? (
              <Field label="¿Cuál?" required>
                <input
                  value={fields.otherCoverageName}
                  onChange={(e) => set({ otherCoverageName: e.target.value })}
                  maxLength={60}
                  autoComplete="off"
                />
              </Field>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Fecha y hora</h2>
          <div className={styles.grid}>
            <Field label="Fecha" required>
              <input
                type="date"
                lang="es-AR"
                value={fields.date}
                onChange={(e) => set({ date: e.target.value })}
              />
            </Field>
            <div className={styles.time}>
              <Field label="Hora" required>
                <select
                  value={fields.hour}
                  onChange={(e) => set({ hour: e.target.value })}
                >
                  <option value="">--</option>
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </Field>
              <span className={styles.timeSeparator} aria-hidden="true">
                :
              </span>
              <Field label="Minutos" required>
                <select
                  value={fields.minute}
                  onChange={(e) => set({ minute: e.target.value })}
                >
                  {MINUTE_OPTIONS.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Duración" required>
              <select
                value={fields.durationMinutes}
                onChange={(e) => {
                  setFields((f) => withDuration(f, Number(e.target.value)));
                  setError(null);
                }}
              >
                {DURATION_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className={styles.hint}>
            Podés elegir cualquier fecha y hora, también fuera de los horarios
            de atención. Ese horario queda reservado y nadie más puede sacar
            turno en él.
          </p>
        </section>

        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={fields.whatsappConsent}
            onChange={(e) => set({ whatsappConsent: e.target.checked })}
          />
          <span>
            El paciente acepta recibir la confirmación y el recordatorio por
            WhatsApp.
          </span>
        </label>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" busy={pending}>
            {pending ? "Agendando…" : "Agendar turno"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
