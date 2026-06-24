import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryAppointmentRepository } from "../appointments/in-memory-appointment-repository";
import { addUnavailableDay } from "./add-unavailable-day";
import { availableTimesFor, bookingWindow } from "./availability";
import { InMemoryUnavailableDaysRepository } from "./in-memory-unavailable-days-repository";
import { DEFAULT_WORK_SCHEDULE } from "./work-schedule";

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
    date: "2026-06-22", // Monday, within the Booking Window
    time: "09:30",
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

async function setup(appts: Appointment[] = []) {
  const appointments = new InMemoryAppointmentRepository();
  for (const a of appts) await appointments.create(a);
  const unavailableDays = new InMemoryUnavailableDaysRepository();
  return {
    appointments,
    unavailableDays,
    deps: { appointments, unavailableDays, now: () => now },
  };
}

describe("addUnavailableDay", () => {
  it("blocks a date that has a Scheduled Appointment and saves nothing", async () => {
    const { unavailableDays, deps } = await setup([appointment()]);

    const result = await addUnavailableDay("2026-06-22", deps);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.collisions.map((a) => a.id)).toEqual([
      "apt-1",
    ]);
    expect(await unavailableDays.list()).toEqual([]);
  });

  it("blocks a free date and persists it", async () => {
    const { unavailableDays, deps } = await setup([appointment()]);

    // A different day with no Appointments.
    const result = await addUnavailableDay("2026-06-23", deps);

    expect(result).toEqual({ ok: true });
    expect(await unavailableDays.list()).toEqual(["2026-06-23"]);
  });

  it("succeeds once the colliding Appointment is cancelled", async () => {
    const { appointments, unavailableDays, deps } = await setup([
      appointment(),
    ]);

    expect((await addUnavailableDay("2026-06-22", deps)).ok).toBe(false);

    await appointments.markCancelled("apt-1");
    const result = await addUnavailableDay("2026-06-22", deps);

    expect(result).toEqual({ ok: true });
    expect(await unavailableDays.list()).toEqual(["2026-06-22"]);
  });
});

describe("Unavailable Day → Booking Window", () => {
  it("excludes an added Unavailable Day from the Booking Window and its Time Slots", async () => {
    const unavailableDays = new InMemoryUnavailableDaysRepository();
    await unavailableDays.add("2026-06-22"); // a working Monday

    const deps = {
      workSchedule: DEFAULT_WORK_SCHEDULE,
      unavailableDays: await unavailableDays.list(),
      scheduledTimesOn: async () => [],
      now: () => now,
    };

    const window = await bookingWindow(deps);
    expect(window).not.toContain("2026-06-22");
    expect(window).toContain("2026-06-29"); // the next Monday is still open
    expect(await availableTimesFor("2026-06-22", deps)).toEqual([]);
  });
});
