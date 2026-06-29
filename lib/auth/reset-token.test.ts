import { describe, expect, it } from "vitest";
import type { Professional } from "../professional/professional";
import { InMemoryProfessionalRepository } from "../professional/in-memory-professional-repository";
import { InMemoryResetTokenRepository } from "./in-memory-reset-token-repository";
import { issuePasswordReset, resetPassword } from "./reset-token";

const EMAIL = "mara@example.com";
const AT = new Date("2026-06-26T12:00:00.000Z");
const AFTER_EXPIRY = new Date(AT.getTime() + 31 * 60 * 1000);

/** A trivial stand-in for the bcrypt hasher, so the test stays fast and exact. */
const fakeHash = async (plain: string) => `hashed:${plain}`;

function professional(): Professional {
  return {
    id: "prof-1",
    email: EMAIL,
    passwordHash: "old-hash",
    emailVerified: null,
    name: "Mara Flamini",
    phone: "3421112233",
    whatsappNumber: "5493421112233",
  };
}

function setup() {
  return {
    professionals: new InMemoryProfessionalRepository([professional()]),
    tokens: new InMemoryResetTokenRepository(),
  };
}

describe("issuePasswordReset", () => {
  it("returns a token for the matching Professional (case/space-insensitive)", async () => {
    const { professionals, tokens } = setup();

    const result = await issuePasswordReset("  MARA@Example.com ", {
      professionals,
      tokens,
      now: () => AT,
      generateToken: () => "tok",
    });

    expect(result).toEqual({ token: "tok", email: EMAIL });
  });

  it("returns null for an unknown email, revealing nothing", async () => {
    const { professionals, tokens } = setup();

    const result = await issuePasswordReset("nobody@example.com", {
      professionals,
      tokens,
      now: () => AT,
    });

    expect(result).toBeNull();
  });
});

describe("resetPassword", () => {
  function issue(deps: ReturnType<typeof setup>, token: string) {
    return issuePasswordReset(EMAIL, {
      ...deps,
      now: () => AT,
      generateToken: () => token,
    });
  }

  it("sets the new password for a valid token, then burns it (single use)", async () => {
    const deps = setup();
    await issue(deps, "tok");

    const result = await resetPassword("tok", "new-pass", {
      ...deps,
      now: () => AT,
      hashPassword: fakeHash,
    });

    expect(result).toEqual({ ok: true });
    expect((await deps.professionals.findByEmail(EMAIL))!.passwordHash).toBe(
      "hashed:new-pass",
    );

    const reuse = await resetPassword("tok", "other", {
      ...deps,
      now: () => AT,
      hashPassword: fakeHash,
    });
    expect(reuse).toEqual({ ok: false, reason: "InvalidOrExpired" });
  });

  it("rejects an expired token and leaves the password untouched", async () => {
    const deps = setup();
    await issue(deps, "tok");

    const result = await resetPassword("tok", "new-pass", {
      ...deps,
      now: () => AFTER_EXPIRY,
      hashPassword: fakeHash,
    });

    expect(result).toEqual({ ok: false, reason: "InvalidOrExpired" });
    expect((await deps.professionals.findByEmail(EMAIL))!.passwordHash).toBe(
      "old-hash",
    );
  });

  it("rejects an unknown token", async () => {
    const deps = setup();

    const result = await resetPassword("never-issued", "x", {
      ...deps,
      now: () => AT,
      hashPassword: fakeHash,
    });

    expect(result).toEqual({ ok: false, reason: "InvalidOrExpired" });
  });

  it("supersedes an earlier token when a new one is issued", async () => {
    const deps = setup();
    await issue(deps, "old-tok");
    await issue(deps, "new-tok");

    expect(
      await resetPassword("old-tok", "x", {
        ...deps,
        now: () => AT,
        hashPassword: fakeHash,
      }),
    ).toEqual({ ok: false, reason: "InvalidOrExpired" });
    expect(
      await resetPassword("new-tok", "x", {
        ...deps,
        now: () => AT,
        hashPassword: fakeHash,
      }),
    ).toEqual({ ok: true });
  });
});
