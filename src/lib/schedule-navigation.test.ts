import { describe, expect, it } from "vitest";
import { getInitialScheduleDayIndex, getSwipeDirection } from "./schedule-navigation";

const days = [
  { isoDate: "2026-08-28" },
  { isoDate: "2026-08-29" },
  { isoDate: "2026-08-30" },
];

describe("getInitialScheduleDayIndex", () => {
  it("selecciona el día actual del evento en la zona horaria de Madrid", () => {
    expect(getInitialScheduleDayIndex(days, new Date("2026-08-28T22:30:00Z"))).toBe(1);
  });

  it("selecciona el primer día antes del evento y el último después", () => {
    expect(getInitialScheduleDayIndex(days, new Date("2026-08-20T12:00:00Z"))).toBe(0);
    expect(getInitialScheduleDayIndex(days, new Date("2026-09-01T12:00:00Z"))).toBe(2);
  });
});

describe("getSwipeDirection", () => {
  it("reconoce deslizamientos horizontales y descarta movimientos cortos o verticales", () => {
    expect(getSwipeDirection({ x: 200, y: 100 }, { x: 100, y: 110 })).toBe(1);
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 200, y: 90 })).toBe(-1);
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 80, y: 105 })).toBe(0);
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 80, y: 200 })).toBe(0);
  });
});
