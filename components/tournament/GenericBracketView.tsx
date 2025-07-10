"use client"

import { useState, useEffect } from "react"
import { SingleEliminationGenerator } from "../generators/SingleEliminationGenerator"
import { DoubleEliminationGenerator } from "../generators/DoubleEliminationGenerator"
import { RoundRobinGenerator } from "../generators/RoundRobinGenerator"
import { SwissGenerator } from "../generators/SwissGenerator"

import { MatchCard } from "@/components/tournament/MatchCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match } from "@/types/index"
import { BracketViewProps } from "./BracketView"

export function GenericBracketView({ participants, options = {}, className }: BracketViewProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [layoutMatches, setLayoutMatches] = useState<Match[]>([])
  const [isGenerated, setIsGenerated] = useState(false)
  const [generator, setGenerator] = useState<BracketGeneratorInterface>(new SingleEliminationGenerator())

  useEffect(() => {
    const format = options.format || 'single-elimination'
    let newGenerator: BracketGeneratorInterface
    switch (format) {
      case 'double-elimination':
        newGenerator = new DoubleEliminationGenerator()
        break
      case 'round-robin':
        newGenerator = new RoundRobinGenerator()
        break
      case 'swiss':
        newGenerator = new SwissGenerator()
        break
      case 'single-elimination':
      default:
        newGenerator = new SingleEliminationGenerator()
        break
    }
    setGenerator(newGenerator)
  }, [options.format])

  const generateBracket = () => {
    if (participants.length > 0) {
      const generatorOptions = {
        ...options,
        ...(options.format === 'round-robin' && {
          groups: options.roundRobinGroups || 1,
          doubleRoundRobin: options.doubleRoundRobin || false,
          usePlayoffs: options.usePlayoffs || false,
          playoffTeams: options.playoffTeams || 0
        })
      }
      const generatedMatches = generator.generateBracket(participants, generatorOptions)
      const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches)
      setMatches(generatedMatches)
      setLayoutMatches(layoutCalculatedMatches)
      setIsGenerated(true)
    }
  }

  const handleWinnerChange = (matchId: number, winnerId: string) => {
    const matchIdNum = typeof matchId === 'string' ? parseInt(matchId) : matchId
    const updatedMatches = generator.updateMatchWinner(matches, matchIdNum, winnerId)
    const layoutCalculatedMatches = generator.calculateBracketLayout(updatedMatches)
    setMatches([...updatedMatches]);
    setLayoutMatches(layoutCalculatedMatches)
  }

  const maxRound = Math.max(...(layoutMatches.map(m => m.round) || [0]))
  const matchCountByRound = layoutMatches.reduce((acc, match) => {
    if (!match.thirdPlaceMatch) {
      acc[match.round] = (acc[match.round] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  const getTeamName = (participant: Participant | undefined, match: Match, isFirstParticipant: boolean): string => {
    if (participant) {
      return participant.name
    }
    if (match.connectedMatches && match.connectedMatches.length > 0) {
      let connectedMatchId
      if (isFirstParticipant) {
        connectedMatchId = match.connectedMatches[0]
      } else {
        connectedMatchId = match.connectedMatches.length > 1 ? match.connectedMatches[1] : match.connectedMatches[0]
      }
      const connectedMatch = layoutMatches.find(m => m.id === connectedMatchId)
      if (connectedMatch) {
        return `Zwycięzca meczu #${connectedMatch.id}`
      }
    }
    return "Oczekiwanie"
  }

  useEffect(() => {
    if (!isGenerated && participants.length > 0) {
      generateBracket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, options])

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-auto p-4">
        <div className="relative" style={{ minWidth: (maxRound + 1) * 280 + "px", minHeight: "600px" }}>
          <div className="flex absolute top-0 left-0 w-full">
            {Array.from({ length: maxRound + 1 }).map((_, index) => {
              const matchCount = matchCountByRound[index] || 0
              if (index === 0 && matchCountByRound[0] === 0) return null
              return (
                <div 
                  key={`round-${index}`} 
                  className="w-[280px] text-center py-2"
                  style={{ marginLeft: index === 0 ? 0 : "0px" }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-sm px-4 py-1 rounded-full bg-gradient-to-r from-[#333] to-[#222] text-gray-300 shadow-sm">
                      {generator.getRoundName(index, maxRound, matchCount)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {matchCount} {matchCount === 1 ? 'mecz' : matchCount < 5 ? 'mecze' : 'meczów'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {layoutMatches.map(match => (
            <div
              key={`match-${match.id}`}
              className="absolute"
              style={{
                left: `${match.layoutX}px`,
                top: `${match.layoutY ? match.layoutY + 60 : 0}px`,
                width: "220px"
              }}
            >
              <MatchCard
                matchId={match.id.toString()}
                matchNumber={match.id}
                matchFormat={match.thirdPlaceMatch ? "3rd Place" : "Bo3"}
                matchTime={new Date().toISOString()}
                teamA={{
                  id: match.participant1?.id || "tbd",
                  name: match.participant1 ? match.participant1.name : getTeamName(match.participant1, match, true),
                  logo: match.participant1?.logo || "/placeholder-team.svg",
                  score: 0,
                  winner: match.winner?.id === match.participant1?.id,
                  seed: match.participant1?.seed
                }}
                teamB={{
                  id: match.participant2?.id || "tbd",
                  name: match.participant2 ? match.participant2.name : getTeamName(match.participant2, match, false),
                  logo: match.participant2?.logo || "/placeholder-team.svg",
                  score: 0,
                  winner: match.winner?.id === match.participant2?.id,
                  seed: match.participant2?.seed
                }}
                editable={true}
                status={match.winner ? "completed" : "upcoming"}
                onWinnerChange={(winnerId) => handleWinnerChange(match.id, winnerId)}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => {
              setIsGenerated(false);
              setMatches([]);
              setLayoutMatches([]);
            }}
            variant="outline"
            className="bg-[#252525] border-[#333] hover:bg-[#333] text-white"
          >
            Reset Bracket
          </Button>
        </div>
      </div>
    </div>
  )
}