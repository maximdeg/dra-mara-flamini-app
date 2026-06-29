import type { Appointment } from "../../appointments/appointment";
import type { CancellationActor } from "../../appointments/cancellation";
import type { ClinicContact } from "../../clinic/clinic-info";
import { siteUrl } from "../../site-url";
import { cancellationEmail } from "./cancellation";
import type { EmailSender } from "./email-sender";

export interface CancellationEmailDeps {
  sender: EmailSender;
  /** The (editable) clinic contacts shown in the email's Contacto block. */
  contacts: ClinicContact[];
}

/**
 * Send the Cancellation email for a cancelled Appointment: render it (actor-
 * aware) and deliver it via the EmailSender. Unlike the Confirmation it records
 * no Appointment-level bookkeeping (best-effort only, mirroring the WhatsApp
 * Cancellation Notice). Callers (Cancellation) invoke this best-effort — it may
 * throw, and that must never cost the cancellation (ADR-0001).
 */
export async function sendCancellationEmail(
  appointment: Appointment,
  actor: CancellationActor,
  deps: CancellationEmailDeps,
): Promise<void> {
  const message = cancellationEmail(
    appointment,
    actor,
    { rebookUrl: siteUrl("/agendar-visita") },
    deps.contacts,
  );
  await deps.sender.send(message);
}
