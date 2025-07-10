import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gameModes, games } from "@/data/gamesData";
import Image from "next/image";
import { MapType } from "@/types/ui";
import { mapPresets, getMapsByPreset, determineActivePreset } from "@/data/mapPresets";
import { vetoTypes } from "@/data/vetoTypes";

// Updated interface to include format
interface AdvancedSettingsProps {
  swissTiebreakers: string[];
  setSwissTiebreakers: (value: string[]) => void;
  format?: string;
  teamFormat: string;
  setTeamFormat: (format: string) => void;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
  gameMode: string;
  setGameMode: (mode: string) => void;
  maxRounds: number;
  setMaxRounds: (rounds: number) => void;
  maps: MapType[];
  setMaps: (maps: MapType[]) => void;
  vetoType: string;
  setVetoType: (type: string) => void;
  substituteCount: number;
  setSubstituteCount: (count: number) => void;
}

export default function AdvancedSettings({
  swissTiebreakers,
  setSwissTiebreakers,
  format = 'single-elimination', // Default to single-elimination
  teamFormat,
  setTeamFormat,
  selectedGame,
  setSelectedGame,
  gameMode,
  setGameMode,
  maxRounds,
  setMaxRounds,
  maps,
  setMaps,
  vetoType,
  setVetoType,
  substituteCount,
  setSubstituteCount,
}: AdvancedSettingsProps) {

  // Game modes for the selected game
  const availableGameModes: { id: string; name: string }[] = (gameModes as Record<string, { id: string; name: string }[]>)[selectedGame] || [];
  // Map pool for the selected game
  const gameMaps = maps.filter(map => map.game === selectedGame);

  // Presets for the selected game
  const availablePresets = mapPresets.filter(preset => preset.game === selectedGame);
  const selectedMapIds = gameMaps.filter(map => map.selected).map(map => map.id);
  const activePreset = determineActivePreset(selectedMapIds);

  const applyMapPreset = (presetId: string) => {
    const presetMaps = getMapsByPreset(presetId);
    const updatedMaps = maps.map(map => {
      if (map.game === selectedGame) {
        return { ...map, selected: presetMaps.some(presetMap => presetMap.id === map.id) };
      }
      return map;
    });
    setMaps(updatedMaps);
  };

  const toggleMapSelection = (mapId: string) => {
    const updatedMaps = maps.map(map =>
      map.id === mapId ? { ...map, selected: !map.selected } : map
    );
    setMaps(updatedMaps);
  };

  const selectedVeto = vetoTypes.find(v => v.id === vetoType) || vetoTypes[0];

  // Ensure substituteCount is always a number for Select
  const safeSubstituteCount = typeof substituteCount === 'number' && !isNaN(substituteCount) ? substituteCount : 1;

  return (
    <div className="space-y-6">
      {/* Game Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Game:</label>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="bg-[#252525] border-[#333] text-white">
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent className="bg-[#252525] border-[#333] text-white">
            {games.map(game => (
              <SelectItem key={game.id} value={game.id}>
                <div className="flex items-center gap-2">
                  <Image 
                    src={game.icon} 
                    alt={game.name} 
                    width={20} 
                    height={20} 
                    className="rounded-sm"
                  />
                  {game.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Team Format & Substitutes */}
      <div className="flex flex-row gap-4 w-full">
        <div className="flex-1 space-y-2">
          <label className="text-sm text-gray-400">Team Format</label>
          <Select value={teamFormat} onValueChange={setTeamFormat}>
            <SelectTrigger className="bg-[#252525] border-[#333] text-white">
              <SelectValue placeholder="Select team format" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#333] text-white">
              <SelectItem value="1v1">1vs1</SelectItem>
              <SelectItem value="2v2">2vs2</SelectItem>
              <SelectItem value="3v3">3vs3</SelectItem>
              <SelectItem value="4v4">4vs4</SelectItem>
              <SelectItem value="5v5">5vs5</SelectItem>
              <SelectItem value="6v6">6vs6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm text-gray-400">Liczba zmienników</label>
          <Select
            value={safeSubstituteCount.toString()}
            onValueChange={v => {
              if (typeof setSubstituteCount === "function") {
                setSubstituteCount(Number(v));
              } else {
                console.error("setSubstituteCount is not a function!", setSubstituteCount);
              }
            }}
          >
            <SelectTrigger className="bg-[#252525] border-[#333] text-white">
              <SelectValue placeholder="Wybierz liczbę zmienników" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#333] text-white">
              {[1,2,3,4,5].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Mode */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Game Mode</label>
        <Select value={gameMode} onValueChange={setGameMode}>
          <SelectTrigger className="bg-[#252525] border-[#333] text-white">
            <SelectValue placeholder="Select game mode" />
          </SelectTrigger>
          <SelectContent className="bg-[#252525] border-[#333] text-white">
            {availableGameModes.map((mode: { id: string; name: string }) => (
              <SelectItem key={mode.id} value={mode.id}>{mode.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max Rounds */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Max rounds</label>
        <Select value={maxRounds.toString()} onValueChange={v => setMaxRounds(Number(v))}>
          <SelectTrigger className="bg-[#252525] border-[#333] text-white">
            <SelectValue placeholder="Select max rounds" />
          </SelectTrigger>
          <SelectContent className="bg-[#252525] border-[#333] text-white">
            {[3, 6, 12, 16, 18, 24, 30].map(num => (
              <SelectItem key={num} value={num.toString()}>{num} rounds</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Veto Type Selector */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Veto Type</label>
        <Select value={vetoType} onValueChange={setVetoType}>
          <SelectTrigger className="bg-[#252525] border-[#333] text-white">
            <SelectValue placeholder="Select veto type" />
          </SelectTrigger>
          <SelectContent className="bg-[#252525] border-[#333] text-white">
            {vetoTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-400 mt-1">
          {selectedVeto.description}
        </div>
      </div>

      {/* Map Pool Selection */}
      <div className="space-y-2">
      <label className="text-sm text-gray-400">Map pool</label>
              {/* Map Pool Presets */}
      {availablePresets.length > 0 && (
        <div className="space-y-2 mb-2">
          <div className="flex flex-wrap gap-2">
            {availablePresets.map(preset => (
              <button
                key={preset.id}
                className={`px-3 py-1 rounded border text-sm font-medium transition-colors cursor-pointer ${
                  activePreset === preset.id
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "bg-[#232323] text-white border-[#333] hover:bg-[#333]"
                }`}
                onClick={() => applyMapPreset(preset.id)}
                type="button"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {gameMaps.map(map => (
            <div
              key={map.id}
              className={`relative flex items-center rounded-lg cursor-pointer border transition-all h-14 overflow-hidden ${
                map.selected
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-[#333] bg-[#181818] hover:bg-[#232323]"
              }`}
              onClick={() => toggleMapSelection(map.id)}
              style={{ minHeight: 56 }}
            >
              <div className="absolute inset-0 opacity-40">
                <Image src={map.image} alt={map.name} fill className="object-cover" />
              </div>
              <div className="relative z-10 flex-1 flex items-center px-4 py-2">
                <span className="font-medium text-white drop-shadow-md">{map.name}</span>
              </div>
              {map.selected && (
                <span className="relative z-10 mr-3 text-yellow-400 font-bold text-lg">×</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {gameMaps.filter(map => map.selected).length} selected
        </div>
      </div>
    </div>
  );
}