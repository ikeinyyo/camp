import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/sections", () => ({
  isSectionEnabled: async () => true,
  getSafeSectionAuthentication: async () => ({ agenda: false, map: false }),
}));
vi.mock("@/lib/activities", () => ({
  getSchedule: async () => [
    { id: "friday", date: "Viernes 28", shortDate: "Vie 28", events: [] },
  ],
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
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
