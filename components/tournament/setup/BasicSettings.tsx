import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TournamentStage } from "@/types/tournament";

// Add to the interface
interface BasicSettingsProps {
  tournamentFormat: string;
  teamCount: string;
  setTeamCount: (count: string) => void;
  customTeamCount: boolean;
  setCustomTeamCount: (custom: boolean) => void;
  customCount: number;
  setCustomCount: (count: number) => void;
  roundRobinGroups: number;
  setRoundRobinGroups: (groups: number) => void;
  roundGroupsCount: number;
  setRoundGroupsCount: (value: number) => void;
  roundGroupsTeamsPerGroup: number;
  setRoundGroupsTeamsPerGroup: (value: number) => void;
  // Add new props for tournament stages
  tournamentStages: TournamentStage[];
  setTournamentStages: (stages: TournamentStage[]) => void;
  // Add the missing props
  activeStageSetup: number | null;
  setActiveStageSetup: (stageId: number) => void;
  // Dodaj nowe właściwości
  teamFormat: string;
  setTeamFormat: (format: string) => void;
}

export default function BasicSettings({
  tournamentFormat,
  teamCount,
  setTeamCount,
  customTeamCount,
  setCustomTeamCount,
  customCount,
  setCustomCount,
  roundRobinGroups,
  setRoundRobinGroups,
  roundGroupsCount,
  setRoundGroupsCount,
  roundGroupsTeamsPerGroup,
  setRoundGroupsTeamsPerGroup,
  // Add new props for tournament stages
  tournamentStages,
  setTournamentStages,
  // Add the missing props
  activeStageSetup,
  setActiveStageSetup,
  // Dodaj nowe właściwości
  teamFormat,
  setTeamFormat
}: BasicSettingsProps) {
  // Force a client-side render to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This will force a re-render on the client side
    // which helps with hydration mismatches
    setIsClient(true);
  }, []);
  
  // If not client-rendered yet, return a minimal placeholder with the same structure
  if (!isClient) {
    return (
      <>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Tournament Name</label>
          <div className="h-10 w-full rounded-md border bg-[#252525] border-[#333]"></div>
        </div>
        {/* Minimal placeholders for other elements */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Game:</label>
            <div className="h-10 w-full rounded-md border bg-[#252525] border-[#333]"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full"></div>
        </div>
      </>
    );
  }
  
  // Function to handle format changes from the stages component
  // Update the BasicSettings component to handle stage format changes
  const handleFormatChange = (format: string) => {
    if (activeStageSetup !== null) {
      // If a stage is selected, update that stage's format
      const updatedStages = [...tournamentStages];
      const stageIndex = updatedStages.findIndex(s => s.id === activeStageSetup);
      
      if (stageIndex >= 0) {
        updatedStages[stageIndex] = { ...updatedStages[stageIndex], format };
        setTournamentStages(updatedStages);
        
        // Only update the main tournament format if it's the first stage
        if (stageIndex === 0) {
          // setTournamentFormat(format);
        }
      }
    } else {
      // If no stage is selected, update the main format
      // setTournamentFormat(format);
    }
  };
  
  // Add this function to handle stage format changes
  const handleStageFormatChange = (format: string) => {
    handleFormatChange(format);
  };
  
  // Regular render for client-side
  return (
    <>
      <div className="space-y-4">
        {/* Format-specific options remain unchanged */}
        {/* Usunięto sekcję wyboru liczby grup dla Round Robin, przeniesiona do FormatOptions */}
      </div>
    </>
  );
}
