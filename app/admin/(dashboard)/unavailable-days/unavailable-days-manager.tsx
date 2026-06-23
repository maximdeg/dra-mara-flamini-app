"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  addUnavailableDayAction,
  cancelCollisionAction,
  removeUnavailableDayAction,
} from "./actions";
import type { CollisionSummary } from "./types";
import styles from "./unavailable-days-manager.module.css";

export function UnavailableDaysManager({ days }: { days: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [date, setDate] = useState("");
  const [collisions, setCollisions] = useState<CollisionSummary[] | null>(null);
  const [collisionOpen, setCollisionOpen] = useState(false);
  const [dayToRemove, setDayToRemove] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add() {
    if (!date) return;
    startTransition(async () => {
      const result = await addUnavailableDayAction(date);
      if (result.ok) {
        setDate("");
        setCollisions(null);
        setCollisionOpen(false);
        toast.success("Día agregado.");
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      } else if (result.collisions) {
        setCollisions(result.collisions);
        setCollisionOpen(true);
      }
    });
  }

  function confirmRemove() {
    const day = dayToRemove;
    if (!day) return;
    startTransition(async () => {
      const result = await removeUnavailableDayAction(day);
      if (result.ok) {
        toast.success("Día quitado.");
        setDayToRemove(null);
        router.refresh();
      } else {
        toast.error("No se pudo quitar el día.");
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
    <div className={styles.manager}>
      <Card className={styles.addCard}>
        <Field label="Fecha a bloquear" className={styles.addField}>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setCollisions(null);
              setCollisionOpen(false);
            }}
          />
        </Field>
        <Button
          className={styles.addSubmit}
          onClick={add}
          busy={pending}
          disabled={!date}
        >
          {pending ? "Agregando…" : "Agregar día no laborable"}
        </Button>
      </Card>

      <Card>
        <h2 className={styles.listTitle}>Días bloqueados</h2>
        {days.length === 0 ? (
          <p className={styles.empty}>No hay días no laborables cargados.</p>
        ) : (
          <ul className={styles.list}>
            {days.map((day) => (
              <li key={day} className={styles.item}>
                <span>{day}</span>
                <Button
                  variant="ghost"
                  onClick={() => setDayToRemove(day)}
                  disabled={pending}
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={collisionOpen}
        onClose={() => {
          if (!pending) setCollisionOpen(false);
        }}
        title="No se puede bloquear el día"
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
              Ese día tiene turnos agendados. Cancelalos para poder bloquearlo
              (cada uno envía un aviso de cancelación).
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
          <p>Conflictos resueltos. Volvé a agregar el día.</p>
        )}
      </Dialog>

      <Dialog
        open={dayToRemove !== null}
        onClose={() => {
          if (!pending) setDayToRemove(null);
        }}
        title="¿Quitar este día?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDayToRemove(null)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button variant="destructive" busy={pending} onClick={confirmRemove}>
              Quitar
            </Button>
          </>
        }
      >
        <p>El día {dayToRemove} volverá a estar disponible para reservar.</p>
      </Dialog>
    </div>
  );
}
