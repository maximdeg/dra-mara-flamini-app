import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tabs } from "./tabs";

const TABS = [
  { id: "a", label: "Uno", content: <p>Panel uno</p> },
  { id: "b", label: "Dos", content: <p>Panel dos</p> },
];

describe("Tabs", () => {
  it("selects on click and toggles aria-selected + panel visibility", () => {
    render(<Tabs tabs={TABS} />);
    const first = screen.getByRole("tab", { name: "Uno" });
    const second = screen.getByRole("tab", { name: "Dos" });

    expect(first).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Panel uno")).toBeVisible();
    expect(screen.getByText("Panel dos")).not.toBeVisible();

    fireEvent.click(second);

    expect(second).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Panel dos")).toBeVisible();
    expect(screen.getByText("Panel uno")).not.toBeVisible();
  });

  it("moves selection with the arrow keys", () => {
    render(<Tabs tabs={TABS} />);
    const first = screen.getByRole("tab", { name: "Uno" });
    first.focus();

    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Dos" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.keyDown(screen.getByRole("tab", { name: "Dos" }), {
      key: "ArrowLeft",
    });
    expect(first).toHaveAttribute("aria-selected", "true");
  });
});
