import { MapType } from "@/types/ui";
import { gameMaps } from "./mapsData";

export type MapPreset = {
  id: string;
  name: string;
  description: string;
  maps: string[]; // Array of map IDs
  game: string;
};

export const mapPresets: MapPreset[] = [
  {
    id: "cs2-official",
    name: "CS2 Official Maps",
    description: "Current Active Duty map pool",
    maps: gameMaps
      .filter(map => map.game === "cs2" && ["dust2", "mirage", "inferno", "nuke", "anubis", "ancient", "train"].includes(map.id))
      .map(map => map.id),
    game: "cs2"
  },
  {
    id: "cs2-unofficial",
    name: "CS2 Unofficial Maps",
    description: "Popular community and retired maps",
    maps: gameMaps
      .filter(map => map.game === "cs2" && ["overpass", "cashe", "office", "italy", "vertigo", "edin", "basalt"].includes(map.id))
      .map(map => map.id),
    game: "cs2"
  },
  {
    id: "custom",
    name: "Custom Selection",
    description: "Your custom map selection",
    maps: [],
    game: "cs2"
  }
];

// Helper function to get maps by preset ID
export const getMapsByPreset = (presetId: string): MapType[] => {
  const preset = mapPresets.find(p => p.id === presetId);
  if (!preset) return [];
  
  return gameMaps.filter(map => 
    map.game === preset.game && preset.maps.includes(map.id)
  ).map(map => ({
    ...map,
    selected: true
  }));
};

// Helper function to determine which preset is active based on selected maps
export const determineActivePreset = (selectedMapIds: string[]): string => {
  // Check if selection matches any preset exactly
  for (const preset of mapPresets) {
    if (preset.id === "custom") continue;
    
    const presetMapIds = preset.maps;
    if (presetMapIds.length === selectedMapIds.length && 
        presetMapIds.every(id => selectedMapIds.includes(id))) {
      return preset.id;
    }
  }
  
  // If no exact match, return custom
  return "custom";
};