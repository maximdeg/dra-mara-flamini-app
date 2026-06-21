"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cancelAppointmentAsProfessional } from "./actions";

// The Professional cancel control for a row. Confirms in a Dialog, then calls
// the cancel server action (actor="professional": no 24-hour limit, a
// Cancellation Notice is enqueued) and reports the outcome via a Toast.
export function CancelAppointmentButton({
  appointmentId,
  patientName,
}: {
  appointmentId: string;
  patientName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await cancelAppointmentAsProfessional(appointmentId);
      toast.success("Turno cancelado. Se notificó al paciente.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("No se pudo cancelar el turno.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Cancelar
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title="¿Cancelar el turno?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              busy={pending}
              onClick={handleConfirm}
            >
              {pending ? "Cancelando…" : "Sí, cancelar"}
            </Button>
          </>
        }
      >
        <p>
          Vas a cancelar el turno de {patientName}. Se le enviará un aviso de
          cancelación. Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </>
  );
}
