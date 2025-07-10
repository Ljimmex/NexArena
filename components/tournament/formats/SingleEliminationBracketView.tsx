"use client"

import { useState, useEffect } from "react"
import { SingleEliminationGenerator } from "../../generators/SingleEliminationGenerator"
import { MatchCard } from "@/components/tournament/MatchCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match } from "@/types/index"
import { BracketViewProps } from "../BracketView"
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RoundLabels } from "./SingleElimination/RoundLabels";
import { MatchConnectionLines } from "./SingleElimination/MatchConnectionLines";
import { BracketMatchCard } from "./SingleElimination/BracketMatchCard";

// Add this interface to extend the options type
interface SingleEliminationOptions extends BracketViewProps {
  options?: BracketViewProps['options'] & {
    stage?: number;
    previousStageFinished?: boolean;
  }
}

// Extend Match type locally to include slotLabel1/slotLabel2
type MatchWithSlotLabels = Match & {
  slotLabel1?: string;
  slotLabel2?: string;
};

// Update the component signature to use the extended interface
export function SingleEliminationBracketView({ participants, options = {}, className }: SingleEliminationOptions) {
  const stage = options.stage ?? 1;
  const [matches, setMatches] = useState<MatchWithSlotLabels[]>([])
  const [layoutMatches, setLayoutMatches] = useState<MatchWithSlotLabels[]>([])
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generator] = useState<BracketGeneratorInterface>(new SingleEliminationGenerator())
  const [isStageReady, setIsStageReady] = useState(true); // domyślnie true dla 1. etapu
  const [tournamentStarted, setTournamentStarted] = useState(false);

  useEffect(() => {
    let startDateTime: string | undefined;
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("tournamentData");
      if (data) {
        const parsed = JSON.parse(data);
        startDateTime = parsed.startDateTime;
      }
    }
    if (startDateTime) {
      setTournamentStarted(new Date() >= new Date(startDateTime));
    }
  }, []);

  useEffect(() => {
    // Przykład: jeśli options.stage > 1 i !options.previousStageFinished, ustaw isStageReady na false
    if (options.stage && options.stage > 1 && !options.previousStageFinished) {
      setIsStageReady(false);
      // Automatycznie generuj pustą drabinkę TYLKO jeśli nie ma zapisanej
      if (!hasSavedBracket(options.stage)) {
        setMatches([]);
        setLayoutMatches([]);
        setIsGenerated(true);
        setIsLoading(false);
      }
      return;
    } else {
      setIsStageReady(true);
    }
  }, [options.stage, options.previousStageFinished]);

  // Helper: sprawdź czy istnieje zapisany stan drabinki
  function hasSavedBracket(stage: number | undefined) {
    if (!stage) return false;
    const saved = localStorage.getItem(`matches-stage-${stage}`);
    try {
      const parsed = JSON.parse(saved || '[]');
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }

  // Add automatic refresh logic for Single Elimination (similar to Swiss)
  useEffect(() => {
    if (!options.stage || options.stage <= 1) return;

    const previousStageId = options.stage - 1;
    let lastMatches = localStorage.getItem(`matches-stage-${previousStageId}`);
    let lastStandings = localStorage.getItem(`standings-stage-${previousStageId}`);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith(`matches-stage-${previousStageId}`) || e.key.startsWith(`standings-stage-${previousStageId}`))) {
        console.log('Single Elimination: Storage change detected, checking if previous stage is complete');
        
        // Check if the previous stage is actually complete before refreshing
        const isPreviousStageComplete = checkPreviousStageCompletion(previousStageId);
        if (isPreviousStageComplete && !hasSavedBracket(options.stage)) {
          console.log('Single Elimination: Previous stage is complete, refreshing bracket');
          setIsGenerated(false); // Force regeneration
        } else {
          console.log('Single Elimination: Previous stage not complete or bracket already saved, keeping placeholders');
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    // Polling co 2 sekundy na wypadek braku eventu (np. w tej samej karcie)
    const interval = setInterval(() => {
      const currentMatches = localStorage.getItem(`matches-stage-${previousStageId}`);
      const currentStandings = localStorage.getItem(`standings-stage-${previousStageId}`);
      
      if (currentMatches !== lastMatches || currentStandings !== lastStandings) {
        lastMatches = currentMatches;
        lastStandings = currentStandings;
        
        // Check if the previous stage is actually complete before refreshing
        const isPreviousStageComplete = checkPreviousStageCompletion(previousStageId);
        if (isPreviousStageComplete && !hasSavedBracket(options.stage)) {
          console.log('Single Elimination: Polling detected change and previous stage is complete, refreshing bracket');
          setIsGenerated(false); // Force regeneration
        } else {
          console.log('Single Elimination: Polling detected change but previous stage not complete or bracket already saved, keeping placeholders');
        }
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [options.stage]);

  // Helper function to check if previous stage is complete
  const checkPreviousStageCompletion = (previousStageId: number): boolean => {
    try {
      const matchesRaw = localStorage.getItem(`matches-stage-${previousStageId}`);
      if (!matchesRaw) return false;
      
      const matches = JSON.parse(matchesRaw);
      if (!Array.isArray(matches) || matches.length === 0) return false;
      
      // Check if all matches have winners and scores
      const allMatchesComplete = matches.every((match: any) => 
        match.winner !== undefined && 
        match.winner !== null && 
        match.score1 !== undefined && 
        match.score2 !== undefined
      );
      
      console.log(`Single Elimination: Checking previous stage ${previousStageId} completion:`, {
        totalMatches: matches.length,
        allMatchesComplete,
        incompleteMatches: matches.filter(m => !m.winner || m.score1 === undefined || m.score2 === undefined)
      });
      
      return allMatchesComplete;
    } catch (error) {
      console.error(`Error checking previous stage ${previousStageId} completion:`, error);
      return false;
    }
  };

  // Helper: sprawdź czy należy wygenerować drabinkę (tylko jeśli NIE ma zapisanej i są prawdziwe drużyny)
  function shouldRegenerateBracket(participants: any[], options: any) {
    if (hasSavedBracket(options.stage)) return false;
    const hasRealTeams = participants.some(p => 
      p.id && 
      !p.id.startsWith('placeholder-') && 
      !p.name?.startsWith('Swiss Place') && 
      !p.name?.startsWith('Group ') && 
      !p.name?.startsWith('Slot ')
    );
    return hasRealTeams && participants.length > 0;
  }

  // Usuń efekt, który resetuje/generuje drabinkę na podstawie zmiany participants, jeśli istnieje już zapisany stan
  // Zamiast tego, generuj drabinkę TYLKO jeśli shouldRegenerateBracket zwraca true
  useEffect(() => {
    if (shouldRegenerateBracket(participants, options)) {
      setIsGenerated(false);
    }
    // Jeśli istnieje zapisany stan, NIE rób nic
  }, [participants.length, options.stage]);

  // Przy montowaniu lub zmianie etapu: odczytaj stan drabinki z localStorage jeśli istnieje
  useEffect(() => {
    if (!stage) {
      console.log('[useEffect][read] options.stage is undefined!');
      return;
    }
    const saved = localStorage.getItem(`matches-stage-${stage}`);
    console.log(`[useEffect][read] Odczytuję matches-stage-${stage} z localStorage:`, saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('[useEffect][read] Załadowano drabinkę z localStorage:', parsed);
          setMatches(parsed);
          setLayoutMatches(generator.calculateBracketLayout(parsed));
          setIsGenerated(true); // <-- kluczowe!
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('[useEffect][read] Błąd parsowania drabinki z localStorage:', e);
      }
    }
    if (!hasSavedBracket(stage)) {
      setIsGenerated(false);
    }
  }, [stage]);

  // Generuj drabinkę tylko jeśli NIE ma zapisanej i są prawdziwe drużyny (po seedowaniu)
  useEffect(() => {
    console.log('[useEffect][generate] isGenerated:', isGenerated, 'isStageReady:', isStageReady, 'hasSavedBracket:', hasSavedBracket(stage));
    if (!isGenerated && isStageReady && !hasSavedBracket(stage)) {
      console.log('[useEffect][generate] Generuję nową drabinkę!');
      const hasRealTeams = participants.some(p =>
        p.id &&
        !p.id.startsWith('placeholder-') &&
        !p.name?.startsWith('Swiss Place') &&
        !p.name?.startsWith('Group ') &&
        !p.name?.startsWith('Slot ')
      );
      if (hasRealTeams && participants.length > 0) {
        generateBracket();
      }
    }
    // Jeśli istnieje zapisany stan lub już załadowano, NIE generuj ponownie!
  }, [isGenerated, isStageReady, participants.length, stage]);

  // Po każdej zmianie matches: natychmiast zapisuj do localStorage
  useEffect(() => {
    if (!stage) return;
    if (!matches || matches.length === 0) return; // <-- dodaj ten warunek!
    try {
      localStorage.setItem(`matches-stage-${stage}`, JSON.stringify(matches));
      console.log(`[useEffect] Saved matches-stage-${stage} to localStorage`, matches);
    } catch (e) {
      console.warn('Błąd zapisu drabinki do localStorage:', e);
    }
  }, [matches, stage]);

  // Create placeholder participants for empty bracket (like RoundRobin does)
  const createPlaceholderParticipants = (bracketSize?: number): Participant[] => {
    // Determine bracket size based on available information
    let size = bracketSize || 8; // Default to 8
    
    // If we have some participants, use their count to determine bracket size
    if (participants.length > 0) {
      size = Math.max(2, Math.pow(2, Math.ceil(Math.log2(participants.length))));
    }
    
    // Ensure minimum size of 2 and maximum reasonable size
    size = Math.max(2, Math.min(size, 32));
    
    const placeholderParticipants: Participant[] = [];
    for (let i = 1; i <= size; i++) {
      placeholderParticipants.push({
        id: `placeholder-single-${i}`,
        name: `Slot ${i}`,
        logo: '',
        seed: i,
        placeholder: true
      } as any);
    }
    return placeholderParticipants;
  };

  // Helper: Pobierz aktualnych uczestników z localStorage
  const getCurrentParticipants = () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('tournamentData');
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.selectedTeams || [];
      }
    }
    return participants;
  };

  const generateBracket = () => {
    // Check if we need to create placeholder participants
    const isEmptyBracket = participants.length === 0 || participants.every(p => p.placeholder);
    const participantsToUse = isEmptyBracket
      ? createPlaceholderParticipants(8) // Default to 8 slots for empty bracket
      : participants;

    // Pobierz aktualnych uczestników (ze statusami)
    const currentParticipants = getCurrentParticipants();

    // Always generate bracket if we have participants to use
    if (participantsToUse.length > 0) {
      setIsLoading(true);
      console.log("Generating Single Elimination bracket with options:", options);
      console.log("Empty bracket mode:", isEmptyBracket);
      console.log("Participants to use:", participantsToUse);
      
      const generatorOptions = {
        ...options,
        thirdPlaceMatch: options.thirdPlaceMatch || false,
        usePreliminaries: options.usePreliminaries || false,
        emptyBracket: isEmptyBracket,
        participants: currentParticipants // <-- przekazujemy aktualnych uczestników
      };
      
      setTimeout(() => {
        try {
          // Przekaż wszystkich uczestników (w tym placeholdery) do generatora
          const generatedMatches = generator.generateBracket(participantsToUse, generatorOptions);
          const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches);
          setMatches(generatedMatches);
          setLayoutMatches(layoutCalculatedMatches);
          setIsGenerated(true);
        } catch (error) {
          console.error("Error generating bracket:", error);
        } finally {
          setIsLoading(false);
        }
      }, 100);
    } else {
      // If no participants at all, create a minimal bracket
      console.log("No participants provided, creating minimal bracket");
      const minimalParticipants = createPlaceholderParticipants(2);
      const generatorOptions = {
        ...options,
        thirdPlaceMatch: false,
        usePreliminaries: false,
        emptyBracket: true,
        participants: getCurrentParticipants() // <-- przekazujemy aktualnych uczestników
      };
      
      try {
        const generatedMatches = generator.generateBracket(minimalParticipants, generatorOptions);
        const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches);
        setMatches(generatedMatches);
        setLayoutMatches(layoutCalculatedMatches);
        setIsGenerated(true);
      } catch (error) {
        console.error("Error generating minimal bracket:", error);
      }
    }
  }

  const handleWinnerChange = (matchId: number, winnerId: string) => {
    console.log(`Setting winner for match ${matchId}: ${winnerId}`);
    const matchIdNum = typeof matchId === 'string' ? parseInt(matchId) : matchId;
    // Pobierz aktualnych uczestników (ze statusami)
    const currentParticipants = getCurrentParticipants();
    // Wywołaj updateMatchWinner z aktualnymi uczestnikami
    const updatedMatches = generator.updateMatchWinner(matches, matchIdNum, winnerId, currentParticipants);
    console.log('Updated matches:', updatedMatches);
    const layoutCalculatedMatches = generator.calculateBracketLayout(updatedMatches);
    // Wymuszamy nową referencję tablicy (na wszelki wypadek)
    setMatches([...updatedMatches]);
    setLayoutMatches([...layoutCalculatedMatches]);
    // Immediately persist to localStorage after update
    if (options.stage) {
      localStorage.setItem(`matches-stage-${options.stage}`, JSON.stringify(updatedMatches));
      console.log(`[handleWinnerChange] Saved matches-stage-${options.stage} to localStorage`);
    }
  }

  // Helper functions
  const maxRound = Math.max(...(layoutMatches.map(m => m.round) || [0]));
  
  // Calculate number of matches in each round
  const matchCountByRound = layoutMatches.reduce((acc, match) => {
    if (!match.thirdPlaceMatch) {
      acc[match.round] = (acc[match.round] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  // Improved bracket dimensions with better spacing
  const bracketWidth = (maxRound + 1) * 340 + 200; // Added 200px extra space on the right side

  // Calculate the height needed for each round based on pyramid structure
  const calculateBracketHeight = () => {
    // Get the number of matches in the first round
    const firstRoundMatches = matchCountByRound[1] || 0;
    
    if (firstRoundMatches === 0) {
      return 800; // Default height if no first round matches
    }
    
    // Calculate base height needed for each match in the first round
    const baseMatchHeight = 140; // Height per match
    const baseSpacing = 40; // Base spacing between matches
    
    // For each round, the matches should be centered with increased spacing
    // This gives the proper pyramid effect
    const lastMatchPosition = firstRoundMatches * 200 + 80; // Position of the last match in round 1
    return Math.max(800, lastMatchPosition + baseMatchHeight + 300); // Added 300px extra space after the last match
  };
  
  const bracketHeight = calculateBracketHeight();

  // Improved function to calculate match position with proper pyramid effect
  const getMatchPosition = (match: MatchWithSlotLabels): { left: string; top: string } => {
    // For third place match, position it below the final
    if (match.thirdPlaceMatch) {
      const finalMatch = layoutMatches.find(m => m.round === maxRound && !m.thirdPlaceMatch);
      if (finalMatch) {
        // Get the position of the final match and align the third place match with it
        const finalPosition = getMatchPosition(finalMatch);
        return {
          left: finalPosition.left, // Align with the final match horizontally
          top: `${parseInt(finalPosition.top) + 200}px`, // 200px below the final match
        };
      }
    }
    
    // Find all matches in this round
    const matchesInRound = layoutMatches.filter(m => 
      m.round === match.round && !m.thirdPlaceMatch
    );
    
    // Find the index of this match in its round
    const matchIndex = matchesInRound.findIndex(m => m.id === match.id);
    
    // Calculate spacing based on the round
    const roundSpacing = 400; // Horizontal spacing between rounds
    const verticalSpacing = 200; // Base vertical spacing between matches
    
    // Align with round labels by adjusting the left position - moved more to the left
    const leftPosition = match.round * roundSpacing -380; // Changed from -60 to -100
    
    // For first round (round 1), use fixed spacing
    if (match.round === 1) {
      return {
        left: `${leftPosition}px`,
        top: `${matchIndex * verticalSpacing + 150}px`,
      };
    } 
    // For later rounds, position matches to align with their connected matches
    else {
      // Get the number of matches in the first round
      const firstRoundMatches = matchCountByRound[1] || 0;
      
      // Calculate how many first round matches feed into this match
      const matchesPerCurrentRoundMatch = Math.pow(2, match.round - 1);
      
      // Calculate the starting index in the first round
      const startingFirstRoundIndex = matchIndex * matchesPerCurrentRoundMatch;
      
      // Calculate the midpoint position
      const midpoint = startingFirstRoundIndex + (matchesPerCurrentRoundMatch / 2) - 0.5;
      
      // Calculate the top position based on the midpoint
      const topPosition = midpoint * verticalSpacing + 150;
      
      return {
        left: `${leftPosition}px`,
        top: `${topPosition}px`,
      };
    }
  };

  // Improved function to get team name with better placeholder text
  const getTeamName = (participant: Participant | undefined, match: MatchWithSlotLabels, isFirstParticipant: boolean): string => {
    if (participant) {
      return participant.name;
    }
    
    // If no participant, check if this match is waiting for a winner from another match
    if (match.connectedMatches && match.connectedMatches.length > 0) {
      // Find the appropriate connected match
      let connectedMatchId;
      
      if (isFirstParticipant) {
        // For the first participant, take the first connected match
        connectedMatchId = match.connectedMatches[0];
      } else {
        // For the second participant, take the second connected match (if it exists)
        connectedMatchId = match.connectedMatches.length > 1 ? 
          match.connectedMatches[1] : match.connectedMatches[0];
      }
      
      const connectedMatch = layoutMatches.find(m => m.id === connectedMatchId);
      
      if (connectedMatch) {
        return `Winner of Match #${connectedMatch.id}`;
      }
    }
    
    return "To Be Determined";
  };

  // Sprawdź, czy uczestnicy to tylko placeholdery
  const onlyPlaceholders = participants.length > 0 && participants.every(p =>
    (typeof p.id === 'string' && p.id.startsWith('placeholder-')) ||
    (typeof p.name === 'string' && (p.name.startsWith('Swiss Place') || p.name.startsWith('Slot ')))
  );

  return (
    <div className={cn("relative", className)}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] rounded-md shadow-lg border border-[#333]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Generating bracket...</p>
        </div>
      ) : (
        <div className="overflow-auto p-4">
          <div 
            className="relative min-h-screen" 
            style={{ 
              minWidth: bracketWidth + "px", 
              minHeight: bracketHeight + "px",
              paddingTop: "60px" // Add padding for round labels
            }}
          >
            {/* Round labels with improved styling */}
            <RoundLabels maxRound={maxRound} matchCountByRound={matchCountByRound} />

            {/* Connection lines first (so they appear behind the match cards) */}
            <MatchConnectionLines layoutMatches={layoutMatches} getMatchPosition={getMatchPosition} />

            {/* Match cards with styling matching the image */}
            {layoutMatches.map(match => {
              const position = getMatchPosition(match);
              return (
                <BracketMatchCard
                  key={`match-${match.id}`}
                  match={match}
                  position={position}
                  getTeamName={getTeamName}
                  handleWinnerChange={handleWinnerChange}
                  editable={tournamentStarted}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}