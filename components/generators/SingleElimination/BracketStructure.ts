import type { Participant } from "@/types/participants";
import type { Match } from "@/types/matches";

export function getClosestBracketSize(teamCount: number): number {
  const knownBrackets = [2, 4, 8, 16, 32, 64, 128, 256];
  return knownBrackets.find(size => size >= teamCount) || knownBrackets[knownBrackets.length - 1];
}

export function calculateByePosition(seed: number, bracketSize: number): number {
  if (seed <= 1) return 1;
  let power = 1;
  while (power * 2 <= seed) {
    power *= 2;
  }
  return 2 * seed - 2 * power + 1;
}

export function calculatePrelimWinnerPositions(bracketSize: number, prelimMatchCount: number): Set<number> {
  const positions = new Set<number>();
  const step = bracketSize / prelimMatchCount;
  for (let i = 0; i < prelimMatchCount; i++) {
    const position = Math.floor(i * step + 1);
    positions.add(position);
  }
  return positions;
}

export function getSeededPosition(seed: number, bracketSize: number): number {
  return calculateByePosition(seed, bracketSize);
}

export function generateStandardBracket(matches: Match[], participants: Participant[], totalTeams: number, bracketSize: number, byes: number, rounds: number, options: any, startMatchId: number = 1): void {
  const firstRoundMatchCount = bracketSize / 2;
  let matchId = startMatchId;
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.standingPosition !== undefined && b.standingPosition !== undefined) {
      return a.standingPosition - b.standingPosition;
    }
    return (a.seed || 999) - (b.seed || 999);
  });
  const seededParticipants: (Participant | undefined)[] = new Array(bracketSize).fill(undefined);
  for (let i = 0; i < sortedParticipants.length; i++) {
    const team = sortedParticipants[i];
    const position = calculateByePosition(i + 1, bracketSize);
    seededParticipants[position - 1] = team;
  }
  const unassignedTeams = sortedParticipants.filter(team => !seededParticipants.some(p => p?.id === team.id));
  if (unassignedTeams.length > 0) {
    const emptyPositions: number[] = seededParticipants
      .map((p, index) => p === undefined ? index + 1 : -1)
      .filter(pos => pos !== -1);
    unassignedTeams.forEach((team, index) => {
      if (index < emptyPositions.length) {
        seededParticipants[emptyPositions[index] - 1] = team;
      }
    });
  }
  for (let i = 0; i < bracketSize / 2; i++) {
    const position = i + 1;
    const team1Index = i * 2;
    const team2Index = i * 2 + 1;
    matches.push({
      id: matchId++,
      round: 1,
      position: position,
      participant1: seededParticipants[team1Index],
      participant2: seededParticipants[team2Index],
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    });
  }
  for (let round = 2; round <= rounds; round++) {
    const matchesInThisRound = firstRoundMatchCount / Math.pow(2, round - 1);
    for (let i = 0; i < matchesInThisRound; i++) {
      const position = i + 1;
      const prevRoundMatch1 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 1);
      const prevRoundMatch2 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 2);
      matches.push({
        id: matchId++,
        round: round,
        position: position,
        participant1: undefined,
        participant2: undefined,
        connectedMatches: [
          ...(prevRoundMatch1 ? [prevRoundMatch1.id] : []),
          ...(prevRoundMatch2 ? [prevRoundMatch2.id] : [])
        ],
        slotLabel1: undefined,
        slotLabel2: undefined
      });
    }
  }
  if (options.thirdPlaceMatch) {
    matches.push({
      id: matchId++,
      round: rounds,
      position: 2,
      participant1: undefined,
      participant2: undefined,
      thirdPlaceMatch: true,
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    });
  }
}

export function generateGroupBasedBracket(matches: Match[], participants: Participant[], options: any = {}): void {
  const groupedParticipants: Record<string, Participant[]> = {};
  participants.forEach(participant => {
    const groupId = participant.groupId || 'unknown';
    if (!groupedParticipants[groupId]) {
      groupedParticipants[groupId] = [];
    }
    groupedParticipants[groupId].push(participant);
  });
  Object.keys(groupedParticipants).forEach(groupId => {
    groupedParticipants[groupId].sort((a, b) => (a.groupPosition || 999) - (b.groupPosition || 999));
  });
  const groups = Object.keys(groupedParticipants).sort();
  const advancingTeams = options.advancingTeams || 1;
  const totalQualified = groups.length * advancingTeams;
  const bracketSize = getClosestBracketSize(totalQualified);
  const rounds = Math.ceil(Math.log2(bracketSize));
  const firstRoundMatchCount = bracketSize / 2;
  const qualified: Participant[] = [];
  groups.forEach((groupId) => {
    const groupTeams = groupedParticipants[groupId];
    for (let pos = 0; pos < advancingTeams; pos++) {
      const team = groupTeams[pos];
      if (team) {
        qualified.push({
          id: `placeholder-${groupId}-${pos+1}`,
          name: '',
          logo: '',
          placeholder: true
        } as Participant);
      }
    }
  });
  const seededParticipants: (Participant | undefined)[] = new Array(bracketSize).fill(undefined);
  let left = 0, right = bracketSize - 1, dir = true;
  qualified.forEach((team) => {
    const pos = dir ? left++ : right--;
    seededParticipants[pos] = team;
    dir = !dir;
  });
  let matchId = 1;
  for (let i = 0; i < bracketSize / 2; i++) {
    const team1Index = i * 2;
    const team2Index = i * 2 + 1;
    matches.push({
      id: matchId++,
      round: 1,
      position: i + 1,
      participant1: undefined,
      participant2: undefined,
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    });
  }
  for (let round = 2; round <= rounds; round++) {
    const matchesInThisRound = firstRoundMatchCount / Math.pow(2, round - 1);
    for (let i = 0; i < matchesInThisRound; i++) {
      const position = i + 1;
      const prevRoundMatch1 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 1);
      const prevRoundMatch2 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 2);
      matches.push({
        id: matchId++,
        round: round,
        position: position,
        participant1: undefined,
        participant2: undefined,
        connectedMatches: [
          ...(prevRoundMatch1 ? [prevRoundMatch1.id] : []),
          ...(prevRoundMatch2 ? [prevRoundMatch2.id] : [])
        ],
        slotLabel1: undefined,
        slotLabel2: undefined
      });
    }
  }
  if (options.thirdPlaceMatch) {
    matches.push({
      id: matchId++,
      round: rounds,
      position: 2,
      participant1: undefined,
      participant2: undefined,
      thirdPlaceMatch: true,
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    });
  }
}

