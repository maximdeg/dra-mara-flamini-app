import { describe, expect, it } from "vitest";
import { InMemoryProfessionalRepository } from "../professional/in-memory-professional-repository";
import type { Professional } from "../professional/professional";
import { changePassword } from "./change-password";
import { hashPassword, verifyPassword } from "./password";

const OLD = "old-password";

async function repoWithProfessional(): Promise<InMemoryProfessionalRepository> {
  const professional: Professional = {
    id: "prof-1",
    email: "mara@example.com",
    passwordHash: await hashPassword(OLD),
    emailVerified: null,
    name: "Mara Flamini",
    phone: "3421112233",
    whatsappNumber: "5493421112233",
  };
  return new InMemoryProfessionalRepository([professional]);
}

describe("changePassword", () => {
  it("replaces the hash when the current password is correct", async () => {
    const repository = await repoWithProfessional();

    const result = await changePassword(
      "mara@example.com",
      OLD,
      "new-password",
      { repository },
    );

    expect(result).toEqual({ ok: true });
    const updated = await repository.findByEmail("mara@example.com");
    expect(await verifyPassword("new-password", updated!.passwordHash)).toBe(
      true,
    );
    expect(await verifyPassword(OLD, updated!.passwordHash)).toBe(false);
  });

  it("rejects a wrong current password and leaves the hash untouched", async () => {
    const repository = await repoWithProfessional();
    const before = (await repository.findByEmail("mara@example.com"))!
      .passwordHash;

    const result = await changePassword(
      "mara@example.com",
      "not-the-old-password",
      "new-password",
      { repository },
    );

    expect(result).toEqual({ ok: false, reason: "WrongCurrentPassword" });
    const after = (await repository.findByEmail("mara@example.com"))!
      .passwordHash;
    expect(after).toBe(before);
  });

  it("rejects an unknown Professional", async () => {
    const result = await changePassword("nobody@example.com", OLD, "x", {
      repository: new InMemoryProfessionalRepository(),
    });

    expect(result).toEqual({ ok: false, reason: "NotFound" });
  });
});
