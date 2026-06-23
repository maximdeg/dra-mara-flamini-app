import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "./callout";

describe("Callout", () => {
  it("renders its title and children", () => {
    render(
      <Callout title="Atención">
        <p>Contenido importante</p>
      </Callout>,
    );
    expect(screen.getByText("Atención")).toBeInTheDocument();
    expect(screen.getByText("Contenido importante")).toBeInTheDocument();
  });

  it("reflects the tone", () => {
    render(<Callout tone="warning" title="Aviso" />);
    expect(screen.getByText("Aviso").closest("[data-tone]")).toHaveAttribute(
      "data-tone",
      "warning",
    );
  });
});
