import { describe, expect, it } from "vitest";
import { InMemoryUnavailableDaysRepository } from "./in-memory-unavailable-days-repository";

describe("UnavailableDaysRepository (in-memory)", () => {
  it("adds dates and lists them ascending", async () => {
    const repository = new InMemoryUnavailableDaysRepository();

    await repository.add("2026-06-24");
    await repository.add("2026-06-22");

    expect(await repository.list()).toEqual(["2026-06-22", "2026-06-24"]);
  });

  it("is idempotent on add", async () => {
    const repository = new InMemoryUnavailableDaysRepository();

    await repository.add("2026-06-22");
    await repository.add("2026-06-22");

    expect(await repository.list()).toEqual(["2026-06-22"]);
  });

  it("removes a date", async () => {
    const repository = new InMemoryUnavailableDaysRepository(["2026-06-22"]);

    await repository.remove("2026-06-22");

    expect(await repository.list()).toEqual([]);
  });
});
