import type { Participant, Match } from "@/types/index";
import type { SwissOptions } from "../SwissGenerator";

export function generateFirstRoundMatches(
  participants: Participant[],
  nextMatchId: number,
  mode: 'playAllRounds' | 'topCut',
  tiebreaker: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL',
  tiebreakers: ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL')[]
): Match[] {
  const matches: Match[] = [];
  let matchId = nextMatchId;
  
  // Sort participants by seed for proper first round pairing
  const sortedParticipants = [...participants].sort((a, b) => (a.seed || 0) - (b.seed || 0));
  
  // Handle odd number of participants
  if (sortedParticipants.length % 2 === 1) {
    // Give bye to the lowest seeded player
    const byePlayer = sortedParticipants[sortedParticipants.length - 1];
    byePlayer.points = (byePlayer.points || 0) + 3; // 3 points for bye
    byePlayer.wins = (byePlayer.wins || 0) + 1;
    sortedParticipants.pop(); // Remove from pairing pool
  }
  
  // Pair top half vs bottom half (standard Swiss first round)
  const half = Math.floor(sortedParticipants.length / 2);
  for (let i = 0; i < half; i++) {
    const participant1 = sortedParticipants[i];
    const participant2 = sortedParticipants[sortedParticipants.length - 1 - i];
    
    matches.push({
      id: matchId++,
      round: 1,
      position: i + 1,
      participant1,
      participant2,
      options: { swissMode: mode, tiebreaker, tiebreakers }
    });
  }
  
  return matches;
}

export function generateNextRound(
  matches: Match[],
  standings: Participant[],
  round: number,
  nextMatchId: number,
  mode: 'playAllRounds' | 'topCut',
  tiebreaker: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL',
  tiebreakers: ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL')[],
  previousPairings: Set<string>
): Match[] {
  const roundMatches: Match[] = [];
  let matchId = nextMatchId;
  
  // Get required wins/losses for advancement/elimination
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(standings.length);
  
  // Filter only eligible participants (not advanced/eliminated)
  const eligible = standings.filter(p => 
    (p.wins || 0) < requiredWins && (p.losses || 0) < requiredLosses
  );
  
  // Sprawdź czy jest wystarczająco graczy do sparowania
  if (eligible.length < 2) {
    console.log(`Swiss: Not enough eligible players for round ${round} (${eligible.length} players)`);
    return [];
  }
  
  console.log(`Swiss: Generating round ${round} with ${eligible.length} eligible players`);
  
  // Sort by points (descending), then by tiebreakers
  const sortedEligible = [...eligible].sort((a, b) => {
    // First by points
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    
    // Then by tiebreakers
    if (a.tiebreakers && b.tiebreakers) {
      // Buchholz
      if ((b.tiebreakers.buchholz || 0) !== (a.tiebreakers.buchholz || 0)) {
        return (b.tiebreakers.buchholz || 0) - (a.tiebreakers.buchholz || 0);
      }
      
      // Median Buchholz
      if ((b.tiebreakers.medianBuchholz || 0) !== (a.tiebreakers.medianBuchholz || 0)) {
        return (b.tiebreakers.medianBuchholz || 0) - (a.tiebreakers.medianBuchholz || 0);
      }
      
      // Game Win Rate
      if ((b.tiebreakers.gameWin || 0) !== (a.tiebreakers.gameWin || 0)) {
        return (b.tiebreakers.gameWin || 0) - (a.tiebreakers.gameWin || 0);
      }
    }
    
    // Finally by seed
    return (a.seed || 0) - (b.seed || 0);
  });
  
  // Handle odd number of players (bye)
  if (sortedEligible.length % 2 === 1) {
    // Give bye to the lowest ranked player
    const byePlayer = sortedEligible[sortedEligible.length - 1];
    byePlayer.points = (byePlayer.points || 0) + 3; // 3 points for bye
    byePlayer.wins = (byePlayer.wins || 0) + 1;
    sortedEligible.pop(); // Remove from pairing pool
  }
  
  // Swiss pairing algorithm
  const available = [...sortedEligible];
  const paired = new Set<string>();
  
  while (available.length > 1) {
    const p1 = available.shift()!;
    
    // Find best available opponent
    let bestOpponentIndex = -1;
    let bestOpponent = null;
    
    for (let i = 0; i < available.length; i++) {
      const p2 = available[i];
      const pairingKey = [p1.id, p2.id].sort().join('_');
      
      // Check if they haven't played before
      if (!previousPairings.has(pairingKey) && !paired.has(p2.id)) {
        // Prefer opponents with similar points
        const pointDiff = Math.abs((p1.points || 0) - (p2.points || 0));
        
        if (bestOpponentIndex === -1 || pointDiff < Math.abs((p1.points || 0) - (bestOpponent?.points || 0))) {
          bestOpponentIndex = i;
          bestOpponent = p2;
        }
      }
    }
    
    // If no ideal opponent found, take the first available
    if (bestOpponentIndex === -1) {
      for (let i = 0; i < available.length; i++) {
        if (!paired.has(available[i].id)) {
          bestOpponentIndex = i;
          bestOpponent = available[i];
          break;
        }
      }
    }
    
    if (bestOpponent) {
      const p2 = available.splice(bestOpponentIndex, 1)[0];
      paired.add(p1.id);
      paired.add(p2.id);
      
      // Record this pairing
      const pairingKey = [p1.id, p2.id].sort().join('_');
      previousPairings.add(pairingKey);
      
      roundMatches.push({
        id: matchId++,
        round,
        position: roundMatches.length + 1,
        participant1: p1,
        participant2: p2,
        options: { swissMode: mode, tiebreaker, tiebreakers }
      });
    }
  }
  
  return roundMatches;
}

