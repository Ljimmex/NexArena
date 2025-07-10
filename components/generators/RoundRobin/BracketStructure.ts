// Bracket structure helpers for Round Robin
// (Extracted from RoundRobinGenerator.ts)

import type { Participant, Match, RoundRobinMatch, GroupStanding } from "@/types/index";
import { SingleEliminationGenerator } from '../SingleEliminationGenerator';

export function generateGroupMatches(participants: Participant[], groupId: number, doubleRoundRobin: boolean): RoundRobinMatch[] {
  const matches: RoundRobinMatch[] = [];
  const n = participants.length;
  const rounds = n - 1;
  const matchesPerRound = Math.floor(n / 2);
  let matchId = 1;
  let teams = [...participants];
  if (n % 2 !== 0) {
    teams.push({ id: 'bye', name: 'BYE', logo: '' } as Participant);
  }
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];
      if (home.id !== 'bye' && away.id !== 'bye') {
        matches.push({
          id: matchId++,
          round: round + 1,
          position: i + 1,
          participant1: home,
          participant2: away,
          group: groupId,
          score1: 0,
          score2: 0,
          winner: undefined
        });
      }
    }
    const lastTeam = teams.pop()!;
    teams.splice(1, 0, lastTeam);
  }
  if (doubleRoundRobin) {
    const firstLegMatches = matches.filter(m => m.group === groupId);
    firstLegMatches.forEach(match => {
      matches.push({
        id: matchId++,
        round: match.round + rounds,
        position: match.position,
        participant1: match.participant2,
        participant2: match.participant1,
        group: groupId,
        score1: 0,
        score2: 0,
        winner: undefined
      });
    });
  }
  return matches;
}

export function initializeStandings(participants: Participant[], groupId: number): GroupStanding[] {
  return participants.map(p => ({
    participant: p,
    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    goalDifference: 0
  }));
}

export function generatePlayoffs(teamsPerGroup: number, groupCount: number, standings: Map<number, GroupStanding[]>): Match[] {
  const qualifiedTeams: Participant[] = [];
  for (let groupId = 1; groupId <= groupCount; groupId++) {
    const groupStandings = standings.get(groupId) || [];
    const topTeams = groupStandings.slice(0, teamsPerGroup);
    topTeams.forEach(standing => {
      const participant = {
        ...standing.participant,
        groupId: groupId,
        groupPosition: groupStandings.findIndex(s => s.participant.id === standing.participant.id) + 1
      };
      qualifiedTeams.push(participant);
    });
  }
  if (qualifiedTeams.length < 2) return [];
  const singleEliminationGenerator = new SingleEliminationGenerator();
  const playoffMatches = singleEliminationGenerator.generateBracket(qualifiedTeams as any);
  const maxRound = 0;
  playoffMatches.forEach((match: any) => {
    match.round += maxRound;
    match.id = Math.random();
    match.playoff = true;
  });
  return playoffMatches as Match[];
}

// Add more structure-related helpers as needed 