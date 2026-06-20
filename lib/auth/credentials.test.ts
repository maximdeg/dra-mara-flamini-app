import { describe, expect, it } from "vitest";
import { InMemoryProfessionalRepository } from "../professional/in-memory-professional-repository";
import type { Professional } from "../professional/professional";
import { verifyProfessionalCredentials } from "./credentials";
import { hashPassword } from "./password";

const PASSWORD = "correct horse battery staple";

async function professional(
  overrides: Partial<Professional> = {},
): Promise<Professional> {
  return {
    id: "prof-1",
    email: "mara@example.com",
    passwordHash: await hashPassword(PASSWORD),
    emailVerified: null,
    name: "Mara Flamini",
    phone: "3421112233",
    whatsappNumber: "5493421112233",
    ...overrides,
  };
}

async function repoWith(
  prof: Professional,
): Promise<InMemoryProfessionalRepository> {
  return new InMemoryProfessionalRepository([prof]);
}

describe("verifyProfessionalCredentials", () => {
  it("returns the Professional for the right email + password", async () => {
    const repository = await repoWith(await professional());

    const result = await verifyProfessionalCredentials(
      "mara@example.com",
      PASSWORD,
      { repository },
    );

    expect(result?.id).toBe("prof-1");
  });

  it("rejects a wrong password", async () => {
    const repository = await repoWith(await professional());

    const result = await verifyProfessionalCredentials(
      "mara@example.com",
      "wrong password",
      { repository },
    );

    expect(result).toBeNull();
  });

  it("rejects an unknown email", async () => {
    const repository = await repoWith(await professional());

    const result = await verifyProfessionalCredentials(
      "someone@example.com",
      PASSWORD,
      { repository },
    );

    expect(result).toBeNull();
  });

  it("normalizes the email (trim + lowercase) to match how it is stored", async () => {
    const repository = await repoWith(await professional());

    const result = await verifyProfessionalCredentials(
      "  MARA@Example.com  ",
      PASSWORD,
      { repository },
    );

    expect(result?.id).toBe("prof-1");
  });

  it("rejects empty credentials without touching the repository", async () => {
    const repository = await repoWith(await professional());

    expect(
      await verifyProfessionalCredentials("", PASSWORD, { repository }),
    ).toBeNull();
    expect(
      await verifyProfessionalCredentials("mara@example.com", "", {
        repository,
      }),
    ).toBeNull();
  });
});
