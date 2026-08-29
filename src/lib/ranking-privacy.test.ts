import { describe, expect, it } from "vitest";
import { canViewRankedUserScore, isRankHidden, randomizeHiddenLeaders } from "./ranking-privacy";

const users = Array.from({ length: 7 }, (_, index) => ({
  id: String(index + 1),
  username: `user-${index + 1}`,
  displayName: `User ${index + 1}`,
  points: 10 - index,
  rank: index + 1,
}));

describe("randomizeHiddenLeaders", () => {
  it("solo aleatoriza los cinco primeros y conserva el resto", () => {
    const randomValues = [0, 0, 0, 0];
    const result = randomizeHiddenLeaders(users, () => randomValues.shift() ?? 0);

    expect(result.slice(0, 5).map((user) => user.id)).toEqual(["2", "3", "4", "5", "1"]);
    expect(result.slice(5).map((user) => user.id)).toEqual(["6", "7"]);
    expect(users.map((user) => user.id)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });
});

describe("canViewRankedUserScore", () => {
  it("oculta un perfil del top 5 a los demás, pero no a su propietario", () => {
    const hiddenProfile = { hiddenMode: true, rank: 3, profileUserId: "3" };

    expect(canViewRankedUserScore({ ...hiddenProfile, viewerUserId: "2" })).toBe(false);
    expect(canViewRankedUserScore({ ...hiddenProfile, viewerUserId: "3" })).toBe(true);
  });

  it("mantiene visibles los puntos desde el sexto puesto y fuera del modo oculto", () => {
    expect(canViewRankedUserScore({ hiddenMode: true, rank: 6, profileUserId: "6" })).toBe(true);
    expect(canViewRankedUserScore({ hiddenMode: false, rank: 1, profileUserId: "1" })).toBe(true);
  });
});

describe("isRankHidden", () => {
  it("oculta el puesto exacto del top 5 incluso a su propietario", () => {
    expect(isRankHidden(true, 1)).toBe(true);
    expect(isRankHidden(true, 5)).toBe(true);
    expect(isRankHidden(true, 6)).toBe(false);
    expect(isRankHidden(false, 1)).toBe(false);
  });
});
