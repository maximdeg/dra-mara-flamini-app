"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addUnavailableDayAction,
  cancelCollisionAction,
  removeUnavailableDayAction,
} from "./actions";
import type { AddDayState } from "./types";

export function UnavailableDaysManager({ days }: { days: string[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [state, setState] = useState<AddDayState>({});
  const [pending, startTransition] = useTransition();

  function add() {
    if (!date) return;
    startTransition(async () => {
      const result = await addUnavailableDayAction(date);
      setState(result);
      if (result.ok) {
        setDate("");
        router.refresh();
      }
    });
  }

  function remove(day: string) {
    startTransition(async () => {
      await removeUnavailableDayAction(day);
      router.refresh();
    });
  }

  function cancelCollision(id: string) {
    startTransition(async () => {
      const result = await cancelCollisionAction(id);
      if (result.ok) {
        setState((s) => ({
          ...s,
          collisions: (s.collisions ?? []).filter((c) => c.id !== id),
        }));
      }
    });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "1rem 0" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setState({});
          }}
        />
        <button type="button" onClick={add} disabled={pending || !date}>
          {pending ? "Agregando…" : "Agregar día no laborable"}
        </button>
      </div>

      {state.ok ? <p>Día agregado.</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}

      {state.collisions ? (
        state.collisions.length > 0 ? (
          <div role="alert" style={{ marginBottom: "1rem", border: "1px solid #d97706", borderRadius: 6, padding: "0.75rem" }}>
            <p style={{ marginTop: 0 }}>
              Ese día tiene turnos agendados. Cancelalos para poder bloquearlo
              (cada uno envía un aviso de cancelación).
            </p>
            <ul>
              {state.collisions.map((c) => (
                <li key={c.id} style={{ marginBottom: "0.4rem" }}>
                  {c.date} {c.time} · {c.patientName}{" "}
                  <button
                    type="button"
                    onClick={() => cancelCollision(c.id)}
                    disabled={pending}
                  >
                    Cancelar turno
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Conflictos resueltos. Volvé a agregar el día.</p>
        )
      ) : null}

      <h2>Días bloqueados</h2>
      {days.length === 0 ? (
        <p>No hay días no laborables cargados.</p>
      ) : (
        <ul>
          {days.map((day) => (
            <li key={day} style={{ marginBottom: "0.4rem" }}>
              {day}{" "}
              <button type="button" onClick={() => remove(day)} disabled={pending}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
