import type { PointMovement } from "./points";

const contests = {
  "tapas-lunch": { name: "Concurso de tapas", shortName: "Tapas", href: "/tapas", emoji: "🍽️" },
  "talent-show": { name: "Concurso de talentos", shortName: "Talentos", href: "/talentos", emoji: "🎭" },
  "domino-championship": { name: "Campeonato de dominó", shortName: "Dominó", href: "/domino", emoji: "🁣" },
} as const;

const positions: Record<string, 1 | 2 | 3> = {
  "Primer puesto": 1,
  "Segundo puesto": 2,
  "Tercer puesto": 3,
};

export function getProfileHighlights(
  movements: PointMovement[],
  currentPoints = movements.reduce((total, movement) => total + movement.points, 0),
) {
  const positive = movements.filter((movement) => movement.points > 0);
  const podiumKeys = new Set<string>();
  const podiums = movements.flatMap((movement) => {
    const contest = contests[movement.sourceId as keyof typeof contests];
    const position = positions[movement.detail];
    const key = `${movement.sourceId}-${position}`;
    if (!contest || !position || podiumKeys.has(key)) return [];
    podiumKeys.add(key);
    return [{ ...contest, position }];
  });
  const activityCount = new Set(
    positive.filter((movement) => movement.source === "activity").map((movement) => movement.sourceId),
  ).size;
  const voucherCount = positive.filter((movement) => movement.source === "voucher").length;
  const gameCount = positive.filter((movement) => movement.source === "game").length;
  const lotteryCount = positive.filter((movement) => movement.source === "lottery").length;
  const wonTenPointLottery = positive.some(
    (movement) => movement.source === "lottery" && movement.points === 10,
  );
  const wonBingoLine = positive.some(
    (movement) => movement.sourceId === "bingo" && movement.detail === "Premio por línea",
  );
  const wonBingo = positive.some(
    (movement) => movement.sourceId === "bingo" && movement.detail === "Premio por bingo",
  );
  const activeDays = new Set(positive.map((movement) => movement.createdAt.slice(0, 10))).size;
  const positiveSources = new Set(positive.map((movement) => movement.source)).size;

  function nextMilestone(
    current: number,
    milestones: Array<{ target: number; title: string; emoji: string }>,
    kind: string,
    revealsPoints = false,
  ) {
    const safeCurrent = Math.max(0, current);
    const milestone = milestones.find((item) => safeCurrent < item.target);
    return milestone ? {
      id: `pending-${kind}-${milestone.target}`,
      ...milestone,
      current: safeCurrent,
      revealsPoints,
    } : null;
  }

  const badges = [
    ...(positive.length > 0 ? [{ id: "first-points", emoji: "✨", title: "Primeros pasos", description: "Ya ha estrenado su marcador" }] : []),
    ...(currentPoints >= 50 ? [{ id: "points-50", emoji: "🌱", title: "En marcha", description: "50 puntos alcanzados", revealsPoints: true }] : []),
    ...(currentPoints >= 75 ? [{ id: "points-75", emoji: "🔥", title: "Pisando fuerte", description: "75 puntos alcanzados", revealsPoints: true }] : []),
    ...(currentPoints >= 100 ? [{ id: "points-100", emoji: "💯", title: "Club de los 100", description: "100 puntos alcanzados", revealsPoints: true }] : []),
    ...(activityCount >= 1 ? [{ id: "first-activity", emoji: "🏁", title: "En acción", description: "Primera actividad completada" }] : []),
    ...(activityCount >= 3 ? [{ id: "activities", emoji: "🎯", title: "Todoterreno", description: `${activityCount} actividades con puntos` }] : []),
    ...(activityCount >= 5 ? [{ id: "activities-5", emoji: "🧭", title: "No se pierde una", description: "5 actividades con puntos" }] : []),
    ...(voucherCount >= 1 ? [{ id: "first-voucher", emoji: "🎟️", title: "Vale estrenado", description: "Primer vale completado" }] : []),
    ...(voucherCount >= 3 ? [{ id: "vouchers", emoji: "🙌", title: "Manos a la obra", description: `${voucherCount} vales completados` }] : []),
    ...(voucherCount >= 5 ? [{ id: "vouchers-5", emoji: "🛠️", title: "Siempre dispuesto", description: "5 vales completados" }] : []),
    ...(voucherCount >= 10 ? [{ id: "vouchers-10", emoji: "🏕️", title: "Pilar del campamento", description: "10 vales completados" }] : []),
    ...(gameCount >= 1 ? [{ id: "first-game", emoji: "🕹️", title: "Primera partida", description: "Primer juego superado" }] : []),
    ...(gameCount >= 5 ? [{ id: "games", emoji: "🧠", title: "Mente ágil", description: `${gameCount} juegos superados` }] : []),
    ...(gameCount >= 10 ? [{ id: "games-10", emoji: "👾", title: "Maestro de los juegos", description: "10 juegos superados" }] : []),
    ...(lotteryCount >= 1 ? [{ id: "lottery", emoji: "🍀", title: "Golpe de suerte", description: "Premio conseguido en un sorteo" }] : []),
    ...(wonTenPointLottery ? [{ id: "lottery-10", emoji: "🎰", title: "Premio gordo", description: "10 puntos en el sorteo" }] : []),
    ...(wonBingoLine ? [{ id: "bingo-line", emoji: "〰️", title: "¡Línea!", description: "Ganador de una línea en el bingo" }] : []),
    ...(wonBingo ? [{ id: "bingo", emoji: "🎱", title: "¡Bingo!", description: "Ganador del bingo" }] : []),
    ...(positiveSources >= 3 ? [{ id: "variety", emoji: "🌟", title: "Espíritu Gallardo", description: "Ha sumado de muchas formas" }] : []),
  ];

  const pendingBadges = [
    nextMilestone(currentPoints, [
      { target: 50, title: "En marcha", emoji: "🌱" },
      { target: 75, title: "Pisando fuerte", emoji: "🔥" },
      { target: 100, title: "Club de los 100", emoji: "💯" },
    ], "points", true),
    nextMilestone(activityCount, [
      { target: 1, title: "En acción", emoji: "🏁" },
      { target: 3, title: "Todoterreno", emoji: "🎯" },
      { target: 5, title: "No se pierde una", emoji: "🧭" },
    ], "activities"),
    nextMilestone(voucherCount, [
      { target: 1, title: "Vale estrenado", emoji: "🎟️" },
      { target: 3, title: "Manos a la obra", emoji: "🙌" },
      { target: 5, title: "Siempre dispuesto", emoji: "🛠️" },
      { target: 10, title: "Pilar del campamento", emoji: "🏕️" },
    ], "vouchers"),
    nextMilestone(gameCount, [
      { target: 1, title: "Primera partida", emoji: "🕹️" },
      { target: 5, title: "Mente ágil", emoji: "🧠" },
      { target: 10, title: "Maestro de los juegos", emoji: "👾" },
    ], "games"),
  ].filter((badge) => badge !== null);

  return {
    podiums: podiums.sort((left, right) => left.position - right.position),
    badges,
    pendingBadges,
    stats: { activityCount, voucherCount, gameCount, activeDays },
  };
}
