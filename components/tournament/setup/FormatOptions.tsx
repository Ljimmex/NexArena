import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Search, X, GripVertical, Medal, Info, HelpCircle, Trophy, Settings, Brackets  } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import TournamentStages from "./TournamentStages";
import { Slider } from "@/components/ui/slider";

interface FormatOptionsProps {
  tournamentFormat: string;
  thirdPlaceMatch: boolean;
  setThirdPlaceMatch: (value: boolean) => void;
  grandFinalAdvantage: boolean;
  setGrandFinalAdvantage: (value: boolean) => void;
  doubleElimThirdPlace: boolean;
  setDoubleElimThirdPlace: (value: boolean) => void;
  roundRobinRematches: boolean;
  setRoundRobinRematches: (value: boolean) => void;
  roundRobinPlayoffs: boolean;
  setRoundRobinPlayoffs: (value: boolean) => void;
  roundRobinPlayoffTeams: number;
  setRoundRobinPlayoffTeams: (value: number) => void;
  roundRobinAdvancingTeams: number;
  setRoundRobinAdvancingTeams: (value: number) => void;
  teamCount: string;
  customTeamCount: boolean;
  customCount: number;
  roundRobinGroups: number;
  setRoundRobinGroups: (groups: number) => void;
  swissRounds: number;
  setSwissRounds: (value: number) => void;
  swissPlayoffs: boolean;
  setSwissPlayoffs: (value: boolean) => void;
  swissPlayoffTeams: number;
  setSwissPlayoffTeams: (value: number) => void;
  options: {
    swissMode?: 'playAllRounds' | 'topCut';
    tiebreaker?: string;
    roundRobinTiebreaker?: string;
    useTiebreakers?: boolean;
    tiebreakers?: string[];
    roundRobinAdvancingTeams?: number;
    scoreConfig?: {
      win: number;
      loss: number;
      draw: number;
      bye: number;
      winOvertime: number;
      lossOvertime: number;
    };
    teamsPerGroup?: number;
  };
  setOptions: (options: any) => void;
  skipGrandFinal: boolean;
  setSkipGrandFinal: (value: boolean) => void;
  skipLowerBracketFinal: boolean;
  setSkipLowerBracketFinal: (value: boolean) => void;
  roundGroupsCount: number;
  stageId?: number;
  activeStageSetup?: number | null;
  activeStageFormat?: string;
}

