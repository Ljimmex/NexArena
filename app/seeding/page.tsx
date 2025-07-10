"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Shuffle, ChevronLeft, Undo, Lock, Unlock, Info, Edit, ArrowDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SeedingPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [seedMode, setSeedMode] = useState<'competitive' | 'manual'>('competitive');
  const [lockedSeeds, setLockedSeeds] = useState<number[]>([]);
  const [seedHistory, setSeedHistory] = useState<any[][]>([]);
  const [groups, setGroups] = useState<{[key: string]: any[]}>({});
  const [groupCount, setGroupCount] = useState<number>(2);
  const [unassignedTeams, setUnassignedTeams] = useState<any[]>([]);
  const [hoveredSlot, setHoveredSlot] = useState<{groupKey: string, index: number} | null>(null);
  const router = useRouter();

  // --- Dodaję teamsPerGroup na górze komponentu, by był dostępny wszędzie ---
  const teamsPerGroup = tournamentData?.formatOptions?.roundRobin?.teamsPerGroup ||
    tournamentData?.formatOptions?.roundRobinTeamsPerGroup ||
    Math.ceil((tournamentData?.selectedTeams?.length || 0) / groupCount) || 4;
  const totalSlots = groupCount * teamsPerGroup;
  const qualifiedCount = tournamentData?.formatOptions?.roundRobin?.qualifiedCount || 0;

  useEffect(() => {
    // Pobierz dane turnieju z localStorage
    const data = localStorage.getItem("tournamentData");
    if (data) {
      const parsed = JSON.parse(data);
      setTournamentData(parsed);
      // Po pobraniu tournamentData, wyciągnij tylko drużyny ze statusem 'ready'
      const readyTeams = parsed.selectedTeams?.filter((t: any) => t.status === 'ready') || [];
      setTeams(readyTeams);
      
      // Pobierz liczbę grup z ustawień Round Robin
      const roundRobinGroups = parsed.formatOptions?.roundRobin?.groups || 2;
      setGroupCount(roundRobinGroups);
      
      // Dodaj historię dla cofania zmian
      setSeedHistory([readyTeams]);
      
      // Zawsze inicjalizuj grupy, niezależnie od trybu
      const newGroups: {[key: string]: any[]} = {};
      const newUnassigned: any[] = [];
      
      // Inicjalizuj puste grupy z placeholderami
      for (let i = 0; i < roundRobinGroups; i++) {
        const groupKey = String.fromCharCode(65 + i); // A, B, C, ...
        newGroups[groupKey] = [];
        
        // Dodaj placeholdery dla pustych miejsc w grupie
        for (let j = 0; j < teamsPerGroup; j++) {
          newGroups[groupKey].push({
            id: `placeholder-${groupKey}${j+1}`,
            name: `Puste miejsce ${j+1}`,
            logo: '',
            seed: i * teamsPerGroup + j + 1,
            placeholder: true,
            standingId: `${groupKey}${j+1}`,
            standingPosition: j+1,
            group: i+1,
            groupPosition: j+1
          });
        }
      }
      
      // Przypisz drużyny do grup na podstawie standingId, zastępując placeholdery
      readyTeams.forEach((team: any) => {
        if (team.standingId && typeof team.standingId === 'string' && team.standingId.length >= 2) {
          const groupKey = team.standingId.charAt(0);
          const position = parseInt(team.standingId.substring(1)) - 1;
          
          if (newGroups[groupKey] && position >= 0 && position < teamsPerGroup) {
            // Zastąp placeholder rzeczywistą drużyną
            newGroups[groupKey][position] = team;
          } else {
            newUnassigned.push(team);
          }
        } else {
          newUnassigned.push(team);
        }
      });
      
      // Sortuj drużyny w grupach według pozycji
      Object.keys(newGroups).forEach(key => {
        newGroups[key].sort((a, b) => {
          const posA = a.standingId ? parseInt(a.standingId.substring(1)) : 0;
          const posB = b.standingId ? parseInt(b.standingId.substring(1)) : 0;
          return posA - posB;
        });
      });
      
      setGroups(newGroups);
      setUnassignedTeams(newUnassigned);
    }
  }, []);

  useEffect(() => {
    if (seedMode === 'competitive') {
      setTeams([]);
      setUnassignedTeams(tournamentData?.selectedTeams?.filter((t: any) => t.status === 'ready') || []);
    }
  }, [seedMode, tournamentData]);

  // Funkcja pomocnicza do wyliczania unassignedTeams na podstawie wszystkich drużyn i aktualnego rozstawienia
  function getUnassignedTeams(allTeams: any[], assignedIds: Set<string>) {
    return allTeams.filter(team => !assignedIds.has(team.id));
  }

  // Funkcja pomocnicza: generuje standingId slotów w kolejności grupowej (A1, A2, B1, ...)
  function getStandingIdForSlot(idx: number, teamsPerGroup: number) {
    const groupIdx = Math.floor(idx / teamsPerGroup);
    const posInGroup = idx % teamsPerGroup + 1;
    const groupKey = String.fromCharCode(65 + groupIdx);
    return `${groupKey}${posInGroup}`;
  }

  // Funkcja pomocnicza: standingId slotu w grupie
  function getGroupStandingId(groupKey: string, idx: number) {
    return `${groupKey}${idx + 1}`;
  }

  // Funkcja pomocnicza do zapisywania aktualnego rozstawienia do localStorage
  function saveSeedingToLocalStorage(mode: 'competitive' | 'manual', teams: any[], groups: {[key: string]: any[]}, tournamentData: any) {
    let teamsWithStandingId: any[] = [];
    if (mode === 'competitive') {
      teamsWithStandingId = teams.map((team, idx) => ({
        ...team,
        standingId: getStandingIdForSlot(idx, teamsPerGroup),
        seed: idx+1,
        standingPosition: idx+1,
        group: Math.floor(idx / teamsPerGroup) + 1,
        groupPosition: (idx % teamsPerGroup) + 1,
        matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0
      }));
    } else {
      teamsWithStandingId = Object.entries(groups).flatMap(([groupKey, groupArr]) =>
        groupArr.filter((t: any) => t && !t.placeholder).map((team: any, idx: number) => ({
          ...team,
          standingId: `${groupKey}${idx+1}`,
          seed: undefined,
          standingPosition: idx+1,
          group: groupKey.charCodeAt(0) - 64,
          groupPosition: idx+1,
          matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0
        }))
      );
    }
    // Dodaj nieprzypisane drużyny bez standingId
    const assignedIds = new Set(teamsWithStandingId.map((t: any) => t.id));
    const allTeams = tournamentData.selectedTeams || [];
    const unassigned = allTeams.filter((t: any) => !assignedIds.has(t.id)).map((t: any) => ({ ...t, standingId: undefined }));
    const updatedTeams = [...teamsWithStandingId, ...unassigned];
    const updatedData = {
      ...tournamentData,
      selectedTeams: updatedTeams
    };
    localStorage.setItem("tournamentData", JSON.stringify(updatedData));
  }

  // Synchronizacja rozstawienia i puli drużyn między trybami
  useEffect(() => {
    if (!tournamentData) return;
    const readyTeams = tournamentData.selectedTeams?.filter((t: any) => t.status === 'ready') || [];
    if (seedMode === 'competitive') {
      // Jeśli teams już istnieje i ma standingId, nie nadpisuj
      if (teams.length > 0 && teams.every(t => t.standingId && /^[A-Z][0-9]+$/.test(t.standingId))) return;
      const sorted = [...readyTeams].filter(t => t.standingId && /^[A-Z][0-9]+$/.test(t.standingId)).sort((a, b) => {
        if (a.standingId < b.standingId) return -1;
        if (a.standingId > b.standingId) return 1;
        return 0;
      });
      setTeams(sorted);
      const assignedIds = new Set(sorted.map((t: any) => t.id));
      setUnassignedTeams(getUnassignedTeams(readyTeams, assignedIds));
    } else if (seedMode === 'manual') {
      // Jeśli grupy już istnieją i mają standingId, nie nadpisuj
      if (Object.values(groups).flat().some(t => t && t.standingId && /^[A-Z][0-9]+$/.test(t.standingId))) return;
      const roundRobinGroups = tournamentData?.formatOptions?.roundRobin?.groups || groupCount;
      const newGroups: {[key: string]: any[]} = {};
      for (let i = 0; i < roundRobinGroups; i++) {
        const groupKey = String.fromCharCode(65 + i);
        newGroups[groupKey] = [];
      }
      const unassigned: any[] = [];
      readyTeams.forEach((team: any) => {
        if (team.standingId && /^[A-Z][0-9]+$/.test(team.standingId)) {
          const groupKey = team.standingId.charAt(0);
          const pos = parseInt(team.standingId.slice(1)) - 1;
          if (newGroups[groupKey]) newGroups[groupKey][pos] = team;
          else unassigned.push(team);
        } else {
          unassigned.push(team);
        }
      });
      setGroups(newGroups);
      setUnassignedTeams(unassigned);
    }
  }, [seedMode, tournamentData]);

  // Funkcja do obsługi przeciągania i upuszczania
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    if (seedMode === 'competitive') {
      const newTeams = Array.from(teams);
      const [removed] = newTeams.splice(result.source.index, 1);
      newTeams.splice(result.destination.index, 0, removed);
      setTeams(newTeams);
      // Zaktualizuj standingId i zapisz do localStorage
      saveSeedingToLocalStorage('competitive', newTeams, groups, tournamentData);
    } else {
      const sourceDroppableId = result.source.droppableId;
      const destinationDroppableId = result.destination.droppableId;
      const sourceIndex = result.source.index;
      const destIndex = result.destination.index;
      const newGroups = {...groups};
      const sourceGroup = [...newGroups[sourceDroppableId]];
      const destGroup = sourceDroppableId === destinationDroppableId ? sourceGroup : [...newGroups[destinationDroppableId]];
      const movedTeam = sourceGroup[sourceIndex];
      if (!movedTeam || movedTeam.placeholder) return;
      // Jeśli docelowa drużyna jest zablokowana, nie pozwól na zamianę
      const destTeam = destGroup[destIndex];
      const destTeamSeed = teams.findIndex((t: any) => t.id === destTeam?.id) + 1;
      if (destTeam && !destTeam.placeholder && lockedSeeds.includes(destTeamSeed)) return;
      // Zamiana miejscami jeśli na drużynę, nadpisanie jeśli placeholder
      if (destGroup[destIndex]?.placeholder) {
        sourceGroup.splice(sourceIndex, 1);
        destGroup.splice(destIndex, 1, movedTeam);
      } else {
        // SWAP
        [sourceGroup[sourceIndex], destGroup[destIndex]] = [destGroup[destIndex], sourceGroup[sourceIndex]];
      }
      newGroups[sourceDroppableId] = sourceGroup;
      newGroups[destinationDroppableId] = destGroup;
        setGroups(newGroups);
      saveSeedingToLocalStorage('manual', teams, newGroups, tournamentData);
    }
  };

  // Funkcja do losowego rozstawienia drużyn
  const shuffleTeams = () => {
    if (seedMode === 'competitive') {
      const shuffled = [...unassignedTeams, ...teams].sort(() => Math.random() - 0.5).slice(0, totalSlots);
      setTeams(shuffled);
      setUnassignedTeams([]);
      saveSeedingToLocalStorage('competitive', shuffled, groups, tournamentData);
    } else {
      // Logika dla trybu manual (grupy)
      const newGroups = {...groups};
      
      // Tasuj każdą grupę osobno
      Object.keys(newGroups).forEach(groupKey => {
        newGroups[groupKey] = [...newGroups[groupKey]].sort(() => Math.random() - 0.5);
      });
      
      setGroups(newGroups);
      
      // Aktualizuj również główną listę drużyn
      const allTeams = Object.values(newGroups).flat();
      setTeams(allTeams.map((team, index) => ({
        ...team,
        seed: index + 1
      })));
      
      // Aktualizuj dane w localStorage
      if (tournamentData) {
        const updatedData = {
          ...tournamentData,
          selectedTeams: allTeams.map((team, index) => ({
            ...team,
            seed: index + 1
          }))
        };
        localStorage.setItem("tournamentData", JSON.stringify(updatedData));
      }
    }
  };

  // Funkcja do cofania ostatniej zmiany
  const undoLastChange = () => {
    if (seedHistory.length > 1) {
      const previousState = seedHistory[seedHistory.length - 1];
      const newHistory = seedHistory.slice(0, -1);
      
      setTeams(previousState);
      
      // Aktualizuj również grupy
      if (seedMode === 'manual') {
        // Pobierz liczbę grup z ustawień Round Robin
        const roundRobinGroups = tournamentData?.formatOptions?.roundRobin?.groups || groupCount;
        
        // Tworzymy nowe grupy na podstawie poprzedniego stanu drużyn
        const newGroups: {[key: string]: any[]} = {};
        const teamsPerGroup = Math.ceil(previousState.length / roundRobinGroups);
        
        // Tworzenie grup od A do Z (w zależności od liczby grup)
        for (let i = 0; i < roundRobinGroups; i++) {
          const groupKey = String.fromCharCode(65 + i); // A, B, C, ...
          const startIdx = i * teamsPerGroup;
          const endIdx = Math.min((i + 1) * teamsPerGroup, previousState.length);
          newGroups[groupKey] = previousState.slice(startIdx, endIdx);
        }
        
        setGroups(newGroups);
      }
      
      setSeedHistory(newHistory);
      
      // Aktualizuj dane w localStorage
      if (tournamentData) {
        const updatedData = {
          ...tournamentData,
          selectedTeams: previousState
        };
        localStorage.setItem("tournamentData", JSON.stringify(updatedData));
      }
    }
  };

  // Funkcja do blokowania/odblokowywania pojedynczego seeda
  const toggleLockSeed = (seedIndex: number) => {
    if (lockedSeeds.includes(seedIndex)) {
      setLockedSeeds(lockedSeeds.filter(seed => seed !== seedIndex));
    } else {
      setLockedSeeds([...lockedSeeds, seedIndex]);
    }
  };

  // Funkcja do blokowania wszystkich seedów
  const lockAllSeeds = () => {
    const allSeeds = teams.map((_, index) => index + 1);
    setLockedSeeds(allSeeds);
  };

  // Funkcja do odblokowywania wszystkich seedów
  const unlockAllSeeds = () => {
    setLockedSeeds([]);
  };

  // Funkcja do sortowania drużyn według pre-seed
  const sortByPreSeed = () => {
    // Zapisz aktualny stan do historii przed zmianą
    setSeedHistory([...seedHistory, [...teams]]);
    
    if (seedMode === 'competitive') {
      // Sortuj drużyny według pre-seed (zakładamy, że pre-seed jest zapisany w polu preSeed)
      const sortedTeams = [...teams].sort((a, b) => (a.preSeed || 999) - (b.preSeed || 999));
      
      // Aktualizuj seedy po sortowaniu
      const updatedTeams = sortedTeams.map((team, index) => ({
        ...team,
        seed: index + 1
      }));
      
      setTeams(updatedTeams);
      
      // Aktualizuj dane w localStorage
      if (tournamentData) {
        const updatedData = {
          ...tournamentData,
          selectedTeams: updatedTeams
        };
        localStorage.setItem("tournamentData", JSON.stringify(updatedData));
      }
    } else {
      // Logika dla trybu manual (grupy)
      const newGroups = {...groups};
      
      // Sortuj każdą grupę osobno według pre-seed
      Object.keys(newGroups).forEach(groupKey => {
        newGroups[groupKey] = [...newGroups[groupKey]].sort((a, b) => (a.preSeed || 999) - (b.preSeed || 999));
      });
      
      setGroups(newGroups);
      
      // Aktualizuj również główną listę drużyn
      const allTeams = Object.values(newGroups).flat();
      setTeams(allTeams.map((team, index) => ({
        ...team,
        seed: index + 1
      })));
      
      // Aktualizuj dane w localStorage
      if (tournamentData) {
        const updatedData = {
          ...tournamentData,
          selectedTeams: allTeams.map((team, index) => ({
            ...team,
            seed: index + 1
          }))
        };
        localStorage.setItem("tournamentData", JSON.stringify(updatedData));
      }
    }
  };

  // Funkcja do zmiany trybu rozstawiania
  const handleSeedModeChange = (value: 'competitive' | 'manual') => {
    setSeedMode(value);
    
    // Jeśli zmieniamy na tryb manual, inicjalizuj puste grupy
    if (value === 'manual') {
      // Pobierz liczbę grup z ustawień Round Robin
      const roundRobinGroups = tournamentData?.formatOptions?.roundRobin?.groups || groupCount;
      
      // Tworzymy nowe puste grupy
      const newGroups: {[key: string]: any[]} = {};
      
      // Tworzenie grup od A do Z (w zależności od liczby grup)
      for (let i = 0; i < roundRobinGroups; i++) {
        const groupKey = String.fromCharCode(65 + i); // A, B, C, ...
        newGroups[groupKey] = [];
      }
      
      // Wszystkie drużyny trafiają do puli niezaprzypisowanych
      setUnassignedTeams([...teams]);
      setGroups(newGroups);
    }
  };

  // Funkcja do zapisania i przejścia do drabinki
  const saveAndContinue = () => {
    router.push('/bracket');
  };

  // Funkcja do zapisywania grup i przypisywania standingId
  const saveGroups = () => {
    saveSeedingToLocalStorage(seedMode, teams, groups, tournamentData);
    router.push('/bracket');
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* Górny pasek z przyciskiem powrotu */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="ml-4 flex items-center">
            <span className="text-sm text-gray-400">Seed - {tournamentData?.tournamentName || "Tournament"}</span>
          </div>
          
          <div className="ml-auto flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={undoLastChange} disabled={seedHistory.length <= 1} className="text-xs">
                    <Undo className="h-3 w-3 mr-1" />
                    Undo
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cofnij ostatnią zmianę w rozstawieniu</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={lockAllSeeds} className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Lock Pre-seed
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zablokuj wszystkie aktualne pozycje drużyn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={unlockAllSeeds} className="text-xs">
                    <Unlock className="h-3 w-3 mr-1" />
                    Unlock All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Odblokuj wszystkie zablokowane pozycje</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={shuffleTeams} className="text-xs">
                    <Shuffle className="h-3 w-3 mr-1" />
                    Shuffle
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Losowo rozstawia drużyny</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={sortByPreSeed} className="text-xs">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Sort Pre-seed
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sortuje drużyny według pre-seed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs" onClick={saveGroups}>
              Save
            </Button>
          </div>
        </div>
        
        {/* Tryby rozstawiania */}
        <div className="mb-6 bg-[#111] border border-[#222] rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tryb rozstawiania</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={seedMode === 'competitive' ? "default" : "outline"}
                size="sm"
                onClick={() => handleSeedModeChange('competitive')}
                className={seedMode === 'competitive' ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Competitive
              </Button>
              <Button
                variant={seedMode === 'manual' ? "default" : "outline"}
                size="sm"
                onClick={() => handleSeedModeChange('manual')}
                className={seedMode === 'manual' ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Manual
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <div className="mb-2">
              <strong>DOSTĘPNE OPCJE:</strong>
            </div>
            <ul className="space-y-1">
              <li className="flex items-start">
                <Lock className="h-3 w-3 mr-2 mt-0.5 text-yellow-500" />
                <span><strong>Lock Pre-seed</strong> - Blokuje wszystkie aktualne pozycje drużyn</span>
              </li>
              <li className="flex items-start">
                <Unlock className="h-3 w-3 mr-2 mt-0.5 text-green-500" />
                <span><strong>Unlock All</strong> - Odblokowuje wszystkie zablokowane pozycje</span>
              </li>
              <li className="flex items-start">
                <Undo className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                <span><strong>Undo</strong> - Cofa ostatnią zmianę w rozstawieniu</span>
              </li>
              <li className="flex items-start">
                <Shuffle className="h-3 w-3 mr-2 mt-0.5 text-purple-500" />
                <span><strong>Shuffle</strong> - Losowo rozstawia drużyny</span>
              </li>
              <li className="flex items-start">
                <ArrowDown className="h-3 w-3 mr-2 mt-0.5 text-orange-500" />
                <span><strong>Sort by pre-seed</strong> - Sortuje drużyny według pre-seed</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-row gap-4">
            {/* Dostępne drużyny po lewej */}
            <div className="w-72 shrink-0 h-fit sticky top-4">
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Dostępne drużyny</h2>
                  <span className="text-xs text-gray-400">{unassignedTeams.length}</span>
                </div>
                <Droppable droppableId="unassigned">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                      className="space-y-2 min-h-[200px]"
                >
                      {unassignedTeams.length === 0 ? (
                        <div className="flex items-center justify-center p-3 rounded-md border-2 border-dashed border-[#444] bg-[#181c23] opacity-80 min-h-[56px] text-gray-400">
                          Brak dostępnych drużyn
                        </div>
                      ) : (
                        unassignedTeams.map((team, index) => {
                          return (
                    <Draggable
                      key={team.id}
                      draggableId={team.id}
                      index={index}
                              isDragDisabled={false}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                                  className={`flex items-center justify-between p-3 rounded-md border border-[#333] bg-[#222] hover:border-[#444]`}
                        >
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-3 text-gray-400">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="flex items-center">
                              {team.logo && (
                                <div className="w-8 h-8 mr-3 rounded-md overflow-hidden">
                                  <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="font-medium">{team.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                          );
                        })
                      )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
            </div>
            {/* Tryb Competitive lub Manual */}
            <div className="flex-grow">
              {seedMode === 'competitive' ? (
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                  <h2 className="text-xl font-semibold mb-4">Rozstawienie drużyn</h2>
                  <Droppable droppableId="teams">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 min-h-[200px]"
                      >
                        {(teams.length === 0
                          ? Array.from({length: totalSlots}, (_, i) => ({ placeholder: true, id: `placeholder-competitive-${getStandingIdForSlot(i, teamsPerGroup)}` }))
                          : [
                              ...teams,
                              ...Array.from({length: Math.max(0, totalSlots - teams.length)}, (_, i) => ({ placeholder: true, id: `placeholder-competitive-${getStandingIdForSlot(teams.length + i, teamsPerGroup)}` }))
                            ]
                        ).map((team: any, index: number) => {
                          const slotStandingId = getStandingIdForSlot(index, teamsPerGroup);
                          if (team.placeholder) {
                            return (
                              <div
                                key={`placeholder-competitive-${slotStandingId}`}
                                className="flex items-center justify-between p-3 rounded-md border-2 border-dashed border-[#444] bg-[#181c23] opacity-80 min-h-[56px]"
                              >
                                <div className="flex items-center">
                                  <Badge className="mr-3 bg-gradient-to-br from-yellow-400 to-yellow-700 text-black font-bold shadow border border-yellow-600 text-base">{slotStandingId}</Badge>
                                  <span className="text-gray-400">Empty slot</span>
                                </div>
                              </div>
                            );
                          }
                          const isLocked = lockedSeeds.includes(index + 1);
                          const isQualified = typeof qualifiedCount === 'number' && index < qualifiedCount;
                          return (
                            <Draggable
                              key={`team-${team.id}`}
                              draggableId={team.id}
                              index={index}
                              isDragDisabled={isLocked}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center justify-between p-3 rounded-md border-2 ${
                                    isLocked
                                      ? 'border-yellow-500 bg-yellow-500/10'
                                      : isQualified ? 'border-4 border-yellow-400 bg-yellow-100/10' : 'border-[#333]'
                                  }`}
                                >
                                  {isQualified && (
                                    <span className="absolute top-1 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow">AWANS</span>
                                  )}
                                  <div className="flex items-center">
                                    <div {...provided.dragHandleProps} className="mr-3 text-gray-400">
                                      <GripVertical className="h-5 w-5" />
                                    </div>
                                    <Badge className="mr-3 bg-gradient-to-br from-yellow-400 to-yellow-700 text-black font-bold shadow border border-yellow-600 text-base">{slotStandingId}</Badge>
                                    <div className="flex items-center">
                                      {team.logo && (
                                        <div className="w-8 h-8 mr-3 rounded-md overflow-hidden">
                                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                      <span className="font-medium">{team.name}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleLockSeed(index + 1)}
                                    className="h-8 w-8"
                                  >
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <Unlock className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(groups).map((groupKey) => {
                    const teamsInGroup = groups[groupKey] || [];
                    const slots = Array.from({length: teamsPerGroup}, (_, i) => (teamsInGroup[i] as any) || { placeholder: true, id: `placeholder-${groupKey}${i+1}` });
                    const teamsCount = teamsInGroup.filter((t: any) => t && !t.placeholder).length;
                    return (
                      <div key={groupKey} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold">Grupa {groupKey}</h2>
                          <span className="text-xs text-gray-400">{teamsCount}/{teamsPerGroup}</span>
            </div>
                        <Droppable droppableId={groupKey}>
                          {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                              onDragOver={e => {
                                if (snapshot.isDraggingOver) setHoveredSlot({groupKey, index: -1});
                              }}
                              onDrop={e => setHoveredSlot(null)}
                            >
                              {slots.map((team: any, index: number) => {
                                const slotStandingId = getGroupStandingId(groupKey, index);
                                const isHovered = hoveredSlot && hoveredSlot.groupKey === groupKey && hoveredSlot.index === index;
                                if (team.placeholder) {
                                  return (
                                    <div
                                      key={`placeholder-manual-${groupKey}-${slotStandingId}`}
                                      className="flex items-center justify-between p-3 rounded-md border-2 border-dashed border-[#444] bg-[#181c23] opacity-80 min-h-[56px]"
                                    >
                                      <div className="flex items-center">
                                        <Badge className="mr-3 bg-gradient-to-br from-yellow-400 to-yellow-700 text-black font-bold shadow border border-yellow-600 text-base">{slotStandingId}</Badge>
                                        <span className="text-gray-400">Empty slot</span>
                                      </div>
                                    </div>
                                  );
                                }
                      const teamSeed = teams.findIndex(t => t.id === team.id) + 1;
                      const isLocked = lockedSeeds.includes(teamSeed);
                                const isQualified = typeof qualifiedCount === 'number' && teamSeed <= qualifiedCount;
                      return (
                        <Draggable
                                    key={`team-${team.id}`}
                          draggableId={team.id}
                          index={index}
                          isDragDisabled={isLocked}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                                        className={`flex items-center justify-between p-3 rounded-md border-2 ${
                                          isHovered ? 'border-yellow-400 shadow-lg' : isQualified ? 'border-4 border-yellow-400 bg-yellow-100/10' : isLocked ? 'border-yellow-500' : 'border-[#333]'
                                        } bg-[#181c23] ${team.placeholder ? 'opacity-80' : ''} min-h-[56px] relative`}
                                        onDragEnter={() => setHoveredSlot({groupKey, index})}
                                        onDragLeave={() => setHoveredSlot(null)}
                                      >
                                        {isQualified && (
                                          <span className="absolute top-1 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow">AWANS</span>
                                        )}
                              <div className="flex items-center">
                                          <div {...provided.dragHandleProps} className="mr-3 text-gray-400 cursor-move">
                                  <GripVertical className="h-5 w-5" />
                                </div>
                                          <Badge className="mr-3 bg-gradient-to-br from-yellow-400 to-yellow-700 text-black font-bold shadow border border-yellow-600 text-base">{slotStandingId}</Badge>
                                <div className="flex items-center">
                                  {team.logo && (
                                              <div className="w-8 h-8 mr-3 rounded-md overflow-hidden bg-[#181c23] border border-[#333]">
                                      <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                            <span className="font-medium text-white">{team.name}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleLockSeed(teamSeed)}
                                className="h-8 w-8"
                              >
                                {isLocked ? (
                                  <Lock className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
      </DragDropContext>
      </div>
    </div>
  );
}