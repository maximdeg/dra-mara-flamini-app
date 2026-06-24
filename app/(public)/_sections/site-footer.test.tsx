import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the brand line and drops the prototype demo text", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Dra. Mara Flamini · Dermatología")).toBeInTheDocument();
    expect(screen.queryByText(/MaxTurnos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Prototipo/)).not.toBeInTheDocument();
  });
});