export function generateWithPreliminaryMatches(matches: Match[], participants: Participant[], totalTeams: number, rounds: number, options: any, startMatchId: number): void {
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
  const nextLowerPowerOf2 = Math.pow(2, Math.floor(Math.log2(totalTeams)));
  const preliminaryMatchesNeeded = totalTeams - nextLowerPowerOf2;
  let currentMatchId = startMatchId;
  const preliminaryRound = 0;
  const teamsInPrelims = new Set();
  const prelimMatches: Match[] = [];
  for (let i = 0; i < preliminaryMatchesNeeded; i++) {
    const team1Index = totalTeams - 1 - (i * 2);
    const team2Index = totalTeams - 2 - (i * 2);
    if (team1Index >= 0 && team2Index >= 0) {
      const prelimMatch = {
        id: currentMatchId++,
        round: preliminaryRound,
        position: i + 1,
        participant1: participants[team1Index],
        participant2: participants[team2Index],
        preliminaryRound: true,
        connectedMatches: [],
        slotLabel1: undefined,
        slotLabel2: undefined
      } as Match;
      prelimMatches.push(prelimMatch);
      matches.push(prelimMatch);
      teamsInPrelims.add(team1Index);
      teamsInPrelims.add(team2Index);
    }
  }
  const directAdvanceTeams: Participant[] = [];
  for (let i = 0; i < totalTeams; i++) {
    if (!teamsInPrelims.has(i)) {
      directAdvanceTeams.push(participants[i]);
    }
  }
  const firstRoundMatchCount = nextLowerPowerOf2 / 2;
  const prelimWinnerPositions = calculatePrelimWinnerPositions(nextLowerPowerOf2, preliminaryMatchesNeeded);
  for (let i = 0; i < firstRoundMatchCount; i++) {
    const position = i + 1;
    const matchPosition1 = i * 2 + 1;
    const matchPosition2 = i * 2 + 2;
    const position1NeedsPrelimWinner = prelimWinnerPositions.has(matchPosition1);
    const position2NeedsPrelimWinner = prelimWinnerPositions.has(matchPosition2);
    let participant1: Participant | undefined = undefined;
    let participant2: Participant | undefined = undefined;
    let awaitingPrelimWinner1: number | undefined = undefined;
    let awaitingPrelimWinner2: number | undefined = undefined;
    if (position1NeedsPrelimWinner) {
      awaitingPrelimWinner1 = prelimMatches[matchPosition1 - 1]?.id;
    } else if (directAdvanceTeams.length > 0) {
      participant1 = directAdvanceTeams.shift();
    }
    if (position2NeedsPrelimWinner) {
      awaitingPrelimWinner2 = prelimMatches[matchPosition2 - 1]?.id;
    } else if (directAdvanceTeams.length > 0) {
      participant2 = directAdvanceTeams.shift();
    }
    const match: Match = {
      id: currentMatchId++,
      round: 1,
      position: position,
      participant1,
      participant2,
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    };
    const prelimWinners: number[] = [];
    if (awaitingPrelimWinner1) prelimWinners.push(awaitingPrelimWinner1);
    if (awaitingPrelimWinner2) prelimWinners.push(awaitingPrelimWinner2);
    if (prelimWinners.length === 1) {
      (match as any).awaitingPreliminaryWinner = prelimWinners[0];
    } else if (prelimWinners.length > 1) {
      (match as any).awaitingPreliminaryWinners = prelimWinners;
    }
    matches.push(match);
  }
  const actualRounds = Math.log2(nextLowerPowerOf2);
  for (let round = 2; round <= actualRounds; round++) {
    const matchesInRound = Math.pow(2, actualRounds - round);
    for (let position = 1; position <= matchesInRound; position++) {
      matches.push({
        id: currentMatchId++,
        round: round,
        position: position,
        participant1: undefined,
        participant2: undefined,
        connectedMatches: [],
        slotLabel1: undefined,
        slotLabel2: undefined
      });
    }
  }
  if (options.thirdPlaceMatch) {
    matches.push({
      id: currentMatchId++,
      round: actualRounds,
      position: 2,
      participant1: undefined,
      participant2: undefined,
      thirdPlaceMatch: true,
      connectedMatches: [],
      slotLabel1: undefined,
      slotLabel2: undefined
    });
  }
} 