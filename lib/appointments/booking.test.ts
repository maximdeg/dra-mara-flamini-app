import { describe, expect, it } from "vitest";
import type { HealthInsurance } from "../coverage/coverage";
import { SEEDED_SELF_PAY_PRICING } from "../deposit/deposit";
import type { Appointment, BookingForm } from "./appointment";
import { book, type BookingDependencies } from "./booking";
import { InMemoryAppointmentRepository } from "./in-memory-appointment-repository";
import { isAtOpenAppointmentLimit } from "./phone-limit";

const accepted: HealthInsurance[] = [{ name: "OSDE", price: 0, notes: "", instructions: "" }];

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
    isPhoneAtOpenAppointmentLimit: () => false,
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
        patientPhone: "+5493421112233",
        patientEmail: "lucia@example.com",
        visitType: "Consultation",
        consultType: "FirstVisit",
        practiceType: null,
        coverage: { kind: "health-insurance", name: "OSDE" },
        coverageInstructions: "",
        deposit: null,
        date: "2026-06-22",
        time: "09:30",
        status: "scheduled",
        whatsappConsentAt: "2026-06-19T12:00:00.000Z",
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

  it("rejects when the phone already holds the maximum open Appointments", async () => {
    const result = await book(
      consultationForm,
      deps({ isPhoneAtOpenAppointmentLimit: () => true }),
    );

    expect(result).toEqual({
      ok: false,
      rejection: "PhoneAtOpenAppointmentLimit",
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

  it("stores the Patient's phone in E.164 so the Confirmation is deliverable", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(
      { ...consultationForm, patientPhone: "0342 15 111-2233" },
      deps({ repository }),
    );

    expect(result.ok).toBe(true);
    const stored = await repository.findById("apt-1");
    expect(stored?.patientPhone).toBe("+5493421112233");
  });

  it("rejects a phone that cannot be read as an Argentine number", async () => {
    const repository = new InMemoryAppointmentRepository();

    const result = await book(
      { ...consultationForm, patientPhone: "12345" },
      deps({ repository }),
    );

    expect(result).toEqual({ ok: false, rejection: "InvalidPhone" });
    expect(await repository.findById("apt-1")).toBeNull();
  });

  it("checks the open-Appointment cap against the normalized phone", async () => {
    const checked: string[] = [];

    await book(
      { ...consultationForm, patientPhone: "0342 15 111-2233" },
      deps({
        isPhoneAtOpenAppointmentLimit: (phone) => {
          checked.push(phone);
          return false;
        },
      }),
    );

    expect(checked).toEqual(["+5493421112233"]);
  });
});

describe("book — open Appointments per phone", () => {
  const now = new Date("2026-06-19T12:00:00");

  // Mirrors the production wiring: the cap is checked against what the
  // repository holds for the phone as of `now`.
  function cappedDeps(repository: InMemoryAppointmentRepository) {
    let n = 0;
    return deps({
      repository,
      now: () => now,
      generateId: () => `apt-${++n}`,
      isPhoneAtOpenAppointmentLimit: async (phone) =>
        isAtOpenAppointmentLimit(
          await repository.findScheduledByPhone(phone),
          now,
        ),
    });
  }

  it("lets one phone hold two open Appointments, then rejects a third", async () => {
    const repository = new InMemoryAppointmentRepository();
    const bookingDeps = cappedDeps(repository);

    const first = await book(consultationForm, bookingDeps);
    const second = await book(
      { ...consultationForm, date: "2026-06-23" },
      bookingDeps,
    );
    const third = await book(
      { ...consultationForm, date: "2026-06-24" },
      bookingDeps,
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third).toEqual({
      ok: false,
      rejection: "PhoneAtOpenAppointmentLimit",
    });
    expect(await repository.findById("apt-3")).toBeNull();
  });

  it("does not count past (Completed) Appointments against the phone", async () => {
    const repository = new InMemoryAppointmentRepository();
    const bookingDeps = cappedDeps(repository);
    for (const date of ["2026-06-10", "2026-06-12"]) {
      await repository.create({
        ...(await bookedOn(date)),
        id: `past-${date}`,
      });
    }

    const result = await book(consultationForm, bookingDeps);

    expect(result.ok).toBe(true);
  });

  it("frees a place once an open Appointment is Cancelled", async () => {
    const repository = new InMemoryAppointmentRepository();
    const bookingDeps = cappedDeps(repository);
    await book(consultationForm, bookingDeps);
    await book({ ...consultationForm, date: "2026-06-23" }, bookingDeps);
    await repository.markCancelled("apt-1");

    const result = await book(
      { ...consultationForm, date: "2026-06-24" },
      bookingDeps,
    );

    expect(result.ok).toBe(true);
  });

  async function bookedOn(date: string): Promise<Appointment> {
    const result = await book({ ...consultationForm, date }, deps());
    if (!result.ok) throw new Error("fixture booking failed");
    return result.appointment;
  }
});

describe("book — WhatsApp consent", () => {
  it("records the instant consent was given when the Patient opts in", async () => {
    const repository = new InMemoryAppointmentRepository();

    await book(
      { ...consultationForm, whatsappConsent: true },
      deps({ repository }),
    );

    expect((await repository.findById("apt-1"))?.whatsappConsentAt).toBe(
      "2026-06-19T12:00:00.000Z",
    );
  });

  it("records a refusal as null when the Patient opts out", async () => {
    const repository = new InMemoryAppointmentRepository();

    await book(
      { ...consultationForm, whatsappConsent: false },
      deps({ repository }),
    );

    expect((await repository.findById("apt-1"))?.whatsappConsentAt).toBeNull();
  });

  it("treats an omitted consent field as consent (pre-checkbox API clients)", async () => {
    const repository = new InMemoryAppointmentRepository();

    await book(consultationForm, deps({ repository }));

    expect((await repository.findById("apt-1"))?.whatsappConsentAt).toBe(
      "2026-06-19T12:00:00.000Z",
    );
  });

  it("still books when the Patient declines WhatsApp", async () => {
    const result = await book(
      { ...consultationForm, whatsappConsent: false },
      deps(),
    );

    expect(result.ok).toBe(true);
  });
});

describe("book — optional email", () => {
  async function storedEmail(
    patientEmail: string | null | undefined,
  ): Promise<string | null | undefined> {
    const repository = new InMemoryAppointmentRepository();
    const result = await book(
      { ...consultationForm, patientEmail },
      deps({ repository }),
    );
    expect(result.ok).toBe(true);
    return (await repository.findById("apt-1"))?.patientEmail;
  }

  it("stores a blank email as null", async () => {
    expect(await storedEmail("")).toBeNull();
  });

  it("stores a whitespace-only email as null", async () => {
    expect(await storedEmail("   ")).toBeNull();
  });

  it("stores an omitted email as null (API clients that send none)", async () => {
    expect(await storedEmail(undefined)).toBeNull();
    expect(await storedEmail(null)).toBeNull();
  });

  it("stores a valid email trimmed", async () => {
    expect(await storedEmail("  lucia@example.com ")).toBe("lucia@example.com");
  });

  it("rejects a malformed email, creating no Appointment", async () => {
    for (const patientEmail of ["lucia", "lucia@", "@example.com", "lucia@example", "a@b@c.com", "lu cia@example.com"]) {
      const repository = new InMemoryAppointmentRepository();

      const result = await book(
        { ...consultationForm, patientEmail },
        deps({ repository }),
      );

      expect(result).toEqual({ ok: false, rejection: "InvalidEmail" });
      expect(await repository.findById("apt-1")).toBeNull();
    }
  });
});

describe("book — Coverage Instructions", () => {
  const insurers: HealthInsurance[] = [
    { name: "OSDE", price: 0, notes: "interna", instructions: "Traer carnet" },
  ];

  it("copies the chosen insurer's Instructions onto the Appointment", async () => {
    const repository = new InMemoryAppointmentRepository();

    await book(
      consultationForm,
      deps({ repository, acceptedHealthInsurances: insurers }),
    );

    expect((await repository.findById("apt-1"))?.coverageInstructions).toBe(
      "Traer carnet",
    );
  });

  it("keeps the copied Instructions when the insurer is edited later", async () => {
    const repository = new InMemoryAppointmentRepository();
    const live = [...insurers];
    await book(
      consultationForm,
      deps({ repository, acceptedHealthInsurances: live }),
    );

    live[0] = { ...live[0], instructions: "Nuevo requisito" };

    expect((await repository.findById("apt-1"))?.coverageInstructions).toBe(
      "Traer carnet",
    );
  });

  it("copies a Self-Pay variant's Instructions onto the Appointment", async () => {
    const repository = new InMemoryAppointmentRepository();

    await book(
      {
        ...consultationForm,
        consultType: "FollowUp",
        coverage: { kind: "self-pay", variant: "Particular" },
      },
      deps({
        repository,
        selfPayPricing: {
          ...SEEDED_SELF_PAY_PRICING,
          instructions: {
            Particular: "Abonar en efectivo",
            PracticaParticular: "",
          },
        },
      }),
    );

    expect((await repository.findById("apt-1"))?.coverageInstructions).toBe(
      "Abonar en efectivo",
    );
  });
});
