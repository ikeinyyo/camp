import { describe, expect, it } from "vitest";
import { rankUsers } from "./ranking";

describe("rankUsers", () => {
  it("ordena por puntos y nunca comparte puesto", () => {
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
      { id: "4", rank: 4 },
    ]);
  });

  it("prioriza premios, actividades y vales de organización en los empates", () => {
    const base = { points: 20, contestPrizePoints: 0, activityParticipationPoints: 0, organizationVoucherPoints: 0, activitiesVoucherPoints: 0, collaborationVoucherPoints: 0, penaltyPoints: 0, completedActions: 1, reachedAt: "2026-08-30T12:00:00.000Z" };
    const users = [
      { id: "org", username: "org", displayName: "Organización", points: 20, rankingTieBreak: { ...base, organizationVoucherPoints: 5 } },
      { id: "activity", username: "activity", displayName: "Actividad", points: 20, rankingTieBreak: { ...base, activityParticipationPoints: 5 } },
      { id: "contest", username: "contest", displayName: "Concurso", points: 20, rankingTieBreak: { ...base, contestPrizePoints: 5 } },
    ];

    expect(rankUsers(users).map((user) => user.id)).toEqual(["contest", "activity", "org"]);
  });
});
