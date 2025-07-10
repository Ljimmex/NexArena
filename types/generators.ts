import { Participant } from './participants';
import { Match, RoundRobinMatch } from './matches';

export interface BracketGeneratorInterface {
  generateBracket(participants: Participant[], options?: any): Match[];
  calculateBracketLayout(matches: Match[]): Match[];
  updateMatchWinner(matches: Match[], matchId: number, winnerId: string, score1?: number, score2?: number): Match[];
  getRoundName(round: number, maxRound: number, matchCount: number): string;
}

export interface GroupStanding {
  participant: Participant;
  teamId?: string;
  name?: string;
  logo?: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number;
}

export interface TournamentResultsProps {
  standings: Map<number, GroupStanding[]>;
  matches: RoundRobinMatch[];
  format: string;
}