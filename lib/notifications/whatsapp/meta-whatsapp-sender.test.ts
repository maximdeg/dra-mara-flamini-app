import { describe, expect, it } from "vitest";
import { MetaWhatsAppSender, type GraphApiTransport } from "./meta-whatsapp-sender";
import type { WhatsAppMessage } from "./whatsapp-sender";

function message(): WhatsAppMessage {
  return {
    to: "+5491134286716",
    templateName: "appointment_confirmation_1",
    language: "es_AR",
    params: ["Lucía", "22/06/2026", "09:30", "Consulta", "OSDE", "https://x/cita/1"],
  };
}

/** A transport that records the last request and returns a scripted response. */
function stubTransport(
  response: { ok: boolean; status: number; json: unknown },
): GraphApiTransport & { lastUrl?: string; lastBody?: any } {
  const t: any = {
    async post(url: string, body: unknown) {
      t.lastUrl = url;
      t.lastBody = body;
      return response;
    },
  };
  return t;
}

describe("MetaWhatsAppSender", () => {
  it("POSTs the template message and returns the wamid on success", async () => {
    const transport = stubTransport({
      ok: true,
      status: 200,
      json: { messages: [{ id: "wamid.ABC" }] },
    });
    const sender = new MetaWhatsAppSender(transport, "111222333", "v23.0");

    const result = await sender.send(message());

    expect(result.messageId).toBe("wamid.ABC");
    expect(transport.lastUrl).toBe(
      "https://graph.facebook.com/v23.0/111222333/messages",
    );
    expect(transport.lastBody).toMatchObject({
      messaging_product: "whatsapp",
      to: "+5491134286716",
      type: "template",
      template: {
        name: "appointment_confirmation_1",
        language: { code: "es_AR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Lucía" },
              { type: "text", text: "22/06/2026" },
              { type: "text", text: "09:30" },
              { type: "text", text: "Consulta" },
              { type: "text", text: "OSDE" },
              { type: "text", text: "https://x/cita/1" },
            ],
          },
        ],
      },
    });
  });

  it("throws a descriptive error carrying the Cloud API code on failure", async () => {
    const transport = stubTransport({
      ok: false,
      status: 400,
      json: {
        error: {
          code: 132001,
          message: "Template name does not exist in the translation",
          error_data: { details: "appointment_confirmation_1 / es_AR" },
        },
      },
    });
    const sender = new MetaWhatsAppSender(transport, "111222333");

    await expect(sender.send(message())).rejects.toThrow(/132001/);
    await expect(sender.send(message())).rejects.toThrow(
      /Template name does not exist/,
    );
  });

  it("throws when the API accepts but returns no message id", async () => {
    const transport = stubTransport({ ok: true, status: 200, json: {} });
    const sender = new MetaWhatsAppSender(transport, "111222333");

    await expect(sender.send(message())).rejects.toThrow(/no message id/);
  });
});
