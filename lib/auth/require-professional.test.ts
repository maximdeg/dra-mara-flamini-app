import { describe, expect, it, vi } from "vitest";
import { requireProfessional } from "./require-professional";

// The module imports the real NextAuth `auth` only as the default `readSession`;
// every test injects its own reader, so this stub just keeps the import from
// pulling NextAuth's runtime into the node test environment.
vi.mock("@/auth", () => ({ auth: vi.fn() }));

describe("requireProfessional", () => {
  it("rejects when there is no session", async () => {
    const result = await requireProfessional(async () => null);
    expect(result).toEqual({ ok: false });
  });

  it("rejects a session whose user has no email", async () => {
    const result = await requireProfessional(async () => ({
      user: { email: null },
    }));
    expect(result).toEqual({ ok: false });
  });

  it("accepts the signed-in Professional and returns the email", async () => {
    const result = await requireProfessional(async () => ({
      user: { email: "mara@example.com" },
    }));
    expect(result).toEqual({ ok: true, email: "mara@example.com" });
  });
});
