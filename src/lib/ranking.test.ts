import { describe, expect, it } from "vitest";
import { rankUsers } from "./ranking";

describe("rankUsers", () => {
  it("ordena por puntos y comparte puesto en caso de empate", () => {
    const users = [
      { id: "3", username: "ana", displayName: "Ana", points: 5 },
      { id: "1", username: "paco", displayName: "Paco", points: 20 },
      { id: "4", username: "luis", displayName: "Luis", points: 5 },
      { id: "2", username: "maria", displayName: "María", points: 10 },
    ];

    expect(rankUsers(users).map(({ id, rank }) => ({ id, rank }))).toEqual([
      { id: "1", rank: 1 },
      { id: "2", rank: 2 },
      { id: "3", rank: 3 },
      { id: "4", rank: 3 },
    ]);
  });
});
