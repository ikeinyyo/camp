import { describe, expect, it } from "vitest";
import type { PointMovement } from "./points";
import { getProfileHighlights } from "./profile-highlights";

function movement(id: string, overrides: Partial<PointMovement>): PointMovement {
  return {
    id,
    userId: "user",
    points: 5,
    source: "activity",
    sourceId: id,
    concept: id,
    detail: "Participación",
    method: "manual",
    createdAt: "2026-08-30T10:00:00.000Z",
    ...overrides,
  };
}

describe("getProfileHighlights", () => {
  it("reconoce puestos de podio definitivos", () => {
    const result = getProfileHighlights([
      movement("tapas", { sourceId: "tapas-lunch", detail: "Primer puesto", points: 15 }),
      movement("talent", { sourceId: "talent-show", detail: "Tercer puesto" }),
    ]);

    expect(result.podiums.map(({ shortName, position }) => ({ shortName, position }))).toEqual([
      { shortName: "Tapas", position: 1 },
      { shortName: "Talentos", position: 3 },
    ]);
  });

  it("resume participación y desbloquea insignias", () => {
    const result = getProfileHighlights([
      movement("a1", { sourceId: "a1" }),
      movement("a2", { sourceId: "a2" }),
      movement("a3", { sourceId: "a3" }),
      movement("v1", { source: "voucher" }),
      movement("v2", { source: "voucher" }),
      movement("v3", { source: "voucher" }),
    ]);

    expect(result.stats).toMatchObject({ activityCount: 3, voucherCount: 3, gameCount: 0, activeDays: 1 });
    expect(result.badges.map((badge) => badge.id)).toEqual([
      "first-points",
      "first-activity",
      "activities",
      "first-voucher",
      "vouchers",
    ]);
  });

  it("desbloquea los hitos acumulativos de puntuación", () => {
    const result = getProfileHighlights([], 100);

    expect(result.badges.filter((badge) => "revealsPoints" in badge).map((badge) => badge.id)).toEqual([
      "points-50",
      "points-75",
      "points-100",
    ]);
  });

  it("reconoce el premio de 10 del sorteo, la línea y el bingo", () => {
    const result = getProfileHighlights([
      movement("lottery", { source: "lottery", points: 10 }),
      movement("line", { sourceId: "bingo", detail: "Premio por línea", points: 3 }),
      movement("bingo", { sourceId: "bingo", detail: "Premio por bingo", points: 5 }),
    ]);

    expect(result.badges.map((badge) => badge.id)).toEqual(expect.arrayContaining([
      "lottery-10",
      "bingo-line",
      "bingo",
    ]));
  });

  it("muestra solo el siguiente nivel pendiente de cada categoría", () => {
    const result = getProfileHighlights([], 60);

    expect(result.pendingBadges.map(({ title, current, target }) => ({ title, current, target }))).toEqual([
      { title: "Pisando fuerte", current: 60, target: 75 },
      { title: "En acción", current: 0, target: 1 },
      { title: "Vale estrenado", current: 0, target: 1 },
      { title: "Primera partida", current: 0, target: 1 },
    ]);
  });
});
