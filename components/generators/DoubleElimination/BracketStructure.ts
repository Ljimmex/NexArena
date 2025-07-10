import type { Participant, Match } from "@/types/index";

export function getClosestBracketSize(participantCount: number): number {
  const sizes = [2, 4, 8, 16, 32, 64];
  for (const size of sizes) {
    if (size >= participantCount) {
      return size;
    }
  }
  return 64;
}

export function getSlotLabel(participant: Participant | undefined, idx: number, teamCount: number): string {
  if (participant) {
    return participant.name;
  }
  return `Slot ${idx}`;
}

export function generateEmptyBracket(options: any): Match[] {
  // Ustal rozmiar drabinki na podstawie przekazanego bracketSize
  let bracketSize = 8;
  if (options.bracketSize) {
    bracketSize = getClosestBracketSize(options.bracketSize);
  }
  // Stwórz placeholdery
  const placeholderParticipants: Participant[] = [];
  for (let i = 0; i < bracketSize; i++) {
    placeholderParticipants.push({
      id: `placeholder-double-${i + 1}`,
      name: `Slot ${i + 1}`,
      placeholder: true
    } as any);
  }
  const matches: Match[] = [];
  const winnerBracketRounds = Math.ceil(Math.log2(bracketSize));
  const nextMatchId = { value: 1 };
  // Winner bracket
  const firstRoundMatches = generateFirstRoundMatches(placeholderParticipants, nextMatchId);
  matches.push(...firstRoundMatches);
  generateWinnerBracket(matches, winnerBracketRounds, nextMatchId);
  generateLoserBracket(matches, winnerBracketRounds, nextMatchId);
  if (options?.thirdPlaceMatch) {
    generateThirdPlaceMatch(matches, nextMatchId);
  }
  if (options?.skipGrandFinal !== true) {
    const useWinnersAdvantage = options?.winnersAdvantage || false;
    const grandFinalType = options?.grandFinal || "single";
    generateGrandFinal(matches, nextMatchId, useWinnersAdvantage, grandFinalType);
  }
  return matches;
}

export function generateFirstRoundMatches(participants: Participant[], nextMatchId: { value: number }): Match[] {
  const matches: Match[] = [];
  const participantCount = participants.length;
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const matchCount = Math.floor(participantCount / 2) + (participantCount % 2);
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.seed !== undefined && b.seed !== undefined) {
      return a.seed - b.seed;
    }
    return 0;
  });
  for (let i = 0; i < matchCount; i++) {
    const match: Match = {
      id: nextMatchId.value++,
      round: 1,
      position: i + 1,
      participant1: sortedParticipants[i * 2],
      participant2: (i * 2 + 1) < participantCount ? sortedParticipants[i * 2 + 1] : undefined
    };
    if (!match.participant2) {
      match.winner = match.participant1;
    }
    matches.push(match);
  }
  return matches;
}

export function generateWinnerBracket(matches: Match[], totalRounds: number, nextMatchId: { value: number }): void {
  for (let round = 2; round <= totalRounds; round++) {
    const previousRoundMatches = matches.filter(m => m.round === round - 1);
    const matchCount = Math.ceil(previousRoundMatches.length / 2);
    for (let i = 0; i < matchCount; i++) {
      const match: Match = {
        id: nextMatchId.value++,
        round: round,
        position: i + 1,
        connectedMatches: [
          previousRoundMatches[i * 2]?.id,
          (i * 2 + 1) < previousRoundMatches.length ? previousRoundMatches[i * 2 + 1]?.id : undefined
        ].filter(Boolean) as number[]
      };
      matches.push(match);
    }
  }
}

