"use client";

import { useState, useTransition } from "react";
import { VISIT_KIND_LABELS, VISIT_KINDS } from "@/lib/appointments/visit-kind";
import {
  DURATION_OPTIONS,
  type VisitDurations,
} from "@/lib/availability/visit-durations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { saveVisitDurationsAction } from "./actions";
import styles from "./schedule-editor.module.css";

/**
 * How long each Visit Kind takes. Availability only offers a start where the
 * whole Appointment fits; each Appointment keeps the duration it was booked
 * with, so editing here never moves or collides with existing Appointments.
 */
export function DurationsEditor({ initial }: { initial: VisitDurations }) {
  const toast = useToast();
  const [durations, setDurations] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveVisitDurationsAction(durations);
      if (result.saved) {
        toast.success("Duraciones guardadas.");
      } else {
        toast.error(result.error ?? "No se pudieron guardar las duraciones.");
      }
    });
  }

  return (
    <Card className={styles.durations}>
      <h2 className={styles.durationsTitle}>Duración de cada tipo de visita</h2>
      <p className={styles.durationsHint}>
        Los turnos ya agendados conservan la duración con la que se reservaron.
      </p>
      <div className={styles.durationsGrid}>
        {VISIT_KINDS.map((kind) => (
          <label key={kind} className={styles.durationRow}>
            <span>{VISIT_KIND_LABELS[kind]}</span>
            <select
              aria-label={VISIT_KIND_LABELS[kind]}
              className={styles.time}
              value={String(durations[kind])}
              onChange={(e) =>
                setDurations((d) => ({ ...d, [kind]: Number(e.target.value) }))
              }
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <Button onClick={save} busy={pending} className={styles.save}>
        {pending ? "Guardando…" : "Guardar duraciones"}
      </Button>
    </Card>
  );
}
