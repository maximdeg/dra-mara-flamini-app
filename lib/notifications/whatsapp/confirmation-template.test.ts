import { describe, expect, it } from "vitest";
import { confirmationIncludesInstructions } from "./confirmation-template";

describe("confirmationIncludesInstructions", () => {
  it("is off when the flag is missing or empty", () => {
    expect(confirmationIncludesInstructions({})).toBe(false);
    expect(
      confirmationIncludesInstructions({
        META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS: "",
      }),
    ).toBe(false);
  });

  it("is off for anything other than exactly \"true\"", () => {
    for (const value of ["false", "TRUE", "1"]) {
      expect(
        confirmationIncludesInstructions({
          META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS: value,
        }),
      ).toBe(false);
    }
  });

  it("is on for \"true\"", () => {
    expect(
      confirmationIncludesInstructions({
        META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS: "true",
      }),
    ).toBe(true);
  });
});
