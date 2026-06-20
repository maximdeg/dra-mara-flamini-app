import { describe, expect, it } from "vitest";
import { SEEDED_SELF_PAY_PRICING } from "./deposit";
import { InMemorySelfPayPricingRepository } from "./in-memory-self-pay-pricing-repository";

describe("SelfPayPricingRepository (in-memory)", () => {
  it("returns the seeded default until saved", async () => {
    const repository = new InMemorySelfPayPricingRepository();
    expect(await repository.get()).toEqual(SEEDED_SELF_PAY_PRICING);
  });

  it("returns saved pricing", async () => {
    const repository = new InMemorySelfPayPricingRepository();
    const pricing = {
      consultationFullPrice: 40000,
      practiceFullPrice: 45000,
      firstVisitConsultationDeposit: 25000,
    };

    await repository.save(pricing);

    expect(await repository.get()).toEqual(pricing);
  });
});