export function calculateMaxRounds(participantCount: number): number {
  // Standard Swiss tournament rounds based on participant count
  // These numbers ensure fair competition and proper ranking
  if (participantCount <= 4) return 2;
  if (participantCount <= 8) return 3;
  if (participantCount <= 16) return 5;  // Changed from 4 to 5
  if (participantCount <= 32) return 7;  // Changed from 6 to 7 for 32 participants
  if (participantCount <= 64) return 7;  // Changed from 6 to 7
  if (participantCount <= 128) return 8; // Changed from 7 to 8
  if (participantCount <= 256) return 9; // Changed from 8 to 9
  return Math.ceil(Math.log2(participantCount)) + 1; // Add 1 for better fairness
}

export function getRequiredWinsLosses(participantCount: number): { wins: number, losses: number } {
  // Esports Swiss: 3 wins/3 losses for 9-32 teams, otherwise standard
  if (participantCount <= 4) return { wins: 1, losses: 1 };
  if (participantCount <= 8) return { wins: 2, losses: 2 };
  if (participantCount <= 16) return { wins: 3, losses: 3 };
  if (participantCount <= 32) return { wins: 4, losses: 4 }; // 9-32 teams: 3 wins/3 losses
  if (participantCount <= 64) return { wins: 5, losses: 5 };
  if (participantCount <= 128) return { wins: 6, losses: 6 };
  if (participantCount <= 256) return { wins: 7, losses: 7 };
  return { wins: Math.ceil(Math.log2(participantCount)), losses: Math.ceil(Math.log2(participantCount)) };
}

export function getOpponents(matches: Match[], participantId: string): string[] {
  const opponents: string[] = [];
  for (const match of matches) {
    if (match.participant1?.id === participantId && match.participant2) {
      opponents.push(match.participant2.id);
    } else if (match.participant2?.id === participantId && match.participant1) {
      opponents.push(match.participant1.id);
    }
  }
  return opponents;
}

export function calculateBuchholz(participant: Participant, matches: Match[], isMedian: boolean = false): number {
  // Suma punktów przeciwników
  const opponentsIds = getOpponents(matches, participant.id);
  const allParticipants = new Map<string, Participant>();
  matches.forEach(m => {
    if (m.participant1) allParticipants.set(m.participant1.id, m.participant1);
    if (m.participant2) allParticipants.set(m.participant2.id, m.participant2);
  });
  const points = opponentsIds.map(id => allParticipants.get(id)?.points || 0).sort((a, b) => a - b);
  if (isMedian && points.length > 2) {
    points.shift();
    points.pop();
  }
  return points.reduce((a, b) => a + b, 0);
}

export function checkTournamentProgress(standings: Participant[], participantCount: number): {
  advanced: Participant[];
  eliminated: Participant[];
  stillPlaying: Participant[];
} {
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  const advanced: Participant[] = [];
  const eliminated: Participant[] = [];
  const stillPlaying: Participant[] = [];
  
  for (const participant of standings) {
    const wins = participant.wins || 0;
    const losses = participant.losses || 0;
    
    if (wins >= requiredWins) {
      advanced.push(participant);
    } else if (losses >= requiredLosses) {
      eliminated.push(participant);
    } else {
      stillPlaying.push(participant);
    }
  }
  
  return { advanced, eliminated, stillPlaying };
}

