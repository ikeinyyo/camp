import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/sections", () => ({
  isSectionEnabled: async () => true,
}));

describe("Home", () => {
  it("presenta el evento", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { level: 1, name: "Gallardo Camp 2026" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver la agenda completa" }),
    ).toHaveAttribute("href", "/agenda");
  });
});
