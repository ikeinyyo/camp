import "server-only";

import { LOTTERY_PRIZES } from "@/config/lottery";
import { addPointMovement } from "@/lib/points";
import { getUserById } from "@/lib/users";

export async function awardLotteryPoints(userId: string, points: number, drawId: string) {
  if (!LOTTERY_PRIZES.includes(points as (typeof LOTTERY_PRIZES)[number])) throw new Error("Premio no válido.");
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(drawId)) throw new Error("Identificador de sorteo no válido.");
  const user = await getUserById(userId);
  if (!user?.approved) throw new Error("El participante no está disponible.");
  await addPointMovement({
    userId: user.id,
    points,
    source: "lottery",
    sourceId: drawId,
    concept: "Sorteo relámpago",
    detail: "Premio del sorteo",
    method: "manual",
  }, { uniqueKey: `lottery_${drawId}` });
  return user;
}
