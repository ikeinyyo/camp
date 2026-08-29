import type { RankedUser, RankingUser } from "./ranking";

export const HIDDEN_RANKING_SIZE = 5;

export function randomizeHiddenLeaders<T extends RankedUser<RankingUser>>(
  users: T[],
  random: () => number = Math.random,
) {
  const leaders = users.slice(0, HIDDEN_RANKING_SIZE);

  for (let index = leaders.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [leaders[index], leaders[target]] = [leaders[target], leaders[index]];
  }

  return [...leaders, ...users.slice(HIDDEN_RANKING_SIZE)];
}

export function canViewRankedUserScore(input: {
  hiddenMode: boolean;
  rank: number | undefined;
  profileUserId: string;
  viewerUserId?: string;
}) {
  return (
    !input.hiddenMode ||
    input.rank === undefined ||
    input.rank > HIDDEN_RANKING_SIZE ||
    input.profileUserId === input.viewerUserId
  );
}
