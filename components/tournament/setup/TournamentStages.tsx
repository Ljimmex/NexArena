import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X, Brackets, GitBranch, Grid, Hash, Layers, ArrowUp, ArrowDown } from "lucide-react";
import { TournamentStage } from "@/types/tournament";
import { Badge } from "@/components/ui/badge";
import SwissBracketIcon from "@/components/icons/SwissBracketIcon";
import SingleEliminationIcon from "@/components/icons/SingleEliminationIcon";
import DoubleEliminationIcon from "@/components/icons/DoubleEliminationIcon";
import RoundRobinIcon from "@/components/icons/RoundRobinIcon";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";


interface TournamentStagesProps {
  stages: TournamentStage[];
  setStages: (stages: TournamentStage[]) => void;
  onFormatChange?: (format: string) => void;
  activeStageSetup: number | null;
  setActiveStageSetup: (stageId: number) => void;
}

export default function TournamentStages({ 
  stages, 
  setStages, 
  onFormatChange,
  activeStageSetup,
  setActiveStageSetup
}: TournamentStagesProps) {
  // Funkcja do pobierania ikony formatu
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'single-elimination':
        return <SingleEliminationIcon className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'double-elimination':
        return <DoubleEliminationIcon className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'round-robin':
        return <RoundRobinIcon className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'swiss':
        return <SwissBracketIcon className="h-4 w-4 mr-2 text-yellow-500" />;
      case 'round-groups':
        return <Layers className="h-4 w-4 mr-2 text-yellow-500" />;
      default:
        return <Brackets className="h-4 w-4 mr-2 text-yellow-500" />;
    }
  };

  // Funkcja do dodawania nowego etapu
  const addStage = () => {
    const newId = stages.length > 0 
      ? Math.max(...stages.map(stage => stage.id)) + 1 
      : 1;
    
    setStages([
      ...stages,
      { id: newId, name: `Etap ${newId}`, format: "single-elimination" }
    ]);
  };

  // Funkcja do usuwania etapu
  const removeStage = (id: number) => {
    if (stages.length <= 1) {
      return; // Nie usuwaj ostatniego etapu
    }
    setStages(stages.filter(stage => stage.id !== id));
  };

  // Funkcja do aktualizacji etapu
  const updateStage = (id: number, field: keyof TournamentStage, value: string) => {
    const updatedStages = stages.map(stage => 
      stage.id === id ? { ...stage, [field]: value } : stage
    );
    
    setStages(updatedStages);
    
    // Jeśli to pierwszy etap i zmienił się format, powiadom rodzica
    if (id === stages[0]?.id && field === 'format' && onFormatChange) {
      onFormatChange(value);
    }
  };

  // Funkcja do zmiany kolejności etapów
  const moveStage = (id: number, direction: 'up' | 'down') => {
    const stageIndex = stages.findIndex(stage => stage.id === id);
    if (
      (direction === 'up' && stageIndex === 0) || 
      (direction === 'down' && stageIndex === stages.length - 1)
    ) {
      return; // Nie można przesunąć poza granice
    }

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    [newStages[stageIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[stageIndex]];
    
    setStages(newStages);
  };

  // Funkcja do uzyskania etykiety formatu
  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      'single-elimination': 'Pojedyncza eliminacja',
      'double-elimination': 'Podwójna eliminacja',
      'round-robin': 'Round Robin',
      'swiss': 'System szwajcarski',
    };
    
    return labels[format] || format;
  };

  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-yellow-500">Struktura Turnieju</h3>
        <Button 
          variant="default" 
          size="sm" 
          onClick={addStage}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Dodaj Etap
        </Button>
      </div>
      
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div 
            key={stage.id} 
            className={`p-4 border rounded-md transition-all ${
              activeStageSetup === stage.id 
                ? 'border-yellow-500 bg-yellow-500/10 shadow-md' 
                : 'border-gray-700 hover:border-gray-500'
            }`}
            onClick={() => setActiveStageSetup(stage.id)}
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${
                    activeStageSetup === stage.id 
                      ? 'bg-yellow-500 text-black font-medium' 
                      : 'bg-gray-800 text-gray-300'
                  } px-2 py-1 text-xs font-semibold rounded-md`}
                >
                  Etap {index + 1}
                </Badge>
                <div className="flex items-center space-x-1">
                  {stages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-yellow-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStage(stage.id, 'up');
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-yellow-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStage(stage.id, 'down');
                        }}
                        disabled={index === stages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStage(stage.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {/* Przycisk z trzema kropkami zawsze po prawej stronie */}
                  <span
                    role="button"
                    tabIndex={0}
                    className={`ml-2 p-1 rounded hover:bg-gray-700 cursor-pointer ${stage.format !== "round-robin" ? "opacity-50 pointer-events-none" : ""}`}
                    title={stage.format === "round-robin" ? "Przejdź do rozstawiania (seeding)" : "Dostępne tylko dla Round Robin"}
                    onClick={e => {
                      e.stopPropagation();
                      if (stage.format === "round-robin") {
                        router.push("/seeding");
                      }
                    }}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <Input
                  value={stage.name}
                  onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                  className="mb-2 bg-[#252525] border-[#333] focus:border-yellow-500 focus:ring-yellow-500/20"
                  placeholder="Nazwa etapu"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <Select
                  value={stage.format}
                  onValueChange={(value) => updateStage(stage.id, 'format', value)}
                >
                  <SelectTrigger 
                    className="w-full bg-[#252525] border-[#333] focus:border-yellow-500 focus:ring-yellow-500/20" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue placeholder="Wybierz format" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252525] border-[#333]">
                    <SelectItem value="single-elimination">
                      <div className="flex items-center">
                        {getFormatIcon('single-elimination')}
                        Pojedyncza eliminacja
                      </div>
                    </SelectItem>
                    <SelectItem value="double-elimination">
                      <div className="flex items-center">
                        {getFormatIcon('double-elimination')}
                        Podwójna eliminacja
                      </div>
                    </SelectItem>
                    <SelectItem value="round-robin">
                      <div className="flex items-center">
                        {getFormatIcon('round-robin')}
                        Round Robin
                      </div>
                    </SelectItem>
                    <SelectItem value="swiss">
                      <div className="flex items-center">
                        {getFormatIcon('swiss')}
                        System szwajcarski
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-gray-400">
                    {getFormatIcon(stage.format)}
                    <span className={stage.format === 'round-robin' ? 'text-yellow-500 font-medium' : ''}>
                      {getFormatLabel(stage.format)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}