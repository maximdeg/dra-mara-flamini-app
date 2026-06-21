import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("shows the Spanish label for each derived Status", () => {
    const { rerender } = render(<StatusBadge status="scheduled" />);
    expect(screen.getByText("Agendada")).toBeInTheDocument();

    rerender(<StatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();

    rerender(<StatusBadge status="completed" />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });
});
