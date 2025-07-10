"use client"

import { useState, useEffect } from "react"
import { RoundRobinGenerator } from "../../generators/RoundRobinGenerator"
import { MatchCard } from "@/components/tournament/MatchCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match, RoundRobinMatch } from "@/types/index"
import { BracketViewProps } from "../BracketView"
import { Info, Clock, Trophy } from "lucide-react"
// Add these imports if they're not already present
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RoundRobinSidebar } from './RoundRobin/RoundRobinSidebar';
import { RoundRobinStandingsTable } from './RoundRobin/RoundRobinStandingsTable';
import { RoundRobinUpcomingMatches } from './RoundRobin/RoundRobinUpcomingMatches';

interface TeamStats {
  participant: Participant;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  headToHead?: Record<string, number>;
}

export function RoundRobinBracketView({ participants, options = {}, className }: BracketViewProps) {
  const [matches, setMatches] = useState<RoundRobinMatch[]>([])
  const [layoutMatches, setLayoutMatches] = useState<RoundRobinMatch[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [showTiebreakers, setShowTiebreakers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("matches")
  const [generator] = useState<BracketGeneratorInterface>(new RoundRobinGenerator())
  const [standings, setStandings] = useState<Record<number, any[]>>({})
  const [groupCount, setGroupCount] = useState(options.roundRobinGroups || 1)
  const [isGenerated, setIsGenerated] = useState(false)
  const allowDraw = true // Round Robin allows draws

  // Add this helper function for tiebreaker labels
  const getTiebreakerLabel = (tiebreaker: string): string => {
    const tiebreakerMap: Record<string, string> = {
      'headToHead': 'Head-to-Head',
      'inGameTiebreaker': 'In-game Score Difference',
      'gameWin': 'Game Win Rate',
      'gameWL': 'Game W/L Differential',
      'matchesPlayed': 'Matches Played',
      'gamesWon': 'Games Won',
      'pointDifference': 'Point Difference',
      'pointsScored': 'Points Scored'
    };
    
    return tiebreakerMap[tiebreaker] || tiebreaker;
  };
  
  // Add helper functions for tiebreakers
  const getTiebreakerShortForm = (tiebreaker: string): string => {
    const shortForms: Record<string, string> = {
      'points': 'PTS',
      'headToHead': 'H2H',
      'inGameTiebreaker': 'GD',
      'gameWin': 'GW%',
      'gameWL': 'W/L',
      'matchesPlayed': 'MP',
      'gamesWon': 'GW',
      'pointDifference': 'PD',
      'pointsScored': 'PS'
    };
    
    return shortForms[tiebreaker] || tiebreaker.substring(0, 3).toUpperCase();
  };
  
  const getTiebreakerDescription = (tiebreaker: string): string => {
    const descriptions: Record<string, string> = {
      'points': 'Total points earned from wins and draws',
      'headToHead': 'Results of matches between tied teams',
      'inGameTiebreaker': 'Goal difference (goals scored minus goals conceded)',
      'gameWin': 'Percentage of games won',
      'gameWL': 'Difference between games won and lost',
      'matchesPlayed': 'Teams with fewer matches played rank higher',
      'gamesWon': 'Total number of games won',
      'pointDifference': 'Difference between points scored and conceded',
      'pointsScored': 'Total points scored across all matches'
    };
    
    return descriptions[tiebreaker] || 'Unknown tiebreaker method';
  };
  
  // Fix the tiebreaker selection logic
  const getSelectedTiebreakers = () => {
    // If tiebreakers is explicitly set to an empty array, respect that choice
    if (Array.isArray(options.tiebreakers)) {
      // Filter out Swiss-specific tiebreakers
      return options.tiebreakers.filter(tiebreaker => 
        !['buchholz', 'medianBuchholz'].includes(tiebreaker)
      );
    } else if (options.roundRobinTiebreaker) {
      return [options.roundRobinTiebreaker];
    } else if (options.tiebreaker && !['buchholz', 'medianBuchholz'].includes(options.tiebreaker)) {
      return [options.tiebreaker];
    } else {
      // Return empty array if no tiebreakers are specified
      return [];
    }
  };

  // Dodaj funkcję do tworzenia placeholderów dla pustych slotów w grupach
  const createPlaceholderParticipants = (groupCount: number, teamsPerGroup: number = 4): Participant[] => {
    const participants: Participant[] = [];
    for (let group = 1; group <= groupCount; group++) {
      for (let slot = 1; slot <= teamsPerGroup; slot++) {
        participants.push({
          id: `placeholder-group${group}-slot${slot}`,
          name: `Group ${group} Slot ${slot}`,
          logo: '',
          seed: slot,
          group,
          standingPosition: slot,
          placeholder: true
        } as any);
      }
    }
    return participants;
  };

  // W generateBracket zawsze generuj placeholdery jeśli nie ma pełnych drużyn
  const generateBracket = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log("Generating Round Robin bracket with options:", options);
    console.log("Participants:", participants);
    
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      try {
        const generatorOptions = {
          groups: options.roundRobinGroups || 1,
          doubleRoundRobin: options.doubleRoundRobin || false,
          usePlayoffs: options.usePlayoffs || false,
          playoffTeams: options.playoffTeams || 0,
          advancingTeams: options.roundRobinAdvancingTeams || 1,
          tiebreaker: options.roundRobinTiebreaker || 'headToHead',
          scoreConfig: options.scoreConfig || {
            win: 3,
            loss: 0,
            draw: 1,
            bye: 3,
            winOvertime: 2,
            lossOvertime: 1
          },
          emptyBracket: options.emptyBracket || false
        };
        
        console.log("Generator options:", generatorOptions);
        
        // Generate the tournament using the standard generateBracket method
        const generatedMatches = generator.generateBracket(participants, generatorOptions) as RoundRobinMatch[];
        
        console.log("Generated matches:", generatedMatches);
        
        setMatches(generatedMatches);
        setIsGenerated(true);
        
        // Save to localStorage for Single Elimination to detect changes
        if (options.stageId) {
          localStorage.setItem(`matches-stage-${options.stageId}`, JSON.stringify(generatedMatches));
          
          // Save empty standings initially (will be updated when matches are played)
          const emptyStandings: any[] = [];
          localStorage.setItem(`standings-stage-${options.stageId}`, JSON.stringify(emptyStandings));
          
          console.log(`RoundRobin: Initial save to localStorage - stage ${options.stageId}`);
        }
        
        // Calculate layout
        const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches) as RoundRobinMatch[];
        setLayoutMatches(layoutCalculatedMatches);
        
        // Initialize standings based on generated matches
        const initialStandings: Record<number, any[]> = {};
        const groups = new Set(generatedMatches.map(m => m.group || 1));
        groups.forEach(group => {
          const groupParticipants = getGroupParticipants(generatedMatches, group);
          initialStandings[group] = groupParticipants.map(p => ({
            participant: p,
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0
          }));
        });
        setStandings(initialStandings);
        
      } catch (error) {
        console.error("Error generating bracket:", error)
        setIsLoading(false)
      }
    }, 0)
  }
  
  const getGroupParticipants = (matches: RoundRobinMatch[], groupId: number): Participant[] => {
    const participants = new Set<Participant>()
    
    matches.filter(m => m.group === groupId).forEach(match => {
      if (match.participant1) participants.add(match.participant1)
      if (match.participant2) participants.add(match.participant2)
    })
    
    return Array.from(participants)
  }

  const handleWinnerChange = (matchId: number, winnerId: string, score1?: number, score2?: number) => {
    console.log(`Setting winner for match ${matchId}: ${winnerId}, scores: ${score1}-${score2}`)
    
    // Make sure matchId is a number
    const matchIdNum = typeof matchId === 'string' ? parseInt(matchId) : matchId
    
    // Update match with winner and scores
    const updatedMatches = [...matches]
    const matchIndex = updatedMatches.findIndex(m => m.id === matchIdNum)
    
    if (matchIndex !== -1) {
      const match = updatedMatches[matchIndex]
      
      // Update winner and scores
      if (winnerId && (match.participant1?.id === winnerId || match.participant2?.id === winnerId)) {
        match.winner = match.participant1?.id === winnerId ? match.participant1 : match.participant2
        
        // Set scores based on winner
          if (match.participant1?.id === winnerId) {
          match.score1 = score1 ?? 1
          match.score2 = score2 ?? 0
          } else {
          match.score1 = score1 ?? 0
          match.score2 = score2 ?? 1
        }
      } else if (winnerId === 'draw') {
        match.winner = undefined // Draw
        
        // For a draw, set equal scores
        match.score1 = score1 ?? 1
        match.score2 = score2 ?? 1
      }
      
      // Update standings if we have all required data
      if (match.group && match.participant1 && match.participant2) {
        // Update standings with the updated match
        updateStandings(match)
      }
      
      // Update matches state
      setMatches(updatedMatches)
    }
  }

  // Add this function to check if all matches in a group are completed
  const areAllMatchesCompleted = (groupId: number) => {
    const groupMatches = matches.filter(m => m.group === groupId);
    return groupMatches.length > 0 && groupMatches.every(m => m.winner !== undefined);
  };

  // Update the updateStandings method to recalculate all standings from scratch
  const updateStandings = (match: RoundRobinMatch) => {
    if (!match.group) return;
    
    const groupId = match.group;
    const newStandings = {...standings};
    
    if (!newStandings[groupId]) return;
    
    // Get score config from options
    const scoreConfig = options.scoreConfig || {
      win: 3,
      loss: 0,
      draw: 1,
      bye: 3,
      winOvertime: 2,
      lossOvertime: 1
    };
    
    // Get all participants in this group
    const groupParticipants = getGroupParticipants(matches, groupId);
    
    // Reset all stats for this group
    newStandings[groupId] = groupParticipants.map(p => ({
      participant: p,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      headToHead: {}
    }));
    
    // Get all completed matches for this group
    const completedMatches = matches.filter(m => 
      m.group === groupId && 
      m.score1 !== undefined && 
      m.score2 !== undefined
    );
    
    // Recalculate all stats based on completed matches
    completedMatches.forEach(m => {
      if (!m.participant1 || !m.participant2 || m.score1 === undefined || m.score2 === undefined) return;
      
      // Find participants in standings
      const team1Index = newStandings[groupId].findIndex(s => s.participant.id === m.participant1?.id);
      const team2Index = newStandings[groupId].findIndex(s => s.participant.id === m.participant2?.id);
      
      if (team1Index === -1 || team2Index === -1) return;
      
      // Update match count
      newStandings[groupId][team1Index].matches++;
      newStandings[groupId][team2Index].matches++;
      
      // Update goals
      newStandings[groupId][team1Index].goalsFor += m.score1;
      newStandings[groupId][team1Index].goalsAgainst += m.score2;
      newStandings[groupId][team2Index].goalsFor += m.score2;
      newStandings[groupId][team2Index].goalsAgainst += m.score1;
      
      // Initialize headToHead objects if they don't exist
      if (!newStandings[groupId][team1Index].headToHead) {
        newStandings[groupId][team1Index].headToHead = {};
      }
      if (!newStandings[groupId][team2Index].headToHead) {
        newStandings[groupId][team2Index].headToHead = {};
      }
      
      // Update wins, draws, losses and points based on score config
      if (m.score1 > m.score2) {
        newStandings[groupId][team1Index].wins++;
        newStandings[groupId][team2Index].losses++;
        newStandings[groupId][team1Index].points += scoreConfig.win;
        newStandings[groupId][team2Index].points += scoreConfig.loss;
        
        // Update head-to-head
        newStandings[groupId][team1Index].headToHead[m.participant2.id] = 
          (newStandings[groupId][team1Index].headToHead[m.participant2.id] || 0) + 1;
      } else if (m.score1 < m.score2) {
        newStandings[groupId][team2Index].wins++;
        newStandings[groupId][team1Index].losses++;
        newStandings[groupId][team2Index].points += scoreConfig.win;
        newStandings[groupId][team1Index].points += scoreConfig.loss;
        
        // Update head-to-head
        newStandings[groupId][team2Index].headToHead[m.participant1.id] = 
          (newStandings[groupId][team2Index].headToHead[m.participant1.id] || 0) + 1;
      } else {
        // Draw
        newStandings[groupId][team1Index].draws++;
        newStandings[groupId][team2Index].draws++;
        newStandings[groupId][team1Index].points += scoreConfig.draw;
        newStandings[groupId][team2Index].points += scoreConfig.draw;
      }
    });
    
    // Update goal difference for all teams
    newStandings[groupId].forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });
    
    // Sort standings based on the selected tiebreakers
    const tiebreakers = getSelectedTiebreakers();
    
    newStandings[groupId].sort((a, b) => {
      // First sort by points
      if (a.points !== b.points) return b.points - a.points;
      
      // Only apply tiebreakers if there are any
      if (tiebreakers.length > 0) {
        // Then apply tiebreakers in order
        for (const tiebreaker of tiebreakers) {
          let comparison = 0;
          
          switch(tiebreaker) {
            case 'headToHead':
              // Check head-to-head record between these teams
              if (a.headToHead && b.headToHead) {
                const aVsB = a.headToHead[b.participant.id] || 0;
                const bVsA = b.headToHead[a.participant.id] || 0;
                comparison = aVsB - bVsA;
                if (comparison !== 0) return comparison;
              }
              break;
            
            case 'inGameTiebreaker':
              // Goal difference
              comparison = b.goalDifference - a.goalDifference;
              if (comparison !== 0) return comparison;
              break;
            
            case 'gameWin':
              // Win rate
              const winRateA = a.matches > 0 ? a.wins / a.matches : 0;
              const winRateB = b.matches > 0 ? b.wins / b.matches : 0;
              comparison = winRateB - winRateA;
              if (Math.abs(comparison) > 0.001) return comparison > 0 ? 1 : -1;
              break;
            
            case 'gameWL':
              // Win/Loss differential
              const wlDiffA = a.wins - a.losses;
              const wlDiffB = b.wins - b.losses;
              comparison = wlDiffB - wlDiffA;
              if (comparison !== 0) return comparison;
              break;
            
            case 'matchesPlayed':
              // Fewer matches played ranks higher
              comparison = a.matches - b.matches;
              if (comparison !== 0) return comparison;
              break;
            
            case 'gamesWon':
              // Total wins
              comparison = b.wins - a.wins;
              if (comparison !== 0) return comparison;
              break;
          }
        }
      }
      
      // If no tiebreakers or all tiebreakers are equal, use goal difference and then goals scored as final tiebreakers
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    
    // Log standings after sorting for debugging
    console.log(`Updated standings for group ${groupId}:`, newStandings[groupId]);
    
    // Assign standing IDs to each team based on their position and group
    newStandings[groupId].forEach((team, index) => {
      // Convert group number to letter (1 = A, 2 = B, etc.)
      const groupLetter = String.fromCharCode(64 + groupId);
      // Assign standing ID (A1, A2, B1, B2, etc.)
      const standingId = `${groupLetter}${index + 1}`;
      team.standingId = standingId;
      // Also set standingPosition for compatibility with other bracket formats
      team.participant.standingPosition = index + 1;
      // Store the group information on the participant for advancement
      team.participant.group = groupId;
      // Assign the standing ID directly to the participant object
      team.participant.standingId = standingId;
    });
    
    setStandings(newStandings);
    
    // Save to localStorage for Single Elimination to detect changes
    if (options.stageId) {
      // Save matches
      localStorage.setItem(`matches-stage-${options.stageId}`, JSON.stringify(matches));
      
      // Save standings as flat array of participants
      const allStandings: any[] = [];
      Object.values(newStandings).forEach((groupStandings: any[]) => {
        groupStandings.forEach((standing: any) => {
          allStandings.push(standing.participant);
        });
      });
      localStorage.setItem(`standings-stage-${options.stageId}`, JSON.stringify(allStandings));
      
      console.log(`RoundRobin: Saved to localStorage - stage ${options.stageId}`);
    }
  };

  // Add this useEffect to update layoutMatches when matches change
  useEffect(() => {
    if (matches.length > 0) {
      const updatedLayoutMatches = generator.calculateBracketLayout(matches) as RoundRobinMatch[]
      setLayoutMatches(updatedLayoutMatches)
    }
  }, [matches, generator])
  
  // Group matches by round for display
  const getMatchesByRound = () => {
    const roundMatches: Record<number, RoundRobinMatch[]> = {}
    
    layoutMatches.forEach(match => {
      const round = match.round
      if (!roundMatches[round]) {
        roundMatches[round] = []
      }
      roundMatches[round].push(match)
    })
    
    return roundMatches
  }

  // Automatyczne generowanie drabinki po załadowaniu uczestników lub opcji
  useEffect(() => {
    if (!isGenerated && participants.length > 0) {
      generateBracket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, options]);
  
  // Przy montowaniu: odczytaj stan drabinki z localStorage jeśli istnieje
  useEffect(() => {
    if (options.stageId) {
      const saved = localStorage.getItem(`matches-stage-${options.stageId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Build a fully type-safe RoundRobinMatch[]
            const rrMatches: RoundRobinMatch[] = parsed
              .map((m: any) => {
                const groupNum = Number(m.group);
                if (
                  typeof m.id === 'number' &&
                  typeof m.round === 'number' &&
                  typeof m.position === 'number' &&
                  !isNaN(groupNum)
                ) {
                  return {
                    id: m.id,
                    round: m.round,
                    position: m.position,
                    participant1: m.participant1,
                    participant2: m.participant2,
                    winner: m.winner,
                    loser: m.loser,
                    group: groupNum,
                    thirdPlaceMatch: m.thirdPlaceMatch,
                    preliminaryRound: m.preliminaryRound,
                    awaitingPreliminaryWinner: m.awaitingPreliminaryWinner,
                    awaitingPreliminaryWinners: m.awaitingPreliminaryWinners,
                    layoutX: m.layoutX,
                    layoutY: m.layoutY,
                    score1: m.score1,
                    score2: m.score2,
                    connectedMatches: m.connectedMatches,
                    nextMatchId: m.nextMatchId,
                    nextMatchPosition: m.nextMatchPosition,
                    grandFinal: m.grandFinal,
                    loserBracket: m.loserBracket,
                    matchName: m.matchName,
                    isLabel: m.isLabel,
                    isPlayoff: m.isPlayoff,
                    playoff: m.playoff,
                    playoffRound: m.playoffRound,
                    x: m.x,
                    y: m.y,
                    bracket: m.bracket,
                    matchDate: m.matchDate,
                    options: m.options,
                    slotLabel1: m.slotLabel1,
                    slotLabel2: m.slotLabel2,
                  } as RoundRobinMatch;
                }
                return null;
              })
              .filter((m): m is RoundRobinMatch => m !== null);

            setMatches(rrMatches);
            if (generator && generator.calculateBracketLayout) {
              // Ensure layout matches are also RoundRobinMatch[]
              const layout = generator.calculateBracketLayout(rrMatches) as RoundRobinMatch[];
              setLayoutMatches(layout);
            }
            setIsGenerated(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Ignore error, fall through to generate new bracket
        }
      }
    }
    // If no saved bracket, trigger new generation
    setIsGenerated(false);
  }, [options.stageId]);
  
  // Helper: sprawdź czy jest seeding (czy są standingId w participants)
  const seeded = participants.some(p => typeof p.standingId === 'string' && /^([A-Z])[0-9]+$/.test(p.standingId));
  
  let groupNum = 1;
  if (typeof selectedGroup === 'number') groupNum = selectedGroup;
  else if (typeof selectedGroup === 'string') groupNum = parseInt(selectedGroup) || 1;
  const groupIdx = groupNum - 1;
  const groupLetter = String.fromCharCode(65 + groupIdx);
  
  // Przed renderowaniem Upcoming Matches, oblicz globalny offset numeracji meczów:
  const allGroupMatches = matches;
  let matchNumberOffset = 0;
  if (typeof selectedGroup === 'number' && selectedGroup > 1) {
    for (let g = 1; g < selectedGroup; g++) {
      matchNumberOffset += allGroupMatches.filter(m => m.group === g).length;
    }
  }
  
  const getSeededTeam = (standingId: string) => {
    return participants.find(p => typeof p.standingId === 'string' && p.standingId === standingId);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        <RoundRobinSidebar
          groupCount={groupCount}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          activeTab={activeTab}
          showTiebreakers={showTiebreakers}
          setShowTiebreakers={setShowTiebreakers}
        />
        <div className="flex-1">
          {selectedGroup === 'all' ? (
            <RoundRobinStandingsTable
              standings={standings}
              groupCount={groupCount}
              showTiebreakers={showTiebreakers}
              getSelectedTiebreakers={getSelectedTiebreakers}
              selectedGroup={selectedGroup}
              advancingTeams={options.roundRobinAdvancingTeams || 1}
            />
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">
                Group {typeof selectedGroup === "number" ? String.fromCharCode(64 + selectedGroup) : ""}
              </h2>
              <div className="flex mb-2">
                <button
                  className={`flex-1 font-bold py-2 rounded-l border border-gray-700 transition-all ${activeTab === 'standings' ? 'bg-yellow-400 text-black shadow' : 'bg-[#232b3b] text-white hover:bg-yellow-500/20 hover:text-yellow-400'}`}
                  onClick={() => setActiveTab('standings')}
                >
                  Standings
                </button>
                <button
                  className={`flex-1 font-bold py-2 rounded-r border border-gray-700 transition-all ${activeTab === 'matches' ? 'bg-yellow-400 text-black shadow' : 'bg-[#232b3b] text-white hover:bg-yellow-500/20 hover:text-yellow-400'}`}
                  onClick={() => setActiveTab('matches')}
                >
                  Upcoming matches
                </button>
              </div>
              {activeTab === 'standings' ? (
                <RoundRobinStandingsTable
                  standings={standings}
                  groupCount={groupCount}
                  showTiebreakers={showTiebreakers}
                  getSelectedTiebreakers={getSelectedTiebreakers}
                  selectedGroup={selectedGroup}
                  advancingTeams={options.roundRobinAdvancingTeams || 1}
                />
              ) : (
                <RoundRobinUpcomingMatches
                  matches={matches}
                  participants={participants}
                  selectedGroup={selectedGroup}
                  getSeededTeam={getSeededTeam}
                  handleWinnerChange={handleWinnerChange}
                  seeded={seeded}
                  generateBracket={generateBracket}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
