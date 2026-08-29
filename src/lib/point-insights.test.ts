import { describe, expect, it } from "vitest";
import type { PointMovement } from "./points";
import { getPointInsights } from "./point-insights";

function movement(
  id: string,
  source: PointMovement["source"],
  points: number,
): PointMovement {
  return {
    id,
    userId: "user",
    source,
    points,
    sourceId: id,
    concept: id,
    detail: id,
    method: "manual",
    createdAt: "2026-08-30T12:00:00.000Z",
  };
}

describe("getPointInsights", () => {
  it("separa puntos ganados y penalizaciones por origen", () => {
    const insights = getPointInsights(
      [movement("activity", "activity", 10), movement("penalty", "voucher", -3)],
      7,
    );

    expect(insights).toMatchObject({ earned: 10, penalties: 3, movementCount: 2 });
    expect(insights.categories).toEqual([
      { source: "activity", earned: 10, penalties: 0, movementCount: 1 },
      { source: "voucher", earned: 0, penalties: 3, movementCount: 1 },
    ]);
  });

  it("incluye como ajuste la puntuación que no figura en movimientos", () => {
    const insights = getPointInsights(
      [movement("game", "game", 2)],
      7,
    );

    expect(insights.earned).toBe(7);
    expect(insights.categories.at(-1)).toEqual({
      source: "adjustment",
      earned: 5,
      penalties: 0,
      movementCount: 0,
    });
  });
});
