import { describe, expect, it } from "vitest";
import { SEEDED_CLINIC_INFO } from "./clinic-info";
import { InMemoryClinicInfoRepository } from "./in-memory-clinic-info-repository";

describe("ClinicInfoRepository (in-memory)", () => {
  it("returns the seeded default until saved", async () => {
    const repository = new InMemoryClinicInfoRepository();
    expect(await repository.get()).toEqual(SEEDED_CLINIC_INFO);
  });

  it("returns saved clinic info", async () => {
    const repository = new InMemoryClinicInfoRepository();
    const info = {
      ...SEEDED_CLINIC_INFO,
      senaTransfer: {
        ...SEEDED_CLINIC_INFO.senaTransfer,
        alias: "mara.flamini",
        cbu: "0000003100010000000001",
      },
    };

    await repository.save(info);

    expect(await repository.get()).toEqual(info);
  });
});