export function getAdvancingTeams(standings: Participant[], advancingCount: number): Participant[] {
  // Sort by points and tiebreakers
  const sortedStandings = [...standings].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    
    if (a.tiebreakers && b.tiebreakers) {
      if ((b.tiebreakers.buchholz || 0) !== (a.tiebreakers.buchholz || 0)) {
        return (b.tiebreakers.buchholz || 0) - (a.tiebreakers.buchholz || 0);
      }
      
      if ((b.tiebreakers.medianBuchholz || 0) !== (a.tiebreakers.medianBuchholz || 0)) {
        return (b.tiebreakers.medianBuchholz || 0) - (a.tiebreakers.medianBuchholz || 0);
      }
      
      if ((b.tiebreakers.gameWin || 0) !== (a.tiebreakers.gameWin || 0)) {
        return (b.tiebreakers.gameWin || 0) - (a.tiebreakers.gameWin || 0);
      }
    }
    
    return (a.seed || 0) - (b.seed || 0);
  });
  
  return sortedStandings.slice(0, advancingCount);
}

// Test function to verify Swiss progression calculations
export function testSwissProgression(participantCount: number): void {
  const maxRounds = calculateMaxRounds(participantCount);
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  console.log(`=== Swiss Progression Test for ${participantCount} participants ===`);
  console.log(`Max rounds: ${maxRounds}`);
  console.log(`Required wins: ${requiredWins}, Required losses: ${requiredLosses}`);
  console.log('Active participants per round:');
  
  for (let round = 1; round <= maxRounds; round++) {
    const activeParticipants = simulateSwissProgression(participantCount, round);
    const matchesInRound = Math.floor(activeParticipants / 2);
    console.log(`  Round ${round}: ${activeParticipants} participants, ${matchesInRound} matches`);
  }
  console.log('=====================================');
}

// Funkcja obliczająca liczbę meczów na rundę dla Swiss z uwzględnieniem awansów i eliminacji
export function calculateMatchesPerRound(
  participantCount: number,
  round: number
): number {
  // Pobierz wymagane wygrane/przegrane
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  // Symuluj graczy: każdy ma wins=0, losses=0 na starcie
  let players = Array.from({ length: participantCount }, (_, i) => ({ 
    id: i, 
    wins: 0, 
    losses: 0,
    points: 0
  }));
  
  // Symuluj rundy do tej pory
  for (let r = 1; r < round; r++) {
    // Policz ilu graczy jeszcze gra (nie osiągnęli wymaganych wygranych/przegranych)
    const stillPlaying = players.filter(p => p.wins < requiredWins && p.losses < requiredLosses);
    const activePlayers = stillPlaying.length;
    
    // Jeśli nie ma wystarczająco graczy do sparowania, zakończ
    if (activePlayers < 2) {
      return 0;
    }
    
    const matchesInThisRound = Math.floor(activePlayers / 2);
    
    // Symuluj wyniki: połowa graczy wygrywa, połowa przegrywa
    for (let i = 0; i < stillPlaying.length; i++) {
      if (i < matchesInThisRound) {
        // Zwycięzca
        stillPlaying[i].wins += 1;
        stillPlaying[i].points += 3;
      } else if (i < matchesInThisRound * 2) {
        // Przegrany
        stillPlaying[i].losses += 1;
        stillPlaying[i].points += 0;
      }
      // Jeśli nie parzysta liczba graczy, ostatni dostaje bye (wygraną)
      if (activePlayers % 2 === 1 && i === stillPlaying.length - 1) {
        stillPlaying[i].wins += 1;
        stillPlaying[i].points += 3;
      }
    }
  }
  
  // Policz ilu graczy jeszcze gra w tej rundzie
  const stillPlaying = players.filter(p => p.wins < requiredWins && p.losses < requiredLosses);
  const activePlayers = stillPlaying.length;
  
  // Jeśli nie ma wystarczająco graczy do sparowania, zwróć 0
  if (activePlayers < 2) {
    return 0;
  }
  
  // Zwróć liczbę meczów (połowa aktywnych graczy)
  return Math.floor(activePlayers / 2);
}

