import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryAppointmentRepository } from "../appointments/in-memory-appointment-repository";
import { InMemoryNotificationOutbox } from "./in-memory-notification-outbox";
import { notifyConfirmation } from "./notify-confirmation";
import { FakeNotificationSender, type NotificationSender } from "./sender";

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
  it("enqueues, sends, marks the outbox entry sent, and records bookkeeping", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const outbox = new InMemoryNotificationOutbox();

    await notifyConfirmation(appointment(), {
      outbox,
      sender: new FakeNotificationSender(),
      appointments: repository,
      now: () => new Date("2026-06-19T12:00:00.000Z"),
    });

    const entries = outbox.all();
    expect(entries).toHaveLength(1);
    expect(entries[0].notification.kind).toBe("confirmation");
    expect(entries[0].status).toBe("sent");
    expect(entries[0].messageId).toBe("fake-confirmation-apt-1");

    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(true);
    expect(stored?.whatsappSentAt).toBe("2026-06-19T12:00:00.000Z");
    expect(stored?.whatsappMessageId).toBe("fake-confirmation-apt-1");
  });

  it("propagates a sender failure (Booking invokes it best-effort)", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const failingSender: NotificationSender = {
      async send() {
        throw new Error("whatsapp down");
      },
    };

    await expect(
      notifyConfirmation(appointment(), {
        outbox: new InMemoryNotificationOutbox(),
        sender: failingSender,
        appointments: repository,
      }),
    ).rejects.toThrow("whatsapp down");

    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(false);
  });
});
