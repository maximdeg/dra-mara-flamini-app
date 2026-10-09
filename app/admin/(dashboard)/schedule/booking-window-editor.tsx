"use client";

import { useState, useTransition } from "react";
import {
  BOOKING_WINDOW_LENGTH_LABELS,
  BOOKING_WINDOW_LENGTH_OPTIONS,
} from "@/lib/availability/booking-window-length";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { saveBookingWindowLengthAction } from "./actions";
import styles from "./schedule-editor.module.css";

/**
 * How far ahead Patients may book — the Booking Window length. The window
 * always opens tomorrow; changing its length only limits new bookings, so it
 * never collides with existing Appointments.
 */
export function BookingWindowEditor({ initial }: { initial: number }) {
  const toast = useToast();
  const [days, setDays] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveBookingWindowLengthAction(days);
      if (result.saved) {
        toast.success("Ventana de reservas guardada.");
      } else {
        toast.error(
          result.error ?? "No se pudo guardar la ventana de reservas.",
        );
      }
    });
  }

  return (
    <Card className={styles.durations}>
      <h2 className={styles.durationsTitle}>Ventana de reservas</h2>
      <p className={styles.durationsHint}>
        Los pacientes pueden reservar desde mañana hasta el plazo elegido. Los
        turnos ya agendados no se ven afectados.
      </p>
      <div className={styles.durationsGrid}>
        <label className={styles.durationRow}>
          <span>Reservas hasta</span>
          <select
            aria-label="Reservas hasta"
            className={styles.time}
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {BOOKING_WINDOW_LENGTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {BOOKING_WINDOW_LENGTH_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button onClick={save} busy={pending} className={styles.save}>
        {pending ? "Guardando…" : "Guardar ventana de reservas"}
      </Button>
    </Card>
  );
}
