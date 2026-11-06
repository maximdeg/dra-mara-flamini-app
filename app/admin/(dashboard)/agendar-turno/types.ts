import type { ManualBookingRejection } from "@/lib/appointments/manual-booking";

export type ManualBookingActionRejection =
  | ManualBookingRejection
  | "Unauthorized";

/** What the Agendar turno server action answers. */
export type ManualBookingActionResult =
  | { ok: true; date: string }
  | { ok: false; rejection: ManualBookingActionRejection };

/** The Spanish message for each refusal, shown under the form. */
export const MANUAL_BOOKING_ERRORS: Record<
  ManualBookingActionRejection,
  string
> = {
  Unauthorized: "No autorizado. Volvé a iniciar sesión.",
  MissingName: "Completá el nombre y el apellido.",
  InvalidPhone: "Ingresá un teléfono válido (código de área y número).",
  MissingConsultType: "Elegí el tipo de consulta.",
  MissingPracticeType: "Elegí el tipo de práctica.",
  InvalidDate: "Elegí una fecha válida.",
  InvalidTime: "Elegí una hora válida.",
  InvalidDuration: "Elegí una duración válida.",
  OverrunsMidnight: "El turno no puede terminar después de la medianoche.",
  InvalidCoverage: "Elegí la obra social, o escribila en «Otro».",
  SlotTaken: "Ese horario ya está ocupado por otro turno.",
};
