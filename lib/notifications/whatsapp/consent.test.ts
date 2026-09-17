import { describe, expect, it } from "vitest";
import { whatsappConsentGiven } from "./consent";

describe("whatsappConsentGiven", () => {
  it("permits a send when the Patient agreed", () => {
    expect(
      whatsappConsentGiven({ whatsappConsentAt: "2026-06-19T12:00:00.000Z" }),
    ).toBe(true);
  });

  it("blocks a send when the Patient explicitly refused", () => {
    expect(whatsappConsentGiven({ whatsappConsentAt: null })).toBe(false);
  });

  it("permits a send for an Appointment booked before the field existed", () => {
    // Legacy rows carry no field at all; refusing them would silently cut off
    // Confirmations for Appointments already in the book.
    expect(whatsappConsentGiven({})).toBe(true);
    expect(whatsappConsentGiven({ whatsappConsentAt: undefined })).toBe(true);
  });
});