export default function FormatOptions({
  tournamentFormat,
  thirdPlaceMatch,
  setThirdPlaceMatch,
  grandFinalAdvantage,
  setGrandFinalAdvantage,
  doubleElimThirdPlace,
  setDoubleElimThirdPlace,
  roundRobinRematches,
  setRoundRobinRematches,
  roundRobinAdvancingTeams,
  setRoundRobinAdvancingTeams,
  teamCount,
  setTeamCount,
  customTeamCount,
  setCustomTeamCount,
  customCount,
  setCustomCount,
  swissRounds,
  setSwissRounds,
  options,
  setOptions,
  skipGrandFinal,
  setSkipGrandFinal,
  skipLowerBracketFinal,
  setSkipLowerBracketFinal,
  activeStageFormat,
  stagesFormats = [],
  tournamentStages = [],
  setTournamentStages,
  activeStageSetup,
  setActiveStageSetup,
  roundRobinGroups,
  setRoundRobinGroups,
  ...rest
}: FormatOptionsProps & { stagesFormats?: string[], tournamentStages?: any[], setTournamentStages: any, activeStageSetup: number | null, setActiveStageSetup: (id: number) => void, setTeamCount: (v: string) => void, setCustomTeamCount: (v: boolean) => void, setCustomCount: (v: number) => void }) {
  // Use activeStageFormat if provided, otherwise fall back to tournamentFormat
  const currentFormat = activeStageFormat || tournamentFormat;
  
  // Obliczanie maksymalnej liczby drużyn awansujących
  const calculateMaxAdvancingTeams = () => {
    // Dla round-robin, maksymalna liczba to liczba drużyn w grupie minus 1
    if (currentFormat === 'round-robin' || currentFormat === 'round-groups') {
      const teamsPerGroup = customTeamCount ? customCount : parseInt(teamCount);
      return Math.max(1, Math.min(teamsPerGroup - 1, 8)); // Maksymalnie 8 drużyn
    }
    // Dla swiss, maksymalna liczba to połowa liczby drużyn
    if (currentFormat === 'swiss') {
      const totalTeams = customTeamCount ? customCount : parseInt(teamCount);
      return Math.max(1, Math.min(Math.floor(totalTeams / 2), 8)); // Maksymalnie 8 drużyn
    }
    return 4; // Domyślna wartość
  };
  
  const maxAdvancingTeams = calculateMaxAdvancingTeams();
  
  // Funkcja renderująca opcje tiebreaker
  const renderTiebreakerOptions = (format: string) => {
    // Zaktualizowane opcje tiebreaker na podstawie plików SwissBracketView i RoundRobinBracketView
    const swissTiebreakers = [
      { value: 'buchholz', label: 'Buchholz', description: 'Suma punktów zdobytych przez przeciwników' },
      { value: 'medianBuchholz', label: 'Median Buchholz', description: 'Suma punktów zdobytych przez przeciwników z pominięciem najlepszego i najgorszego wyniku' },
      { value: 'gameWin', label: 'Procent wygranych gier', description: 'Stosunek wygranych gier do wszystkich rozegranych' },
      { value: 'gameWL', label: 'Różnica W/L gier', description: 'Różnica między wygranymi a przegranymi grami' },
      { value: 'matchesPlayed', label: 'Rozegrane mecze', description: 'Drużyny z mniejszą liczbą rozegranych meczów są wyżej' },
      { value: 'headToHead', label: 'Bezpośrednie spotkania', description: 'Wyniki bezpośrednich spotkań między remisującymi drużynami' }
    ];
    
    const roundRobinTiebreakers = [
      { value: 'headToHead', label: 'Bezpośrednie spotkania', description: 'Wyniki bezpośrednich spotkań między remisującymi drużynami' },
      { value: 'inGameTiebreaker', label: 'Różnica punktów', description: 'Różnica między zdobytymi a straconymi punktami w grach' },
      { value: 'gameWin', label: 'Procent wygranych gier', description: 'Stosunek wygranych gier do wszystkich rozegranych' },
      { value: 'gameWL', label: 'Różnica W/L gier', description: 'Różnica między wygranymi a przegranymi grami' },
      { value: 'matchesPlayed', label: 'Rozegrane mecze', description: 'Drużyny z mniejszą liczbą rozegranych meczów są wyżej' },
      { value: 'gamesWon', label: 'Wygrane gry', description: 'Całkowita liczba wygranych gier' },
      { value: 'pointDifference', label: 'Różnica punktów', description: 'Różnica między zdobytymi a straconymi punktami' },
      { value: 'pointsScored', label: 'Zdobyte punkty', description: 'Całkowita liczba zdobytych punktów' }
    ];
    
    // Wybierz odpowiednie tiebreakery w zależności od formatu
    const tiebreakerOptions = format === 'swiss' ? swissTiebreakers : roundRobinTiebreakers;
    
    return (
      <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-md border border-[#333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <label className="block text-sm font-medium">Tiebreakery (rozstrzyganie remisów)</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Tiebreakery określają, w jaki sposób rozstrzygane są remisy między drużynami o tej samej liczbie punktów.
                    Możesz ustawić wiele tiebreakers w kolejności ich zastosowania.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="useTiebreakers"
              checked={options.useTiebreakers || false}
              onCheckedChange={(checked) => {
                setOptions({
                  ...options,
                  useTiebreakers: !!checked
                });
              }}
              className="border-[#333] data-[state=checked]:bg-yellow-500"
            />
            <label htmlFor="useTiebreakers" className="text-sm">Włącz tiebreakery</label>
          </div>
        </div>
        
        {options.useTiebreakers && (
          <div className="space-y-4 pl-4 border-l-2 border-yellow-500/30">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-gray-300">
                Przeciągnij, aby zmienić kolejność tiebreakers - będą stosowane w podanej kolejności
              </p>
            </div>
            
            {(options.tiebreakers || []).length === 0 && (
              <div className="text-sm text-gray-400 bg-[#222] p-3 rounded-md border border-dashed border-[#444] text-center">
                Brak wybranych tiebreakers. Dodaj przynajmniej jeden tiebreaker poniżej.
              </div>
            )}
            
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                
                const tiebreakers = [...(options.tiebreakers || [])];
                const [removed] = tiebreakers.splice(result.source.index, 1);
                tiebreakers.splice(result.destination.index, 0, removed);
                
                setOptions({
                  ...options,
                  tiebreakers
                });
              }}
            >
              <Droppable droppableId="tiebreakers">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {(options.tiebreakers || []).map((tiebreaker, index) => (
                      <Draggable key={tiebreaker} draggableId={tiebreaker} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-2 bg-[#252525] rounded-md border border-[#333] hover:border-[#444]"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {tiebreakerOptions.find(t => t.value === tiebreaker)?.label || tiebreaker}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-white hover:bg-red-500/20"
                              onClick={() => {
                                const updatedTiebreakers = options.tiebreakers?.filter(t => t !== tiebreaker) || [];
                                setOptions({
                                  ...options,
                                  tiebreakers: updatedTiebreakers
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="pt-2">
              <Select
                onValueChange={(value) => {
                  // Sprawdź, czy tiebreaker już istnieje
                  if (options.tiebreakers?.includes(value)) return;
                  
                  const updatedTiebreakers = [...(options.tiebreakers || []), value];
                  setOptions({
                    ...options,
                    tiebreakers: updatedTiebreakers
                  });
                }}
              >
                <SelectTrigger className="w-full bg-[#252525] border-[#333]">
                  <SelectValue placeholder="Dodaj tiebreaker" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {tiebreakerOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={options.tiebreakers?.includes(option.value)}
                      className="focus:bg-[#333] focus:text-white"
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-400">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Ustal, które formaty są wybrane w stagach (jeśli nie przekazano stagesFormats, użyj currentFormat)
  const formatsToShow = stagesFormats.length > 0 ? stagesFormats : [activeStageFormat || tournamentFormat];
  
  return (
    <div className="space-y-6">
      {/* Struktura turnieju (Tournament Stages) */}
      <div className="bg-[#1a1a1a] p-4 rounded-md border border-[#333] mb-4">
        <h3 className="text-lg font-semibold mb-2">Struktura turnieju</h3>
        <TournamentStages
          stages={tournamentStages || []}
          setStages={setTournamentStages}
          onFormatChange={setOptions}
          activeStageSetup={activeStageSetup}
          setActiveStageSetup={setActiveStageSetup}
        />
      </div>
      {/* Liczba drużyn lub Teams per group */}
      {currentFormat === 'round-robin' ? (
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Teams per group</label>
          </div>
          <Select
            value={options.teamsPerGroup?.toString() || '4'}
            onValueChange={v => {
              const num = parseInt(v);
              setOptions({ ...options, teamsPerGroup: num });
            }}
          >
            <SelectTrigger className="bg-[#252525] border-[#333] text-white">
              <SelectValue placeholder="Select teams per group" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#333] text-white">
              {[2, 3, 4, 5, 6, 8, 10, 12, 16].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Team' : 'Teams'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Number of Teams</label>
          </div>
          <Select
            value={teamCount}
            onValueChange={v => setTeamCount(v)}
          >
            <SelectTrigger className="bg-[#252525] border-[#333] text-white">
              <SelectValue placeholder="Select number of teams" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#333] text-white">
              {[4, 8, 12, 16, 24, 32, 48, 64].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Teams
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {currentFormat === 'round-robin' && (
        (() => {
          const rrGroups = (options && typeof (options as any).roundRobinGroups === 'number') ? (options as any).roundRobinGroups : roundRobinGroups;
          const teamsPerGroup = options.teamsPerGroup || 4;
          return (
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Number of Groups</label>
              </div>
              <Select 
                value={rrGroups.toString()} 
                onValueChange={v => {
                  const num = parseInt(v);
                  setOptions({ ...options, roundRobinGroups: num });
                  setRoundRobinGroups(num);
                }}
              >
                <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                  <SelectValue placeholder="Select number of groups" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333] text-white">
                  {[1, 2, 4, 8, 16, 32].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Group' : 'Groups'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Total teams needed: {teamsPerGroup * rrGroups}
              </p>
            </div>
          );
        })()
      )}
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5 text-yellow-500" />
        Opcje formatów
      </h3>
      
      {formatsToShow.includes('single-elimination') && (
        <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-md border border-[#333]">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brackets className="h-4 w-4 text-yellow-500" />
            Opcje Single Elimination
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4 text-gray-400" />
              <label className="text-sm text-gray-300">Mecz o 3. miejsce</label>
            </div>
            <Switch
              checked={thirdPlaceMatch}
              onCheckedChange={setThirdPlaceMatch}
              className="border-[#333] data-[state=checked]:bg-yellow-500"
            />
          </div>
        </div>
      )}
      
      {/* Pozostałe sekcje formatów pozostają bez zmian */}
      {formatsToShow.includes('double-elimination') && (
        <div className="space-y-4">
          <h4 className="font-medium mb-2">Opcje Double Elimination</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={skipLowerBracketFinal}
                onCheckedChange={val => {
                  if (skipGrandFinal) setSkipLowerBracketFinal(val);
                }}
                id="skipLowerBracketFinal"
                disabled={!skipGrandFinal}
                className="border-[#333] data-[state=checked]:bg-yellow-500"
              />
              <label htmlFor="skipLowerBracketFinal" className={`text-sm ${!skipGrandFinal ? "text-gray-500" : ""}`}>
                Pomiń finał dolnej drabinki
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={skipGrandFinal}
                onCheckedChange={val => {
                  if (!grandFinalAdvantage) setSkipGrandFinal(val);
                }}
                id="skipGrandFinal"
                disabled={grandFinalAdvantage}
                className="border-[#333] data-[state=checked]:bg-yellow-500"
              />
              <label htmlFor="skipGrandFinal" className={`text-sm ${grandFinalAdvantage ? "text-gray-500" : ""}`}>
                Pomiń wielki finał
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={grandFinalAdvantage}
                onCheckedChange={val => {
                  if (!skipGrandFinal && !skipLowerBracketFinal) setGrandFinalAdvantage(val);
                }}
                id="grandFinalAdvantage"
                disabled={skipGrandFinal || skipLowerBracketFinal}
                className="border-[#333] data-[state=checked]:bg-yellow-500"
              />
              <label htmlFor="grandFinalAdvantage" className={`text-sm ${(skipGrandFinal || skipLowerBracketFinal) ? "text-gray-500" : ""}`}>
                Przewaga w wielkim finale
              </label>
            </div>
          </div>
          {(grandFinalAdvantage || skipGrandFinal || skipLowerBracketFinal) && (
            <div className="text-xs text-gray-400 mt-2">
              {grandFinalAdvantage && "Aby wybrać pomijanie finałów, odznacz przewagę w wielkim finale."}
              {(skipGrandFinal || skipLowerBracketFinal) && "Aby wybrać przewagę w wielkim finale, odznacz pomijanie finałów."}
            </div>
          )}
        </div>
      )}
      {formatsToShow.includes('round-robin') && (
        <div className="space-y-4">
          <h4 className="font-medium mb-2">Opcje Round Robin</h4>
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={roundRobinRematches}
              onCheckedChange={(checked) => {
                setRoundRobinRematches(!!checked);
                setOptions({
                  ...options,
                  roundRobinRematches: !!checked
                });
              }}
              className="border-[#333] data-[state=checked]:bg-yellow-500"
            />
            <div className="space-y-1">
              <label htmlFor="roundRobinRematches" className="text-sm font-medium">
                Double round robin
              </label>
              <p className="text-xs text-gray-400">Drużyny grają ze sobą dwukrotnie</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Drużyny awansujące z grupy
            </label>
            <div className="flex items-center gap-2">
              <Select 
                value={roundRobinAdvancingTeams.toString()} 
                onValueChange={(value) => {
                  const numValue = parseInt(value);
                  setRoundRobinAdvancingTeams(numValue);
                  setOptions({
                    ...options, 
                    roundRobinAdvancingTeams: numValue
                  });
                }}
              >
                <SelectTrigger className="w-24 bg-[#333] border-[#444]">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent className="bg-[#333] border-[#444]">
                  {Array.from({ length: maxAdvancingTeams }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {renderTiebreakerOptions('round-robin')}
          {(currentFormat === 'swiss' || currentFormat === 'round-robin') && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Score Configuration</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                        <Info className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Configure point values for different match outcomes. 
                        Only applies to Swiss and Round Robin formats.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Win</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.win ?? 3}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, win: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Loss</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.loss ?? 0}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, loss: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Draw</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.draw ?? 1}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, draw: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bye</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.bye ?? 3}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, bye: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Win (Overtime)</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.winOvertime ?? 2}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, winOvertime: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Loss (Overtime)</label>
                  <Input
                    type="number"
                    value={options.scoreConfig?.lossOvertime ?? 1}
                    onChange={e => setOptions({ ...options, scoreConfig: { ...options.scoreConfig, lossOvertime: Number(e.target.value) } })}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {formatsToShow.includes('swiss') && (
        <div className="space-y-4">
          <h4 className="font-medium mb-2">Opcje Swiss</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Liczba rund</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Liczba rund turnieju Swiss. 0 = automatyczna (zalecane).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="10"
                value={swissRounds}
                onChange={(e) => setSwissRounds(parseInt(e.target.value) || 0)}
                className="w-24 bg-[#252525] border-[#333] text-white"
                placeholder="0"
              />
              <span className="text-xs text-gray-400">
                {swissRounds === 0 ? '(automatyczna)' : 'rund'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Tryb Swiss</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <Info className="h-4 w-4 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Wybierz sposób rozgrywania turnieju szwajcarskiego.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={options.swissMode || 'topCut'}
              onValueChange={(value) => {
                setOptions({
                  ...options,
                  swissMode: value as 'playAllRounds' | 'topCut'
                });
              }}
            >
              <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                <SelectValue placeholder="Wybierz tryb" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topCut">Top Cut (Eliminacja po osiągnięciu progu)</SelectItem>
                <SelectItem value="playAllRounds">Wszystkie rundy (Graj wszystkie zaplanowane rundy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderTiebreakerOptions('swiss')}
        </div>
      )}
    </div>
  );
}
