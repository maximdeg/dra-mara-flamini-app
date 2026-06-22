import { describe, expect, it } from "vitest";
import { InMemoryNotificationOutbox } from "../notifications/in-memory-notification-outbox";
import { notifyCancellation } from "../notifications/notify-cancellation";
import { FakeNotificationSender } from "../notifications/sender";
import type { Appointment } from "./appointment";
import {
  cancel,
  patientCanCancel,
  type CancellationDependencies,
} from "./cancellation";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";

const now = new Date("2026-06-19T12:00:00"); // a Friday

function appointment(overrides: Partial<Appointment> = {}): Appointment {
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
    ...overrides,
  };
}

async function repoWith(
  appt: Appointment,
): Promise<InMemoryAppointmentRepository> {
  const repository = new InMemoryAppointmentRepository();
  await repository.create(appt);
  return repository;
}

function deps(
  repository: InMemoryAppointmentRepository,
  overrides: Partial<CancellationDependencies> = {},
): CancellationDependencies {
  return {
    repository,
    notifyCancellation: async () => {},
    now: () => now,
    ...overrides,
  };
}

describe("patientCanCancel", () => {
  it("is true more than 24h before the start", () => {
    expect(patientCanCancel({ date: "2026-06-22", time: "09:30" }, now)).toBe(
      true,
    );
  });

  it("is false within 24h of the start", () => {
    expect(patientCanCancel({ date: "2026-06-20", time: "09:30" }, now)).toBe(
      false,
    );
  });

  it("is false exactly 24h before (must be strictly more)", () => {
    expect(patientCanCancel({ date: "2026-06-20", time: "12:00" }, now)).toBe(
      false,
    );
  });
});

describe("cancel", () => {
  it("lets a Patient cancel more than 24h before the start", async () => {
    const repository = await repoWith(appointment());

    const result = await cancel("apt-1", "patient", deps(repository));

    expect(result.ok).toBe(true);
    expect(result.ok && result.appointment.status).toBe("cancelled");
    expect((await repository.findById("apt-1"))?.status).toBe("cancelled");
  });

  it("blocks a Patient within the 24h Cancellation Window", async () => {
    const repository = await repoWith(
      appointment({ date: "2026-06-20", time: "09:30" }),
    );

    const result = await cancel("apt-1", "patient", deps(repository));

    expect(result).toEqual({
      ok: false,
      rejection: "OutsideCancellationWindow",
    });
    expect((await repository.findById("apt-1"))?.status).toBe("scheduled");
  });

  it("lets the Professional cancel within 24h (no window restriction)", async () => {
    const repository = await repoWith(
      appointment({ date: "2026-06-20", time: "09:30" }),
    );

    const result = await cancel("apt-1", "professional", deps(repository));

    expect(result.ok).toBe(true);
    expect((await repository.findById("apt-1"))?.status).toBe("cancelled");
  });

  it("rejects an unknown id", async () => {
    const result = await cancel(
      "missing",
      "patient",
      deps(new InMemoryAppointmentRepository()),
    );

    expect(result).toEqual({ ok: false, rejection: "NotFound" });
  });

  it("rejects an already-cancelled Appointment", async () => {
    const repository = await repoWith(appointment({ status: "cancelled" }));

    const result = await cancel("apt-1", "patient", deps(repository));

    expect(result).toEqual({ ok: false, rejection: "AlreadyCancelled" });
  });

  it("rejects a past (Completed) Appointment", async () => {
    const repository = await repoWith(appointment({ date: "2026-06-18" }));

    const result = await cancel("apt-1", "professional", deps(repository));

    expect(result).toEqual({ ok: false, rejection: "AlreadyCompleted" });
  });

  it("frees the Time Slot and clears the one-open-per-phone gate", async () => {
    const repository = await repoWith(appointment());

    await cancel("apt-1", "patient", deps(repository));

    expect(await repository.scheduledTimesOn("2026-06-22")).toEqual([]);
    expect(await repository.findScheduledByPhone("3421112233")).toEqual([]);
  });

  it("enqueues a Cancellation Notice on both Channels", async () => {
    const repository = await repoWith(appointment());
    const outbox = new InMemoryNotificationOutbox();

    await cancel(
      "apt-1",
      "patient",
      deps(repository, {
        notifyCancellation: (a) =>
          notifyCancellation(a, {
            outbox,
            sender: new FakeNotificationSender(),
            baseUrl: "https://maraflamini.com",
          }),
      }),
    );

    const entries = outbox.all();
    expect(entries).toHaveLength(2);
    expect(
      entries.every((e) => e.notification.kind === "cancellation-notice"),
    ).toBe(true);
    expect(entries.every((e) => e.status === "sent")).toBe(true);
  });

  it("still cancels when the Cancellation Notice fails (decoupled — ADR-0001)", async () => {
    const repository = await repoWith(appointment());

    const result = await cancel(
      "apt-1",
      "patient",
      deps(repository, {
        notifyCancellation: async () => {
          throw new Error("whatsapp down");
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect((await repository.findById("apt-1"))?.status).toBe("cancelled");
  });
});
