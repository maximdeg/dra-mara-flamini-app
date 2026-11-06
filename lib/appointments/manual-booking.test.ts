import { describe, expect, it } from "vitest";
import type { HealthInsurance } from "../coverage/coverage";
import type { Appointment } from "./appointment";
import { availableTimesFor } from "../availability/availability";
import { DEFAULT_VISIT_DURATIONS } from "../availability/visit-durations";
import { DEFAULT_WORK_SCHEDULE } from "../availability/work-schedule";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";
import {
  bookManually,
  type ManualBookingDependencies,
  type ManualBookingForm,
} from "./manual-booking";

const accepted: HealthInsurance[] = [
  { name: "OSDE", price: 0, notes: "", instructions: "Traer carnet" },
];

// 2026-06-19 09:00 in Argentina (UTC−3).
const NOW = new Date("2026-06-19T12:00:00.000Z");

const form: ManualBookingForm = {
  patientFirstName: "Lucía",
  patientLastName: "Gómez",
  patientPhone: "3421112233",
  visitType: "Practice",
  consultType: null,
  practiceType: "Plasma",
  coverage: { kind: "self-pay", variant: "PracticaParticular" },
  date: "2026-06-27", // a Saturday
  time: "20:15",
  durationMinutes: 40,
  whatsappConsent: true,
};

function deps(
  overrides: Partial<ManualBookingDependencies> = {},
): ManualBookingDependencies {
  return {
    repository: new InMemoryAppointmentRepository(),
    acceptedHealthInsurances: accepted,
    selfPayInstructions: {
      Particular: "Abonar en efectivo",
      PracticaParticular: "Traer estudios",
    },
    notifyConfirmation: async () => {},
    sendConfirmationEmail: async () => {},
    generateId: () => "apt-1",
    now: () => NOW,
    ...overrides,
  };
}

describe("bookManually", () => {
  it("persists a manual Scheduled Appointment at any date, time and duration", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await bookManually(form, deps({ repository }));

    const expected: Appointment = {
      id: "apt-1",
      origin: "manual",
      patientFirstName: "Lucía",
      patientLastName: "Gómez",
      patientPhone: "+5493421112233",
      patientEmail: null,
      visitType: "Practice",
      consultType: null,
      practiceType: "Plasma",
      coverage: { kind: "self-pay", variant: "PracticaParticular" },
      coverageInstructions: "Traer estudios",
      deposit: null,
      date: "2026-06-27",
      time: "20:15",
      durationMinutes: 40,
      status: "scheduled",
      whatsappConsentAt: NOW.toISOString(),
      whatsappSent: false,
      whatsappSentAt: null,
      whatsappMessageId: null,
      emailSent: false,
      emailSentAt: null,
      emailMessageId: null,
      createdAt: NOW.toISOString(),
    };
    expect(result).toEqual({ ok: true, appointment: expected });
    expect(await repository.findById("apt-1")).toEqual(expected);
  });
});

