"use client";

import { useState, useTransition } from "react";
import {
  WEEKDAYS_IN_ORDER,
  WEEKDAY_LABELS,
  type Weekday,
  type WorkdaySchedule,
  type WorkSchedule,
} from "@/lib/availability/work-schedule";
import { cancelCollisionAction, saveScheduleAction } from "./actions";
import type { SaveScheduleState } from "./types";

/** Always present the schedule as one ordered entry per weekday. */
function normalize(initial: WorkSchedule): WorkSchedule {
  return WEEKDAYS_IN_ORDER.map(
    (weekday): WorkdaySchedule =>
      initial.find((d) => d.weekday === weekday) ?? {
        weekday,
        isWorkingDay: false,
        ranges: [],
      },
  );
}

export function ScheduleEditor({ initial }: { initial: WorkSchedule }) {
  const [schedule, setSchedule] = useState<WorkSchedule>(() =>
    normalize(initial),
  );
  const [state, setState] = useState<SaveScheduleState>({});
  const [pending, startTransition] = useTransition();

  function edit(updater: (schedule: WorkSchedule) => WorkSchedule) {
    setSchedule(updater);
    setState({}); // editing invalidates any prior result
  }

  function patchDay(weekday: Weekday, patch: Partial<WorkdaySchedule>) {
    edit((s) =>
      s.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    );
  }

  function setRange(
    weekday: Weekday,
    index: number,
    field: "start" | "end",
    value: string,
  ) {
    edit((s) =>
      s.map((d) =>
        d.weekday === weekday
          ? {
              ...d,
              ranges: d.ranges.map((r, i) =>
                i === index ? { ...r, [field]: value } : r,
              ),
            }
          : d,
      ),
    );
  }

  function save() {
    startTransition(async () => {
      setState(await saveScheduleAction(schedule));
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
      {schedule.map((day) => (
        <fieldset
          key={day.weekday}
          style={{ border: "1px solid #ddd", borderRadius: 6, marginBottom: "0.75rem", padding: "0.75rem" }}
        >
          <legend>
            <label>
              <input
                type="checkbox"
                checked={day.isWorkingDay}
                onChange={(e) =>
                  patchDay(day.weekday, { isWorkingDay: e.target.checked })
                }
              />{" "}
              {WEEKDAY_LABELS[day.weekday]}
            </label>
          </legend>

          {day.isWorkingDay ? (
            <div>
              {day.ranges.map((range, index) => (
                <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                  <input
                    type="time"
                    value={range.start}
                    onChange={(e) =>
                      setRange(day.weekday, index, "start", e.target.value)
                    }
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={range.end}
                    onChange={(e) =>
                      setRange(day.weekday, index, "end", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patchDay(day.weekday, {
                        ranges: day.ranges.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patchDay(day.weekday, {
                    ranges: [...day.ranges, { start: "09:00", end: "13:00" }],
                  })
                }
              >
                Agregar rango
              </button>
            </div>
          ) : (
            <p style={{ color: "#777", margin: 0 }}>No se atiende.</p>
          )}
        </fieldset>
      ))}

      <button type="button" onClick={save} disabled={pending}>
        {pending ? "Guardando…" : "Guardar horarios"}
      </button>

      {state.saved ? <p>Horarios guardados.</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}

      {state.collisions ? (
        state.collisions.length > 0 ? (
          <div role="alert" style={{ marginTop: "1rem", border: "1px solid #d97706", borderRadius: 6, padding: "0.75rem" }}>
            <p style={{ marginTop: 0 }}>
              No se puede reducir la agenda: hay turnos agendados en conflicto.
              Cancelalos para aplicar el cambio (cada uno envía un aviso de
              cancelación).
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
          <p>Conflictos resueltos. Volvé a guardar para aplicar el cambio.</p>
        )
      ) : null}
    </div>
  );
}
