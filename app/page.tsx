"use client"

import { useState, useEffect } from "react"
import TournamentSetup from "@/components/tournament/TournamentSetup"
import { BracketView } from "@/components/tournament/BracketView"
import { useRouter } from "next/navigation"
import Teams from '@/components/tournament/overview/Teams';

// Define interfaces for type safety
interface TeamType {
  id: string
  name: string
  logo: string
  seed?: number
  status?: 'registered' | 'ready' | 'confirmed' | 'declined' | 'disqualified' | 'substitute';
}

// In the TournamentDataType interface, add the stages property
interface TournamentDataType {
  tournamentName: string
  tournamentFormat: string
  teamCount: number
  thirdPlaceMatch: boolean
  selectedTeams: TeamType[]
  selectedGame: string
  selectedMaps: string[]
  mapSelectionType: string
  // Dodajemy pola dla wyglądu
  tournamentLogo?: string
  backgroundImage?: string
  organizerLogo?: string
  organizer?: string
  // Add stages property
  stages?: {
    id: number;
    name: string;
    format: string;
  }[];
  // Dodaj nowe pola dla dat
  startDateTime?: string;
  registrationOpenDateTime?: string;
  registrationCloseDateTime?: string;
  readyOpenDateTime?: string;
  readyCloseDateTime?: string;
  formatOptions?: {
    doubleElimination?: { 
      grandFinalAdvantage: boolean; 
      thirdPlace: boolean;
      skipGrandFinal?: boolean;         // Add this property
      skipLowerBracketFinal?: boolean;  // Add this property
      grandFinal?: "single" | "double"; // Add this property for consistency
    }
    swiss?: { 
      rounds: number; 
      usePlayoffs: boolean; 
      playoffTeams: number; 
      useTiebreakers: boolean;
      tiebreakers?: string[];
      tiebreaker?: string;
      swissMode?: 'playAllRounds' | 'topCut';
    }
    roundRobin?: {
      groups: number;
      usePlayoffs: boolean;
      playoffTeams: number;
      doubleRoundRobin: boolean;
      useTiebreakers: boolean;
      tiebreakers?: string[];
      roundRobinTiebreaker?: string;
      advancingTeams?: number; // Dodajemy właściwość advancingTeams
    }
    roundGroups?: {
      groupCount: number;
      teamsPerGroup: number;
      qualificationMatches: boolean;
    }
  }
  endCondition: string;
  winsRequired: number;
  lossesElimination: number;
  swissMode?: 'playAllRounds' | 'topCut';
  tiebreaker?: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL';
  [key: string]: any; // For any additional properties
  
  // Dodaj nowe pola dla Prize Pool
  prizePool?: string;
  prizeDistribution?: string;
  customPrizeDistribution?: Record<string, number>;
  admins?: { name: string; role: string; avatar?: string }[];
}

