import { describe, expect, it } from "vitest";
import {
  emailNotificationsEnabled,
  gateEmailChannel,
} from "./email-notifications";

describe("emailNotificationsEnabled", () => {
  it("is off when the flag is missing", () => {
    expect(emailNotificationsEnabled({})).toBe(false);
  });

  it("is off for an empty value", () => {
    expect(emailNotificationsEnabled({ EMAIL_NOTIFICATIONS_ENABLED: "" })).toBe(
      false,
    );
  });

  it("is off for anything other than exactly \"true\"", () => {
    for (const value of ["false", "TRUE", "1", "yes"]) {
      expect(
        emailNotificationsEnabled({ EMAIL_NOTIFICATIONS_ENABLED: value }),
      ).toBe(false);
    }
  });

  it("is on for \"true\"", () => {
    expect(
      emailNotificationsEnabled({ EMAIL_NOTIFICATIONS_ENABLED: "true" }),
    ).toBe(true);
  });
});

describe("gateEmailChannel", () => {
  it("never calls the real send when email notifications are off", async () => {
    const calls: string[] = [];
    const send = gateEmailChannel(false, async (id: string) => {
      calls.push(id);
    });

    await send("apt-1");

    expect(calls).toEqual([]);
  });

  it("passes every argument through to the real send when on", async () => {
    const calls: [string, string][] = [];
    const send = gateEmailChannel(true, async (id: string, actor: string) => {
      calls.push([id, actor]);
    });

    await send("apt-1", "patient");

    expect(calls).toEqual([["apt-1", "patient"]]);
  });
});
