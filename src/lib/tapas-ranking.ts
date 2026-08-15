export type RankedTapaInput = { id: string; name: string };
export type RankedVoteInput = { firstId: string; secondId: string; thirdId: string };

export function rankTapas<T extends RankedTapaInput>(tapas: T[], votes: RankedVoteInput[]) {
  const results = new Map(tapas.map((tapa) => [tapa.id, { score: 0, fiveVotes: 0, threeVotes: 0, oneVotes: 0 }]));
  for (const vote of votes) {
    const first = results.get(vote.firstId); const second = results.get(vote.secondId); const third = results.get(vote.thirdId);
    if (first) { first.score += 5; first.fiveVotes += 1; }
    if (second) { second.score += 3; second.threeVotes += 1; }
    if (third) { third.score += 1; third.oneVotes += 1; }
  }
  const ranked = tapas.map((tapa) => ({ ...tapa, ...results.get(tapa.id)! })).sort((a, b) => b.score - a.score || b.fiveVotes - a.fiveVotes || b.threeVotes - a.threeVotes || b.oneVotes - a.oneVotes || a.name.localeCompare(b.name, "es"));
  let currentRank = 0;
  return ranked.map((tapa, index) => { const previous = ranked[index - 1]; if (!previous || tapa.score !== previous.score || tapa.fiveVotes !== previous.fiveVotes || tapa.threeVotes !== previous.threeVotes || tapa.oneVotes !== previous.oneVotes) currentRank = index + 1; return { ...tapa, rank: currentRank }; });
}
