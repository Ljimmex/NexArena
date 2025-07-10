import type { Match, Participant } from "@/types/index";

export interface DoubleEliminationStanding {
  participant: Participant;
  wins: number;
  losses: number;
  seed?: number;
}

export function calculateStandings(matches: Match[]): DoubleEliminationStanding[] {
  const standingsMap = new Map<string, DoubleEliminationStanding>();
  matches.forEach(match => {
    [match.participant1, match.participant2].forEach(p => {
      if (p && !standingsMap.has(p.id)) {
        standingsMap.set(p.id, {
          participant: p,
          wins: 0,
          losses: 0,
          seed: p.seed
        });
      }
    });
    if (match.winner && match.participant1 && match.participant2) {
      const loser = match.winner.id === match.participant1.id ? match.participant2 : match.participant1;
      standingsMap.get(match.winner.id)!.wins++;
      standingsMap.get(loser.id)!.losses++;
    }
  });
  return Array.from(standingsMap.values());
}

export function sortStandings(standings: DoubleEliminationStanding[]): DoubleEliminationStanding[] {
  return [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    if (a.seed !== undefined && b.seed !== undefined) return a.seed - b.seed;
    return 0;
  });
} 