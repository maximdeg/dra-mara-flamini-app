import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label and is a native button by default", () => {
    render(<Button>Agendar</Button>);
    const button = screen.getByRole("button", { name: "Agendar" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Confirmar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not fire onClick when busy", () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Agendando…
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Agendando…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects an explicit disabled prop", () => {
    render(<Button disabled>Agendar</Button>);
    expect(screen.getByRole("button", { name: "Agendar" })).toBeDisabled();
  });
});
