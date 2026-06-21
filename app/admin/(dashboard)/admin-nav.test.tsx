import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminNav } from "./admin-nav";

// Render Next's Link as a plain anchor; isolate the active-state logic.
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

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/appointments",
}));

function withoutClasses(html: string): string {
  return html.replace(/\sclass="[^"]*"/g, "");
}

describe("AdminNav", () => {
  it("marks the section matching the current route active", () => {
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Turnos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // "Panel" (/admin) is exact-match, so it is not active on a sub-route.
    expect(screen.getByRole("link", { name: "Panel" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("matches the nav structure", () => {
    const { container } = render(<AdminNav />);
    expect(withoutClasses(container.innerHTML)).toMatchSnapshot();
  });
});
