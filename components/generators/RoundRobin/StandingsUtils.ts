// Standings utilities for Round Robin
// (Extracted from RoundRobinGenerator.ts)

import type { RoundRobinMatch, GroupStanding, Participant } from "@/types/index";

type ExtendedMatch = RoundRobinMatch & { walkover?: boolean; bye?: boolean; overtime?: boolean; draw?: boolean; loser?: Participant };

// Pomocnicza funkcja do aktualizacji statystyk jednej drużyny
function updateTeamStats(standing: GroupStanding, scored: number, conceded: number, result: 'win' | 'draw' | 'loss' | 'bye' | 'walkover' | 'overtime', points: number) {
  standing.matches++;
  standing.goalsFor += scored;
  standing.goalsAgainst += conceded;
  standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
  switch (result) {
    case 'win':
      standing.wins++;
      standing.points += points;
      break;
    case 'draw':
      standing.draws++;
      standing.points += points;
      break;
    case 'loss':
      standing.losses++;
      break;
    case 'bye':
      standing.wins++;
      standing.points += points;
      break;
    case 'walkover':
      standing.wins++;
      standing.points += points;
      break;
    case 'overtime':
      standing.wins++;
      standing.points += points;
      break;
  }
}

export function updateStandings(match: RoundRobinMatch, groupStandings?: GroupStanding[], scoreConfig?: any, tiebreaker: string = 'headToHead') {
  const m = match as ExtendedMatch;
  if (!m.group || m.score1 === undefined || m.score2 === undefined) return;
  if (!groupStandings) return;
  const team1 = groupStandings.find(s => s.participant.id === m.participant1?.id);
  const team2 = groupStandings.find(s => s.participant.id === m.participant2?.id);
  if (!team1 || !team2) return;
  // Reset statystyki dla tego meczu (jeśli już był liczony)
  // ... (można dodać logikę resetowania statystyk dla powtórnego przeliczenia)
  // Walkower
  if (m.walkover) {
    if (m.winner?.id === team1.participant.id) {
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'walkover', scoreConfig?.win ?? 3);
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    } else {
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'walkover', scoreConfig?.win ?? 3);
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    }
  } else if (m.bye) {
    if (m.winner?.id === team1.participant.id) {
      updateTeamStats(team1, m.score1 ?? 0, 0, 'bye', scoreConfig?.bye ?? 3);
      updateTeamStats(team2, 0, m.score1 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    } else {
      updateTeamStats(team2, m.score2 ?? 0, 0, 'bye', scoreConfig?.bye ?? 3);
      updateTeamStats(team1, 0, m.score2 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    }
  } else if (m.overtime) {
    if (m.winner?.id === team1.participant.id) {
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'overtime', scoreConfig?.winOvertime ?? 2);
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'loss', scoreConfig?.lossOvertime ?? 1);
    } else {
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'overtime', scoreConfig?.winOvertime ?? 2);
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'loss', scoreConfig?.lossOvertime ?? 1);
    }
  } else if (m.draw) {
    updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'draw', scoreConfig?.draw ?? 1);
    updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'draw', scoreConfig?.draw ?? 1);
  } else if (m.winner) {
    if (m.winner.id === team1.participant.id) {
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'win', scoreConfig?.win ?? 3);
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    } else {
      updateTeamStats(team2, m.score2 ?? 0, m.score1 ?? 0, 'win', scoreConfig?.win ?? 3);
      updateTeamStats(team1, m.score1 ?? 0, m.score2 ?? 0, 'loss', scoreConfig?.loss ?? 0);
    }
  }
  sortStandings(groupStandings, tiebreaker);
}

export function calculateStandings(matches: RoundRobinMatch[], groupStandingsMap?: Map<number, GroupStanding[]>, scoreConfig?: any, tiebreaker: string = 'headToHead') {
  if (!groupStandingsMap) return;
  // Resetuj wszystkie statystyki
  groupStandingsMap.forEach(groupStandings => {
    groupStandings.forEach(standing => {
      standing.matches = 0;
      standing.wins = 0;
      standing.draws = 0;
      standing.losses = 0;
      standing.goalsFor = 0;
      standing.goalsAgainst = 0;
      standing.points = 0;
      standing.goalDifference = 0;
    });
  });
  // Przelicz na podstawie wszystkich meczów
  matches.forEach(match => {
    const m = match as ExtendedMatch;
    const groupStandings = groupStandingsMap.get(m.group!);
    if (groupStandings) {
      updateStandings(m, groupStandings, scoreConfig, tiebreaker);
    }
  });
}

export function sortStandings(groupStandings: GroupStanding[], tiebreaker: string): void {
  groupStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    switch(tiebreaker) {
      case 'headToHead':
      case 'inGameTiebreaker':
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      case 'gameWin':
        const winRateA = a.wins / (a.matches || 1);
        const winRateB = b.wins / (b.matches || 1);
        return winRateB - winRateA;
      case 'gameWL':
        const wlDiffA = a.wins - a.losses;
        const wlDiffB = b.wins - b.losses;
        return wlDiffB - wlDiffA;
      case 'matchesPlayed':
        return a.matches - b.matches;
      case 'gamesWon':
        return b.wins - a.wins;
      default:
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    }
  });
}

// Add more standings-related helpers as needed 