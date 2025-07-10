import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match } from "@/types/index"
import type { ScoreConfig } from "@/types/tournament"
import {
  generateFirstRoundMatches,
  generateNextRound,
  calculateMaxRounds,
  getRequiredWinsLosses,
  getOpponents,
  calculateBuchholz
} from "./Swiss/BracketStructure"
import {
  updateMatchWinner,
  updateParticipantStatsForWin,
  updateParticipantStatsForLoss,
  updateStandings,
  calculateStandings
} from "./Swiss/MatchUtils"
import { validateParticipants, shuffleParticipants } from "./Swiss/SeedUtils"

// Update the SwissOptions interface to include scoreConfig
export interface SwissOptions {
  rounds?: number;
  mode?: 'playAllRounds' | 'topCut';
  swissMode?: 'playAllRounds' | 'topCut';
  playoffTeams?: number;
  usePlayoffs?: boolean;
  tiebreaker?: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL';
  tiebreakers?: ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL')[];
  scoreConfig?: ScoreConfig;
}

// Update the class to expose the standings property
export class SwissGenerator implements BracketGeneratorInterface {
  // Change from private to public so it can be accessed from outside
  public standings: Participant[] = [];
  public previousPairings: Set<string> = new Set();
  private nextMatchId = 1;
  private requiredWins: number = 3;
  private requiredLosses: number = 3;
  private scoreConfig: ScoreConfig = {
    win: 3,
    loss: 0,
    draw: 1,
    bye: 3,
    winOvertime: 2,
    lossOvertime: 1
  }; // Default score configuration

  // Add the missing methods required by BracketGeneratorInterface
  getRoundName(round: number, maxRound: number, matchCount: number): string {
    if (round === maxRound) {
      return "Final Round";
    } else {
      return `Round ${round}`;
    }
  }

  // Add the missing recordPairing method
  private recordPairing(participant1Id: string, participant2Id: string): void {
    // Create a unique key for this pairing (order doesn't matter)
    const pairingKey = [participant1Id, participant2Id].sort().join('_');
    this.previousPairings.add(pairingKey);
  }

  // Add the missing havePlayed method
  private havePlayed(participant1Id: string, participant2Id: string): boolean {
    // Check if these participants have played against each other
    const pairingKey = [participant1Id, participant2Id].sort().join('_');
    return this.previousPairings.has(pairingKey);
  }

  // Add the missing updateStandings method
  private updateStandings(matches: Match[]): void {
    // First reset all standings
    this.calculateStandings(matches);
    
    // Then sort standings by points and tiebreakers
    this.standings.sort((a, b) => {
      // Sort by points (descending)
      if ((b.points || 0) !== (a.points || 0)) {
        return (b.points || 0) - (a.points || 0);
      }
      
      // Then by tiebreakers
      if (a.tiebreakers && b.tiebreakers) {
        // Buchholz
        if (a.tiebreakers.buchholz !== b.tiebreakers.buchholz) {
          return (b.tiebreakers.buchholz || 0) - (a.tiebreakers.buchholz || 0);
        }
        
        // Median Buchholz
        if (a.tiebreakers.medianBuchholz !== b.tiebreakers.medianBuchholz) {
          return (b.tiebreakers.medianBuchholz || 0) - (a.tiebreakers.medianBuchholz || 0);
        }
        
        // Game Win Rate
        if (a.tiebreakers.gameWin !== b.tiebreakers.gameWin) {
          return (b.tiebreakers.gameWin || 0) - (a.tiebreakers.gameWin || 0);
        }
      }
      
      // If all tiebreakers are equal, sort by original seed
      return (a.seed || 0) - (b.seed || 0);
    });
    
    // Update standing positions
    this.standings.forEach((participant, index) => {
      participant.standingPosition = index + 1;
      participant.standingId = index + 1;
    });
  }

