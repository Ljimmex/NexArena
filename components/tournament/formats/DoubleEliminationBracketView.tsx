import { useState, useEffect } from "react"
import { DoubleEliminationGenerator } from "../../generators/DoubleEliminationGenerator"
import { MatchCard } from "@/components/tournament/MatchCard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match } from "@/types/index"
import { BracketViewProps } from "../BracketView"
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { WinnerBracketLabels } from "./DoubleElimination/WinnerBracketLabels";
import { LoserBracketLabels } from "./DoubleElimination/LoserBracketLabels";
import { DoubleEliminationMatchCard } from "./DoubleElimination/DoubleEliminationMatchCard";
import { DoubleEliminationConnectionLines } from "./DoubleElimination/DoubleEliminationConnectionLines";
import {
  getMatchPosition,
  getMatchPositionWithoutGrandFinal,
  calculateBracketHeight
} from "./DoubleElimination/helpers/doubleEliminationLayout";

// Add this interface to extend the Match type with the properties we need
interface ExtendedMatch extends Match {
  participants?: Participant[];
  grandFinal?: boolean;
  loserBracket?: boolean;
}

// Extend BracketViewProps to include all the double elimination options
interface DoubleEliminationOptions extends Omit<BracketViewProps, 'options'> {
  options?: BracketViewProps['options'] & {
    grandFinal?: 'single' | 'double';
    winnersAdvantage?: boolean;
    skipGrandFinal?: boolean;
    skipLowerBracketFinal?: boolean;
    thirdPlaceMatch?: boolean;
    stage?: number;
    previousStageFinished?: boolean;
    maxTeams?: number;
    bracketSize?: number;
  }
}

