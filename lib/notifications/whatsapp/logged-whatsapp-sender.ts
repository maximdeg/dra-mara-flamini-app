import type { WhatsAppSendLog } from "./send-log";
import type { WhatsAppMessage, WhatsAppSender } from "./whatsapp-sender";

/**
 * A WhatsAppSender that records every attempt in the Send Log before handing
 * the result back.
 *
 * Wrapping the sender (rather than recording inside MetaWhatsAppSender) keeps
 * the Cloud API adapter free of storage concerns and lets the Panel's usage
 * figures come from the same seam any sender goes through. A rejection is
 * recorded and then re-thrown unchanged, so Booking's best-effort catch behaves
 * exactly as before — the Patient still keeps their Appointment, but the failure
 * is no longer invisible.
 *
 * Logging must never be the reason a message fails, so a Send Log error is
 * swallowed: the delivery result is what the caller gets either way.
 */
export class LoggedWhatsAppSender implements WhatsAppSender {
  constructor(
    private readonly inner: WhatsAppSender,
    private readonly log: WhatsAppSendLog,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async send(message: WhatsAppMessage): Promise<{ messageId: string }> {
    try {
      const result = await this.inner.send(message);
      await this.write(message, true, result.messageId, null);
      return result;
    } catch (error) {
      await this.write(message, false, null, errorCodeOf(error));
      throw error;
    }
  }

  private async write(
    message: WhatsAppMessage,
    delivered: boolean,
    messageId: string | null,
    errorCode: number | null,
  ): Promise<void> {
    try {
      await this.log.record({
        sentAt: this.now().toISOString(),
        templateName: message.templateName,
        to: message.to,
        delivered,
        messageId,
        errorCode,
      });
    } catch {
      // Swallowed on purpose: bookkeeping must not break delivery.
    }
  }
}

/**
 * The Cloud API error code carried in a MetaWhatsAppSender failure message,
 * which formats it as `... [131049] ...`. Returns null when the error is not a
 * Cloud API rejection (a network fault, say), so the Panel can tell "Meta said
 * no" apart from "we never reached Meta".
 */
function errorCodeOf(error: unknown): number | null {
  if (!(error instanceof Error)) {
    return null;
  }
  const match = /\[(\d+)\]/.exec(error.message);
  return match ? Number(match[1]) : null;
}
