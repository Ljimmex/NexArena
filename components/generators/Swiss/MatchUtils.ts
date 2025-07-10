import type { Match, Participant } from "@/types/index";
import { calculateBuchholz } from "./BracketStructure";

export function updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
  const updatedMatches = matches.map(m => ({ ...m }));
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return updatedMatches;
  const match = updatedMatches[matchIndex];
  if (!match.participant1 || !match.participant2) return updatedMatches;
  // Ustaw zwycięzcę
  match.winner = match.participant1.id === winnerId ? match.participant1 : match.participant2;
  updatedMatches[matchIndex] = match;
  return updatedMatches;
}

export function updateParticipantStatsForWin(winnerId: string, match: Match) {
  if (match.participant1 && match.participant1.id === winnerId) {
    match.participant1.wins = (match.participant1.wins || 0) + 1;
    match.participant1.points = (match.participant1.points || 0) + 3;
  } else if (match.participant2 && match.participant2.id === winnerId) {
    match.participant2.wins = (match.participant2.wins || 0) + 1;
    match.participant2.points = (match.participant2.points || 0) + 3;
  }
}

export function updateParticipantStatsForLoss(loserId: string, match: Match) {
  if (match.participant1 && match.participant1.id === loserId) {
    match.participant1.losses = (match.participant1.losses || 0) + 1;
  } else if (match.participant2 && match.participant2.id === loserId) {
    match.participant2.losses = (match.participant2.losses || 0) + 1;
  }
}

export function updateStandings(matches: Match[], standings: Participant[]): void {
  console.log('MatchUtils: updateStandings called with', matches.length, 'matches and', standings.length, 'participants');
  
  calculateStandings(matches, standings);
  
  // Sort standings by points and tiebreakers
  standings.sort((a, b) => {
    // First by points (descending)
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    
    // Then by tiebreakers in order of priority
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
      
      // Head-to-Head
      if ((b.tiebreakers.headToHead || 0) !== (a.tiebreakers.headToHead || 0)) {
        return (b.tiebreakers.headToHead || 0) - (a.tiebreakers.headToHead || 0);
      }
      
      // Game W/L Differential
      if ((b.tiebreakers.gameWL || 0) !== (a.tiebreakers.gameWL || 0)) {
        return (b.tiebreakers.gameWL || 0) - (a.tiebreakers.gameWL || 0);
      }
    }
    
    // Finally by seed (lower seed = higher rank)
    return (a.seed || 0) - (b.seed || 0);
  });
  
  // Update standing positions
  standings.forEach((participant, index) => {
    participant.standingPosition = index + 1;
    participant.standingId = index + 1;
  });
  
  console.log('MatchUtils: Final standings:', standings.map(s => ({ name: s.name, points: s.points, wins: s.wins, losses: s.losses, position: s.standingPosition })));
}

export function calculateStandings(matches: Match[], standings: Participant[]): void {
  console.log('MatchUtils: calculateStandings called with', matches.length, 'matches and', standings.length, 'participants');
  
  // Reset all statistics
  standings.forEach(p => {
    p.points = 0;
    p.wins = 0;
    p.losses = 0;
    p.draws = 0;
    p.tiebreakers = { 
      buchholz: 0, 
      medianBuchholz: 0, 
      gameWin: 0, 
      headToHead: 0, 
      matchesPlayed: 0, 
      gameWL: 0 
    };
  });
  
  console.log('MatchUtils: Reset statistics for', standings.length, 'participants');
  
  // Calculate points from match results
  for (const match of matches) {
    if (match.winner) {
      const winner = standings.find(p => p.id === match.winner?.id);
      const loser = standings.find(p => 
        (p.id === match.participant1?.id || p.id === match.participant2?.id) && 
        p.id !== match.winner?.id
      );
      
      if (winner) {
        winner.wins = (winner.wins || 0) + 1;
        winner.points = (winner.points || 0) + 3; // 3 points for win
      }
      
      if (loser) {
        loser.losses = (loser.losses || 0) + 1;
        loser.points = (loser.points || 0) + 0; // 0 points for loss
      }
    }
  }
  
  console.log('MatchUtils: Calculated points from', matches.filter(m => m.winner).length, 'completed matches');
  
  // Calculate tiebreakers
  for (const participant of standings) {
    if (!participant.tiebreakers) {
      participant.tiebreakers = {};
    }
    
    let headToHeadPoints = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let matchesPlayed = 0;
    let opponentScores: number[] = [];
    
    for (const match of matches) {
      if (match.winner) {
        let opponent: Participant | undefined;
        let isWinner = false;
        
        // Find opponent and determine if participant won
        if (match.participant1?.id === participant.id) {
          opponent = standings.find(p => p.id === match.participant2?.id);
          isWinner = match.winner.id === participant.id;
          matchesPlayed++;
        } else if (match.participant2?.id === participant.id) {
          opponent = standings.find(p => p.id === match.participant1?.id);
          isWinner = match.winner.id === participant.id;
          matchesPlayed++;
        }
        
        if (opponent) {
          // Add opponent score for Buchholz calculation
          opponentScores.push(opponent.points || 0);
          
          // Head-to-head calculation
          if (isWinner) {
            headToHeadPoints += 3;
          }
          
          // Game W/L calculation
          if (match.score1 !== undefined && match.score2 !== undefined) {
            if (match.participant1?.id === participant.id) {
              gamesWon += match.score1;
              gamesLost += match.score2;
            } else {
              gamesWon += match.score2;
              gamesLost += match.score1;
            }
          } else if (isWinner) {
            gamesWon += 1;
          } else {
            gamesLost += 1;
          }
        }
      }
    }
    
    // Calculate Buchholz (sum of opponents' scores)
    participant.tiebreakers.buchholz = opponentScores.reduce((sum, score) => sum + score, 0);
    
    // Calculate Median Buchholz
    if (opponentScores.length > 2) {
      const sortedScores = [...opponentScores].sort((a, b) => a - b);
      sortedScores.shift(); // Remove lowest
      sortedScores.pop();   // Remove highest
      participant.tiebreakers.medianBuchholz = sortedScores.reduce((sum, score) => sum + score, 0);
    } else {
      participant.tiebreakers.medianBuchholz = participant.tiebreakers.buchholz;
    }
    
    // Game Win Rate
    const totalGames = gamesWon + gamesLost;
    participant.tiebreakers.gameWin = totalGames > 0 ? gamesWon / totalGames : 0;
    
    // Head-to-Head
    participant.tiebreakers.headToHead = headToHeadPoints;
    
    // Matches Played
    participant.tiebreakers.matchesPlayed = matchesPlayed;
    
    // Game W/L Differential
    participant.tiebreakers.gameWL = gamesWon - gamesLost;
  }
} 