describe("bookManually — validation", () => {
  async function rejectionFor(overrides: Partial<ManualBookingForm>) {
    const repository = new InMemoryAppointmentRepository();
    const result = await bookManually(
      { ...form, ...overrides },
      deps({ repository }),
    );
    // A refused form never persists anything.
    expect(await repository.findById("apt-1")).toBeNull();
    return result.ok ? null : result.rejection;
  }

  it("requires a first and a last name, and trims them", async () => {
    expect(await rejectionFor({ patientFirstName: "  " })).toBe("MissingName");
    expect(await rejectionFor({ patientLastName: "" })).toBe("MissingName");

    const result = await bookManually(
      { ...form, patientFirstName: " Lucía ", patientLastName: " Gómez " },
      deps(),
    );
    expect(result.ok && result.appointment.patientFirstName).toBe("Lucía");
    expect(result.ok && result.appointment.patientLastName).toBe("Gómez");
  });

  it("refuses a phone that is not a valid Argentine number", async () => {
    expect(await rejectionFor({ patientPhone: "123" })).toBe("InvalidPhone");
  });

  it("accepts no phone, storing none and no WhatsApp consent, and sends nothing", async () => {
    const sent: string[] = [];
    const result = await bookManually(
      { ...form, patientPhone: "  ", whatsappConsent: true },
      deps({
        notifyConfirmation: () => void sent.push("whatsapp"),
        sendConfirmationEmail: () => void sent.push("email"),
      }),
    );
    expect(result.ok && result.appointment.patientPhone).toBe("");
    // No consent stored means no Reminder or Cancellation Notice later either.
    expect(result.ok && result.appointment.whatsappConsentAt).toBeNull();
    expect(sent).toEqual([]);
  });

  it("requires a Consult Type for a Consultation and drops any Practice Type", async () => {
    expect(
      await rejectionFor({
        visitType: "Consultation",
        consultType: null,
        coverage: { kind: "self-pay", variant: "Particular" },
      }),
    ).toBe("MissingConsultType");

    const result = await bookManually(
      {
        ...form,
        visitType: "Consultation",
        consultType: "FollowUp",
        practiceType: "Plasma",
        coverage: { kind: "self-pay", variant: "Particular" },
      },
      deps(),
    );
    expect(result.ok && result.appointment.consultType).toBe("FollowUp");
    expect(result.ok && result.appointment.practiceType).toBeNull();
  });

  it("requires a known Practice Type for a Practice and drops any Consult Type", async () => {
    expect(await rejectionFor({ practiceType: null })).toBe(
      "MissingPracticeType",
    );
    expect(
      await rejectionFor({ practiceType: "Botox" as never }),
    ).toBe("MissingPracticeType");

    const result = await bookManually(
      { ...form, consultType: "FirstVisit", practiceType: "Biopsy" },
      deps(),
    );
    expect(result.ok && result.appointment.practiceType).toBe("Biopsy");
    expect(result.ok && result.appointment.consultType).toBeNull();
  });

  it("accepts every admin-only Practice Type", async () => {
    for (const practiceType of [
      "Plasma",
      "Peeling",
      "SkinBooster",
      "BotulinumToxin",
    ] as const) {
      const result = await bookManually({ ...form, practiceType }, deps());
      expect(result.ok && result.appointment.practiceType).toBe(practiceType);
    }
  });

  it("refuses a malformed or non-existent date", async () => {
    for (const date of ["", "27/06/2026", "2026-02-30", "2026-6-1"]) {
      expect(await rejectionFor({ date })).toBe("InvalidDate");
    }
  });

  it("accepts a past date", async () => {
    const result = await bookManually({ ...form, date: "2025-01-10" }, deps());
    expect(result.ok).toBe(true);
  });

  it("refuses a time that is not a 24-hour HH:MM", async () => {
    for (const time of ["", "9:30", "24:00", "12:60", "noon"]) {
      expect(await rejectionFor({ time })).toBe("InvalidTime");
    }
  });

  it("refuses a duration off the Duración options", async () => {
    for (const durationMinutes of [0, 5, 25, 130, Number.NaN]) {
      expect(await rejectionFor({ durationMinutes })).toBe("InvalidDuration");
    }
  });

  it("refuses an Appointment that would run past midnight, but allows one ending at it", async () => {
    expect(
      await rejectionFor({ time: "23:40", durationMinutes: 30 }),
    ).toBe("OverrunsMidnight");

    const result = await bookManually(
      { ...form, time: "23:40", durationMinutes: 20 },
      deps(),
    );
    expect(result.ok).toBe(true);
  });

  it("accepts an accepted insurer and copies its Instructions", async () => {
    const result = await bookManually(
      { ...form, coverage: { kind: "health-insurance", name: "OSDE" } },
      deps(),
    );
    expect(result.ok && result.appointment.coverageInstructions).toBe(
      "Traer carnet",
    );
  });

  it("refuses the other Visit Type's Self-Pay variant and an unknown insurer", async () => {
    expect(
      await rejectionFor({ coverage: { kind: "self-pay", variant: "Particular" } }),
    ).toBe("InvalidCoverage");
    expect(
      await rejectionFor({ coverage: { kind: "health-insurance", name: "IOMA" } }),
    ).toBe("InvalidCoverage");
  });

  it("accepts an Otro coverage with a typed name, cleaned, with no Instructions", async () => {
    expect(
      await rejectionFor({ coverage: { kind: "other", name: "   " } }),
    ).toBe("InvalidCoverage");

    const result = await bookManually(
      { ...form, coverage: { kind: "other", name: "  IOMA \n plan B " } },
      deps(),
    );
    expect(result.ok && result.appointment.coverage).toEqual({
      kind: "other",
      name: "IOMA plan B",
    });
    expect(result.ok && result.appointment.coverageInstructions).toBe("");
  });
});

