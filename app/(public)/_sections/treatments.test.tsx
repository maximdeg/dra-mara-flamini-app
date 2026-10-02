import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Treatments } from "./treatments";

const TREATMENTS = [
  "Peeling",
  "Skinbooster",
  "Toxina botulínica",
  "Plasma rico en plaquetas",
];

describe("Treatments", () => {
  it("renders the heading and the clinic's WhatsApp number", () => {
    render(<Treatments />);

    expect(
      screen.getByRole("heading", { name: "Consultas por WhatsApp" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\+54 9 3425 78-2344/)).toBeInTheDocument();
  });

  it("renders one card per Aesthetic Treatment", () => {
    render(<Treatments />);

    for (const name of TREATMENTS) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("links each card to WhatsApp, in a new tab, asking about that treatment", () => {
    render(<Treatments />);

    const links = screen.getAllByRole("link", {
      name: /Consultar por WhatsApp/,
    });
    expect(links).toHaveLength(TREATMENTS.length);

    links.forEach((link, i) => {
      const url = new URL(link.getAttribute("href") ?? "");
      expect(url.origin + url.pathname).toBe("https://wa.me/5493425782344");
      expect(url.searchParams.get("text")).toContain(TREATMENTS[i]);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });
});
