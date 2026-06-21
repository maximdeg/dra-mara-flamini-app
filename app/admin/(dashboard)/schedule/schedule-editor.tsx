"use client";

import { useState, useTransition } from "react";
import {
  WEEKDAYS_IN_ORDER,
  WEEKDAY_LABELS,
  type Weekday,
  type WorkdaySchedule,
  type WorkSchedule,
} from "@/lib/availability/work-schedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cancelCollisionAction, saveScheduleAction } from "./actions";
import type { CollisionSummary } from "./types";
import styles from "./schedule-editor.module.css";

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
  const toast = useToast();
  const [schedule, setSchedule] = useState<WorkSchedule>(() =>
    normalize(initial),
  );
  const [collisions, setCollisions] = useState<CollisionSummary[] | null>(null);
  const [collisionOpen, setCollisionOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function edit(updater: (schedule: WorkSchedule) => WorkSchedule) {
    setSchedule(updater);
    // Editing invalidates any pending collision result.
    setCollisions(null);
    setCollisionOpen(false);
  }

  function patchDay(weekday: Weekday, patch: Partial<WorkdaySchedule>) {
    edit((s) => s.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
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
      const result = await saveScheduleAction(schedule);
      if (result.saved) {
        setCollisions(null);
        setCollisionOpen(false);
        toast.success("Horarios guardados.");
      } else if (result.error) {
        toast.error(result.error);
      } else if (result.collisions) {
        setCollisions(result.collisions);
        setCollisionOpen(true);
      }
    });
  }

  function cancelCollision(id: string) {
    startTransition(async () => {
      const result = await cancelCollisionAction(id);
      if (result.ok) {
        setCollisions((cs) => (cs ?? []).filter((c) => c.id !== id));
        toast.success("Turno cancelado. Se notificó al paciente.");
      } else {
        toast.error("No se pudo cancelar el turno.");
      }
    });
  }

  return (
    <div className={styles.editor}>
      <div className={styles.days}>
        {schedule.map((day) => (
          <Card key={day.weekday} className={styles.day}>
            <label className={styles.dayToggle}>
              <input
                type="checkbox"
                checked={day.isWorkingDay}
                onChange={(e) =>
                  patchDay(day.weekday, { isWorkingDay: e.target.checked })
                }
              />
              <span className={styles.dayName}>
                {WEEKDAY_LABELS[day.weekday]}
              </span>
            </label>

            {day.isWorkingDay ? (
              <div className={styles.ranges}>
                {day.ranges.map((range, index) => (
                  <div key={index} className={styles.range}>
                    <input
                      type="time"
                      className={styles.time}
                      aria-label="Desde"
                      value={range.start}
                      onChange={(e) =>
                        setRange(day.weekday, index, "start", e.target.value)
                      }
                    />
                    <span className={styles.sep}>a</span>
                    <input
                      type="time"
                      className={styles.time}
                      aria-label="Hasta"
                      value={range.end}
                      onChange={(e) =>
                        setRange(day.weekday, index, "end", e.target.value)
                      }
                    />
                    <Button
                      variant="ghost"
                      onClick={() =>
                        patchDay(day.weekday, {
                          ranges: day.ranges.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    patchDay(day.weekday, {
                      ranges: [
                        ...day.ranges,
                        { start: "09:00", end: "13:00" },
                      ],
                    })
                  }
                >
                  Agregar rango
                </Button>
              </div>
            ) : (
              <p className={styles.closed}>No se atiende.</p>
            )}
          </Card>
        ))}
      </div>

      <Button onClick={save} busy={pending} className={styles.save}>
        {pending ? "Guardando…" : "Guardar horarios"}
      </Button>

      <Dialog
        open={collisionOpen}
        onClose={() => {
          if (!pending) setCollisionOpen(false);
        }}
        title="No se puede reducir la agenda"
        footer={
          <Button
            variant="ghost"
            onClick={() => setCollisionOpen(false)}
            disabled={pending}
          >
            Cerrar
          </Button>
        }
      >
        {collisions && collisions.length > 0 ? (
          <>
            <p>
              Hay turnos agendados en conflicto. Cancelalos para aplicar el
              cambio (cada uno envía un aviso de cancelación).
            </p>
            <ul className={styles.collisions}>
              {collisions.map((c) => (
                <li key={c.id} className={styles.collision}>
                  <span>
                    {c.date} {c.time} · {c.patientName}
                  </span>
                  <Button
                    variant="destructive"
                    onClick={() => cancelCollision(c.id)}
                    disabled={pending}
                  >
                    Cancelar turno
                  </Button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Conflictos resueltos. Volvé a guardar para aplicar el cambio.</p>
        )}
      </Dialog>
    </div>
  );
}