// Change the component parameter type to use the extended interface
export function DoubleEliminationBracketView({ participants, options = {}, className, seededTeams = [], hasSeeding = false }: DoubleEliminationOptions & { seededTeams?: Participant[], hasSeeding?: boolean }) {
  const stage = options.stage ?? 1;
  const [matches, setMatches] = useState<ExtendedMatch[]>([])
  const [layoutMatches, setLayoutMatches] = useState<ExtendedMatch[]>([])
  const [isGenerated, setIsGenerated] = useState(false) // Zmiana: używamy isGenerated jak w Single Elimination
  const [isLoading, setIsLoading] = useState(false) // Dodano isLoading
  const [generator] = useState<BracketGeneratorInterface>(new DoubleEliminationGenerator())
  const [isStageReady, setIsStageReady] = useState(true);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const router = useRouter();

  // Pobierz datę startu turnieju i ustaw flagę tournamentStarted
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

  // Add automatic refresh logic for Double Elimination (similar to Single Elimination)
  useEffect(() => {
    if (!options.stage || options.stage <= 1) return;

    const previousStageId = options.stage - 1;
    let lastMatches = localStorage.getItem(`matches-stage-${previousStageId}`);
    let lastStandings = localStorage.getItem(`standings-stage-${previousStageId}`);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith(`matches-stage-${previousStageId}`) || e.key.startsWith(`standings-stage-${previousStageId}`))) {
        console.log('Double Elimination: Storage change detected, checking if previous stage is complete');
        
        // Check if the previous stage is actually complete before refreshing
        const isPreviousStageComplete = checkPreviousStageCompletion(previousStageId);
        if (isPreviousStageComplete && !hasSavedBracket(options.stage)) {
          console.log('Double Elimination: Previous stage is complete, refreshing bracket');
          setIsGenerated(false); // Force regeneration
        } else {
          console.log('Double Elimination: Previous stage not complete or bracket already saved, keeping placeholders');
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
          console.log('Double Elimination: Polling detected change and previous stage is complete, refreshing bracket');
          setIsGenerated(false); // Force regeneration
        } else {
          console.log('Double Elimination: Polling detected change but previous stage not complete or bracket already saved, keeping placeholders');
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
      
      console.log(`Double Elimination: Checking previous stage ${previousStageId} completion:`, {
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

  // Seedowanie: jeśli nie ma pełnego seedowania, przekazuj placeholdery; jeśli jest, przekazuj posortowane drużyny
  const effectiveParticipants = hasSeeding ? seededTeams : participants;

  // Usuń efekt, który resetuje/generuje drabinkę na podstawie zmiany participants, jeśli istnieje już zapisany stan
  // Zamiast tego, generuj drabinkę TYLKO jeśli shouldRegenerateBracket zwraca true
  useEffect(() => {
    if (shouldRegenerateBracket(effectiveParticipants, options)) {
      console.log('[useEffect][participants] Resetuję isGenerated z powodu zmiany participants');
      setIsGenerated(false);
    }
    // Jeśli istnieje zapisany stan, NIE rób nic
  }, [effectiveParticipants.length, options.stage, JSON.stringify(effectiveParticipants.map(p => p.id))]); // Używaj stabilnego dependency

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
          if (generator && generator.calculateBracketLayout) {
            setLayoutMatches(generator.calculateBracketLayout(parsed));
          }
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
      const hasRealTeams = effectiveParticipants.some(p =>
        p.id &&
        !p.id.startsWith('placeholder-') &&
        !p.name?.startsWith('Swiss Place') &&
        !p.name?.startsWith('Group ') &&
        !p.name?.startsWith('Slot ')
      );
      if (hasRealTeams && effectiveParticipants.length > 0) {
        generateBracket();
      } else if (effectiveParticipants.length > 0) {
        // Generate placeholder bracket if we only have placeholders
        generateBracket();
      }
    }
    // Jeśli istnieje zapisany stan lub już załadowano, NIE generuj ponownie!
  }, [isGenerated, isStageReady, stage]); // Usunięto effectiveParticipants.length z dependencies

  // Po każdej zmianie matches: natychmiast zapisuj do localStorage
  useEffect(() => {
    if (!stage) return;
    if (!matches || matches.length === 0) return; // <-- dodaj ten warunek!
    
    // Debounce save to avoid too frequent localStorage writes
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`matches-stage-${stage}`, JSON.stringify(matches));
        console.log(`[useEffect] Saved matches-stage-${stage} to localStorage`);
      } catch (e) {
        console.warn('Błąd zapisu drabinki do localStorage:', e);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [matches.length, stage, JSON.stringify(matches.map(m => ({ id: m.id, winner: m.winner, score1: m.score1, score2: m.score2 })))]); // Stabilniejsze dependency

  // Create placeholder participants for empty bracket (like Single Elimination does)
  const createPlaceholderParticipants = (): Participant[] => {
    // Ustal rozmiar drabinki na podstawie bracketSize z options
    let size = options.bracketSize || options.maxTeams || effectiveParticipants.length || 8;
    size = Math.max(2, Math.pow(2, Math.ceil(Math.log2(size))));
    size = Math.max(2, Math.min(size, 32));
    const placeholderParticipants: Participant[] = [];
    for (let i = 1; i <= size; i++) {
      placeholderParticipants.push({
        id: `placeholder-double-elimination-${i}`,
        name: `Slot ${i}`,
        logo: '',
        seed: i,
        placeholder: true
      });
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
    return effectiveParticipants;
  };

  // Funkcja generująca drabinkę (pełną lub pustą)
  const generateBracket = () => {
    // Check if we need to create placeholder participants
    const isEmptyBracket = effectiveParticipants.length === 0 || effectiveParticipants.every(p => p.placeholder);
    const participantsToUse = isEmptyBracket
      ? createPlaceholderParticipants() // Użyj dynamicznego rozmiaru
      : effectiveParticipants;

    // Pobierz aktualnych uczestników (ze statusami)
    const currentParticipants = getCurrentParticipants();

    // Always generate bracket if we have participants to use
    if (participantsToUse.length > 0) {
      setIsLoading(true);
      console.log("Generating Double Elimination bracket with options:", options);
      console.log("Empty bracket mode:", isEmptyBracket);
      console.log("Participants to use:", participantsToUse);

      const generatorOptions = {
        ...options,
        grandFinal: options.grandFinal || "single",
        usePreliminaries: options.usePreliminaries || false,
        winnersAdvantage: options.winnersAdvantage || false,
        skipGrandFinal: options.skipGrandFinal === true,
        skipLowerBracketFinal: options.skipLowerBracketFinal === true,
        thirdPlaceMatch: options.thirdPlaceMatch || false,
        participantCount: participantsToUse.length,
        emptyBracket: isEmptyBracket,
        bracketSize: participantsToUse.length, // Przekazujemy rozmiar do generatora
        participants: currentParticipants // <-- przekazujemy aktualnych uczestników
      };
      
      setTimeout(() => {
        try {
          const generatedMatches = generator.generateBracket(participantsToUse, generatorOptions) as ExtendedMatch[];
          if (!generatedMatches || generatedMatches.length === 0) {
            setIsLoading(false);
            return;
          }
          try {
            const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches) as ExtendedMatch[];
            setMatches(generatedMatches);
            setLayoutMatches(layoutCalculatedMatches);
            setIsGenerated(true);
          } catch (layoutError) {
            console.error("Error calculating layout:", layoutError);
            setMatches(generatedMatches);
            setIsGenerated(true);
          }
        } catch (error) {
          console.error("Error generating bracket:", error);
        } finally {
          setIsLoading(false);
        }
      }, 100);
    } else {
      // If no participants at all, create a minimal bracket
      console.log("No participants provided, creating minimal bracket");
      const minimalParticipants = createPlaceholderParticipants();
      const generatorOptions = {
        ...options,
        grandFinal: options.grandFinal || "single",
        usePreliminaries: false,
        winnersAdvantage: false,
        skipGrandFinal: false,
        skipLowerBracketFinal: false,
        thirdPlaceMatch: false,
        participantCount: minimalParticipants.length,
        emptyBracket: true,
        bracketSize: minimalParticipants.length,
        participants: getCurrentParticipants() // <-- przekazujemy aktualnych uczestników
      };
      
      try {
        const generatedMatches = generator.generateBracket(minimalParticipants, generatorOptions) as ExtendedMatch[];
        const layoutCalculatedMatches = generator.calculateBracketLayout(generatedMatches) as ExtendedMatch[];
        setMatches(generatedMatches);
        setLayoutMatches(layoutCalculatedMatches);
        setIsGenerated(true);
      } catch (error) {
        console.error("Error generating minimal bracket:", error);
      }
    }
  }

  useEffect(() => {
    if (!matches || matches.length === 0) return;
    
    // Zbierz ID wszystkich drużyn ze statusem 'disqualified'
    const disqualifiedIds = participants.filter(p => p.status === 'disqualified').map(p => p.id);
    if (disqualifiedIds.length === 0) return;
    
    console.log('Processing disqualifications for:', disqualifiedIds);
    
    let updated = [...matches];
    let changed = false;
    
    // Najpierw użyj autoAdvanceOnDisqualification dla bieżących meczów
    try {
      const autoAdvanced = (generator as any).autoAdvanceOnDisqualification(updated, participants);
      if (JSON.stringify(autoAdvanced) !== JSON.stringify(updated)) {
        updated = autoAdvanced;
        changed = true;
        console.log('Auto-advance applied');
      }
    } catch (error) {
      console.error('Error during auto-advance:', error);
    }
    
    // Następnie zastosuj walkover dla każdej zdyskwalifikowanej drużyny
    for (const dqId of disqualifiedIds) {
      // Sprawdź, czy ta drużyna ma jakiekolwiek mecze (wygrane lub przyszłe)
      const hasAnyMatch = updated.some(m => 
        (m.participant1?.id === dqId || m.participant2?.id === dqId)
      );
      
      if (hasAnyMatch) {
        try {
          const walkoverResult = (generator as any).walkoverDisqualification(updated, participants, dqId);
          if (JSON.stringify(walkoverResult) !== JSON.stringify(updated)) {
            updated = walkoverResult;
            changed = true;
            console.log('Walkover applied for:', dqId);
          }
        } catch (error) {
          console.error('Error during walkover disqualification for', dqId, ':', error);
        }
      }
    }
    
    if (changed) {
      console.log('Updating matches after disqualification processing');
      setMatches([...updated]);
      
      try {
        const newLayoutMatches = generator.calculateBracketLayout(updated);
        setLayoutMatches(newLayoutMatches);
      } catch (error) {
        console.error('Error calculating layout after disqualification:', error);
      }
    }
  }, [matches.length, participants.map(p => `${p.id}-${p.status}`).join(',')]); // Stabilniejsze dependencies
  
  // TAKŻE ZAKTUALIZUJ handleWinnerChange:
  const handleWinnerChange = (matchId: number, winnerId: string) => {
    console.log(`Setting winner for match ${matchId}: ${winnerId}`);
    
    // Make sure matchId is a number
    const matchIdNum = typeof matchId === 'string' ? parseInt(matchId) : matchId;
    
    // Pobierz aktualnych uczestników (ze statusami)
    const currentParticipants = getCurrentParticipants();
    
    // Wywołaj updateMatchWinnerWithParticipants z aktualnymi uczestnikami
    const updatedMatches = (generator as any).updateMatchWinnerWithParticipants(matches, matchIdNum, winnerId, currentParticipants);
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
  
  // I handleDisqualify można uprościć:
  const handleDisqualify = (teamId: string) => {
    console.log('Manual disqualification triggered for:', teamId);
    
    // Pobierz aktualnych uczestników (ze statusami)
    const currentParticipants = getCurrentParticipants();
    
    // Zastosuj dyskwalifikację
    const updatedMatches = (generator as any).walkoverDisqualification(matches, currentParticipants, teamId);
    
    setMatches([...updatedMatches]);
    setLayoutMatches(generator.calculateBracketLayout(updatedMatches));
    
    if (options.stage) {
      localStorage.setItem(`matches-stage-${options.stage}`, JSON.stringify(updatedMatches));
      console.log(`[handleDisqualify] Saved matches after disqualification`);
    }
  };

  // Helper functions
  // Add safety checks for maxWinnerRound and maxLoserRound
  const maxWinnerRound = Math.max(...(layoutMatches.filter(m => m.round > 0 && !m.grandFinal).map(m => m.round) || [0]));
  
  // Fix for loser bracket rounds when skipLowerBracketFinal is enabled
  // Only filter out the final loser bracket match, not all loser bracket matches
  const loserBracketMatches = layoutMatches.filter(m => m.round < 0);
  const maxLoserRound = loserBracketMatches.length > 0 
    ? Math.abs(Math.min(...loserBracketMatches.map(m => m.round)))
    : 0;
  
  // Add safety checks for the round labels
  const safeWinnerRoundCount = Math.max(0, Math.min(maxWinnerRound + 2, 20)); // Limit to reasonable size
  const safeLoserRoundCount = Math.max(0, Math.min(maxLoserRound + 1, 20)); // Limit to reasonable size
  
  // Calculate number of matches in each round
  const winnerMatchCountByRound = layoutMatches.reduce((acc, match) => {
    if (match.round > 0 && !match.grandFinal) {
      acc[match.round] = (acc[match.round] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const loserMatchCountByRound = layoutMatches.reduce((acc, match) => {
    if (match.round < 0) {
      const absRound = Math.abs(match.round);
      acc[absRound] = (acc[absRound] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  // Improved bracket dimensions with better spacing
  const bracketWidth = (Math.max(maxWinnerRound, maxLoserRound) + 2) * 340 + 200;

  // Improved function to get team name with better placeholder text
  const getTeamName = (participant: Participant | undefined, match: ExtendedMatch, isFirstParticipant: boolean): string => {
    // Add safety check for undefined match
    if (!match) {
      return "Unknown";
    }
    
    if (participant) {
      return participant.name;
    }
    
    // If we're using the participants array instead of participant1/participant2
    if (match.participants && match.participants.length > 0) {
      const participantIndex = isFirstParticipant ? 0 : 1;
      if (match.participants[participantIndex]) {
        return match.participants[participantIndex].name;
      }
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
        // For loser bracket matches, show "Loser of Match" for connections from winner bracket
        if (match.round < 0 && connectedMatch.round > 0) {
          return `Loser of Match #${connectedMatch.id}`;
        }
        
        // For other loser bracket matches, check if this is a connection from another loser match
        if (match.round < 0 && connectedMatch.round < 0) {
          // If the connected match is from an earlier loser round, it's a winner
          return `Winner of Match #${connectedMatch.id}`;
        }
        
        // For winner bracket matches
        return `Winner of Match #${connectedMatch.id}`;
      }
    }
    
    return "To Be Determined";
  };

  // --- POCZĄTEK ZMIANY: renderowanie pustej drabinki poprawione ---
  if (layoutMatches.length === 0 && !isLoading) {
    // Wygeneruj placeholdery (ale nie zapisuj do localStorage)
    const placeholderParticipants = createPlaceholderParticipants();
    // Wygeneruj "na żywo" pustą drabinkę (nie zapisujemy do matches/layoutMatches, tylko do lokalnej zmiennej)
    const generatorOptions = {
      ...options,
      grandFinal: options.grandFinal || "single",
      usePreliminaries: options.usePreliminaries || false,
      winnersAdvantage: options.winnersAdvantage || false,
      skipGrandFinal: options.skipGrandFinal === true,
      skipLowerBracketFinal: options.skipLowerBracketFinal === true,
      thirdPlaceMatch: options.thirdPlaceMatch || false,
      participantCount: placeholderParticipants.length,
      emptyBracket: true,
      bracketSize: placeholderParticipants.length,
      participants: placeholderParticipants
    };
    let placeholderMatches: ExtendedMatch[] = [];
    let placeholderLayoutMatches: ExtendedMatch[] = [];
    try {
      placeholderMatches = generator.generateBracket(placeholderParticipants, generatorOptions) as ExtendedMatch[];
      placeholderLayoutMatches = generator.calculateBracketLayout(placeholderMatches) as ExtendedMatch[];
    } catch {}

    // Poprawne wyliczanie rund i etykiet dla placeholderLayoutMatches
    const maxWinnerRound = Math.max(...(placeholderLayoutMatches.filter(m => m.round > 0 && !m.grandFinal).map(m => m.round) || [0]));
    const loserBracketMatches = placeholderLayoutMatches.filter(m => m.round < 0);
    const maxLoserRound = loserBracketMatches.length > 0 
      ? Math.abs(Math.min(...loserBracketMatches.map(m => m.round)))
      : 0;
    const winnerMatchCountByRound = placeholderLayoutMatches.reduce((acc, match) => {
      if (match.round > 0 && !match.grandFinal) {
        acc[match.round] = (acc[match.round] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);
    const loserMatchCountByRound = placeholderLayoutMatches.reduce((acc, match) => {
      if (match.round < 0) {
        const absRound = Math.abs(match.round);
        acc[absRound] = (acc[absRound] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return (
      <div className={cn("relative mt-8 pt-24", className)}>
        <div className="relative overflow-auto" style={{ minHeight: '800px' }}>
          <div className="relative" style={{ 
            width: `${(maxWinnerRound + 2) * 340}px`, 
            minHeight: `${calculateBracketHeight(placeholderLayoutMatches, winnerMatchCountByRound)}px` 
          }}>
            {/* Winner bracket label + round labels */}
            <div className="absolute left-0 top-0 flex flex-col w-full z-10">
              <span className="text-lg font-semibold text-yellow-500 px-4 py-2">Winner Bracket</span>
              <WinnerBracketLabels
                maxWinnerRound={maxWinnerRound}
                winnerMatchCountByRound={winnerMatchCountByRound}
                options={options}
                layoutMatches={placeholderLayoutMatches}
              />
            </div>
            {/* Loser bracket label + round labels */}
            <div className="absolute left-0 w-full z-10" style={{ top: `${(() => {
              const winnerBracketMatches = placeholderLayoutMatches.filter(m => m.round > 0 && !m.grandFinal);
              let winnerBracketBottom = 600;
              if (winnerBracketMatches.length > 0) {
                winnerBracketBottom = Math.max(...winnerBracketMatches.map(m => {
                  const pos = getMatchPosition(m, placeholderLayoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound);
                  return parseInt(pos.top) + 160;
                }));
              }
              return winnerBracketBottom + 50;
            })()}px` }}>
              <span className="text-lg font-semibold text-red-500 px-4 py-2">Loser Bracket</span>
              <LoserBracketLabels
                maxLoserRound={maxLoserRound}
                loserMatchCountByRound={loserMatchCountByRound}
                options={options}
              />
            </div>
            <DoubleEliminationConnectionLines
              layoutMatches={placeholderLayoutMatches}
              getMatchPosition={match => getMatchPosition(match, placeholderLayoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound)}
            />
            {/* Match cards */}
            {placeholderLayoutMatches.map(match => {
              const position = getMatchPosition(match, placeholderLayoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound);
              return (
                <DoubleEliminationMatchCard
                  key={`match-${match.id}`}
                  match={match}
                  position={position}
                  getTeamName={getTeamName}
                  handleWinnerChange={() => {}}
                  editable={false}
                  onDisqualify={undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  // --- KONIEC ZMIANY ---

  return (
    <div className={cn("relative", className)}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] rounded-md shadow-lg border border-[#333]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Generating bracket...</p>
        </div>
      ) : layoutMatches.length === 0 ? null : (
        <div className="relative overflow-auto" style={{ minHeight: '800px' }}>
          {/* Bracket content */}
          <div className="relative" style={{ 
            width: `${(maxWinnerRound + 2) * 340}px`, 
            minHeight: `${calculateBracketHeight(layoutMatches, winnerMatchCountByRound)}px` 
          }}>
            {/* Winner bracket label + round labels */}
            <div className="absolute left-0 top-0 flex flex-col w-full z-10">
              <span className="text-lg font-semibold text-yellow-500 px-4 py-2">Winner Bracket</span>
              <WinnerBracketLabels
                maxWinnerRound={maxWinnerRound}
                winnerMatchCountByRound={winnerMatchCountByRound}
                options={options}
                layoutMatches={layoutMatches}
              />
            </div>
            {/* Loser bracket label + round labels */}
            <div className="absolute left-0 w-full z-10" style={{ top: `${(() => {
              const winnerBracketMatches = layoutMatches.filter(m => m.round > 0 && !m.grandFinal);
              let winnerBracketBottom = 600;
              if (winnerBracketMatches.length > 0) {
                winnerBracketBottom = Math.max(...winnerBracketMatches.map(m => {
                  const pos = getMatchPosition(m, layoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound);
                  return parseInt(pos.top) + 160;
                }));
              }
              return winnerBracketBottom + 50;
            })()}px` }}>
              <span className="text-lg font-semibold text-red-500 px-4 py-2">Loser Bracket</span>
              <LoserBracketLabels
                maxLoserRound={maxLoserRound}
                loserMatchCountByRound={loserMatchCountByRound}
                options={options}
              />
            </div>
            <DoubleEliminationConnectionLines
              layoutMatches={layoutMatches}
              getMatchPosition={match => getMatchPosition(match, layoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound)}
            />
            {/* Match cards */}
            {layoutMatches.map(match => {
              const position = getMatchPosition(match, layoutMatches, winnerMatchCountByRound, maxWinnerRound, maxLoserRound);
              return (
                <DoubleEliminationMatchCard
                  key={`match-${match.id}`}
                  match={match}
                  position={position}
                  getTeamName={getTeamName}
                  handleWinnerChange={handleWinnerChange}
                  editable={tournamentStarted}
                  onDisqualify={handleDisqualify}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}