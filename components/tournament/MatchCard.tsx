"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, Clock, Trophy } from "lucide-react"
import { TeamProps, MatchCardProps } from "@/types/ui"

// Types for the MatchCard component
export interface Team {
  id: string
  name: string
  score?: number
  seed?: number
  avatar?: string
  winner?: boolean
}

// Note: We're removing the duplicate MatchCardProps interface since it's already imported from @/types/ui

export function MatchCard({
  matchId,
  matchNumber,
  matchFormat,
  matchTime,
  teamA,
  teamB,
  className,
  onWinnerChange,
  onScoreChange,
  editable = false,
  status = "upcoming",
  allowDraw = false,
  mapScore,
  centerScores = true, // New prop with default true
  scoreEditable = false, // New prop with default false
}: MatchCardProps) {
  // Initialize with default values to prevent "TBD" issues
  const [localTeamA, setLocalTeamA] = useState({
    id: teamA?.id || "",
    name: teamA?.name || "TBD",
    logo: teamA?.logo || "",
    score: teamA?.score || 0,
    winner: teamA?.winner || false,
    seed: teamA?.seed
  })
  
  const [localTeamB, setLocalTeamB] = useState({
    id: teamB?.id || "",
    name: teamB?.name || "TBD",
    logo: teamB?.logo || "",
    score: teamB?.score || 0,
    winner: teamB?.winner || false,
    seed: teamB?.seed
  })
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Update local state when props change
  useEffect(() => {
    if (teamA) {
      setLocalTeamA({
        id: teamA.id || "",
        name: teamA.name || "TBD",
        logo: teamA.logo || "",
        score: teamA.score || 0,
        winner: teamA.winner || false,
        seed: teamA.seed
      })
    }
    
    if (teamB) {
      setLocalTeamB({
        id: teamB.id || "",
        name: teamB.name || "TBD",
        logo: teamB.logo || "",
        score: teamB.score || 0,
        winner: teamB.winner || false,
        seed: teamB.seed
      })
    }
  }, [teamA, teamB])

  const handleWinnerSelect = (teamId: string) => {
    if (!editable) return

    const newTeamA = {
      ...localTeamA,
      winner: teamId === localTeamA.id,
    }

    const newTeamB = {
      ...localTeamB,
      winner: teamId === localTeamB.id,
    }

    setLocalTeamA(newTeamA)
    setLocalTeamB(newTeamB)

    if (onWinnerChange) {
      onWinnerChange(teamId, matchId)
    }
  }

  const handleScoreChange = (teamId: string, score: number) => {
    if (!editable) return

    if (teamId === localTeamA.id) {
      const newTeamA = { ...localTeamA, score }
      setLocalTeamA(newTeamA)
      
      if (onScoreChange) {
        onScoreChange(score, localTeamB.score)
      }
    } else {
      const newTeamB = { ...localTeamB, score }
      setLocalTeamB(newTeamB)
      
      if (onScoreChange) {
        onScoreChange(localTeamA.score, score)
      }
    }
  }

  const getStatusIndicator = () => {
    switch (status) {
      case "live":
        return <span className="bg-red-500 animate-pulse h-2.5 w-2.5 rounded-full ring-2 ring-red-500/20" />
      case "completed":
        return <Trophy className="h-3.5 w-3.5 text-yellow-500" />
      default:
        return <Clock className="h-3.5 w-3.5 text-blue-400" />
    }
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-black to-[#18181b] rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all shadow-lg hover:shadow-yellow-900/20 transform hover:scale-[1.01] duration-200",
        status === "live" && "border-red-500/50 shadow-red-500/20 ring-1 ring-red-500/20",
        status === "completed" && "border-yellow-400 shadow-yellow-900/10 ring-1 ring-yellow-400/20",
        className
      )}
    >
      <div className="p-3 bg-gradient-to-r from-black to-[#23272f] flex items-center justify-between border-b border-gray-700 relative overflow-hidden">
        {status === "live" && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
        )}
        {status === "completed" && (
          <div className="absolute inset-0 bg-yellow-400/10"></div>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span className="font-semibold text-black bg-yellow-400 px-2 py-0.5 rounded-md shadow">#{matchNumber}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-300">{matchFormat}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center space-x-1.5 px-2 py-1 rounded-full transition-colors",
            status === "live" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
            status === "completed" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" : 
            "bg-gray-800 text-gray-400 border border-gray-700"
          )}>
            {getStatusIndicator()}
            <span className="text-xs font-medium">
              {status === "live" ? 
                <span className="font-semibold">LIVE</span> : 
                status === "completed" ? 
                <span className="font-semibold">Completed</span> : 
                <span className="font-semibold">Upcoming</span>}
            </span>
          </div>
          
          {/* Match details dialog button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-1.5 rounded-full hover:bg-[#333] hover:text-white transition-all bg-[#252525] border border-[#444] hover:border-[#555] hover:scale-105 duration-200">
                <Info className="h-4 w-4 text-gray-300 hover:text-white transition-colors" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-b from-[#252525] to-[#1a1a1a] text-white border-[#444] shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Match Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 bg-[#1e1e1e] p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-medium">Match ID</p>
                    <p className="text-white">{matchId}</p>
                  </div>
                  <div className="space-y-2 bg-[#1e1e1e] p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-medium">Format</p>
                    <p className="text-white">{matchFormat}</p>
                  </div>
                  {matchTime && (
                    <div className="space-y-2 col-span-2 bg-[#1e1e1e] p-3 rounded-lg">
                      <p className="text-sm text-gray-400 font-medium">Scheduled Time</p>
                      <p className="text-white">{new Date(matchTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                      <span className="bg-yellow-500/20 p-1 rounded">
                        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      </span>
                      Teams
                    </p>
                    <Badge variant="outline" className="bg-[#252525] text-xs border-[#444]">
                      {status === "live" ? "LIVE" : status === "completed" ? "Completed" : "Upcoming"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 bg-[#1e1e1e] p-3 rounded-lg border border-[#333] hover:border-[#444] transition-all">
                      <div className="w-10 h-10 rounded-full bg-[#252525] overflow-hidden ring-2 ring-[#444] shadow-md">
                        {localTeamA.logo ? (
                          <img 
                            src={localTeamA.logo} 
                            alt={localTeamA.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-medium">{localTeamA.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p>{localTeamA.name}</p>
                        {localTeamA.seed && (
                          <p className="text-xs text-gray-400">Seed #{localTeamA.seed}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-[#1e1e1e] p-3 rounded-lg border border-[#333] hover:border-[#444] transition-all">
                      <div className="w-10 h-10 rounded-full bg-[#252525] overflow-hidden ring-2 ring-[#444] shadow-md">
                        {localTeamB.logo ? (
                          <img 
                            src={localTeamB.logo} 
                            alt={localTeamB.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-medium">{localTeamB.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p>{localTeamB.name}</p>
                        {localTeamB.seed && (
                          <p className="text-xs text-gray-400">Seed #{localTeamB.seed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {editable && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-[#333]">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="bg-yellow-500/20 p-1 rounded">
                        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      </span>
                      Set Winner
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleWinnerSelect(localTeamA.id)}
                        className={cn(
                          "p-2 rounded border border-[#333] hover:bg-[#252525] transition-colors flex items-center justify-center gap-2",
                          localTeamA.winner && "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                        )}
                      >
                        {localTeamA.winner && <Trophy className="h-3.5 w-3.5" />}
                        {localTeamA.name}
                      </button>
                      <button
                        onClick={() => handleWinnerSelect(localTeamB.id)}
                        className={cn(
                          "p-2 rounded border border-[#333] hover:bg-[#252525] transition-colors flex items-center justify-center gap-2",
                          localTeamB.winner && "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                        )}
                      >
                        {localTeamB.winner && <Trophy className="h-3.5 w-3.5" />}
                        {localTeamB.name}
                      </button>
                      {allowDraw && (
                        <button
                          onClick={() => handleWinnerSelect("draw")}
                          className={cn(
                            "p-2 rounded border border-[#333] hover:bg-[#252525] transition-colors col-span-2 flex items-center justify-center gap-2",
                            !localTeamA.winner && !localTeamB.winner && status === "completed" && "border-blue-500 bg-blue-500/10 text-blue-400"
                          )}
                        >
                          {!localTeamA.winner && !localTeamB.winner && status === "completed" && (
                            <div className="bg-blue-500/20 p-0.5 rounded-full">
                              <span className="h-3.5 w-3.5 text-blue-400 flex items-center justify-center font-bold">D</span>
                            </div>
                          )}
                          Draw
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <TeamDisplay 
            team={localTeamA} 
            editable={editable} 
            onScoreChange={handleScoreChange}
            position="left"
          />
          
          <div className="flex flex-col items-center mx-4">
            <span className="text-gray-300 text-sm font-medium bg-[#252525] px-3 py-1 rounded-full">VS</span>
            {mapScore && (
              <div className="mt-2 text-xs font-medium bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333]">
                <span className={localTeamA.winner ? "text-yellow-500" : "text-gray-400"}>{mapScore.teamA}</span>
                <span className="text-gray-500 mx-1">-</span>
                <span className={localTeamB.winner ? "text-yellow-500" : "text-gray-400"}>{mapScore.teamB}</span>
              </div>
            )}
          </div>
          
          <TeamDisplay 
            team={localTeamB} 
            editable={editable} 
            onScoreChange={handleScoreChange}
            position="right"
          />
        </div>
        
        {editable && status !== "completed" && (
          <div className="flex justify-center space-x-2 mt-4 border-t border-[#333] pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-[#252525] border-[#333] hover:bg-[#333] hover:text-yellow-400 hover:border-yellow-500/50 text-white transition-all"
              onClick={() => handleWinnerSelect(localTeamA.id)}
            >
              {localTeamA.name} wins
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-[#252525] border-[#333] hover:bg-[#333] hover:text-yellow-400 hover:border-yellow-500/50 text-white transition-all"
              onClick={() => handleWinnerSelect(localTeamB.id)}
            >
              {localTeamB.name} wins
            </Button>
            {allowDraw && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs bg-[#252525] border-[#333] hover:bg-[#333] hover:text-blue-400 hover:border-blue-500/50 text-white transition-all"
                onClick={() => handleWinnerSelect("draw")}
              >
                Draw
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Team display component with improved fallback handling
interface TeamDisplayProps {
  team: TeamProps
  editable: boolean
  onScoreChange: (teamId: string, score: number) => void
  position: "left" | "right"
}

function TeamDisplay({ team, editable, onScoreChange, position }: TeamDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [score, setScore] = useState(team?.score || 0)
  
  useEffect(() => {
    setScore(team?.score || 0)
  }, [team?.score])
  
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value) || 0
    setScore(newScore)
  }
  
  const handleBlur = () => {
    setIsEditing(false)
    onScoreChange(team?.id || "", score)
  }
  
  return (
    <div className={cn(
      "flex items-center space-x-4",
      position === "right" && "flex-row-reverse space-x-reverse"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-full bg-[#252525] overflow-hidden flex items-center justify-center ring-2",
        team?.winner ? "ring-yellow-500/50 shadow-md shadow-yellow-500/10" : "ring-[#444] shadow-md"
      )}>
        {team?.logo ? (
          <img 
            src={team.logo} 
            alt={team.name || "Team"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-gray-400">
            {(team?.name || "TBD").charAt(0)}
          </span>
        )}
      </div>
      <div className={cn(
        "flex flex-col",
        position === "right" && "items-end"
      )}>
        <div className="flex items-center space-x-1.5">
          {team?.winner && (
            <div className="bg-yellow-500/10 p-0.5 rounded-full mr-1">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            </div>
          )}
          <span className={cn(
            "font-medium text-base",
            team?.winner ? "text-yellow-500" : "text-white"
          )}>
            {team?.name || "TBD"}
          </span>
        </div>
        {team?.seed && (
          <span className="text-xs text-gray-400 mt-0.5">
            <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded-sm border border-[#333]">
              Seed #{team.seed}
            </span>
          </span>
        )}
      </div>
      
      {editable ? (
        <div className={cn(
          "ml-3",
          position === "right" && "mr-3 ml-0"
        )}>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={score}
              onChange={handleScoreChange}
              onBlur={handleBlur}
              className="w-14 h-10 text-center bg-[#252525] border border-[#444] rounded text-white focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none"
              autoFocus
            />
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-10 min-w-[3.5rem] px-3 bg-[#252525] border-[#444] hover:bg-[#333] text-lg font-semibold transition-all",
                team?.winner && "border-yellow-500/30 bg-yellow-500/5 text-yellow-500"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              {score}
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          "ml-3 text-xl font-semibold px-3 py-1 rounded-md",
          position === "right" && "mr-3 ml-0",
          team?.winner ? "text-yellow-500 bg-yellow-500/5 border border-yellow-500/20" : "text-white bg-[#252525] border border-[#333]"
        )}>
          {team?.score || 0}
        </div>
      )}
    </div>
  )
}