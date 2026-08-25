import "server-only";

import { listUserPointMovements } from "@/lib/points";
import { rankUsers } from "@/lib/ranking";
import { listUsers } from "@/lib/users";
import { listVouchers } from "@/lib/vouchers";

const PODIUM_DETAILS = new Set(["Primer puesto", "Segundo puesto", "Tercer puesto"]);

export async function getRankedUsers() {
  const [users, vouchers] = await Promise.all([listUsers(), listVouchers({ includeInactive: true })]);
  const movementsByUser = await Promise.all(users.map((user) => listUserPointMovements(user.id)));
  const voucherCategories = new Map(vouchers.map((voucher) => [voucher.id, voucher.category]));

  return rankUsers(users.map((user, index) => {
    const movements = movementsByUser[index];
    const positiveMovements = movements.filter((movement) => movement.points > 0);
    const activityMovements = movements.filter((movement) => movement.source === "activity");
    const voucherPoints = (category: "organization" | "activities" | "collaboration") => movements.filter((movement) => movement.source === "voucher" && voucherCategories.get(movement.sourceId) === category).reduce((sum, movement) => sum + movement.points, 0);
    return {
      ...user,
      rankingTieBreak: {
        contestPrizePoints: activityMovements.filter((movement) => PODIUM_DETAILS.has(movement.detail)).reduce((sum, movement) => sum + movement.points, 0),
        activityParticipationPoints: activityMovements.filter((movement) => !PODIUM_DETAILS.has(movement.detail)).reduce((sum, movement) => sum + movement.points, 0),
        organizationVoucherPoints: voucherPoints("organization"),
        activitiesVoucherPoints: voucherPoints("activities"),
        collaborationVoucherPoints: voucherPoints("collaboration"),
        penaltyPoints: movements.filter((movement) => movement.points < 0).reduce((sum, movement) => sum + movement.points, 0),
        completedActions: positiveMovements.length,
        reachedAt: positiveMovements.reduce((latest, movement) => movement.createdAt > latest ? movement.createdAt : latest, "" ) || "9999-12-31T23:59:59.999Z",
      },
    };
  }));
}
