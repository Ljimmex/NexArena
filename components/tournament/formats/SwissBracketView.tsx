"use client"

import { useState, useEffect } from "react"
import { SwissGenerator } from "../../generators/SwissGenerator"
import type { SwissOptions } from "../../generators/SwissGenerator"
import { MatchCard } from "@/components/tournament/MatchCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ChevronDown, ChevronUp, Info, Trophy } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Participant, Match } from "@/types/index"
import { BracketViewProps } from "../BracketView"
import { SwissMatchesByRound } from "./SwissBracketView/SwissMatchesByRound"
import { SwissStandingsTable } from "./SwissBracketView/SwissStandingsTable"
import { generateNextRound, generateEmptySwissRounds, generateFirstRoundMatches, getSwissMatchesPerRound, validateEmptySwissRounds, testSwissProgression } from "@/components/generators/Swiss/BracketStructure"
import { updateStandings } from "@/components/generators/Swiss/MatchUtils"
import { SwissBracketTree } from "./SwissBracketView/SwissBracketTree"

// Add a type extension for the options we need
interface SwissBracketViewProps extends BracketViewProps {
  options?: BracketViewProps['options'] & {
    startDate?: string;
  }
}

export function SwissBracketView({ participants, options = {}, className }: SwissBracketViewProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [layoutMatches, setLayoutMatches] = useState<Match[]>([])
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generator] = useState<SwissGenerator>(new SwissGenerator())
  const [standings, setStandings] = useState<Participant[]>([])
  const [activeTab, setActiveTab] = useState("matches")
  const [showTiebreakers, setShowTiebreakers] = useState(false)
  const allowDraw = false // Swiss doesn't allow draws
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({1: true})
  const [currentRound, setCurrentRound] = useState(1)
  const [blockHistory, setBlockHistory] = useState<Record<number, Record<string, Participant[]>>>({})

  // Get required stats for Swiss format
  const requiredStats = generator.getRequiredWinsLosses(participants.length);

  // Pobierz liczbę meczów na każdą rundę
  const matchesPerRoundArr = getSwissMatchesPerRound(participants.length);
  
  console.log(`Swiss: Tournament setup - ${participants.length} participants, ${generator.calculateMaxRounds(participants.length)} rounds`);
  console.log(`Swiss: Expected matches per round:`, matchesPerRoundArr);
  console.log(`Swiss: Required wins/losses: ${requiredStats.wins}W/${requiredStats.losses}L`);

  // Update the generateBracket function to properly handle tiebreakers and score config
  const generateBracket = () => {
    if (participants.length > 0) {
      setIsLoading(true)
      console.log("Generating Swiss bracket with options:", options)
      
      // Test the calculations for debugging
      testSwissProgression(participants.length);
      
      const swissOptions: SwissOptions = {
        rounds: options.rounds || generator.calculateMaxRounds(participants.length),
        usePlayoffs: options.usePlayoffs || false,
        playoffTeams: options.playoffTeams || 8,
        swissMode: options.swissMode || 'topCut',
        tiebreakers: (options.tiebreakers || []) as ("buchholz" | "medianBuchholz" | "gameWin" | "headToHead" | "matchesPlayed" | "gameWL")[],
        scoreConfig: options.scoreConfig || {
          win: 3,
          loss: 0,
          draw: 1,
          bye: 3,
          winOvertime: 2,
          lossOvertime: 1
        }
      }
      
      // Zawsze używaj calculateMaxRounds dla prawidłowej liczby rund
      const maxRounds = generator.calculateMaxRounds(participants.length);
      
      // Generate real pairings for round 1
      const firstRoundMatches = generateFirstRoundMatches(
        participants, 
        1, 
        swissOptions.swissMode || 'topCut', 
        swissOptions.tiebreaker || 'buchholz', 
        swissOptions.tiebreakers || [swissOptions.tiebreaker || 'buchholz']
      );
      
      // Generate empty matches for rounds 2+ that properly reflect Swiss structure
      const emptyMatchesForLaterRounds = generateEmptySwissRounds(
        participants.length, 
        maxRounds, // Generate for all rounds
        firstRoundMatches.length + 1, // start from match ID after first round matches
        swissOptions
      );
      
      // Filter out round 1 from empty matches since we have real matches for round 1
      const emptyMatchesExceptFirst = emptyMatchesForLaterRounds.filter(m => m.round !== 1);
      const allMatches = [...firstRoundMatches, ...emptyMatchesExceptFirst];
      
      console.log(`Swiss: Generated ${firstRoundMatches.length} real matches for round 1, ${emptyMatchesExceptFirst.length} empty matches for rounds 2+`);
      console.log(`Swiss: Total rounds: ${maxRounds}, Total matches: ${allMatches.length}`);
      
      // Log breakdown by round
      const matchesByRound = allMatches.reduce((acc, match) => {
        acc[match.round] = (acc[match.round] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log('Swiss matches by round:', matchesByRound);
      
      // Log empty matches structure
      console.log('Swiss empty matches structure:', emptyMatchesExceptFirst.map(m => ({
        id: m.id,
        round: m.round,
        position: m.position,
        hasParticipants: !!(m.participant1 || m.participant2)
      })));
      
      // Validate empty rounds structure
      const isValidEmptyRounds = validateEmptySwissRounds(emptyMatchesExceptFirst, participants.length);
      console.log(`Swiss: Empty rounds validation: ${isValidEmptyRounds ? 'PASS' : 'FAIL'}`);
      
      setMatches(allMatches);
      setLayoutMatches(generator.calculateBracketLayout(allMatches.filter(m => m.round === 1)));
      setCurrentRound(1);
      // Initialize expanded state for all rounds (all collapsed except round 1 open)
      const initialExpandedState: Record<number, boolean> = {};
      for (let i = 1; i <= maxRounds; i++) {
        initialExpandedState[i] = i === 1;
      }
      setExpandedRounds(initialExpandedState);
      
      // Inicjalizuj standings ze wszystkimi uczestnikami z zerowymi statystykami
      const initialStandings = participants.map(participant => ({
        ...participant,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        tiebreakers: {
          buchholz: 0,
          medianBuchholz: 0,
          gameWin: 0,
          headToHead: 0,
          matchesPlayed: 0,
          gameWL: 0
        }
      }));
      setStandings(initialStandings);
      
      setIsGenerated(true);
      setIsLoading(false);
    }
  }

  // Group matches by round for collapsible display
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  // Add a function to toggle round expansion
  const toggleRound = (round: number) => {
    setExpandedRounds(prev => ({
      ...prev,
      [round]: !prev[round]
    }));
  };

  // Add the missing generateMatchDates function
  const generateMatchDates = (matches: Match[], startDate: string = new Date().toISOString().split('T')[0]) => {
    const updatedMatches = [...matches];
    const startDateObj = new Date(startDate);
    
    // Group matches by round
    const roundMatches = updatedMatches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, Match[]>);
    
    // Assign dates to each round (one day per round)
    Object.keys(roundMatches).forEach((roundStr, index) => {
      const round = parseInt(roundStr);
      const roundDate = new Date(startDateObj);
      roundDate.setDate(startDateObj.getDate() + index);
      
      roundMatches[round].forEach(match => {
        match.matchDate = roundDate.toISOString().split('T')[0];
      });
    });
    
    return updatedMatches;
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Funkcja pomocnicza do budowania historii bloków
  const buildBlockHistory = (matches: Match[], participants: Participant[]): Record<number, Record<string, Participant[]>> => {
    const history: Record<number, Record<string, Participant[]>> = {
      0: { "0:0": participants.map(p => ({ ...p, wins: 0, losses: 0 })) },
    }
    const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0

    for (let round = 1; round <= maxRound; round++) {
      const tempStandings = participants.map(p => ({ ...p, wins: 0, losses: 0 }))
      const completedMatchesUpToRound = matches.filter(m => m.winner && m.round <= round)

      // Calculate standings up to this round
      completedMatchesUpToRound.forEach(match => {
        const winner = tempStandings.find(p => p.id === match.winner?.id)
        if (winner) winner.wins = (winner.wins || 0) + 1

        const loser = tempStandings.find(
          p => (p.id === match.participant1?.id || p.id === match.participant2?.id) && p.id !== match.winner?.id,
        )
        if (loser) loser.losses = (loser.losses || 0) + 1
      })

      // Group teams by their record at this round
      const grouped: Record<string, Participant[]> = {}
      tempStandings.forEach(team => {
        const key = `${team.wins}:${team.losses}`
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(team)
      })
      
      // Only add to history if we have teams in this round
      if (Object.keys(grouped).length > 0) {
        history[round] = grouped
      }
    }
    return history
  }

  // Aktualizuj blockHistory po zmianie meczów lub standings
  useEffect(() => {
    if (matches.length > 0 && participants.length > 0) {
      const newHistory = buildBlockHistory(matches, participants)
      console.log('Building block history:', {
        matchesCount: matches.length,
        participantsCount: participants.length,
        historyRounds: Object.keys(newHistory),
        historyStructure: newHistory
      })
      setBlockHistory(newHistory)
    }
  }, [matches, participants])

  // Generuj drabinkę przy pierwszym renderowaniu
  useEffect(() => {
    if (!isGenerated && participants.length > 0) {
      generateBracket();
    }
  }, [participants, isGenerated]);

  // Przy montowaniu: odczytaj stan drabinki z localStorage jeśli istnieje
  useEffect(() => {
    if (options.stageId) {
      const saved = localStorage.getItem(`matches-stage-${options.stageId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMatches(parsed);
            if (generator && generator.calculateBracketLayout) {
              setLayoutMatches(generator.calculateBracketLayout(parsed.filter(m => m.round === 1)));
            }
            setIsGenerated(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Ignoruj błąd, przejdź do generowania nowej drabinki
        }
      }
    }
    // Jeśli nie było zapisanej drabinki, generuj nową (poprzez isGenerated=false)
    setIsGenerated(false);
  }, [options.stageId]);

  // Save matches to localStorage for Page synchronization
  useEffect(() => {
    const stageId = options.stageId || 1;
    if (matches.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(`matches-stage-${stageId}`, JSON.stringify(matches));
      // Ograniczamy logowanie do minimum
      console.log(`Swiss: Zaktualizowano etap ${stageId}, runda ${currentRound}/${Math.max(...matches.map(m => m.round))}`);
    }
  }, [matches, standings, options.stageId]);

  // Load matches from localStorage
  useEffect(() => {
    const stageId = options.stageId || 1;
    const savedMatches = localStorage.getItem(`matches-stage-${stageId}`);
    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches);
      setMatches(parsedMatches);
      
      const lastPlayedRound = Math.max(...parsedMatches.filter((m: Match) => m.winner).map((m: Match) => m.round), 1);
      setCurrentRound(lastPlayedRound);

      const initialStandings = participants.map(participant => ({
        ...participant,
        points: 0, wins: 0, losses: 0,
        metadata: { buchholz: 0, medianBuchholz: 0, gameWin: 0, headToHead: [], matchesPlayed: 0, gameWL: 0 }
      }));
      updateStandings(parsedMatches, initialStandings);
      setStandings(initialStandings);

      setIsGenerated(true);
    }
  }, [options.stageId, participants]);
    
   // Add handleWinnerChange function

   const handleWinnerChange = (matchId: string, winnerId: string) => {
    const matchIdNum = typeof matchId === "string" ? parseInt(matchId) : matchId
    const updatedMatches = matches.map(m => (m.id === matchIdNum ? { ...m, winner: participants.find(p => p.id === winnerId) } : m))
    
    const standingsCopy =
      standings.length > 0
        ? standings.map(p => ({ ...p }))
        : participants.map(p => ({
            ...p,
            points: 0,
            wins: 0,
            losses: 0,
            metadata: {
              buchholz: 0,
              medianBuchholz: 0,
              gameWin: 0,
              headToHead: [],
              matchesPlayed: 0,
              gameWL: 0,
            },
          }))
    
    updateStandings(
      updatedMatches.filter(m => m.round <= currentRound),
      standingsCopy,
    )
    setStandings(standingsCopy)

    const currentRoundMatches = updatedMatches.filter(m => m.round === currentRound)
    const isRoundComplete = currentRoundMatches.every(m => m.winner)

    console.log(`--- handleWinnerChange (Round ${currentRound}) ---`)
    console.log(`Is round complete? ${isRoundComplete}`)
    
    if (isRoundComplete && currentRound < (options.rounds || generator.calculateMaxRounds(participants.length))) {
      const nextRound = currentRound + 1
      console.log(`Round ${currentRound} is complete. Generating matches for round ${nextRound}...`)
      
      const nextRoundMatches = generateNextRound(
        updatedMatches,
        standingsCopy,
        nextRound,
        Math.max(...updatedMatches.map(m => m.id)) + 1,
        options.swissMode || "topCut",
        options.tiebreaker || "buchholz",
        (options.tiebreakers || [options.tiebreaker || "buchholz"]) as (
          | "buchholz"
          | "medianBuchholz"
          | "gameWin"
          | "headToHead"
          | "matchesPlayed"
          | "gameWL"
        )[],
        new Set(), // TODO: przekazać pairingi jeśli chcesz unikać powtórzeń
      )
      
      console.log(`Generated ${nextRoundMatches.length} matches for round ${nextRound}:`, nextRoundMatches)

      if (nextRoundMatches.length === 0) {
        console.log(`No more matches generated for round ${nextRound} - tournament may be complete`)
        setMatches(updatedMatches)
        setLayoutMatches(generator.calculateBracketLayout(updatedMatches.filter(m => m.round <= currentRound)))
        return
      }
      
      const matchesWithoutEmptyNextRound = updatedMatches.filter(m => m.round !== nextRound)
      const mergedMatches = [...matchesWithoutEmptyNextRound, ...nextRoundMatches]
      
      console.log("New merged matches state:", mergedMatches)
      setMatches(mergedMatches)
      setCurrentRound(nextRound)
      setExpandedRounds(prev => ({ ...prev, [nextRound]: true }))
      setLayoutMatches(generator.calculateBracketLayout(mergedMatches.filter(m => m.round <= nextRound)))
      return
    }
    setMatches(updatedMatches)
    setLayoutMatches(generator.calculateBracketLayout(updatedMatches.filter(m => m.round <= currentRound)))
  };
 
   // Helper function to get tiebreaker label
   const getTiebreakerLabel = (tiebreaker: string) => {
     const labels: Record<string, string> = {
       'buchholz': 'Buchholz',
       'medianBuchholz': 'Median Buchholz',
       'gameWin': 'Game Win %',
       'headToHead': 'Head-to-Head',
       'matchesPlayed': 'Matches Played',
       'gameWL': 'Game W/L Diff',
       'inGameTiebreaker': 'In-Game Tiebreaker',
       'gamesWon': 'Games Won'
     };
     
     return labels[tiebreaker] || tiebreaker;
   };
  
    // Renderuj widok drabinki
    return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="bracket-tree">Bracket Tree</TabsTrigger>
        </TabsList>
        <TabsContent value="matches">
          <SwissMatchesByRound
            matchesByRound={matchesByRound}
            currentRound={currentRound}
            expandedRounds={expandedRounds}
            toggleRound={toggleRound}
            handleWinnerChange={handleWinnerChange}
            formatDate={formatDate}
            matchesPerRoundArr={matchesPerRoundArr}
          />
        </TabsContent>
        <TabsContent value="standings">
          <SwissStandingsTable
            standings={standings.length > 0 ? standings : participants.map(participant => ({
              ...participant,
              points: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              tiebreakers: {
                buchholz: 0,
                medianBuchholz: 0,
                gameWin: 0,
                headToHead: 0,
                matchesPlayed: 0,
                gameWL: 0
              }
            }))}
            options={options}
            requiredStats={requiredStats}
            showTiebreakers={showTiebreakers}
            setShowTiebreakers={setShowTiebreakers}
            getTiebreakerLabel={getTiebreakerLabel}
          />
        </TabsContent>
        <TabsContent value="bracket-tree">
          <SwissBracketTree
            standings={
              standings.length > 0
                ? standings
                : participants.map(participant => ({
                    ...participant,
                    points: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    tiebreakers: {
                      buchholz: 0,
                      medianBuchholz: 0,
                      gameWin: 0,
                      headToHead: 0,
                      matchesPlayed: 0,
                      gameWL: 0,
                    },
                  }))
            }
            requiredStats={requiredStats}
            blockHistory={blockHistory}
            matches={matches}
          />
        </TabsContent>
      </Tabs>
      {isLoading && <LoadingSpinner size="lg" />}
    </div>
  )
}