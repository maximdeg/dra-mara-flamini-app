"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import styles from "./cancel-appointment.module.css";

const REJECTION_MESSAGES: Record<string, string> = {
  OutsideCancellationWindow:
    "Solo podés cancelar hasta 24 horas antes del turno.",
  AlreadyCancelled: "La cita ya estaba cancelada.",
  AlreadyCompleted: "La cita ya pasó y no puede cancelarse.",
  NotFound: "No se encontró la cita.",
};
const FALLBACK_ERROR = "No se pudo cancelar la cita.";

// Patient cancel control on the confirmation page. Shown only for a Scheduled
// Appointment; if the Cancellation Window has closed (within 24h) it explains
// why instead of offering the button. The server enforces the rule regardless.
export function CancelAppointment({
  appointmentId,
  isScheduled,
  withinWindow,
}: {
  appointmentId: string;
  isScheduled: boolean;
  withinWindow: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!isScheduled) {
    return null;
  }
  if (!withinWindow) {
    return (
      <p className={styles.note}>
        Solo podés cancelar hasta 24 horas antes del turno.
      </p>
    );
  }

  async function handleCancel() {
    setPending(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          rejection?: string;
        };
        toast.error(
          (data.rejection && REJECTION_MESSAGES[data.rejection]) ||
            FALLBACK_ERROR,
        );
        setPending(false);
        setOpen(false);
        return;
      }
      toast.success("Tu cita fue cancelada.");
      setPending(false);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(FALLBACK_ERROR);
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <div className={styles.actions}>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Cancelar cita
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title="¿Cancelar la cita?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button variant="destructive" busy={pending} onClick={handleCancel}>
              {pending ? "Cancelando…" : "Sí, cancelar"}
            </Button>
          </>
        }
      >
        <p>Vas a cancelar tu cita. Esta acción no se puede deshacer.</p>
      </Dialog>
    </div>
  );
}
