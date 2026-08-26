import "server-only";

import { schedule } from "@/config/schedule";
import { DOMINO_ROUNDS, getDominoTournament } from "@/lib/domino";
import { addPointMovement, DuplicatePointMovementError, listUserPointMovements } from "@/lib/points";
import { getTalentContestState, listTalents, listTalentVotes, rankTalents } from "@/lib/talents";
import { getContestState, listTapas, listTapaVotes, rankTapas } from "@/lib/tapas";
import { getUsersByIds, type User } from "@/lib/users";

export type ContestAwardKind = "tapas" | "talents" | "domino";

export type ContestAward = {
  key: string;
  user: User;
  entryName: string;
  position: 1 | 2 | 3;
  points: number;
  alreadyAwarded: boolean;
};

export type ContestAwardsPreview = {
  ready: boolean;
  reason?: string;
  awards: ContestAward[];
};

type AwardCandidate = Omit<ContestAward, "user" | "alreadyAwarded"> & { userId: string };

const POSITION_REWARDS = {
  1: { reward: "first", detail: "Primer puesto" },
  2: { reward: "second", detail: "Segundo puesto" },
  3: { reward: "third", detail: "Tercer puesto" },
} as const;

const ACTIVITY_IDS: Record<ContestAwardKind, string> = {
  tapas: "tapas-lunch",
  talents: "talent-show",
  domino: "domino-championship",
};

function getActivity(kind: ContestAwardKind) {
  const activity = schedule.flatMap((day) => day.events).find((event) => event.id === ACTIVITY_IDS[kind]);
  if (!activity?.podiumPoints) throw new Error("No se ha configurado la puntuación del podio.");
  return activity;
}

function candidate(kind: ContestAwardKind, entryId: string, entryName: string, userId: string, position: 1 | 2 | 3): AwardCandidate {
  const activity = getActivity(kind);
  const reward = POSITION_REWARDS[position].reward;
  return {
    key: `contest_award_${kind}_${entryId}_${position}`,
    userId,
    entryName,
    position,
    points: activity.podiumPoints![reward],
  };
}

async function loadCandidates(kind: ContestAwardKind): Promise<{ ready: boolean; reason?: string; candidates: AwardCandidate[] }> {
  if (kind === "tapas") {
    const [state, items, votes] = await Promise.all([getContestState(), listTapas(), listTapaVotes()]);
    const winners = rankTapas(items, votes).filter((item) => item.rank >= 1 && item.rank <= 3);
    return {
      ready: state === "ranking" && votes.length > 0,
      reason: state !== "ranking" ? "Pasa el concurso a modo Ranking para cerrar el resultado." : votes.length === 0 ? "Todavía no hay votos con los que calcular el podio." : undefined,
      candidates: winners.flatMap((item) => item.participantIds.map((userId) => candidate(kind, item.id, item.name, userId, item.rank as 1 | 2 | 3))),
    };
  }

  if (kind === "talents") {
    const [state, items, votes] = await Promise.all([getTalentContestState(), listTalents(), listTalentVotes()]);
    const winners = rankTalents(items, votes).filter((item) => item.rank >= 1 && item.rank <= 3);
    return {
      ready: state === "ranking" && votes.length > 0,
      reason: state !== "ranking" ? "Pasa el concurso a modo Ranking para cerrar el resultado." : votes.length === 0 ? "Todavía no hay votos con los que calcular el podio." : undefined,
      candidates: winners.flatMap((item) => item.participantIds.map((userId) => candidate(kind, item.id, item.name, userId, item.rank as 1 | 2 | 3))),
    };
  }

  const tournament = await getDominoTournament();
  const finalMatches = tournament.matches.filter((match) => match.round === DOMINO_ROUNDS && !match.bye);
  const complete = tournament.mode === "tournament" && tournament.currentRound === DOMINO_ROUNDS && finalMatches.length > 0 && finalMatches.every((match) => match.winnerTeamId);
  const winners = tournament.standings.filter((standing) => standing.position >= 1 && standing.position <= 3 && standing.team);
  return {
    ready: complete,
    reason: complete ? undefined : "Completa los resultados de las tres rondas antes de repartir los puntos.",
    candidates: winners.flatMap((standing) => {
      const team = standing.team!;
      const entryName = team.players.map((player) => player.displayName).join(" y ");
      return team.players.map((player) => candidate(kind, team.id, entryName, player.id, standing.position as 1 | 2 | 3));
    }),
  };
}

export async function getContestAwardsPreview(kind: ContestAwardKind): Promise<ContestAwardsPreview> {
  const { ready, reason, candidates } = await loadCandidates(kind);
  const userIds = [...new Set(candidates.map((item) => item.userId))];
  const [users, movements] = await Promise.all([
    getUsersByIds(userIds),
    Promise.all(userIds.map(async (userId) => [userId, await listUserPointMovements(userId)] as const)),
  ]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  const movementMap = new Map(movements);
  const awards = candidates.flatMap((item) => {
    const user = userMap.get(item.userId);
    if (!user) return [];
    return [{ ...item, user, alreadyAwarded: movementMap.get(item.userId)?.some((movement) => movement.id === item.key) ?? false }];
  });
  return { ready, reason, awards };
}

export async function awardContestPoints(kind: ContestAwardKind) {
  const preview = await getContestAwardsPreview(kind);
  if (!preview.ready) throw new Error(preview.reason ?? "El resultado todavía no es definitivo.");
  const activity = getActivity(kind);
  let awarded = 0;
  for (const award of preview.awards.filter((item) => !item.alreadyAwarded)) {
    try {
      await addPointMovement({
        userId: award.user.id,
        points: award.points,
        source: "activity",
        sourceId: activity.id,
        concept: activity.title,
        detail: POSITION_REWARDS[award.position].detail,
        method: "manual",
      }, { uniqueKey: award.key });
      awarded += 1;
    } catch (error) {
      if (!(error instanceof DuplicatePointMovementError)) throw error;
    }
  }
  return awarded;
}
