import { describe, expect, it } from "vitest";
import { FakeWhatsAppSender } from "./whatsapp-sender";

describe("FakeWhatsAppSender", () => {
  it("records each message and returns a synthetic incrementing id", async () => {
    const sender = new FakeWhatsAppSender();

    const first = await sender.send({
      to: "+111",
      templateName: "t",
      language: "es_AR",
      params: ["a"],
    });
    const second = await sender.send({
      to: "+222",
      templateName: "t",
      language: "es_AR",
      params: ["b"],
    });

    expect(first.messageId).toBe("fake-whatsapp-1");
    expect(second.messageId).toBe("fake-whatsapp-2");
    expect(sender.sent).toHaveLength(2);
    expect(sender.last?.to).toBe("+222");
  });

  it("exposes undefined last before anything is sent", () => {
    expect(new FakeWhatsAppSender().last).toBeUndefined();
  });
});
