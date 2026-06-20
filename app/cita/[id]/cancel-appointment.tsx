"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isScheduled) {
    return null;
  }
  if (!withinWindow) {
    return <p>Solo podés cancelar hasta 24 horas antes del turno.</p>;
  }

  async function handleCancel() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          rejection?: string;
        };
        setError(
          (data.rejection && REJECTION_MESSAGES[data.rejection]) ||
            FALLBACK_ERROR,
        );
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      setError(FALLBACK_ERROR);
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleCancel} disabled={pending}>
        {pending ? "Cancelando…" : "Cancelar cita"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
