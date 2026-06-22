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
  it("enqueues and sends one entry per Channel, recording WhatsApp bookkeeping", async () => {
    const repository = new InMemoryAppointmentRepository();
    await repository.create(appointment());
    const outbox = new InMemoryNotificationOutbox();

    await notifyConfirmation(appointment(), {
      outbox,
      sender: new FakeNotificationSender(),
      appointments: repository,
      baseUrl: "https://maraflamini.com",
      now: () => new Date("2026-06-19T12:00:00.000Z"),
    });

    const entries = outbox.all();
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.notification.kind === "confirmation")).toBe(
      true,
    );
    expect(entries.every((e) => e.status === "sent")).toBe(true);

    const whatsapp = entries.find((e) => e.notification.channel === "whatsapp");
    const email = entries.find((e) => e.notification.channel === "email");
    expect(whatsapp?.messageId).toBe("fake-whatsapp-confirmation-apt-1");
    expect(email?.messageId).toBe("fake-email-confirmation-apt-1");

    // Bookkeeping is recorded from the WhatsApp send, not the email one.
    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(true);
    expect(stored?.whatsappSentAt).toBe("2026-06-19T12:00:00.000Z");
    expect(stored?.whatsappMessageId).toBe("fake-whatsapp-confirmation-apt-1");
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
        baseUrl: "https://maraflamini.com",
      }),
    ).rejects.toThrow("whatsapp down");

    const stored = await repository.findById("apt-1");
    expect(stored?.whatsappSent).toBe(false);
  });
});
