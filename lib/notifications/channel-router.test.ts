import { describe, expect, it, vi } from "vitest";
import { ChannelRouter } from "./channel-router";
import type { Notification } from "./notification";
import type { NotificationSender } from "./sender";

function notification(channel: "whatsapp" | "email"): Notification {
  return channel === "whatsapp"
    ? {
        kind: "confirmation",
        channel: "whatsapp",
        appointmentId: "apt-1",
        recipient: "3421112233",
        message: { text: "hola" },
      }
    : {
        kind: "confirmation",
        channel: "email",
        appointmentId: "apt-1",
        recipient: "lucia@example.com",
        message: { subject: "s", html: "h", text: "t" },
      };
}

describe("ChannelRouter", () => {
  it("routes each Notification to the sender for its Channel", async () => {
    const whatsapp: NotificationSender = {
      send: vi.fn(async () => ({ messageId: "wa-1" })),
    };
    const email: NotificationSender = {
      send: vi.fn(async () => ({ messageId: "em-1" })),
    };
    const router = new ChannelRouter({ whatsapp, email });

    const emailResult = await router.send(notification("email"));
    const whatsappResult = await router.send(notification("whatsapp"));

    expect(emailResult.messageId).toBe("em-1");
    expect(whatsappResult.messageId).toBe("wa-1");
    expect(email.send).toHaveBeenCalledTimes(1);
    expect(whatsapp.send).toHaveBeenCalledTimes(1);
  });
});
