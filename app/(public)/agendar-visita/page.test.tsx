import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AgendarVisitaPage from "./page";

// The page navigates with the router on success; stub it so the component mounts.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const DAYS = ["2026-06-22", "2026-06-23"];
const INSURANCES = [{ name: "OSDE", price: 0, notes: "" }];
const PRICING = {
  consultationFullPrice: 30000,
  practiceFullPrice: 35000,
  firstVisitConsultationDeposit: 20000,
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes("/api/availability")
        ? { days: DAYS }
        : url.includes("/api/health-insurances")
          ? { insurances: INSURANCES }
          : url.includes("/api/self-pay-pricing")
            ? { pricing: PRICING }
            : url.includes("/api/available-times/")
              ? { times: [] }
              : {};
      return { ok: true, json: async () => body } as Response;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Snapshot the booking form's structure, not its styling: class attributes are
// stripped so the snapshot tracks the element tree, copy, and field wiring only.
function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("AgendarVisitaPage", () => {
  it("matches the booking form structure", async () => {
    const { container } = render(<AgendarVisitaPage />);
    // Wait until availability has loaded so the date options are present.
    await screen.findByText("2026-06-22");

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(withoutClasses(form!.outerHTML)).toMatchSnapshot();
  });
});
