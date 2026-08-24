import { describe, expect, it } from "vitest";
import { calculateDominoStandings } from "./domino-ranking";

describe("calculateDominoStandings", () => {
  it("clasifica parejas completas por victorias y desempate Buchholz", () => {
    const standings = calculateDominoStandings(["a", "b", "c", "d"], [
      { team1Id: "a", team2Id: "b", winnerTeamId: "a" },
      { team1Id: "c", team2Id: "d", winnerTeamId: "c" },
      { team1Id: "a", team2Id: "c", winnerTeamId: "a" },
      { team1Id: "b", team2Id: "d", winnerTeamId: "b" },
    ]);

    expect(standings.map(({ teamId, wins, losses }) => ({ teamId, wins, losses }))).toEqual([
      { teamId: "a", wins: 2, losses: 0 },
      { teamId: "b", wins: 1, losses: 1 },
      { teamId: "c", wins: 1, losses: 1 },
      { teamId: "d", wins: 0, losses: 2 },
    ]);
    expect(standings.find((team) => team.teamId === "c")?.buchholz).toBe(2);
    expect(standings.find((team) => team.teamId === "b")?.buchholz).toBe(2);
  });

  it("da una victoria a la pareja que descansa", () => {
    expect(calculateDominoStandings(["a"], [{ team1Id: "a", winnerTeamId: "a" }])[0]).toMatchObject({ wins: 1, losses: 0, played: 1 });
  });
});
