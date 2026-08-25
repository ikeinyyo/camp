export type RankingUser = {
  id: string;
  username: string;
  displayName: string;
  points: number;
  rankingTieBreak?: {
    contestPrizePoints: number;
    activityParticipationPoints: number;
    organizationVoucherPoints: number;
    activitiesVoucherPoints: number;
    collaborationVoucherPoints: number;
    penaltyPoints: number;
    completedActions: number;
    reachedAt: string;
  };
};

export type RankedUser<T extends RankingUser = RankingUser> = T & {
  rank: number;
};

export function rankUsers<T extends RankingUser>(users: T[]): RankedUser<T>[] {
  const tieBreak = (user: RankingUser) => user.rankingTieBreak ?? {
    contestPrizePoints: 0,
    activityParticipationPoints: 0,
    organizationVoucherPoints: 0,
    activitiesVoucherPoints: 0,
    collaborationVoucherPoints: 0,
    penaltyPoints: 0,
    completedActions: 0,
    reachedAt: "9999-12-31T23:59:59.999Z",
  };
  const sortedUsers = [...users].sort(
    (left, right) => {
      const leftTie = tieBreak(left);
      const rightTie = tieBreak(right);
      return right.points - left.points ||
        rightTie.contestPrizePoints - leftTie.contestPrizePoints ||
        rightTie.activityParticipationPoints - leftTie.activityParticipationPoints ||
        rightTie.organizationVoucherPoints - leftTie.organizationVoucherPoints ||
        rightTie.activitiesVoucherPoints - leftTie.activitiesVoucherPoints ||
        rightTie.collaborationVoucherPoints - leftTie.collaborationVoucherPoints ||
        rightTie.penaltyPoints - leftTie.penaltyPoints ||
        rightTie.completedActions - leftTie.completedActions ||
        leftTie.reachedAt.localeCompare(rightTie.reachedAt) ||
        left.displayName.localeCompare(right.displayName, "es") ||
        left.id.localeCompare(right.id);
    },
  );
  return sortedUsers.map((user, index) => ({ ...user, rank: index + 1 }));
}
