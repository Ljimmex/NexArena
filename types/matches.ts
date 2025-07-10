import { Participant } from './participants';

export interface Match {
  id: number;
  round: number;
  position: number;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  loser?: Participant;
  group?: number | string;
  thirdPlaceMatch?: boolean;
  preliminaryRound?: boolean;
  awaitingPreliminaryWinner?: number;
  awaitingPreliminaryWinners?: number[];
  layoutX?: number;
  layoutY?: number;
  score1?: number;
  score2?: number;
  connectedMatches?: number[];
  nextMatchId?: number;
  nextMatchPosition?: number;
  grandFinal?: boolean;
  loserBracket?: boolean;
  matchName?: string;
  isLabel?: boolean;
  isPlayoff?: boolean;
  playoff?: boolean; // Oznaczenie meczu jako część fazy play-off
  playoffRound?: number; // Numer rundy w fazie play-off
  x?: number;
  y?: number;
  bracket?: string;
  matchDate?: string; // Add match date field
  options?: {
    swissMode?: 'playAllRounds' | 'topCut';
    tiebreaker?: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL' | 'inGameTiebreaker' | 'gamesWon';
    tiebreakers?: ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL' | 'inGameTiebreaker' | 'gamesWon')[];
  };
  slotLabel1?: string;
  slotLabel2?: string;
  walkover?: boolean;
  bye?: boolean;
  overtime?: boolean;
  draw?: boolean;
}

// Adding RoundRobin specific interfaces
export interface RoundRobinMatch extends Match {
  group: number;  // Make group required for round robin matches
  score1?: number;
  score2?: number;
  // Removed duplicate group property
  walkover?: boolean;
  bye?: boolean;
  overtime?: boolean;
  draw?: boolean;
  loser?: Participant;
}