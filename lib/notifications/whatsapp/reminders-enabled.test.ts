import { describe, expect, it } from "vitest";
import { remindersEnabled } from "./reminders-enabled";

describe("remindersEnabled", () => {
  it("is off when the flag is missing or empty", () => {
    expect(remindersEnabled({})).toBe(false);
    expect(remindersEnabled({ META_WHATSAPP_REMINDERS_ENABLED: "" })).toBe(false);
  });

  it('is off for anything other than exactly "true"', () => {
    for (const value of ["false", "TRUE", "1"]) {
      expect(remindersEnabled({ META_WHATSAPP_REMINDERS_ENABLED: value })).toBe(
        false,
      );
    }
  });

  it('is on for "true"', () => {
    expect(remindersEnabled({ META_WHATSAPP_REMINDERS_ENABLED: "true" })).toBe(
      true,
    );
  });
});
