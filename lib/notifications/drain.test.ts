import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryAppointmentRepository } from "../appointments/in-memory-appointment-repository";
import { composeNotifications } from "./compose";
import { drainOutbox } from "./drain";
import { InMemoryNotificationOutbox } from "./in-memory-notification-outbox";
import type { NotificationKind } from "./notification";
import { FakeNotificationSender, type NotificationSender } from "./sender";

const BASE_URL = "https://maraflamini.com";

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

async function enqueue(
  outbox: InMemoryNotificationOutbox,
  kind: NotificationKind,
): Promise<void> {
  for (const notification of composeNotifications(appointment(), kind, BASE_URL)) {
    await outbox.enqueue(notification);
  }
}

function deps(overrides: {
  outbox: InMemoryNotificationOutbox;
  sender?: NotificationSender;
  appointments?: InMemoryAppointmentRepository;
  maxAttempts?: number;
}) {
  return {
    outbox: overrides.outbox,
    sender: overrides.sender ?? new FakeNotificationSender(),
    appointments: overrides.appointments ?? new InMemoryAppointmentRepository(),
    now: () => new Date("2026-06-19T12:00:00.000Z"),
    maxAttempts: overrides.maxAttempts,
  };
}

describe("drainOutbox", () => {
  it("sends every pending entry and marks it sent", async () => {
    const outbox = new InMemoryNotificationOutbox();
    await enqueue(outbox, "confirmation");

    const result = await drainOutbox(deps({ outbox }));

    expect(result).toEqual({ sent: 2, failed: 0 });
    expect(outbox.all().every((e) => e.status === "sent")).toBe(true);
  });

  it("records WhatsApp Confirmation bookkeeping on the Appointment", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const appointments = new InMemoryAppointmentRepository();
    await appointments.create(appointment());
    await enqueue(outbox, "confirmation");

    await drainOutbox(deps({ outbox, appointments }));

    const stored = await appointments.findById("apt-1");
    expect(stored?.whatsappSent).toBe(true);
    expect(stored?.whatsappSentAt).toBe("2026-06-19T12:00:00.000Z");
    expect(stored?.whatsappMessageId).toBe("fake-whatsapp-confirmation-apt-1");
  });

  it("does not record bookkeeping for a Cancellation Notice", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const appointments = new InMemoryAppointmentRepository();
    await appointments.create(appointment());
    await enqueue(outbox, "cancellation-notice");

    await drainOutbox(deps({ outbox, appointments }));

    const stored = await appointments.findById("apt-1");
    expect(stored?.whatsappSent).toBe(false);
  });

  it("fails one Channel without affecting the other", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const appointments = new InMemoryAppointmentRepository();
    await appointments.create(appointment());
    await enqueue(outbox, "confirmation");
    const whatsappDown: NotificationSender = {
      async send(notification) {
        if (notification.channel === "whatsapp") {
          throw new Error("whatsapp down");
        }
        return { messageId: `email-${notification.appointmentId}` };
      },
    };

    const result = await drainOutbox(deps({ outbox, sender: whatsappDown, appointments }));

    expect(result).toEqual({ sent: 1, failed: 1 });
    const whatsapp = outbox
      .all()
      .find((e) => e.notification.channel === "whatsapp");
    const email = outbox.all().find((e) => e.notification.channel === "email");
    expect(email?.status).toBe("sent");
    expect(whatsapp?.status).toBe("pending"); // retryable
    expect(whatsapp?.attempts).toBe(1);
    expect(whatsapp?.lastError).toBe("whatsapp down");
    // The failed WhatsApp send must not have recorded bookkeeping.
    expect((await appointments.findById("apt-1"))?.whatsappSent).toBe(false);
  });

  it("retries a failing entry until the cap, then marks it failed", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const alwaysDown: NotificationSender = {
      async send() {
        throw new Error("down");
      },
    };
    const drainDeps = deps({ outbox, sender: alwaysDown, maxAttempts: 2 });
    await enqueue(outbox, "confirmation");

    await drainOutbox(drainDeps);
    expect(outbox.all().every((e) => e.status === "pending")).toBe(true);
    expect(outbox.all().every((e) => e.attempts === 1)).toBe(true);

    await drainOutbox(drainDeps);
    expect(outbox.all().every((e) => e.status === "failed")).toBe(true);
    expect(outbox.all().every((e) => e.attempts === 2)).toBe(true);

    // Nothing left pending — a further tick is a no-op.
    expect(await drainOutbox(drainDeps)).toEqual({ sent: 0, failed: 0 });
  });

  it("does not send an entry already claimed by another tick", async () => {
    const outbox = new InMemoryNotificationOutbox();
    const [entry] = await Promise.all([
      outbox.enqueue(
        composeNotifications(appointment(), "confirmation", BASE_URL)[0],
      ),
    ]);
    // Simulate another worker tick having claimed it.
    await outbox.claim(entry.id);

    const result = await drainOutbox(deps({ outbox }));

    expect(result).toEqual({ sent: 0, failed: 0 });
    expect(outbox.all()[0].status).toBe("sending");
  });
});
