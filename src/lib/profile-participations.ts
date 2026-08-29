import "server-only";

import { getDominoTournament } from "./domino";
import { listTalents } from "./talents";
import { listTapas } from "./tapas";

export type ProfileParticipation = {
  id: string;
  kind: "tapas" | "talents" | "domino";
  label: string;
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
};

export async function getProfileParticipations(userId: string) {
  const [tapas, talents, domino] = await Promise.all([
    listTapas(),
    listTalents(),
    getDominoTournament(),
  ]);

  const result: ProfileParticipation[] = [
    ...tapas.filter((item) => item.participantIds.includes(userId)).map((item) => ({
      id: `tapas-${item.id}`,
      kind: "tapas" as const,
      label: "Concurso de tapas",
      title: item.name,
      description: item.description,
      href: "/tapas",
      imageUrl: item.imageUrl,
    })),
    ...talents.filter((item) => item.participantIds.includes(userId)).map((item) => ({
      id: `talents-${item.id}`,
      kind: "talents" as const,
      label: "Concurso de talentos",
      title: item.name,
      description: item.description,
      href: "/talentos",
      imageUrl: item.imageUrl,
    })),
    ...domino.teams.filter((team) => team.player1Id === userId || team.player2Id === userId).map((team) => {
      const teammate = team.players.find((player) => player.id !== userId);
      return {
        id: `domino-${team.id}`,
        kind: "domino" as const,
        label: "Campeonato de dominó",
        title: teammate ? `Pareja con ${teammate.displayName}` : "Pareja de dominó",
        description: "Equipo participante en el campeonato de dominó.",
        href: "/domino",
      };
    }),
  ];

  return result;
}
