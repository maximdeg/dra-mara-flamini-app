import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AgendarVisitaPage from "./page";

// The page navigates with the router on success; stub it so the component mounts.
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

// What POST /api/bookings answers; each test can swap it.
let bookingResponse: { ok: boolean; body: unknown } = {
  ok: true,
  body: { id: "apt-1" },
};
let bookingRequests: Record<string, unknown>[] = [];

beforeEach(() => {
  bookingResponse = { ok: true, body: { id: "apt-1" } };
  bookingRequests = [];
  push.mockClear();
  const listings = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.includes("/api/bookings")) {
      bookingRequests.push(JSON.parse(String(init?.body)));
      return {
        ok: bookingResponse.ok,
        json: async () => bookingResponse.body,
      } as Response;
    }
    if (url.includes("/api/available-times/")) {
      return { ok: true, json: async () => ({ times: ["09:20"] }) } as Response;
    }
    return listings(input, init);
  });
});

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value },
  });

/** The URLs fetched so far that match a fragment. */
function fetchedUrls(fragment: string): string[] {
  return vi
    .mocked(fetch)
    .mock.calls.map(([input]) => String(input))
    .filter((url) => url.includes(fragment));
}

/** Fill every required field for a Health Insurance Follow-up, email blank. */
async function fillBookingForm(email = "") {
  const view = render(<AgendarVisitaPage />);
  change("Nombre", "Lucía");
  change("Apellido", "Gómez");
  change("Teléfono", "342 15 111-2233");
  change("Email", email);
  change("Tipo de visita", "Consultation");
  change("Tipo de consulta", "FollowUp");
  // Dates load once the Visit Kind is complete (DD/MM/YYYY).
  await screen.findByText("22/06/2026");
  await screen.findByRole("option", { name: /OSDE/ });
  change("Cobertura", "health-insurance:OSDE");
  change("Fecha", "2026-06-22");
  await screen.findByRole("option", { name: "09:20" });
  change("Hora", "09:20");
  return view;
}

describe("AgendarVisitaPage — Visit Kind", () => {
  it("keeps Fecha disabled until the Visit Kind is complete", async () => {
    render(<AgendarVisitaPage />);
    const fecha = screen.getByLabelText("Fecha", { exact: false });
    expect(fecha).toBeDisabled();

    change("Tipo de visita", "Practice");
    expect(fecha).toBeDisabled();

    change("Tipo de práctica", "Biopsy");
    await waitFor(() => expect(fecha).toBeEnabled());
  });

  it("fetches dates and times for the chosen Visit Kind", async () => {
    render(<AgendarVisitaPage />);
    change("Tipo de visita", "Practice");
    change("Tipo de práctica", "Biopsy");
    await screen.findByText("22/06/2026");

    change("Fecha", "2026-06-22");
    await screen.findByRole("option", { name: "09:20" });

    expect(fetchedUrls("/api/availability")).toEqual([
      "/api/availability?kind=Biopsy",
    ]);
    expect(fetchedUrls("/api/available-times/")).toEqual([
      "/api/available-times/2026-06-22?kind=Biopsy",
    ]);
  });

  it("clears date and time and refetches when the Visit Kind changes", async () => {
    render(<AgendarVisitaPage />);
    change("Tipo de visita", "Consultation");
    change("Tipo de consulta", "FirstVisit");
    await screen.findByText("22/06/2026");
    change("Fecha", "2026-06-22");
    await screen.findByRole("option", { name: "09:20" });
    change("Hora", "09:20");

    change("Tipo de consulta", "FollowUp");

    await waitFor(() =>
      expect(fetchedUrls("/api/availability")).toContain(
        "/api/availability?kind=FollowUp",
      ),
    );
    expect(screen.getByLabelText("Fecha", { exact: false })).toHaveValue("");
    expect(screen.getByLabelText("Hora", { exact: false })).toHaveValue("");
  });
});

describe("AgendarVisitaPage — optional email", () => {
  it("labels the email as optional and does not require it", async () => {
    render(<AgendarVisitaPage />);
    const email = await screen.findByLabelText("Email (opcional)");
    expect(email).not.toBeRequired();
  });

  it("books with the email left blank", async () => {
    const { container } = await fillBookingForm("");

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/cita/apt-1"));
    expect(bookingRequests[0]).toMatchObject({ patientEmail: "" });
  });

  it("explains an InvalidEmail rejection", async () => {
    bookingResponse = { ok: false, body: { rejection: "InvalidEmail" } };
    const { container } = await fillBookingForm("lucia@");

    fireEvent.submit(container.querySelector("form")!);

    expect(
      await screen.findByText("Revisá el email ingresado o dejalo vacío."),
    ).toBeInTheDocument();
  });
});

// Snapshot the booking form's structure, not its styling: class attributes are
// stripped so the snapshot tracks the element tree, copy, and field wiring only.
function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("AgendarVisitaPage", () => {
  it("matches the booking form structure", async () => {
    const { container } = render(<AgendarVisitaPage />);
    // Initial state: coverage config loaded, no Visit Kind chosen yet, so
    // Fecha and Hora are disabled and no dates are listed.
    await waitFor(() =>
      expect(fetchedUrls("/api/self-pay-pricing")).toHaveLength(1),
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(withoutClasses(form!.outerHTML)).toMatchSnapshot();
  });
});
