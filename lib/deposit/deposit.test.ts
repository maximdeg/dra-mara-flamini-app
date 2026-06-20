import { describe, expect, it } from "vitest";
import {
  depositAmountFor,
  formatPesos,
  sanitizeSelfPayPricing,
  type SelfPayPricing,
} from "./deposit";

const pricing: SelfPayPricing = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
};

describe("depositAmountFor", () => {
  it("charges the full price as Deposit for a Self-Pay Practice", () => {
    expect(
      depositAmountFor(
        {
          visitType: "Practice",
          consultType: null,
          coverage: { kind: "self-pay", variant: "PracticaParticular" },
        },
        pricing,
      ),
    ).toBe(35000);
  });

  it("charges the smaller set Deposit for a Self-Pay First-Visit Consultation", () => {
    expect(
      depositAmountFor(
        {
          visitType: "Consultation",
          consultType: "FirstVisit",
          coverage: { kind: "self-pay", variant: "Particular" },
        },
        pricing,
      ),
    ).toBe(20000);
  });

  it("charges no Deposit for a Self-Pay Follow-up Consultation", () => {
    expect(
      depositAmountFor(
        {
          visitType: "Consultation",
          consultType: "FollowUp",
          coverage: { kind: "self-pay", variant: "Particular" },
        },
        pricing,
      ),
    ).toBeNull();
  });

  it("charges no Deposit when a Health Insurance covers the visit", () => {
    expect(
      depositAmountFor(
        {
          visitType: "Practice",
          consultType: null,
          coverage: { kind: "health-insurance", name: "OSDE" },
        },
        pricing,
      ),
    ).toBeNull();
    expect(
      depositAmountFor(
        {
          visitType: "Consultation",
          consultType: "FirstVisit",
          coverage: { kind: "health-insurance", name: "OSDE" },
        },
        pricing,
      ),
    ).toBeNull();
  });
});

describe("formatPesos", () => {
  it("formats whole pesos with a thousands separator", () => {
    expect(formatPesos(35000)).toBe("$35.000");
  });
});

describe("sanitizeSelfPayPricing", () => {
  it("keeps valid whole-peso amounts", () => {
    expect(
      sanitizeSelfPayPricing({
        consultationFullPrice: 30000,
        practiceFullPrice: 35000,
        firstVisitConsultationDeposit: 20000,
      }),
    ).toEqual({
      consultationFullPrice: 30000,
      practiceFullPrice: 35000,
      firstVisitConsultationDeposit: 20000,
    });
  });

  it("floors floats and coerces negatives/NaN/missing to 0", () => {
    expect(
      sanitizeSelfPayPricing({
        consultationFullPrice: 30000.9,
        practiceFullPrice: -5,
        firstVisitConsultationDeposit: "nope",
      }),
    ).toEqual({
      consultationFullPrice: 30000,
      practiceFullPrice: 0,
      firstVisitConsultationDeposit: 0,
    });
  });
});
