import { describe, expect, it } from "vitest";
import type { Appointment } from "./appointment";
import {
  countOpenAppointments,
  isAtOpenAppointmentLimit,
  MAX_OPEN_APPOINTMENTS_PER_PHONE,
} from "./phone-limit";

const now = new Date("2026-06-19T12:00:00"); // a Friday

function scheduledOn(date: string): Appointment {
  return {
    id: "x",
    patientFirstName: "A",
    patientLastName: "B",
    patientPhone: "3421112233",
    patientEmail: "a@b.c",
    visitType: "Consultation",
    consultType: "FirstVisit",
    practiceType: null,
    coverage: { kind: "health-insurance", name: "OSDE" },
    deposit: null,
    date,
    time: "09:00",
    status: "scheduled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("countOpenAppointments", () => {
  it("counts Scheduled Appointments today or in the future", () => {
    expect(
      countOpenAppointments(
        [scheduledOn("2026-06-19"), scheduledOn("2026-06-25")],
        now,
      ),
    ).toBe(2);
  });

  it("does not count past (now Completed) Appointments", () => {
    expect(
      countOpenAppointments(
        [scheduledOn("2026-06-18"), scheduledOn("2026-06-20")],
        now,
      ),
    ).toBe(1);
  });

  it("is zero when there are no Scheduled Appointments", () => {
    expect(countOpenAppointments([], now)).toBe(0);
  });
});

describe("isAtOpenAppointmentLimit", () => {
  it("allows up to two open Appointments per phone", () => {
    expect(MAX_OPEN_APPOINTMENTS_PER_PHONE).toBe(2);
  });

  it("is false below the limit", () => {
    expect(isAtOpenAppointmentLimit([scheduledOn("2026-06-20")], now)).toBe(
      false,
    );
  });

  it("is true once the phone holds the limit of open Appointments", () => {
    expect(
      isAtOpenAppointmentLimit(
        [scheduledOn("2026-06-20"), scheduledOn("2026-06-22")],
        now,
      ),
    ).toBe(true);
  });

  it("ignores past Appointments when checking the limit", () => {
    expect(
      isAtOpenAppointmentLimit(
        [scheduledOn("2026-06-10"), scheduledOn("2026-06-12")],
        now,
      ),
    ).toBe(false);
  });
});
