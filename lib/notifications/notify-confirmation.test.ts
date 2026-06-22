import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryNotificationOutbox } from "./in-memory-notification-outbox";
import { notifyConfirmation } from "./notify-confirmation";

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
    status: "scheduled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    createdAt: "2026-06-19T11:55:00.000Z",
  };
}

describe("notifyConfirmation", () => {
  it("enqueues a pending Confirmation entry on both Channels (delivery is the worker's job)", async () => {
    const outbox = new InMemoryNotificationOutbox();

    await notifyConfirmation(appointment(), {
      outbox,
      baseUrl: "https://maraflamini.com",
    });

    const entries = outbox.all();
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.notification.kind === "confirmation")).toBe(
      true,
    );
    // Enqueue-only: nothing is sent at request time.
    expect(entries.every((e) => e.status === "pending")).toBe(true);

    const channels = entries.map((e) => e.notification.channel).sort();
    expect(channels).toEqual(["email", "whatsapp"]);
  });
});
