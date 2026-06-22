import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryNotificationOutbox } from "./in-memory-notification-outbox";
import { notifyCancellation } from "./notify-cancellation";
import { FakeNotificationSender } from "./sender";

function appointment(): Appointment {
  return {
    id: "apt-1",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "3421112233",
    patientEmail: "lucia@example.com",
    visitType: "Consultation",
    consultType: "FirstVisit",
    practiceType: null,
    coverage: { kind: "health-insurance", name: "OSDE" },
    deposit: null,
    date: "2026-06-22",
    time: "09:30",
    status: "cancelled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    createdAt: "2026-06-19T11:55:00.000Z",
  };
}

describe("notifyCancellation", () => {
  it("enqueues and sends a Cancellation Notice on both Channels", async () => {
    const outbox = new InMemoryNotificationOutbox();

    await notifyCancellation(appointment(), {
      outbox,
      sender: new FakeNotificationSender(),
      baseUrl: "https://maraflamini.com",
      now: () => new Date("2026-06-20T08:00:00.000Z"),
    });

    const entries = outbox.all();
    expect(entries).toHaveLength(2);
    expect(
      entries.every((e) => e.notification.kind === "cancellation-notice"),
    ).toBe(true);
    expect(entries.every((e) => e.status === "sent")).toBe(true);

    const channels = entries.map((e) => e.notification.channel).sort();
    expect(channels).toEqual(["email", "whatsapp"]);
  });
});
