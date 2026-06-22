import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./reveal";

// jsdom has no IntersectionObserver, so this exercises the fallback path: the
// content must be shown (revealed) rather than hidden behind an animation that
// can never fire.
describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>contenido</p>
      </Reveal>,
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("reveals the content when there is no IntersectionObserver", () => {
    render(
      <Reveal>
        <p>contenido</p>
      </Reveal>,
    );
    expect(screen.getByText("contenido").parentElement).toHaveAttribute(
      "data-revealed",
      "true",
    );
  });
});
