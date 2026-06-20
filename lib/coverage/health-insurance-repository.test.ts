import { describe, expect, it } from "vitest";
import { SEEDED_HEALTH_INSURANCES } from "./coverage";
import { InMemoryHealthInsuranceRepository } from "./in-memory-health-insurance-repository";

describe("HealthInsuranceRepository (in-memory)", () => {
  it("returns the seeded default until a list is saved", async () => {
    const repository = new InMemoryHealthInsuranceRepository();
    expect(await repository.list()).toEqual(SEEDED_HEALTH_INSURANCES);
  });

  it("returns the saved list, including an empty one (no seed resurrection)", async () => {
    const repository = new InMemoryHealthInsuranceRepository();

    await repository.save([{ name: "OSDE", price: 1000, notes: "" }]);
    expect(await repository.list()).toEqual([
      { name: "OSDE", price: 1000, notes: "" },
    ]);

    await repository.save([]);
    expect(await repository.list()).toEqual([]);
  });
});
