export type RankingUser = {
  id: string;
  username: string;
  displayName: string;
  points: number;
};

export type RankedUser<T extends RankingUser = RankingUser> = T & {
  rank: number;
};

export function rankUsers<T extends RankingUser>(users: T[]): RankedUser<T>[] {
  const sortedUsers = [...users].sort(
    (left, right) =>
      right.points - left.points ||
      left.displayName.localeCompare(right.displayName, "es"),
  );
  let currentRank = 0;
  let previousPoints: number | undefined;

  return sortedUsers.map((user, index) => {
    if (user.points !== previousPoints) currentRank = index + 1;
    previousPoints = user.points;
    return { ...user, rank: currentRank };
  });
}
