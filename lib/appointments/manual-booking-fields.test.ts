import { describe, expect, it } from "vitest";
import { DEFAULT_VISIT_DURATIONS } from "@/lib/availability/visit-durations";
import {
  EMPTY_FIELDS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  OTHER_COVERAGE,
  practiceTypeOptions,
  toManualBookingForm,
  withDuration,
  withSubType,
  withVisitType,
  type ManualFields,
} from "./manual-booking-fields";

const durations = { ...DEFAULT_VISIT_DURATIONS, Biopsy: 40, FollowUp: 10 };

const filled: ManualFields = {
  ...EMPTY_FIELDS,
  firstName: "Lucía",
  lastName: "Gómez",
  phone: "3421112233",
  visitType: "Practice",
  subType: "Biopsy",
  coverage: "self-pay:PracticaParticular",
  date: "2026-06-27",
  hour: "20",
  minute: "15",
  durationMinutes: 40,
  whatsappConsent: true,
};

describe("practiceTypeOptions", () => {
  it("offers the bookable Practice Types and the admin-only ones", () => {
    expect(practiceTypeOptions().map((o) => o.label)).toEqual([
      "Criocirugía",
      "Electrocoagulación",
      "Biopsia",
      "Plasma",
      "Peeling",
      "Skin Booster",
      "Toxina Botulínica",
    ]);
  });
});

describe("duration default", () => {
  it("follows the chosen kind's Visit Duration, and 20 for Plasma", () => {
    let fields = withVisitType(EMPTY_FIELDS, "Practice", durations);
    fields = withSubType(fields, "Biopsy", durations);
    expect(fields.durationMinutes).toBe(40);
    fields = withSubType(fields, "Plasma", durations);
    expect(fields.durationMinutes).toBe(20);
  });

  it("stops following the kind once the Professional picks a duration", () => {
    let fields = withSubType(
      withVisitType(EMPTY_FIELDS, "Practice", durations),
      "Biopsy",
      durations,
    );
    fields = withDuration(fields, 90);
    fields = withSubType(fields, "Cryosurgery", durations);
    expect(fields.durationMinutes).toBe(90);
  });

  it("clears the sub-type and coverage when the Visit Type changes", () => {
    const fields = withVisitType(
      { ...filled, otherCoverageName: "IOMA" },
      "Consultation",
      durations,
    );
    expect(fields.subType).toBe("");
    expect(fields.coverage).toBe("");
    expect(fields.otherCoverageName).toBe("");
  });
});

describe("toManualBookingForm", () => {
  it("builds the form for a Practice with Self-Pay", () => {
    expect(toManualBookingForm(filled)).toEqual({
      patientFirstName: "Lucía",
      patientLastName: "Gómez",
      patientPhone: "3421112233",
      visitType: "Practice",
      consultType: null,
      practiceType: "Biopsy",
      coverage: { kind: "self-pay", variant: "PracticaParticular" },
      date: "2026-06-27",
      time: "20:15",
      durationMinutes: 40,
      whatsappConsent: true,
    });
  });

  it("puts a Consult Type in its own field", () => {
    const form = toManualBookingForm({
      ...filled,
      visitType: "Consultation",
      subType: "FollowUp",
      coverage: "health-insurance:OSDE",
    });
    expect(form?.consultType).toBe("FollowUp");
    expect(form?.practiceType).toBeNull();
    expect(form?.coverage).toEqual({ kind: "health-insurance", name: "OSDE" });
  });

  it("turns Otro into an other coverage with the typed name", () => {
    const form = toManualBookingForm({
      ...filled,
      coverage: OTHER_COVERAGE,
      otherCoverageName: "IOMA",
    });
    expect(form?.coverage).toEqual({ kind: "other", name: "IOMA" });
  });

  it("is null while the Visit Type, sub-type or coverage is still missing", () => {
    expect(toManualBookingForm({ ...filled, visitType: "" })).toBeNull();
    expect(toManualBookingForm({ ...filled, subType: "" })).toBeNull();
    expect(toManualBookingForm({ ...filled, coverage: "" })).toBeNull();
  });
});

describe("24-hour time", () => {
  it("offers hours 00–23 and minutes 00–59", () => {
    expect(HOUR_OPTIONS[0]).toBe("00");
    expect(HOUR_OPTIONS.at(-1)).toBe("23");
    expect(HOUR_OPTIONS).toHaveLength(24);
    expect(MINUTE_OPTIONS[0]).toBe("00");
    expect(MINUTE_OPTIONS.at(-1)).toBe("59");
    expect(MINUTE_OPTIONS).toHaveLength(60);
  });

  it("starts with no hour and minutes at 00", () => {
    expect(EMPTY_FIELDS.hour).toBe("");
    expect(EMPTY_FIELDS.minute).toBe("00");
  });

  it("joins hour and minute into HH:MM, or leaves it blank without an hour", () => {
    expect(toManualBookingForm({ ...filled, hour: "08", minute: "05" })?.time).toBe(
      "08:05",
    );
    expect(toManualBookingForm({ ...filled, hour: "" })?.time).toBe("");
  });
});
