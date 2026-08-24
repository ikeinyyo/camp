export type DominoMatchResult = {
  team1Id: string;
  team2Id?: string;
  winnerTeamId?: string;
};

export function calculateDominoStandings(teamIds: string[], matches: DominoMatchResult[]) {
  const stats = new Map(teamIds.map((teamId) => [teamId, { teamId, wins: 0, losses: 0, opponents: [] as string[], played: 0 }]));
  for (const match of matches) {
    if (!match.winnerTeamId) continue;
    const first = stats.get(match.team1Id);
    if (first) {
      first.played += 1;
      if (match.team2Id) first.opponents.push(match.team2Id);
      if (match.winnerTeamId === match.team1Id) first.wins += 1; else first.losses += 1;
    }
    if (match.team2Id) {
      const second = stats.get(match.team2Id);
      if (second) {
        second.played += 1;
        second.opponents.push(match.team1Id);
        if (match.winnerTeamId === match.team2Id) second.wins += 1; else second.losses += 1;
      }
    }
  }
  const ranked = [...stats.values()].map((entry) => ({ ...entry, buchholz: entry.opponents.reduce((sum, opponent) => sum + (stats.get(opponent)?.wins ?? 0), 0) })).sort((a, b) => b.wins - a.wins || b.buchholz - a.buchholz || a.losses - b.losses || a.teamId.localeCompare(b.teamId));
  return ranked.map((entry) => {
    const firstAtScore = ranked.findIndex((candidate) => candidate.wins === entry.wins && candidate.buchholz === entry.buchholz && candidate.losses === entry.losses);
    return { position: firstAtScore + 1, teamId: entry.teamId, wins: entry.wins, losses: entry.losses, buchholz: entry.buchholz, played: entry.played };
  });
}
