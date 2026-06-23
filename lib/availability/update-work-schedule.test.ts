import { describe, expect, it } from "vitest";
import type { Appointment } from "../appointments/appointment";
import { InMemoryAppointmentRepository } from "../appointments/in-memory-appointment-repository";
import { InMemoryWorkScheduleRepository } from "./in-memory-work-schedule-repository";
import { updateWorkSchedule } from "./update-work-schedule";
import {
  DEFAULT_WORK_SCHEDULE,
  type Weekday,
  type WorkdaySchedule,
  type WorkSchedule,
} from "./work-schedule";

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
    date: "2026-06-22", // Monday
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

function withWeekday(weekday: Weekday, patch: Partial<WorkdaySchedule>): WorkSchedule {
  return DEFAULT_WORK_SCHEDULE.map((d) =>
    d.weekday === weekday ? { ...d, ...patch } : d,
  );
}

async function setup(appts: Appointment[] = []) {
  const appointments = new InMemoryAppointmentRepository();
  for (const a of appts) await appointments.create(a);
  const schedule = new InMemoryWorkScheduleRepository();
  return { appointments, schedule, deps: { appointments, schedule, now: () => now } };
}

describe("updateWorkSchedule", () => {
  it("saves a non-colliding change and reflects it via the seam", async () => {
    const { schedule, deps } = await setup([appointment()]);
    const proposed = withWeekday("tuesday", {
      ranges: [{ start: "09:00", end: "15:00" }],
    });

    const result = await updateWorkSchedule(proposed, deps);

    expect(result).toEqual({ ok: true });
    expect(await schedule.get()).toEqual(proposed);
  });

  it("blocks a reduction that strands a Scheduled Appointment and saves nothing", async () => {
    const { schedule, deps } = await setup([appointment()]);
    const proposed = withWeekday("monday", { isWorkingDay: false, ranges: [] });

    const result = await updateWorkSchedule(proposed, deps);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.collisions.map((a) => a.id)).toEqual([
      "apt-1",
    ]);
    // Unchanged — still the seeded default.
    expect(await schedule.get()).toEqual(DEFAULT_WORK_SCHEDULE);
  });

  it("applies once the colliding Appointment is cancelled", async () => {
    const { appointments, schedule, deps } = await setup([appointment()]);
    const proposed = withWeekday("monday", { isWorkingDay: false, ranges: [] });

    expect((await updateWorkSchedule(proposed, deps)).ok).toBe(false);

    await appointments.markCancelled("apt-1");
    const result = await updateWorkSchedule(proposed, deps);

    expect(result).toEqual({ ok: true });
    expect(await schedule.get()).toEqual(proposed);
  });
});
