export interface MapType {
  id: string
  name: string
  image: string
  game: string
  selected: boolean
}

export interface MatchCardProps {
  matchId: string
  matchNumber: number
  matchFormat: string
  matchTime?: string
  teamA: TeamProps
  teamB: TeamProps
  className?: string
  onWinnerChange?: (winnerId: string, matchId?: string) => void
  onScoreChange?: (score1: number, score2: number) => void
  editable?: boolean
  status?: "upcoming" | "live" | "completed"
  allowDraw?: boolean // Added this property for Round Robin format
  mapScore?: {
    teamA: number
    teamB: number
  }
  centerScores?: boolean // New prop to center scores
  scoreEditable?: boolean // New prop
}

export interface TeamProps {
  id: string
  name: string
  logo: string
  score: number
  winner?: boolean
  seed?: number
}

export interface TournamentSetupProps {
  onGenerateBracket: (data: TournamentData) => void;
  activeStageSetup?: number | null;
  setActiveStageSetup?: (stageId: number) => void;
}

import { TournamentData } from './formats';