import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicHeader } from "./public-header";

// Render Next's Link as a plain anchor so we can assert on hrefs.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PublicHeader", () => {
  it("links the brand home", () => {
    render(<PublicHeader />);
    expect(
      screen.getByRole("link", { name: /Mara Flamini/ }),
    ).toHaveAttribute("href", "/");
  });

  it("routes the Agendar visita CTA to the booking flow", () => {
    render(<PublicHeader />);
    expect(
      screen.getByRole("link", { name: "Agendar visita" }),
    ).toHaveAttribute("href", "/agendar-visita");
  });
});
