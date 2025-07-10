"use client"

import { SingleEliminationBracketView } from "./formats/SingleEliminationBracketView"
import { DoubleEliminationBracketView } from "./formats/DoubleEliminationBracketView"
import { RoundRobinBracketView } from "./formats/RoundRobinBracketView"
import { SwissBracketView } from "./formats/SwissBracketView"
import { GenericBracketView } from "./GenericBracketView"
import type { Participant } from "@/types/participants"
import type { ScoreConfig } from "@/types/tournament"


export interface BracketViewProps {
  participants: Participant[]
  options?: {
    thirdPlaceMatch?: boolean
    usePreliminaries?: boolean
    format?: string
    roundRobinGroups?: number
    doubleRoundRobin?: boolean
    usePlayoffs?: boolean
    playoffTeams?: number
    teamsPerGroup?: number
    roundRobinTeamsPerGroup?: number
    rounds?: number
    swissMode?: 'playAllRounds' | 'topCut'
    tiebreaker?: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL'
    roundRobinTiebreaker?: 'headToHead' | 'inGameTiebreaker' | 'gameWin' | 'gameWL' | 'matchesPlayed' | 'gamesWon'
    tiebreakers?: string[]
    useTiebreakers?: boolean
    scoreConfig?: ScoreConfig // Add scoreConfig to the options
    roundRobinAdvancingTeams?: number // Dodaj tę właściwość
    emptyBracket?: boolean // <-- Add this line
    stageId?: number // <-- Add this line for Swiss/other formats
    bracketSize?: number // <-- Dodaj to pole
  }
  className?: string
}

export function BracketView(props: BracketViewProps) {
  const { options = {}, participants } = props
  const format = options.format || 'single-elimination'

  // In the BracketView function, update the switch statement:
  switch (format) {
    case 'single-elimination':
      return <SingleEliminationBracketView {...props} />
    case 'double-elimination':
      return <DoubleEliminationBracketView {...props} />
    case 'round-robin':
      return <RoundRobinBracketView {...props} />
    case 'swiss':
      return <SwissBracketView {...props} />      
    default:
      return <GenericBracketView {...props} />
  }
}