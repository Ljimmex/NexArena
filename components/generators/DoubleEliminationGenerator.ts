import type { BracketGeneratorInterface } from "@/types/generators";
import type { Participant, Match } from "@/types/index";
import {
  getClosestBracketSize,
  getSlotLabel,
  generateEmptyBracket,
  generateFirstRoundMatches,
  generateWinnerBracket,
  generateLoserBracket,
  generateThirdPlaceMatch,
  generateGrandFinal
} from "./DoubleElimination/BracketStructure";
import { updateMatchWinner, updateNextMatches, getMatchById, getNextMatches, walkoverDisqualification } from "./DoubleElimination/MatchUtils";
import { sortParticipantsBySeed, calculateByes } from "./DoubleElimination/SeedUtils";
import { calculateStandings, sortStandings, DoubleEliminationStanding } from "./DoubleElimination/StandingsUtils";

interface DoubleEliminationOptions {
  winnersAdvantage?: boolean;
  skipGrandFinal?: boolean;
  skipLowerBracketFinal?: boolean;
  thirdPlaceMatch?: boolean;
  grandFinal?: "single" | "double";
  emptyBracket?: boolean;
  bracketSize?: number;
}

export class DoubleEliminationGenerator implements BracketGeneratorInterface {
  private nextMatchId = 1;

  generateBracket(participants: Participant[], options: any = {}): Match[] {
    if (options.emptyBracket) {
      return generateEmptyBracket(options);
    }
    this.nextMatchId = 1;
    const matches: Match[] = [];
    const participantCount = participants.length;
    const winnerBracketRounds = Math.ceil(Math.log2(participantCount));
    const nextMatchId = { value: 1 };
    // Winner bracket first round
    const firstRoundMatches = generateFirstRoundMatches(participants, nextMatchId);
    matches.push(...firstRoundMatches);
    // Winner bracket
    generateWinnerBracket(matches, winnerBracketRounds, nextMatchId);
    // Loser bracket
    generateLoserBracket(matches, winnerBracketRounds, nextMatchId);
    // Remove final loser bracket match if needed
    if (options?.skipLowerBracketFinal === true) {
      const loserBracketMatches = matches.filter(m => m.round < 0);
      if (loserBracketMatches.length > 0) {
        const minRound = Math.min(...loserBracketMatches.map(m => m.round));
        const finalLoserMatchIndex = matches.findIndex(m =>
          m.round === minRound &&
          !matches.some(other => other.round < 0 && other.connectedMatches?.includes(m.id))
        );
        if (finalLoserMatchIndex !== -1) {
          matches.splice(finalLoserMatchIndex, 1);
        }
      }
    }
    // Third place
    if (options?.thirdPlaceMatch) {
      generateThirdPlaceMatch(matches, nextMatchId);
    }
    // Grand final
    if (options?.skipGrandFinal !== true) {
      const useWinnersAdvantage = options?.winnersAdvantage || false;
      const grandFinalType = options?.grandFinal || "single";
      generateGrandFinal(matches, nextMatchId, useWinnersAdvantage, grandFinalType);
    }
    return matches;
  }

  calculateBracketLayout(matches: Match[]): Match[] {
    // ... (pozostaw dotychczasową logikę layoutu lub przenieś do osobnego helpera jeśli chcesz)
    return matches;
  }

  updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
    return updateMatchWinner(matches, matchId, winnerId);
  }

  getMatchById(matches: Match[], matchId: number): Match | undefined {
    return getMatchById(matches, matchId);
  }

  getNextMatches(matches: Match[], matchId: number): Match[] {
    return getNextMatches(matches, matchId);
  }

  walkoverDisqualification(matches: Match[], participants: Participant[], disqualifiedTeamId: string): Match[] {
    return walkoverDisqualification(matches, participants, disqualifiedTeamId);
  }

  getStandings(matches: Match[]): DoubleEliminationStanding[] {
    return calculateStandings(matches);
  }

  sortStandings(standings: DoubleEliminationStanding[]): DoubleEliminationStanding[] {
    return sortStandings(standings);
  }

  getRoundName(round: number, maxRound: number, matchCount: number): string {
    if (round === 0) {
      return matchCount > 1 ? `Grand Final (Match ${matchCount})` : "Grand Final";
    } else if (round === -1 && matchCount === 1) {
      return "Third Place Match";
    } else if (round > 0) {
      if (round === maxRound) {
        return "Final";
      } else if (round === maxRound - 1) {
        return "Semifinal";
      } else if (round === maxRound - 2) {
        return "Quarterfinal";
      } else if (round === 1) {
        return "First Round";
      } else {
        return `Round ${round}`;
      }
    } else {
      const loserRound = Math.abs(round);
      const totalLoserRounds = 2 * maxRound - 1;
      if (loserRound === totalLoserRounds) {
        return "Lower Bracket Final";
      } else if (loserRound === totalLoserRounds - 1) {
        return "Lower Bracket Semifinal";
      } else {
        return `Loser's Round ${loserRound}`;
      }
    }
  }
}