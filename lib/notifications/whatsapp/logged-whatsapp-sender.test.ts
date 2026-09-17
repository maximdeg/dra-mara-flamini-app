import { describe, expect, it } from "vitest";
import { LoggedWhatsAppSender } from "./logged-whatsapp-sender";
import { InMemoryWhatsAppSendLog } from "./send-log";
import { FakeWhatsAppSender, type WhatsAppSender } from "./whatsapp-sender";

const message = {
  to: "+5493421112233",
  templateName: "appointment_confirmation_1",
  language: "es_AR",
  params: ["Lucía"],
};
const now = () => new Date("2026-06-19T12:00:00.000Z");

describe("LoggedWhatsAppSender", () => {
  it("records a delivered send with its wamid", async () => {
    const log = new InMemoryWhatsAppSendLog();
    const sender = new LoggedWhatsAppSender(new FakeWhatsAppSender(), log, now);

    const result = await sender.send(message);

    expect(result.messageId).toBe("fake-whatsapp-1");
    expect(log.records).toEqual([
      {
        sentAt: "2026-06-19T12:00:00.000Z",
        templateName: "appointment_confirmation_1",
        to: "+5493421112233",
        delivered: true,
        messageId: "fake-whatsapp-1",
        errorCode: null,
      },
    ]);
  });

  it("records a rejection with its Cloud API code and re-throws", async () => {
    const log = new InMemoryWhatsAppSendLog();
    const failing: WhatsAppSender = {
      async send() {
        throw new Error(
          "Meta WhatsApp send failed (400) [131049] Message limit reached",
        );
      },
    };
    const sender = new LoggedWhatsAppSender(failing, log, now);

    await expect(sender.send(message)).rejects.toThrow(/131049/);
    expect(log.records[0]).toMatchObject({
      delivered: false,
      messageId: null,
      errorCode: 131049,
    });
  });

  it("records a non-Cloud-API failure with no code", async () => {
    const log = new InMemoryWhatsAppSendLog();
    const failing: WhatsAppSender = {
      async send() {
        throw new Error("fetch failed");
      },
    };

    await expect(
      new LoggedWhatsAppSender(failing, log, now).send(message),
    ).rejects.toThrow("fetch failed");
    expect(log.records[0]).toMatchObject({ delivered: false, errorCode: null });
  });

  it("still delivers when the Send Log itself fails", async () => {
    const brokenLog = {
      async record() {
        throw new Error("mongo down");
      },
      async since() {
        return [];
      },
    };

    const result = await new LoggedWhatsAppSender(
      new FakeWhatsAppSender(),
      brokenLog,
      now,
    ).send(message);

    expect(result.messageId).toBe("fake-whatsapp-1");
  });
});
