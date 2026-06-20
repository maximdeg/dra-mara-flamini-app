import { describe, expect, it } from "vitest";
import type { Appointment } from "./appointment";
import {
  listAppointments,
  type ListingDependencies,
} from "./appointment-listing";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";

const now = new Date("2026-06-19T12:00:00"); // a Friday

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt",
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
  ...appts: Appointment[]
): Promise<InMemoryAppointmentRepository> {
  const repository = new InMemoryAppointmentRepository();
  for (const appt of appts) {
    await repository.create(appt);
  }
  return repository;
}

function deps(repository: InMemoryAppointmentRepository): ListingDependencies {
  return { repository, now: () => now };
}

// A fixed cast: one past Scheduled (→ Completed), one future Scheduled, one
// Cancelled, plus a Practice for the Visit Type filter.
async function cast(): Promise<InMemoryAppointmentRepository> {
  return repoWith(
    appointment({ id: "past", date: "2026-06-17", time: "10:00" }), // Completed
    appointment({ id: "future", date: "2026-06-23", time: "08:00" }), // Scheduled
    appointment({ id: "cancelled", date: "2026-06-24", status: "cancelled" }),
    appointment({
      id: "practice",
      date: "2026-06-25",
      time: "11:00",
      visitType: "Practice",
      consultType: null,
      practiceType: "Biopsy",
    }), // Scheduled
  );
}

describe("listAppointments", () => {
  it("returns every Appointment with its derived Status, sorted by date then time", async () => {
    const views = await listAppointments({}, deps(await cast()));

    expect(views.map((v) => v.appointment.id)).toEqual([
      "past",
      "future",
      "cancelled",
      "practice",
    ]);
    expect(views.map((v) => v.status)).toEqual([
      "completed",
      "scheduled",
      "cancelled",
      "scheduled",
    ]);
  });

  it("filters by derived Completed (past Scheduled only)", async () => {
    const views = await listAppointments(
      { status: "completed" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["past"]);
  });

  it("filters by derived Scheduled (future Scheduled only — excludes past and cancelled)", async () => {
    const views = await listAppointments(
      { status: "scheduled" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["future", "practice"]);
  });

  it("filters by Cancelled", async () => {
    const views = await listAppointments(
      { status: "cancelled" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["cancelled"]);
  });

  it("filters by Visit Type", async () => {
    const views = await listAppointments(
      { visitType: "Practice" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["practice"]);
  });

  it("filters by an inclusive date range", async () => {
    const views = await listAppointments(
      { from: "2026-06-23", to: "2026-06-24" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["future", "cancelled"]);
  });

  it("combines a date range with a derived-Status filter", async () => {
    const views = await listAppointments(
      { from: "2026-06-20", to: "2026-06-30", status: "scheduled" },
      deps(await cast()),
    );

    expect(views.map((v) => v.appointment.id)).toEqual(["future", "practice"]);
  });
});
