import type { PointMovement, PointSource } from "./points";

export type PointInsightSource = PointSource | "adjustment";

export type PointInsightCategory = {
  source: PointInsightSource;
  earned: number;
  penalties: number;
  movementCount: number;
};

const SOURCES: PointInsightSource[] = [
  "activity",
  "voucher",
  "game",
  "lottery",
  "adjustment",
];

export function getPointInsights(
  movements: PointMovement[],
  currentPoints: number,
) {
  const categories = new Map<PointInsightSource, PointInsightCategory>(
    SOURCES.map((source) => [
      source,
      { source, earned: 0, penalties: 0, movementCount: 0 },
    ]),
  );

  for (const movement of movements) {
    const category = categories.get(movement.source)!;
    category.movementCount += 1;
    if (movement.points > 0) category.earned += movement.points;
    else category.penalties += Math.abs(movement.points);
  }

  const movementBalance = movements.reduce(
    (total, movement) => total + movement.points,
    0,
  );
  const adjustment = currentPoints - movementBalance;
  const adjustmentCategory = categories.get("adjustment")!;
  if (adjustment > 0) adjustmentCategory.earned = adjustment;
  if (adjustment < 0) adjustmentCategory.penalties = Math.abs(adjustment);

  const visibleCategories = [...categories.values()].filter(
    (category) => category.earned > 0 || category.penalties > 0,
  );

  return {
    categories: visibleCategories,
    earned: visibleCategories.reduce(
      (total, category) => total + category.earned,
      0,
    ),
    penalties: visibleCategories.reduce(
      (total, category) => total + category.penalties,
      0,
    ),
    movementCount: movements.length,
  };
}
