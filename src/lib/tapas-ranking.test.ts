import { describe, expect, it } from "vitest";
import { rankTapas } from "./tapas-ranking";
import type { Tapa, TapaVote } from "./tapas";

const tapa = (id: string): Tapa => ({ id, name: id, description: id, participantIds: [], participantNames: [], imageUrl: "", active: true });
const vote = (userId: string, firstId: string, secondId: string, thirdId: string): TapaVote => ({ userId, displayName: userId, firstId, secondId, thirdId, createdAt: "" });

describe("rankTapas", () => {
  it("mantiene el empate si todos los criterios coinciden", () => {
    const result = rankTapas([tapa("a"), tapa("b"), tapa("c")], [vote("1", "a", "b", "c"), vote("2", "b", "a", "c")]);
    expect(result.map(({ id, score, fiveVotes, rank }) => ({ id, score, fiveVotes, rank }))).toEqual([
      { id: "a", score: 8, fiveVotes: 1, rank: 1 },
      { id: "b", score: 8, fiveVotes: 1, rank: 1 },
      { id: "c", score: 2, fiveVotes: 0, rank: 3 },
    ]);
  });
});