  generateBracket(participants: Participant[], options?: SwissOptions): Match[] {
    this.nextMatchId = 1;
    validateParticipants(participants);
    const rounds = options?.rounds || calculateMaxRounds(participants.length);
    const mode = (options?.swissMode ?? options?.mode ?? 'topCut') as 'playAllRounds' | 'topCut';
    const tiebreaker = (options?.tiebreaker || 'buchholz') as 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL';
    const tiebreakers = (options?.tiebreakers || [tiebreaker]) as ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL')[];
    if (options?.scoreConfig) this.scoreConfig = options.scoreConfig;
    this.standings = participants.map(p => ({ ...p, points: 0, wins: 0, draws: 0, losses: 0, tiebreakers: { buchholz: 0 } }));
    const matches = generateFirstRoundMatches(participants, this.nextMatchId, mode, tiebreaker, tiebreakers);
    return matches;
  }

  calculateMaxRounds(participantCount: number): number {
    return calculateMaxRounds(participantCount);
  }
  
  // Get required wins/losses for advancement/elimination
  getRequiredWinsLosses(participantCount: number): { wins: number, losses: number } {
    return getRequiredWinsLosses(participantCount);
  }

  calculateBracketLayout(matches: Match[]): Match[] {
    const layoutMatches = [...matches];
    const matchesPerRound: Record<number, number> = {};
    for (const match of layoutMatches) {
      matchesPerRound[match.round] = (matchesPerRound[match.round] || 0) + 1;
    }
    for (const match of layoutMatches) {
      const matchesInRound = matchesPerRound[match.round];
      const spacing = 120;
      const roundWidth = 280;
      match.layoutX = (match.round - 1) * roundWidth;
      match.layoutY = (match.position - 0.5) * spacing * (8 / Math.max(1, matchesInRound));
    }
    return layoutMatches;
  }

  updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
    return updateMatchWinner(matches, matchId, winnerId);
  }

  // Dodajemy metodę do aktualizacji statystyk dla zwycięzcy
  private updateParticipantStatsForWin(winnerId: string, match: Match) {
    const participant = this.standings.find(p => p.id === winnerId);
    if (participant) {
      participant.wins = (participant.wins || 0) + 1;
      participant.points = (participant.points || 0) + this.scoreConfig.win;
    }
  }

  // Dodajemy metodę do aktualizacji statystyk dla przegranego
  private updateParticipantStatsForLoss(loserId: string, match: Match) {
    const participant = this.standings.find(p => p.id === loserId);
    if (participant) {
      participant.losses = (participant.losses || 0) + 1;
      participant.points = (participant.points || 0) + this.scoreConfig.loss;
    }
  }

  private calculateStandings(matches: Match[]): void {
    // Reset points
    for (const participant of this.standings) {
      participant.wins = 0;
      participant.draws = 0;
      participant.losses = 0;
      participant.points = 0;
      
      if (!participant.tiebreakers) {
        participant.tiebreakers = {};
      }
      
      // Initialize all tiebreaker values
      participant.tiebreakers.buchholz = 0;
      participant.tiebreakers.medianBuchholz = 0;
      participant.tiebreakers.gameWin = 0;
      participant.tiebreakers.headToHead = 0;
      participant.tiebreakers.matchesPlayed = 0;
      participant.tiebreakers.gameWL = 0;
    }
    
    // Calculate points based on match results and score configuration
    for (const match of matches) {
      if (match.winner) {
        const winner = this.standings.find(p => p.id === match.winner?.id);
        const loser = this.standings.find(p => 
          (p.id === match.participant1?.id || p.id === match.participant2?.id) && 
          p.id !== match.winner?.id
        );
        
        if (winner) {
          winner.wins = (winner.wins || 0) + 1;
          winner.points = (winner.points || 0) + this.scoreConfig.win;
        }
        
        if (loser) {
          loser.losses = (loser.losses || 0) + 1;
          loser.points = (loser.points || 0) + this.scoreConfig.loss;
        }
      } else if (match.score1 === match.score2 && match.score1 !== undefined) {
        // This is a draw
        const participant1 = this.standings.find(p => p.id === match.participant1?.id);
        const participant2 = this.standings.find(p => p.id === match.participant2?.id);
        
        if (participant1) {
          participant1.draws = (participant1.draws || 0) + 1;
          participant1.points = (participant1.points || 0) + this.scoreConfig.draw;
        }
        
        if (participant2) {
          participant2.draws = (participant2.draws || 0) + 1;
          participant2.points = (participant2.points || 0) + this.scoreConfig.draw;
        }
      }
    }
    
    // Get tiebreaker method from the first match's options if available
    let tiebreakerMethod = 'buchholz';
    if (matches.length > 0 && matches[0].options) {
      tiebreakerMethod = matches[0].options.tiebreaker || 'buchholz';
    }
    
    // Calculate tiebreakers based on selected method
    for (const participant of this.standings) {
      if (!participant.tiebreakers) {
        participant.tiebreakers = {};
      }
      
      // Initialize all tiebreaker values
      participant.tiebreakers.buchholz = 0;
      participant.tiebreakers.medianBuchholz = 0;
      participant.tiebreakers.gameWin = 0;
      participant.tiebreakers.headToHead = 0;
      participant.tiebreakers.matchesPlayed = 0;
      participant.tiebreakers.gameWL = 0;
      
      // Calculate Buchholz score (sum of opponents' scores)
      let opponentScores: number[] = [];
      let headToHeadPoints = 0;
      let gamesWon = 0;
      let gamesLost = 0;
      let matchesPlayed = 0;
      
      for (const match of matches) {
        // Only count completed matches
        if (match.winner) {
          let opponent: Participant | undefined;
          let isWinner = false;
          
          // Find opponent and determine if participant won
          if (match.participant1?.id === participant.id) {
            opponent = this.standings.find(p => p.id === match.participant2?.id);
            isWinner = match.winner.id === participant.id;
            matchesPlayed++;
          } else if (match.participant2?.id === participant.id) {
            opponent = this.standings.find(p => p.id === match.participant1?.id);
            isWinner = match.winner.id === participant.id;
            matchesPlayed++;
          }
          
          // If opponent found, add to calculations
          if (opponent) {
            // Add to opponent scores for Buchholz
            opponentScores.push(opponent.points || 0);
            
            // Head-to-head calculation
            if (isWinner) {
              headToHeadPoints += 3; // 3 points for a win
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
      
      // Instead of calculating Buchholz here, use our new methods
      participant.tiebreakers.buchholz = this.calculateBuchholz(participant, false);
      participant.tiebreakers.medianBuchholz = this.calculateBuchholz(participant, true);
      
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

  // Add the getOpponents method to find all opponents a participant has faced
  private getOpponents(participantId: string): string[] {
    const opponents: string[] = [];
    
    // Look through all pairings to find opponents
    Array.from(this.previousPairings).forEach(pairingKey => {
      const [id1, id2] = pairingKey.split('_');
      
      if (id1 === participantId) {
        opponents.push(id2);
      } else if (id2 === participantId) {
        opponents.push(id1);
      }
    });
    
    return opponents;
  }
  
  // Update the Buchholz calculation method
  private calculateBuchholz(participant: Participant, isMedian: boolean = false): number {
    // Get all opponents this participant has faced
    const opponents = this.getOpponents(participant.id);
    
    if (opponents.length === 0) return 0;
    
    // Calculate the W-L differential for each opponent
    const opponentScores = opponents.map(opponentId => {
      const opponent = this.standings.find(p => p.id === opponentId);
      if (!opponent) return 0;
      
      // Calculate W-L differential (can be negative)
      return (opponent.wins || 0) - (opponent.losses || 0);
    });
    
    // For median Buchholz, remove highest and lowest scores if there are enough opponents
    if (isMedian && opponentScores.length > 2) {
      opponentScores.sort((a, b) => a - b);
      opponentScores.shift(); // Remove lowest
      opponentScores.pop();   // Remove highest
    }
    
    // Sum the scores
    return opponentScores.reduce((sum, score) => sum + score, 0);
  }

  public generateNextRound(matches: Match[], standings: Participant[], round: number, nextMatchId: number, mode: 'playAllRounds' | 'topCut', tiebreaker: any, tiebreakers: any) {
    return generateNextRound(matches, standings, round, nextMatchId, mode, tiebreaker, tiebreakers, this.previousPairings);
  }
}