describe("bookManually — the agenda", () => {
  // A 30-minute Appointment already Scheduled on the same date, 10:00–10:30.
  async function withBooked(status: Appointment["status"] = "scheduled") {
    const repository = new InMemoryAppointmentRepository();
    const first = await bookManually(
      { ...form, date: "2026-06-24", time: "10:00", durationMinutes: 30 },
      deps({ repository, generateId: () => "booked" }),
    );
    if (!first.ok) throw new Error("setup failed");
    if (status === "cancelled") await repository.markCancelled("booked");
    return repository;
  }

  async function attempt(time: string, durationMinutes: number, repository: InMemoryAppointmentRepository, date = "2026-06-24") {
    return bookManually(
      { ...form, date, time, durationMinutes },
      deps({ repository, generateId: () => `new-${time}` }),
    );
  }

  it("refuses any interval overlapping a Scheduled Appointment", async () => {
    for (const [time, minutes] of [
      ["09:50", 20], // runs into its start
      ["10:20", 20], // starts before its end
      ["10:10", 10], // inside it
      ["09:50", 60], // covers it
      ["10:00", 30], // the same interval
    ] as const) {
      const repository = await withBooked();
      const result = await attempt(time, minutes, repository);
      expect(result).toEqual({ ok: false, rejection: "SlotTaken" });
      expect(await repository.findById(`new-${time}`)).toBeNull();
    }
  });

  it("allows an interval touching it on either side", async () => {
    const repository = await withBooked();
    expect((await attempt("09:40", 20, repository)).ok).toBe(true);
    expect((await attempt("10:30", 20, repository)).ok).toBe(true);
  });

  it("is not blocked by a Cancelled Appointment or one on another date", async () => {
    expect((await attempt("10:00", 30, await withBooked("cancelled"))).ok).toBe(
      true,
    );
    expect(
      (await attempt("10:00", 30, await withBooked(), "2026-06-25")).ok,
    ).toBe(true);
  });
});

describe("bookManually — online booking steps around it", () => {
  it("removes the reserved time from the Patient's Time Slots", async () => {
    const repository = new InMemoryAppointmentRepository();
    const availability = {
      workSchedule: DEFAULT_WORK_SCHEDULE, // Monday 09:00–13:00
      unavailableDays: [],
      scheduledIntervalsOn: (date: string) =>
        repository.scheduledIntervalsOn(date),
      visitDurations: DEFAULT_VISIT_DURATIONS, // 20 minutes each
    };
    const before = await availableTimesFor("2026-06-22", "FirstVisit", availability);
    expect(before.slice(0, 3)).toEqual(["09:00", "09:20", "09:40"]);

    await bookManually(
      { ...form, date: "2026-06-22", time: "09:00", durationMinutes: 40 },
      deps({ repository }),
    );

    const after = await availableTimesFor("2026-06-22", "FirstVisit", availability);
    expect(after.slice(0, 2)).toEqual(["09:40", "10:00"]);
  });
});

describe("bookManually — notifications", () => {
  function spies(fail = false) {
    const sent: string[] = [];
    return {
      sent,
      overrides: {
        notifyConfirmation: async (a: Appointment) => {
          sent.push(`whatsapp:${a.id}`);
          if (fail) throw new Error("Meta down");
        },
        sendConfirmationEmail: async (a: Appointment) => {
          sent.push(`email:${a.id}`);
          if (fail) throw new Error("SMTP down");
        },
      },
    };
  }

  it("sends the Confirmation for a future start when the Patient consented", async () => {
    const { sent, overrides } = spies();
    await bookManually(form, deps(overrides));
    expect(sent).toEqual(["whatsapp:apt-1", "email:apt-1"]);
  });

  it("sends nothing, and stores no consent, when the Patient did not consent", async () => {
    const { sent, overrides } = spies();
    const result = await bookManually(
      { ...form, whatsappConsent: false },
      deps(overrides),
    );
    expect(sent).toEqual([]);
    expect(result.ok && result.appointment.whatsappConsentAt).toBeNull();
  });

  it("sends nothing for a start already past in Argentina", async () => {
    // NOW is 09:00 on 2026-06-19 in Argentina.
    for (const [date, time] of [
      ["2026-06-18", "20:00"],
      ["2026-06-19", "08:59"],
      ["2026-06-19", "09:00"],
    ]) {
      const { sent, overrides } = spies();
      await bookManually({ ...form, date, time }, deps(overrides));
      expect(sent).toEqual([]);
    }

    const { sent, overrides } = spies();
    await bookManually(
      { ...form, date: "2026-06-19", time: "09:10" },
      deps(overrides),
    );
    expect(sent).toEqual(["whatsapp:apt-1", "email:apt-1"]);
  });

  it("keeps the Appointment when a notification fails", async () => {
    const repository = new InMemoryAppointmentRepository();
    const { overrides } = spies(true);
    const result = await bookManually(form, deps({ repository, ...overrides }));
    expect(result.ok).toBe(true);
    expect(await repository.findById("apt-1")).not.toBeNull();
  });
});
