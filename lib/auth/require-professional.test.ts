import { describe, expect, it } from "vitest";
import { requireProfessional } from "./require-professional";

describe("requireProfessional", () => {
  it("rejects when there is no session", async () => {
    expect(await requireProfessional(async () => null)).toEqual({ ok: false });
  });

  it("rejects when the session user has no email", async () => {
    const result = await requireProfessional(async () => ({
      user: { email: null },
    }));
    expect(result).toEqual({ ok: false });
  });

  it("authorizes the Professional and returns the email", async () => {
    const result = await requireProfessional(async () => ({
      user: { email: "pro@example.com" },
    }));
    expect(result).toEqual({ ok: true, email: "pro@example.com" });
  });
});
