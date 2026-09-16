import type { Appointment } from "../../appointments/appointment";
import type { CancellationActor } from "../../appointments/cancellation";
import { cancellationWhatsApp } from "./cancellation";
import { whatsappConsentGiven } from "./consent";
import type { WhatsAppSender } from "./whatsapp-sender";

export interface CancellationWhatsAppDeps {
  sender: WhatsAppSender;
}

/**
 * Send the Cancellation WhatsApp for a cancelled Appointment: render the
 * approved template for whoever cancelled and deliver it via the WhatsAppSender.
 *
 * Unlike the Confirmation it records no Appointment-level bookkeeping — the
 * `whatsappSent` fields track the Confirmation specifically, and the
 * Cancellation email sets the same precedent. The Send Log still records the
 * attempt (the sender is wrapped by LoggedWhatsAppSender), so it counts against
 * the messaging limit shown in the Panel.
 *
 * Callers (Cancellation) invoke this best-effort — it may throw, and that must
 * never cost the cancellation itself (ADR-0001, kept by ADR-0003). Mirrors
 * sendCancellationEmail.
 */
export async function sendCancellationWhatsApp(
  appointment: Appointment,
  actor: CancellationActor,
  deps: CancellationWhatsAppDeps,
): Promise<void> {
  // A Patient who declined WhatsApp gets no message (see sendConfirmationWhatsApp).
  if (!whatsappConsentGiven(appointment)) {
    return;
  }

  await deps.sender.send(cancellationWhatsApp(appointment, actor));
}