export function generateLoserBracket(matches: Match[], winnerBracketRounds: number, nextMatchId: { value: number }): void {
  const loserBracketRounds = 2 * winnerBracketRounds - 1;
  let loserRound = 1;
  const winnerRound1Matches = matches.filter(m => m.round === 1);
  const loserRound1MatchCount = Math.floor(winnerRound1Matches.length / 2);
  for (let i = 0; i < loserRound1MatchCount; i++) {
    const match: Match = {
      id: nextMatchId.value++,
      round: -loserRound,
      position: i + 1,
      connectedMatches: [
        winnerRound1Matches[i * 2]?.id,
        (i * 2 + 1) < winnerRound1Matches.length ? winnerRound1Matches[i * 2 + 1]?.id : undefined
      ].filter(Boolean) as number[]
    };
    matches.push(match);
  }
  for (let winnerRound = 2; winnerRound <= winnerBracketRounds; winnerRound++) {
    loserRound++;
    const winnerRoundMatches = matches.filter(m => m.round === winnerRound);
    const previousLoserRoundMatches = matches.filter(m => m.round === -(loserRound - 1));
    if (winnerRoundMatches.length === 0 || previousLoserRoundMatches.length === 0) continue;
    const loserRoundMatchCount = Math.min(winnerRoundMatches.length, previousLoserRoundMatches.length);
    for (let i = 0; i < loserRoundMatchCount; i++) {
      const match: Match = {
        id: nextMatchId.value++,
        round: -loserRound,
        position: i + 1,
        connectedMatches: [
          winnerRoundMatches[i]?.id,
          previousLoserRoundMatches[i]?.id
        ].filter(Boolean) as number[]
      };
      matches.push(match);
    }
    if (winnerRound < winnerBracketRounds) {
      loserRound++;
      const firstLoserRoundMatches = matches.filter(m => m.round === -(loserRound - 1));
      if (firstLoserRoundMatches.length === 0) continue;
      const secondLoserRoundMatchCount = Math.floor(firstLoserRoundMatches.length / 2);
      for (let i = 0; i < secondLoserRoundMatchCount; i++) {
        const match: Match = {
          id: nextMatchId.value++,
          round: -loserRound,
          position: i + 1,
          connectedMatches: [
            firstLoserRoundMatches[i * 2]?.id,
            (i * 2 + 1) < firstLoserRoundMatches.length ? firstLoserRoundMatches[i * 2 + 1]?.id : undefined
          ].filter(Boolean) as number[]
        };
        matches.push(match);
      }
    }
  }
}

export function generateThirdPlaceMatch(matches: Match[], nextMatchId: { value: number }): void {
  const winnerBracketSemis = matches.filter(m => m.round > 0 && matches.some(other => other.round > 0 && other.connectedMatches?.includes(m.id)));
  if (winnerBracketSemis.length >= 2) {
    const thirdPlaceMatch: Match = {
      id: nextMatchId.value++,
      round: -1,
      position: 1,
      thirdPlaceMatch: true,
      connectedMatches: winnerBracketSemis.map(m => m.id)
    };
    matches.push(thirdPlaceMatch);
  }
}

export function generateGrandFinal(matches: Match[], nextMatchId: { value: number }, winnersAdvantage: boolean, grandFinalType: string = "single"): void {
  const winnerBracketFinal = matches.find(m => m.round > 0 && !matches.some(other => other.round > 0 && other.connectedMatches?.includes(m.id)));
  const loserBracketFinal = matches.find(m => m.round < 0 && !matches.some(other => other.round < 0 && other.connectedMatches?.includes(m.id)));
  if (winnerBracketFinal && loserBracketFinal) {
    const grandFinal: Match = {
      id: nextMatchId.value++,
      round: 0,
      position: 1,
      connectedMatches: [winnerBracketFinal.id, loserBracketFinal.id],
      grandFinal: true,
      matchName: `Grand Final`
    };
    if (winnerBracketFinal.winner) {
      grandFinal.participant1 = winnerBracketFinal.winner;
    }
    if (loserBracketFinal.winner) {
      grandFinal.participant2 = loserBracketFinal.winner;
    }
    matches.push(grandFinal);
    if (grandFinalType === "double" && winnersAdvantage) {
      const secondGrandFinal: Match = {
        id: nextMatchId.value++,
        round: 0,
        position: 2,
        connectedMatches: [grandFinal.id],
        grandFinal: true,
        matchName: `Grand Final (Reset)`,
        preliminaryRound: true
      };
      matches.push(secondGrandFinal);
    }
  }
} 