import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("presenta el evento", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Gallardo Camp 2026" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver la agenda completa" }),
    ).toHaveAttribute("href", "/agenda");
  });
});
