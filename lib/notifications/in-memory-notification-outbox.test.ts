import { describe, expect, it } from "vitest";
import { InMemoryNotificationOutbox } from "./in-memory-notification-outbox";
import type { Notification } from "./notification";

function notification(): Notification {
  return {
    kind: "confirmation",
    channel: "whatsapp",
    appointmentId: "apt-1",
    recipient: "3421112233",
    message: { text: "hola" },
  };
}

describe("InMemoryNotificationOutbox", () => {
  it("enqueues a pending entry with a fresh attempt count", async () => {
    const outbox = new InMemoryNotificationOutbox();

    const entry = await outbox.enqueue(notification());

    expect(entry.status).toBe("pending");
    expect(entry.attempts).toBe(0);
    expect(entry.lastError).toBeNull();
    expect(await outbox.pending()).toHaveLength(1);
  });

  it("claims a pending entry exactly once (the double-send guard)", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const entry = await outbox.enqueue(notification());

    const first = await outbox.claim(entry.id);
    const second = await outbox.claim(entry.id);

    expect(first?.status).toBe("sending");
    expect(second).toBeNull();
    expect(await outbox.pending()).toHaveLength(0);
  });

  it("markSent moves a claimed entry to sent", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const entry = await outbox.enqueue(notification());
    await outbox.claim(entry.id);

    await outbox.markSent(entry.id, "msg-1", "2026-06-19T12:00:00.000Z");

    const stored = outbox.all()[0];
    expect(stored.status).toBe("sent");
    expect(stored.messageId).toBe("msg-1");
    expect(stored.sentAt).toBe("2026-06-19T12:00:00.000Z");
  });

  it("markFailed records the outcome and can return the entry to pending", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const entry = await outbox.enqueue(notification());
    await outbox.claim(entry.id);

    await outbox.markFailed(entry.id, {
      attempts: 1,
      error: "boom",
      status: "pending",
    });

    const stored = outbox.all()[0];
    expect(stored.status).toBe("pending");
    expect(stored.attempts).toBe(1);
    expect(stored.lastError).toBe("boom");
    expect(await outbox.pending()).toHaveLength(1);
  });
});