export default function Home() {
  const [tournamentData, setTournamentData] = useState<TournamentDataType | null>(null)
  const [participants, setParticipants] = useState<TeamType[]>([])
  const [activeStageSetup, setActiveStageSetup] = useState<number | null>(null)
  const router = useRouter()
  const [selectedTeams, setSelectedTeams] = useState<TeamType[]>([]);
  const [substituteTeams, setSubstituteTeams] = useState<TeamType[]>([]);

  // When stages are updated, set the active stage to the first one if not already set
  useEffect(() => {
    if (tournamentData?.stages && tournamentData.stages.length > 0 && activeStageSetup === null) {
      setActiveStageSetup(tournamentData.stages[0].id);
    }
  }, [tournamentData?.stages, activeStageSetup]);

  const handleGenerateBracket = (data: TournamentDataType) => {
    // Process the tournament data from TournamentSetup
    // Rozdziel selectedTeams i substituteTeams
    const mainTeams = data.selectedTeams.filter(t => t.status !== 'substitute');
    const subs = data.selectedTeams.filter(t => t.status === 'substitute');
    const dataWithSubs = { ...data, selectedTeams: mainTeams, substituteTeams: subs };
    localStorage.setItem('tournamentData', JSON.stringify(dataWithSubs));
    setTournamentData(dataWithSubs);
    setSelectedTeams(mainTeams);
    setSubstituteTeams(subs);
    
    // Ensure admins/roles are always present and compatible
    const admins = (data.admins || []).map((admin: any) => ({
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar || undefined
    }));
    const dataWithAdmins = { ...data, admins };
    // Save tournament data to localStorage for the bracket page
    localStorage.setItem('tournamentData', JSON.stringify(dataWithAdmins))
    
    // Navigate to the OVERVIEW page
    router.push('/overview')
  }

  // Prepare options based on tournament format
  const getOptions = () => {
    if (!tournamentData) return { format: 'single-elimination' }
    
    const format = tournamentData.tournamentFormat.toLowerCase().trim()
    
    // Define valid tiebreaker values
    const validTiebreakers = [
      'buchholz', 'medianBuchholz', 'gameWin', 'headToHead', 'matchesPlayed', 'gameWL'
    ] as const;
    
    // Get tiebreaker with validation
    const getTiebreaker = (value: string | undefined) => {
      if (!value || !validTiebreakers.includes(value as any)) {
        return 'buchholz';
      }
      return value as typeof validTiebreakers[number];
    };
    
    return {
      format: format,
      thirdPlaceMatch: tournamentData.thirdPlaceMatch || false,
      
      // Format-specific options
      ...(format === 'single-elimination' && {
        usePreliminaries: false
      }),
      
      ...(format === 'double-elimination' && {
        winnersAdvantage: tournamentData.formatOptions?.doubleElimination?.grandFinalAdvantage || false,
        skipGrandFinal: tournamentData.formatOptions?.doubleElimination?.skipGrandFinal || false,
        skipLowerBracketFinal: tournamentData.formatOptions?.doubleElimination?.skipLowerBracketFinal || false,
        thirdPlaceMatch: tournamentData.formatOptions?.doubleElimination?.thirdPlace || false,
        grandFinal: tournamentData.formatOptions?.doubleElimination?.grandFinalAdvantage ? "double" : "single"
      }),
      
      ...(format === 'round-robin' && {
        roundRobinGroups: tournamentData.formatOptions?.roundRobin?.groups || 1,
        doubleRoundRobin: tournamentData.formatOptions?.roundRobin?.doubleRoundRobin || false,
        usePlayoffs: tournamentData.formatOptions?.roundRobin?.usePlayoffs || false,
        playoffTeams: tournamentData.formatOptions?.roundRobin?.playoffTeams || 0,
        roundRobinAdvancingTeams: tournamentData.formatOptions?.roundRobin?.advancingTeams || 1,
      }),
      
      ...(format === 'swiss' && {
        rounds: tournamentData.formatOptions?.swiss?.rounds || 0,
        swissMode: tournamentData.formatOptions?.swiss?.swissMode || 'topCut',
        tiebreaker: getTiebreaker(tournamentData.formatOptions?.swiss?.tiebreaker)
      }),
      
      ...(format === 'round-groups' && {
        groupCount: tournamentData.formatOptions?.roundGroups?.groupCount || 4,
        teamsPerGroup: tournamentData.formatOptions?.roundGroups?.teamsPerGroup || 4,
        qualificationMatches: tournamentData.formatOptions?.roundGroups?.qualificationMatches !== false
      })
    }
  }

  const isSwissStageComplete = (stageId: number) => {
    const matchesRaw = localStorage.getItem(`matches-stage-${stageId}`);
    if (!matchesRaw) return false;
    const matches = JSON.parse(matchesRaw);
    if (!Array.isArray(matches) || matches.length === 0) return false;
    return matches.every((match: any) => match.winner);
  };

  return (
    <div>
      <TournamentSetup onGenerateBracket={data => handleGenerateBracket(data as any)} activeStageSetup={activeStageSetup} setActiveStageSetup={setActiveStageSetup} />
    </div>
  );
}