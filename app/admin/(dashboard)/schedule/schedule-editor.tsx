"use client";

import { useState, useTransition } from "react";
import {
  acceptedKinds,
  WEEKDAYS_IN_ORDER,
  WEEKDAY_LABELS,
  type TimeRange,
  type Weekday,
  type WorkdaySchedule,
  type WorkSchedule,
} from "@/lib/availability/work-schedule";
import { formatDateAR } from "@/lib/datetime/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cancelCollisionAction, saveScheduleAction } from "./actions";
import { KindPicker } from "./kind-picker";
import type { CollisionSummary } from "./types";
import styles from "./schedule-editor.module.css";

function onTenMinuteGrid(time: string): boolean {
  return /^\d{2}:\d0$/.test(time);
}

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

  function patchRange(
    weekday: Weekday,
    index: number,
    patch: Partial<TimeRange>,
  ) {
    edit((s) =>
      s.map((d) =>
        d.weekday === weekday
          ? {
              ...d,
              ranges: d.ranges.map((r, i) =>
                i === index ? { ...r, ...patch } : r,
              ),
            }
          : d,
      ),
    );
  }

  function save() {
    // The server drops a range open to no Visit Kind; refuse here instead so
    // a range is never lost silently.
    const kindless = schedule.some(
      (d) =>
        d.isWorkingDay && d.ranges.some((r) => acceptedKinds(r).length === 0),
    );
    if (kindless) {
      toast.error("Cada rango necesita al menos un tipo de visita.");
      return;
    }
    // Likewise for times off 10-minute boundaries (durations are multiples of 10).
    const offGrid = schedule.some(
      (d) =>
        d.isWorkingDay &&
        d.ranges.some(
          (r) => !onTenMinuteGrid(r.start) || !onTenMinuteGrid(r.end),
        ),
    );
    if (offGrid) {
      toast.error(
        "Usá horarios en múltiplos de 10 minutos (por ejemplo 09:10).",
      );
      return;
    }
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
                  <div key={index} className={styles.rangeBlock}>
                    <div className={styles.range}>
                      <input
                        type="time"
                        // Argentine convention: render the native control in 24-hour
                        // form (no am/pm) for a visitor on a non-es locale.
                        lang="es-AR"
                        // Steps of 10 minutes: durations are multiples of 10.
                        step={600}
                        className={styles.time}
                        aria-label="Desde"
                        value={range.start}
                        onChange={(e) =>
                          patchRange(day.weekday, index, {
                            start: e.target.value,
                          })
                        }
                      />
                      <span className={styles.sep}>a</span>
                      <input
                        type="time"
                        lang="es-AR"
                        // Steps of 10 minutes: durations are multiples of 10.
                        step={600}
                        className={styles.time}
                        aria-label="Hasta"
                        value={range.end}
                        onChange={(e) =>
                          patchRange(day.weekday, index, {
                            end: e.target.value,
                          })
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
                    <KindPicker
                      kinds={acceptedKinds(range)}
                      onChange={(kinds) =>
                        patchRange(day.weekday, index, { kinds })
                      }
                    />
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    patchDay(day.weekday, {
                      ranges: [...day.ranges, { start: "09:00", end: "13:00" }],
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
                    {formatDateAR(c.date)} {c.time} · {c.patientName}
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
