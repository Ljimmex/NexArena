export interface TournamentOptions {
  singleElimination: {
    thirdPlaceMatch: boolean;
  };
  doubleElimination: {
    winnersAdvantage: boolean;
    skipGrandFinal: boolean;
    skipLowerBracketFinal: boolean;
    thirdPlace?: boolean;
    grandFinal?: "single" | "double";
  };
  swiss: {
    mode: 'playAllRounds' | 'topCut';
  };
  roundRobin: {
    doubleRoundRobin: false
  };
}

export type TournamentFormat = 'singleElimination' | 'doubleElimination' | 'swiss' | 'roundRobin' | 'gauntlet';

export interface TournamentData {
  tournamentName: string
  tournamentFormat: string
  teamCount: number
  thirdPlaceMatch: boolean;
  selectedTeams: TeamType[];
  substituteTeams: TeamType[];
  startDate: string
  selectedGame?: string
  selectedMaps?: MapType[]
  mapSelectionType?: string
  formatOptions?: {
    doubleElimination?: {
      grandFinalAdvantage: boolean
      thirdPlace: boolean
    }
    swiss?: {
      rounds: number
      usePlayoffs: boolean
      playoffTeams: number
      useTiebreakers: boolean
      endCondition: string
      winsRequired: number
      lossesElimination: number
      swissMode?: 'playAllRounds' | 'topCut'
      tiebreaker?: string
      tiebreakers?: string[]
      scoreConfig?: {  // Add scoreConfig property
        win: number;
        loss: number;
        draw: number;
        bye: number;
        winOvertime: number;
        lossOvertime: number;
      }
    }
    roundRobin?: {
      groups: number
      doubleRoundRobin: boolean
      usePlayoffs: boolean
      playoffTeams: number
      tiebreaker?: string
      tiebreakers?: string[]
      roundRobinTiebreaker?: string
      advancingTeams?: number; // Dodajemy tę właściwość
      scoreConfig?: {  // Add scoreConfig property
        win: number;
        loss: number;
        draw: number;
        bye: number;
        winOvertime: number;
        lossOvertime: number;
      }
    }
    gauntlet?: {
      reverse: boolean
      advantage: boolean
    }
    kingOfTheHill?: {
      multipleLives: boolean
      livesCount: number
    }
  }
  substituteCount?: number
}

import { TeamType } from './participants';
import { MapType } from './ui';