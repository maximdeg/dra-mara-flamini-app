import { describe, expect, it } from "vitest";
import type { Appointment } from "./appointment";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt",
    patientFirstName: "Lucía",
    patientLastName: "Gómez",
    patientPhone: "3421112233",
    patientEmail: null,
    visitType: "Consultation",
    consultType: "FirstVisit",
    practiceType: null,
    coverage: { kind: "health-insurance", name: "OSDE" },
    deposit: null,
    date: "2026-06-22",
    time: "09:00",
    durationMinutes: 20,
    status: "scheduled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-06-19T11:55:00.000Z",
    ...overrides,
  };
}

async function repoWith(
  ...appts: Appointment[]
): Promise<InMemoryAppointmentRepository> {
  const repository = new InMemoryAppointmentRepository();
  for (const appt of appts) {
    await repository.create(appt);
  }
  return repository;
}

describe("scheduledIntervalsBetween", () => {
  it("groups the Scheduled intervals by date across an inclusive range", async () => {
    const repository = await repoWith(
      appointment({ id: "a", date: "2026-06-22", time: "09:00" }),
      appointment({ id: "b", date: "2026-06-22", time: "09:20" }),
      appointment({ id: "c", date: "2026-06-26", time: "10:00" }),
    );

    expect(
      await repository.scheduledIntervalsBetween("2026-06-22", "2026-06-26"),
    ).toEqual({
      "2026-06-22": [
        { time: "09:00", durationMinutes: 20 },
        { time: "09:20", durationMinutes: 20 },
      ],
      "2026-06-26": [{ time: "10:00", durationMinutes: 20 }],
    });
  });

  it("leaves out dates outside the range and cancelled Appointments", async () => {
    const repository = await repoWith(
      appointment({ id: "before", date: "2026-06-21" }),
      appointment({ id: "after", date: "2026-06-27" }),
      appointment({ id: "cancelled", status: "cancelled" }),
    );

    expect(
      await repository.scheduledIntervalsBetween("2026-06-22", "2026-06-26"),
    ).toEqual({});
  });

  it("gives Appointments booked before durations the default duration", async () => {
    const repository = await repoWith(
      appointment({ durationMinutes: undefined }),
    );

    expect(
      await repository.scheduledIntervalsBetween("2026-06-22", "2026-06-22"),
    ).toEqual({ "2026-06-22": [{ time: "09:00", durationMinutes: 20 }] });
  });

  it("agrees with the per-day read", async () => {
    const repository = await repoWith(
      appointment({ id: "a", time: "09:00", durationMinutes: 40 }),
      appointment({ id: "b", time: "11:00" }),
    );

    const byDate = await repository.scheduledIntervalsBetween(
      "2026-06-22",
      "2026-06-22",
    );
    expect(byDate["2026-06-22"]).toEqual(
      await repository.scheduledIntervalsOn("2026-06-22"),
    );
  });
});
