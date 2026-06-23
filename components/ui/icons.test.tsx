import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  ArrowRightIcon,
  AwardIcon,
  ShieldIcon,
  UsersIcon,
} from "./icons";

describe("home icons", () => {
  const icons = [
    ["ArrowRightIcon", ArrowRightIcon],
    ["ShieldIcon", ShieldIcon],
    ["UsersIcon", UsersIcon],
    ["AwardIcon", AwardIcon],
  ] as const;

  it.each(icons)("%s renders an aria-hidden svg at the given size", (_, Comp) => {
    const { container } = render(<Comp size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
