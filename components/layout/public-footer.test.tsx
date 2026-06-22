import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicFooter } from "./public-footer";

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

describe("PublicFooter", () => {
  it("renders as the contentinfo landmark with the practice name", () => {
    render(<PublicFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/Mara Flamini/);
  });

  it("links to the Professional's sign-in", () => {
    render(<PublicFooter />);
    expect(
      screen.getByRole("link", { name: "Panel del profesional" }),
    ).toHaveAttribute("href", "/admin/sign-in");
  });
});
