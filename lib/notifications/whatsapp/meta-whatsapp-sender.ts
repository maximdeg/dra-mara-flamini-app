import type { WhatsAppMessage, WhatsAppSender } from "./whatsapp-sender";

/**
 * The slice of the Graph API this adapter uses — a single authenticated POST to
 * `/{phone-number-id}/messages`. Narrowing to a transport interface (rather than
 * calling `fetch` directly) keeps the adapter unit-testable with a plain stub,
 * exactly like MailTransport does for the email adapter. The production
 * transport (get-whatsapp-sender) wraps `fetch` and carries the bearer token, so
 * this adapter never sees credentials — mirroring how NodemailerEmailSender
 * receives an already-authenticated transport.
 */
export interface GraphApiTransport {
  post(
    url: string,
    body: unknown,
  ): Promise<{ ok: boolean; status: number; json: unknown }>;
}

/** The Meta Cloud API response shapes this adapter reads. */
interface GraphSuccess {
  messages?: { id?: string }[];
}
interface GraphError {
  error?: { code?: number; message?: string; error_data?: { details?: string } };
}

/**
 * Production WhatsAppSender — delivers a template message over the Meta WhatsApp
 * Cloud API (ADR-0003). The phone-number-id is fixed per deployment and supplied
 * by the factory (get-whatsapp-sender); the bearer token lives in the injected
 * transport. This class holds no env and stays unit-testable with a stub
 * transport.
 */
export class MetaWhatsAppSender implements WhatsAppSender {
  constructor(
    private readonly transport: GraphApiTransport,
    private readonly phoneNumberId: string,
    private readonly graphVersion = "v23.0",
  ) {}

  async send(message: WhatsAppMessage): Promise<{ messageId: string }> {
    const url = `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: message.to,
      type: "template",
      template: {
        name: message.templateName,
        language: { code: message.language },
        components: [
          {
            type: "body",
            parameters: message.params.map((text) => ({ type: "text", text })),
          },
        ],
      },
    };

    const response = await this.transport.post(url, body);

    if (!response.ok) {
      const err = (response.json as GraphError).error ?? {};
      const detail = err.error_data?.details ? ` — ${err.error_data.details}` : "";
      throw new Error(
        `Meta WhatsApp send failed (${response.status}) [${err.code ?? "?"}] ${err.message ?? "unknown error"}${detail}`,
      );
    }

    const messageId = (response.json as GraphSuccess).messages?.[0]?.id;
    if (!messageId) {
      throw new Error("Meta WhatsApp send returned no message id");
    }
    return { messageId };
  }
}