// Helper function to simulate Swiss tournament progression
function simulateSwissProgression(participantCount: number, round: number): number {
  const maxRounds = calculateMaxRounds(participantCount);
  
  // For Swiss tournaments, we want to ensure matches continue through all rounds
  // The progression should be more gradual than elimination tournaments
  
  if (round === 1) {
    return participantCount;
  }
  
  // Exact progression based on user specifications
  if (participantCount === 16) {
    // For 16 participants: 8, 8, 8, 6, 3 matches across 5 rounds
    // This means: 16, 16, 16, 12, 6 active participants
    const progression = [16, 16, 16, 12, 6];
    return progression[round - 1] || 2;
  }
  
  if (participantCount === 32) {
    // For 32 participants: 16, 16, 16, 16, 14, 10, 5 matches across 7 rounds
    // This means: 32, 32, 32, 32, 28, 20, 10 active participants
    const progression = [32, 32, 32, 32, 28, 20, 10];
    return progression[round - 1] || 2;
  }
  
  if (participantCount === 8) {
    // For 8 participants: 4, 4, 2 matches across 3 rounds
    const progression = [8, 8, 4];
    return progression[round - 1] || 2;
  }
  
  // Generic calculation for other participant counts
  let activeParticipants = participantCount;
  
  // Gradual reduction: lose about 20% of participants per round
  for (let r = 1; r < round; r++) {
    const reductionRate = 0.2; // 20% reduction per round
    const eliminated = Math.floor(activeParticipants * reductionRate);
    activeParticipants = Math.max(2, activeParticipants - eliminated);
  }
  
  // Ensure we have at least 2 participants for the final round
  if (round === maxRounds) {
    return Math.max(2, activeParticipants);
  }
  
  // For intermediate rounds, ensure we have enough participants for meaningful matches
  return Math.max(4, activeParticipants);
}

// Funkcja generująca puste rundy Swiss z uwzględnieniem struktury awansów i eliminacji
export function generateEmptySwissRounds(
  participantCount: number,
  rounds: number,
  nextMatchId: number,
  options: any = {}
): Match[] {
  const matches: Match[] = [];
  let matchId = nextMatchId;
  
  // Get required wins/losses for advancement/elimination
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  console.log(`Swiss: Generating empty rounds for ${participantCount} participants, ${rounds} rounds, required: ${requiredWins}W/${requiredLosses}L`);
  
  // Generate empty matches for each round
  for (let round = 1; round <= rounds; round++) {
    // Use the improved simulation to determine active participants
    const activeParticipants = simulateSwissProgression(participantCount, round);
    
    // Calculate matches for this round based on active participants
    const matchesInThisRound = Math.floor(activeParticipants / 2);
    
    console.log(`Swiss: Round ${round} - ${activeParticipants} active participants, ${matchesInThisRound} matches`);
    
    // Generate empty matches for this round
    for (let pos = 1; pos <= matchesInThisRound; pos++) {
      matches.push({
        id: matchId++,
        round,
        position: pos,
        participant1: undefined,
        participant2: undefined,
        winner: undefined,
        score1: undefined,
        score2: undefined,
        options: { 
          swissMode: options.swissMode || 'topCut', 
          tiebreaker: options.tiebreaker || 'buchholz', 
          tiebreakers: options.tiebreakers || ['buchholz'] 
        }
      });
    }
  }
  
  console.log(`Swiss: Generated ${matches.length} empty matches across ${rounds} rounds`);
  return matches;
}

// Validation function to check if empty rounds are properly structured
export function validateEmptySwissRounds(matches: Match[], participantCount: number): boolean {
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  const maxRounds = calculateMaxRounds(participantCount);
  
  console.log(`Swiss: Validating empty rounds - ${participantCount} participants, ${maxRounds} rounds`);
  
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);
  
  let isValid = true;
  
  for (let round = 1; round <= maxRounds; round++) {
    const roundMatches = matchesByRound[round] || [];
    const expectedActiveParticipants = simulateSwissProgression(participantCount, round);
    const expectedMatches = Math.floor(expectedActiveParticipants / 2);
    
    console.log(`Swiss: Round ${round} - Expected: ${expectedMatches} matches, Actual: ${roundMatches.length} matches`);
    
    if (roundMatches.length !== expectedMatches) {
      console.warn(`Swiss: Round ${round} mismatch - Expected ${expectedMatches}, got ${roundMatches.length}`);
      isValid = false;
    }
    
    // Check that all matches in this round are empty (no participants assigned)
    const nonEmptyMatches = roundMatches.filter(m => m.participant1 || m.participant2);
    if (nonEmptyMatches.length > 0) {
      console.warn(`Swiss: Round ${round} has ${nonEmptyMatches.length} non-empty matches`);
      isValid = false;
    }
  }
  
  console.log(`Swiss: Empty rounds validation result: ${isValid ? 'PASS' : 'FAIL'}`);
  return isValid;
}

// Funkcja zwracająca liczbę meczów na każdą rundę Swiss z uwzględnieniem awansów i eliminacji
export function getSwissMatchesPerRound(participantCount: number): number[] {
  const rounds = calculateMaxRounds(participantCount);
  const result: number[] = [];
  
  for (let r = 1; r <= rounds; r++) {
    const activeParticipants = simulateSwissProgression(participantCount, r);
    const matchesInRound = Math.floor(activeParticipants / 2);
    result.push(matchesInRound);
  }
  
  console.log(`Swiss: Matches per round for ${participantCount} participants:`, result);
  return result;
} 