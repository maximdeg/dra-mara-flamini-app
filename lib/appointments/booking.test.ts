import { describe, expect, it } from "vitest";
import type { HealthInsurance } from "../coverage/coverage";
import { SEEDED_SELF_PAY_PRICING } from "../deposit/deposit";
import type { Appointment, BookingForm } from "./appointment";
import {
  book,
  phoneHasOpenAppointment,
  type BookingDependencies,
} from "./booking";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";

const accepted: HealthInsurance[] = [{ name: "OSDE", price: 0, notes: "" }];

const consultationForm: BookingForm = {
  patientFirstName: "Lucía",
  patientLastName: "Gómez",
  patientPhone: "3421112233",
  patientEmail: "lucia@example.com",
  visitType: "Consultation",
  consultType: "FirstVisit",
  coverage: { kind: "health-insurance", name: "OSDE" },
  date: "2026-06-22",
  time: "09:30",
};

function deps(
  overrides: Partial<BookingDependencies> = {},
): BookingDependencies {
  return {
    repository: new InMemoryAppointmentRepository(),
    acceptedHealthInsurances: accepted,
    selfPayPricing: SEEDED_SELF_PAY_PRICING,
    classifyDateTime: () => "ok" as const,
    hasOpenAppointmentForPhone: () => false,
    notifyConfirmation: async () => {},
    sendConfirmationEmail: async () => {},
    generateId: () => "apt-1",
    now: () => new Date("2026-06-19T12:00:00.000Z"),
    ...overrides,
  };
}

describe("book", () => {
  it("creates and persists a Scheduled Appointment with its Visit Type and coverage", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(consultationForm, deps({ repository }));

    expect(result).toEqual({
      ok: true,
      appointment: {
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
        emailSent: false,
        emailSentAt: null,
        emailMessageId: null,
        createdAt: "2026-06-19T12:00:00.000Z",
      },
    });
    expect(await repository.findById("apt-1")).not.toBeNull();
  });

  it("sends a Confirmation for the booked Appointment", async () => {
    let notifiedId: string | null = null;
    const result = await book(
      consultationForm,
      deps({
        notifyConfirmation: async (appointment) => {
          notifiedId = appointment.id;
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect(notifiedId).toBe("apt-1");
  });

  it("still books when the Confirmation fails (decoupled — ADR-0001)", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(
      consultationForm,
      deps({
        repository,
        notifyConfirmation: async () => {
          throw new Error("whatsapp down");
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect(await repository.findById("apt-1")).not.toBeNull();
  });

  it("sends a Confirmation email for the booked Appointment", async () => {
    let emailedId: string | null = null;
    const result = await book(
      consultationForm,
      deps({
        sendConfirmationEmail: async (appointment) => {
          emailedId = appointment.id;
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect(emailedId).toBe("apt-1");
  });

  it("still books when the Confirmation email fails (decoupled — ADR-0001)", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(
      consultationForm,
      deps({
        repository,
        sendConfirmationEmail: async () => {
          throw new Error("smtp down");
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect(await repository.findById("apt-1")).not.toBeNull();
  });

  it("books a Practice with a Practice Type and the Self-Pay Practice variant", async () => {
    const result = await book(
      {
        ...consultationForm,
        visitType: "Practice",
        consultType: undefined,
        practiceType: "Cryosurgery",
        coverage: { kind: "self-pay", variant: "PracticaParticular" },
        depositAcknowledged: true,
      },
      deps(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.appointment.practiceType).toBe("Cryosurgery");
      expect(result.appointment.consultType).toBeNull();
      expect(result.appointment.deposit).toEqual({
        amount: 35000,
        acknowledged: true,
      });
    }
  });

  it("rejects a Self-Pay Practice whose Deposit was not acknowledged", async () => {
    const result = await book(
      {
        ...consultationForm,
        visitType: "Practice",
        consultType: undefined,
        practiceType: "Cryosurgery",
        coverage: { kind: "self-pay", variant: "PracticaParticular" },
        depositAcknowledged: false,
      },
      deps(),
    );

    expect(result).toEqual({ ok: false, rejection: "DepositNotAcknowledged" });
  });

  it("books a Self-Pay Follow-up Consultation with no Deposit and no acknowledgment", async () => {
    const result = await book(
      {
        ...consultationForm,
        consultType: "FollowUp",
        coverage: { kind: "self-pay", variant: "Particular" },
      },
      deps(),
    );

    expect(result.ok).toBe(true);
    expect(result.ok && result.appointment.deposit).toBeNull();
  });

  it("normalizes away the sub-type that does not belong to the Visit Type", async () => {
    const result = await book(
      { ...consultationForm, practiceType: "Biopsy" },
      deps(),
    );

    expect(result.ok && result.appointment.practiceType).toBe(null);
    expect(result.ok && result.appointment.consultType).toBe("FirstVisit");
  });

  it("rejects a Consultation with no Consult Type", async () => {
    const result = await book(
      { ...consultationForm, consultType: undefined },
      deps(),
    );

    expect(result).toEqual({ ok: false, rejection: "MissingConsultType" });
  });

  it("rejects a Practice with no Practice Type", async () => {
    const result = await book(
      { ...consultationForm, visitType: "Practice", consultType: undefined },
      deps(),
    );

    expect(result).toEqual({ ok: false, rejection: "MissingPracticeType" });
  });

  it("rejects the wrong Visit Type's Self-Pay variant", async () => {
    // Practica Particular is for a Practice, not a Consultation.
    const result = await book(
      {
        ...consultationForm,
        coverage: { kind: "self-pay", variant: "PracticaParticular" },
      },
      deps(),
    );

    expect(result).toEqual({
      ok: false,
      rejection: "InvalidCoverageForVisitType",
    });
  });

  it("rejects an unaccepted Health Insurance", async () => {
    const result = await book(
      {
        ...consultationForm,
        coverage: { kind: "health-insurance", name: "Not An Insurer" },
      },
      deps(),
    );

    expect(result).toEqual({
      ok: false,
      rejection: "InvalidCoverageForVisitType",
    });
  });

  it("rejects when the phone already has an open Appointment", async () => {
    const result = await book(
      consultationForm,
      deps({ hasOpenAppointmentForPhone: () => true }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: "PhoneHasOpenAppointment",
    });
  });

  it("rejects a date/time outside the Booking Window", async () => {
    const result = await book(
      consultationForm,
      deps({ classifyDateTime: () => "outside-window" as const }),
    );

    expect(result).toEqual({ ok: false, rejection: "OutsideBookingWindow" });
  });

  it("rejects a Time Slot taken since the form loaded, creating no Appointment", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(
      consultationForm,
      deps({ repository, classifyDateTime: () => "slot-taken" as const }),
    );

    expect(result).toEqual({ ok: false, rejection: "SlotTaken" });
    expect(
      await repository.findScheduledByPhone(consultationForm.patientPhone),
    ).toEqual([]);
  });
});

describe("phoneHasOpenAppointment", () => {
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

  it("is true when a Scheduled Appointment is today or in the future", () => {
    expect(phoneHasOpenAppointment([scheduledOn("2026-06-20")], now)).toBe(
      true,
    );
    expect(phoneHasOpenAppointment([scheduledOn("2026-06-19")], now)).toBe(
      true,
    );
  });

  it("is false when the only Scheduled Appointment is in the past (now Completed)", () => {
    expect(phoneHasOpenAppointment([scheduledOn("2026-06-18")], now)).toBe(
      false,
    );
  });

  it("is false when there are no Scheduled Appointments", () => {
    expect(phoneHasOpenAppointment([], now)).toBe(false);
  });
});
