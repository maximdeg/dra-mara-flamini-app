import { describe, expect, it } from "vitest";
import { InMemoryProfessionalRepository } from "./in-memory-professional-repository";
import type { Professional } from "./professional";

// The in-memory adapter is the reference fake the auth modules are tested
// against, so this pins the seam contract for the profile/password updates.
function seeded(): InMemoryProfessionalRepository {
  const professional: Professional = {
    id: "prof-1",
    email: "mara@example.com",
    passwordHash: "hash-old",
    emailVerified: null,
    name: "",
    phone: "",
    whatsappNumber: "",
  };
  return new InMemoryProfessionalRepository([professional]);
}

describe("ProfessionalRepository (in-memory)", () => {
  it("updateProfile persists the editable fields and leaves credentials", async () => {
    const repository = seeded();

    await repository.updateProfile("mara@example.com", {
      name: "Mara Flamini",
      phone: "3421112233",
      whatsappNumber: "5493421112233",
    });

    const updated = await repository.findByEmail("mara@example.com");
    expect(updated).toMatchObject({
      name: "Mara Flamini",
      phone: "3421112233",
      whatsappNumber: "5493421112233",
      passwordHash: "hash-old",
      email: "mara@example.com",
    });
  });

  it("updatePassword replaces only the hash", async () => {
    const repository = seeded();

    await repository.updatePassword("mara@example.com", "hash-new");

    const updated = await repository.findByEmail("mara@example.com");
    expect(updated?.passwordHash).toBe("hash-new");
    expect(updated?.email).toBe("mara@example.com");
  });
});
