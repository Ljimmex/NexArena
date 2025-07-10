"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'

// UI components
import { Button } from "@/components/ui/button"

// Icons
import {Trophy, Sparkles, Settings, Users, Clock} from "lucide-react"

// Types & Data
import { TournamentSetupProps, TournamentData, TournamentStage } from "@/types/tournament"
import { MapType } from "@/types/ui"
import { Participant } from "@/types/participants"
import { gameMaps } from "@/data/mapsData"

// Sub-components
import TeamSelector from "./setup/TeamSelector"
import FormatOptions from "./setup/FormatOptions"
import BasicSettings from "./setup/BasicSettings"
import AdvancedSettings from "./setup/AdvancedSettings"
import TournamentStages from "./setup/TournamentStages"
import { AppearanceSelection } from "./setup/AppearanceSelection"

// Dodaj nowe importy
import TimeSettings from "./setup/TimeSettings"
import PrizePoolSettings from "./setup/PrizePoolSettings"
import AboutTab from "./setup/AboutTab"
import RolesTab, { RolesTabProps, RoleEntry } from "./setup/RolesTab"
import RulesTab, { RuleSection } from "./setup/RulesTab"
import HostTab from "./setup/HostTab"

export default function TournamentSetup({ onGenerateBracket }: TournamentSetupProps) {
  const router = useRouter()
  
  // Main state
  const [tournamentName, setTournamentName] = useState("My Tournament")
  const [tournamentFormat, setTournamentFormat] = useState("single-elimination")
  const [teamCount, setTeamCount] = useState("4")
  const [customTeamCount, setCustomTeamCount] = useState(false)
  const [customCount, setCustomCount] = useState(4)
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState<Participant[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedGame, setSelectedGame] = useState("cs2")
  const [mapSelectionType, setMapSelectionType] = useState("preset")
  const [maps, setMaps] = useState<MapType[]>(gameMaps)
  const [activeMapPreset, setActiveMapPreset] = useState("cs2-official")

  // Dodaj nowe stany
  const [teamFormat, setTeamFormat] = useState("5v5")
  const [organizerName, setOrganizerName] = useState("Tournament Organizer")

  const [tournamentLogo, setTournamentLogo] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [organizerLogo, setOrganizerLogo] = useState<string>("");
  
  // Add tournament stages state
  const [tournamentStages, setTournamentStages] = useState<TournamentStage[]>([
    { id: 1, name: "Stage 1", format: tournamentFormat }
  ]);
  
  // Add activeStageSetup state
  const [activeStageSetup, setActiveStageSetup] = useState<number | null>(null);
  
  // Add activeStageFormat state to track the format of the active stage
  const [activeStageFormat, setActiveStageFormat] = useState<string>(tournamentFormat);
  
  // Format-specific options
  const [roundRobinRematches, setRoundRobinRematches] = useState(false)
  const [roundRobinGroups, setRoundRobinGroups] = useState(1)
  const [roundRobinPlayoffs, setRoundRobinPlayoffs] = useState(false)
  const [roundRobinPlayoffTeams, setRoundRobinPlayoffTeams] = useState(4)
  const [roundRobinAdvancingTeams, setRoundRobinAdvancingTeams] = useState(1) // Upewnij się, że ta linia istnieje
  const [grandFinalAdvantage, setGrandFinalAdvantage] = useState(true)
  const [doubleElimThirdPlace, setDoubleElimThirdPlace] = useState(false)
  const [skipGrandFinal, setSkipGrandFinal] = useState(false)
  const [skipLowerBracketFinal, setSkipLowerBracketFinal] = useState(false)
  const [swissRounds, setSwissRounds] = useState(0)
  const [swissPlayoffs, setSwissPlayoffs] = useState(false)
  const [swissPlayoffTeams, setSwissPlayoffTeams] = useState(8)
  const [swissTiebreakers, setSwissTiebreakers] = useState(true)

  const [registrationOpenDateTime, setRegistrationOpenDateTime] = useState("");
  const [registrationCloseDateTime, setRegistrationCloseDateTime] = useState("");
  const [readyOpenDateTime, setReadyOpenDateTime] = useState("");
  const [readyCloseDateTime, setReadyCloseDateTime] = useState("");
  const [startDateTime, setStartDateTime] = useState("");

    // Dodaj nowe stany dla Prize Pool
    const [prizePool, setPrizePool] = useState("$1000")
    const [prizeDistribution, setPrizeDistribution] = useState("50-percent-rule")
    const [customPrizeDistribution, setCustomPrizeDistribution] = useState<Record<string, number>>({
      "1": 50,
      "2": 25,
      "3": 15,
      "4": 10
    })
  
  // Add state for Round Groups options
  const [roundGroupsCount, setRoundGroupsCount] = useState(4)
  const [roundGroupsTeamsPerGroup, setRoundGroupsTeamsPerGroup] = useState(4)
  const [roundGroupsQualificationMatches, setRoundGroupsQualificationMatches] = useState(true)
  
  // Merged options state with all properties
  const [options, setOptions] = useState<{
    swissMode?: 'playAllRounds' | 'topCut',
    tiebreaker?: string,
    roundRobinTiebreaker?: string,
    tiebreakers?: string[],
    useTiebreakers?: boolean,
    roundRobinAdvancingTeams?: number, // Dodajemy tę właściwość
    scoreConfig?: {
      win: number;
      loss: number;
      draw: number;
      bye: number;
      winOvertime: number;
      lossOvertime: number;
    }
  }>({ 
    swissMode: 'topCut',
    tiebreakers: [], // Initialize with empty array
    useTiebreakers: true,
    roundRobinAdvancingTeams: 1, // Inicjalizujemy z wartością domyślną
    scoreConfig: {
      win: 3,
      loss: 0,
      draw: 1,
      bye: 3,
      winOvertime: 2,
      lossOvertime: 1
    }
  });
  
  // Add stageOptions state to store options for each stage
  const [stageOptions, setStageOptions] = useState<Record<number, any>>({
    1: { // Initialize with default options for the first stage
      swissMode: 'topCut',
      tiebreakers: [],
      useTiebreakers: true,
      roundRobinAdvancingTeams: 1,
      scoreConfig: {
        win: 3,
        loss: 0,
        draw: 1,
        bye: 3,
        winOvertime: 2,
        lossOvertime: 1
      }
    }
  });

  // Przywróć stany:
  const [aboutDescription, setAboutDescription] = useState("");
  const [aboutContactUrl, setAboutContactUrl] = useState("");
  const [aboutVideoUrl, setAboutVideoUrl] = useState("");
  const [aboutContactMethod, setAboutContactMethod] = useState("");

  // Dodaj stany dla HostTab
  const [organizerDescription, setOrganizerDescription] = useState("");
  const [organizerContact, setOrganizerContact] = useState("");
  const [organizerSocials, setOrganizerSocials] = useState({
    discord: "",
    facebook: "",
    instagram: "",
    x: "",
    twitch: "",
    kick: ""
  });

  // Przywracanie About Description z localStorage przy montażu
  useEffect(() => {
    const savedAbout = localStorage.getItem("tournamentAbout");
    if (savedAbout) {
      try {
        const about = JSON.parse(savedAbout);
        if (about.description) setAboutDescription(about.description);
        if (about.contactUrl) setAboutContactUrl(about.contactUrl);
        if (about.videoUrl) setAboutVideoUrl(about.videoUrl);
        if (about.contactMethod) setAboutContactMethod(about.contactMethod);
      } catch {}
    }
  }, []);

  // Zapisuj About Description do localStorage przy każdej zmianie
  useEffect(() => {
    const about = {
      description: aboutDescription,
      contactUrl: aboutContactUrl,
      videoUrl: aboutVideoUrl,
      contactMethod: aboutContactMethod,
    };
    localStorage.setItem("tournamentAbout", JSON.stringify(about));
  }, [aboutDescription, aboutContactUrl, aboutVideoUrl, aboutContactMethod]);

  useEffect(() => {
    const today = new Date()
    setRegistrationOpenDateTime(today.toISOString().split("T")[0] + "T" + today.toISOString().split("T")[1])
    
    // Ustaw domyślne daty dla rejestracji i potwierdzenia
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    setRegistrationCloseDateTime(yesterday.toISOString().split("T")[0] + "T" + yesterday.toISOString().split("T")[1])
    
    // Ustaw domyślną datę startu turnieju (1 dzień po rejestracji)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    setStartDateTime(tomorrow.toISOString().split("T")[0] + "T" + tomorrow.toISOString().split("T")[1])
  }, [])

  // Add this useEffect to update activeStageFormat when activeStageSetup changes
  useEffect(() => {
    if (activeStageSetup !== null) {
      const activeStage = tournamentStages.find(stage => stage.id === activeStageSetup);
      if (activeStage) {
        setActiveStageFormat(activeStage.format);
      }
    } else {
      setActiveStageFormat(tournamentFormat);
    }
  }, [activeStageSetup, tournamentStages, tournamentFormat]);

  // Add roles state for roles tab
  const [roles, setRoles] = useState<RoleEntry[]>([]);

  // Add rules state for rules tab
  const [rules, setRules] = useState<RuleSection[]>([
    {
      title: "Zasady Ogólne",
      icon: "⚙️",
      points: [
        { text: "Turniej jest otwarty dla wszystkich graczy powyżej 16 roku życia" },
        { text: "Każdy uczestnik może zarejestrować tylko jeden zespół" },
        { text: "Rejestracja kończy się 24 godziny przed rozpoczęciem turnieju" },
        { text: "Wszyscy uczestnicy muszą posiadać ważne konto Steam" },
        { text: "Organizatorzy zastrzegają sobie prawo do dyskwalifikacji za nieprzestrzeganie zasad" }
      ]
    }
  ]);

  // Synchronizuj rules z localStorage
  useEffect(() => {
    localStorage.setItem("tournamentRules", JSON.stringify(rules));
  }, [rules]);

  // Helper to map roles to admins format
  const getAdminsFromRoles = () => roles.map(r => ({ name: r.name, role: r.role, avatar: undefined }));

  // Add rulesMeta state for meta info from RulesTab
  const [rulesMeta, setRulesMeta] = useState({
    approvedBy: "",
    approvedDate: "",
    version: "",
    pdfUrl: "",
    wordUrl: "",
    previewUrl: ""
  });

  // Synchronizuj z localStorage
  useEffect(() => {
    const savedHost = localStorage.getItem("tournamentHost");
    if (savedHost) {
      try {
        const host = JSON.parse(savedHost);
        if (host.organizerName) setOrganizerName(host.organizerName);
        if (host.organizerDescription) setOrganizerDescription(host.organizerDescription);
        if (host.organizerContact) setOrganizerContact(host.organizerContact);
        if (host.organizerSocials) setOrganizerSocials(host.organizerSocials);
      } catch {}
    }
  }, []);
  useEffect(() => {
    const host = {
      organizerName,
      organizerDescription,
      organizerContact,
      organizerSocials
    };
    localStorage.setItem("tournamentHost", JSON.stringify(host));
  }, [organizerName, organizerDescription, organizerContact, organizerSocials]);

  // Zaktualizuj funkcję generateBracket, aby uwzględniała pole admins i rules
  const generateBracket = () => {
    console.log("Generate button clicked");
    // Add validation
    if (selectedTeams.length < 2) {
      alert("Please select at least 2 teams")
      return
    }
    
    if (mapSelectionType === "preset" && maps.filter(map => map.game === selectedGame && map.selected).length === 0) {
      alert("Please select at least one map")
      return
    }
    
    console.log("TournamentSetup - Generating bracket with format:", tournamentFormat);
    console.log("TournamentSetup - Selected teams count:", selectedTeams.length);
    console.log("TournamentSetup - Selected tiebreakers:", options.tiebreakers);
    
    // Create a base tournament data object
    const tournamentData: TournamentData = {
      tournamentName,
      tournamentFormat: tournamentStages[0]?.format || tournamentFormat,
      teamCount: selectedTeams.length,
      thirdPlaceMatch,
      selectedTeams: selectedTeams.map((team: Participant) => ({
        ...team,
        id: team.id,
        name: team.name,
        logo: team.logo,
        seed: team.seed,
        groupPosition: undefined,
        groupId: undefined
      })),
      substituteTeams: substituteTeams.map((team: Participant) => ({
        ...team,
        id: team.id,
        name: team.name,
        logo: team.logo,
        seed: team.seed,
        groupPosition: undefined,
        groupId: undefined
      })),
      startDateTime,
      selectedGame,
      selectedMaps: maps.filter(map => map.game === selectedGame && map.selected),
      mapSelectionType: "preset",
      stages: tournamentStages,
      // Dodaj nowe pola
      teamFormat: teamFormat,
      organizer: organizerName,
      organizerDescription,
      organizerContact,
      organizerSocials,
      tournamentLogo: tournamentLogo,
      backgroundImage: backgroundImage,
      organizerLogo: organizerLogo,
      prizePool: prizePool,
      prizeDistribution: prizeDistribution,
      customPrizeDistribution: customPrizeDistribution,
      substituteCount,
      formatOptions: {
        doubleElimination: {
          grandFinalAdvantage: grandFinalAdvantage,
          thirdPlace: doubleElimThirdPlace,
          skipGrandFinal: skipGrandFinal === true,
          skipLowerBracketFinal: skipLowerBracketFinal === true,
          grandFinal: grandFinalAdvantage ? "double" : "single",
        },
        swiss: {
          rounds: swissRounds,
          usePlayoffs: swissPlayoffs,
          playoffTeams: swissPlayoffTeams,
          useTiebreakers: swissTiebreakers,
          swissMode: options.swissMode || 'topCut',
          tiebreaker: options.tiebreaker || 'buchholz',
          tiebreakers: options.tiebreakers || [],
          endCondition: 'rounds',
          winsRequired: 3,
          lossesElimination: 3,
          scoreConfig: options.scoreConfig
        },
        roundRobin: {
          groups: roundRobinGroups,
          doubleRoundRobin: roundRobinRematches,
          usePlayoffs: roundRobinPlayoffs,
          playoffTeams: roundRobinPlayoffTeams,
          advancingTeams: roundRobinAdvancingTeams,
          tiebreaker: options.roundRobinTiebreaker,
          scoreConfig: options.scoreConfig,
          ...(options.roundRobinAdvancingTeams !== undefined ? { advancingTeams: options.roundRobinAdvancingTeams } : {})
        },
        roundGroups: {
          groupCount: roundGroupsCount,
          teamsPerGroup: roundGroupsTeamsPerGroup,
          qualificationMatches: roundGroupsQualificationMatches
        }
      },
      registrationOpenDateTime,
      registrationCloseDateTime,
      readyOpenDateTime,
      readyCloseDateTime,
      about: {
        name: tournamentName,
        organizerName: organizerName,
        description: aboutDescription,
        contactUrl: aboutContactUrl,
        videoUrl: aboutVideoUrl,
        contactMethod: aboutContactMethod,
      },
      admins: getAdminsFromRoles(),
      rules: { rulesSections: rules, rulesMeta },
    }
    
    console.log("TournamentSetup - Tournament data:", JSON.stringify(tournamentData, null, 2));
    
    try {
      // Usuń stare wyniki, mecze i standings
      Object.keys(localStorage).forEach(key => {
        if (
          key.startsWith('matches-stage-') ||
          key.startsWith('standings-stage-') ||
          key.startsWith('advancingTeams-stage-')
        ) {
          localStorage.removeItem(key);
        }
      });

      // Save to localStorage
      localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
      console.log("TournamentSetup - Data saved to localStorage successfully");
      
      // Use the callback if provided, otherwise navigate to bracket page
      if (onGenerateBracket) {
        console.log("TournamentSetup - Calling onGenerateBracket callback");
        onGenerateBracket(tournamentData);
      } else {
        console.log("TournamentSetup - Navigating to bracket page");
        // Force a small delay before navigation to ensure localStorage is updated
        setTimeout(() => {
          router.push('/bracket');
        }, 100);
      }
    } catch (error) {
      console.error("Error during bracket generation:", error);
      alert("An error occurred while generating the bracket. Please try again.");
    }
  }

  // Add a function to update tiebreaker based on format
  const updateTiebreaker = (value: string) => {
    if (tournamentFormat === 'swiss') {
      setOptions({...options, tiebreaker: value});
    } else if (tournamentFormat === 'round-robin') {
      setOptions({...options, roundRobinTiebreaker: value});
    }
  };

  // Add a function to handle stage format changes
  // Update the handleStageFormatChange function to properly update activeStageFormat
  const handleStageFormatChange = (format: string) => {
    handleFormatChange(format);
    setActiveStageFormat(format);
  };
  
  // Update the handleFormatChange function to properly handle stage formats
  const handleFormatChange = (format: string) => {
    // If we have an active stage selected, update that stage's format
    if (activeStageSetup !== null) {
      const updatedStages = [...tournamentStages];
      const stageIndex = updatedStages.findIndex(s => s.id === activeStageSetup);
      
      if (stageIndex >= 0) {
        updatedStages[stageIndex] = { ...updatedStages[stageIndex], format };
        setTournamentStages(updatedStages);
        
        // Only update the main tournament format if it's the first stage
        if (stageIndex === 0) {
          setTournamentFormat(format);
        }
        
        // Always update activeStageFormat
        setActiveStageFormat(format);
      }
    } else {
      // If no stage is selected, just update the main format
      setTournamentFormat(format);
      setActiveStageFormat(format);
      
      // Update the first stage format
      if (tournamentStages.length > 0) {
        const updatedStages = [...tournamentStages];
        updatedStages[0] = { ...updatedStages[0], format };
        setTournamentStages(updatedStages);
      }
    }
    
    // Reset tiebreakers when changing format to prevent Swiss tiebreakers in Round Robin
    if (format === 'round-robin') {
      setOptions(prev => ({
        ...prev,
        tiebreakers: [], // Reset to empty array
        roundRobinTiebreaker: undefined // Clear the single tiebreaker
      }));
    } else if (format === 'swiss') {
      setOptions(prev => ({
        ...prev,
        tiebreakers: [], // Reset to empty array
        tiebreaker: undefined // Clear the single tiebreaker
      }));
    }
  };

  // Add a function to handle setting options for the active stage
  const handleSetOptions = (newOptions: any) => {
    if (activeStageSetup !== null) {
      // Update options for the specific stage
      setStageOptions(prev => ({
        ...prev,
        [activeStageSetup]: {
          ...prev[activeStageSetup],
          ...newOptions
        }
      }));
    } else {
      // Update global options
      setOptions(newOptions);
    }
  };
  
  // Add state for advanced settings fields
  const [gameMode, setGameMode] = useState("");
  const [maxRounds, setMaxRounds] = useState(16);

  const [vetoType, setVetoType] = useState("challengermode");
  const [substituteCount, setSubstituteCount] = useState(1);

  // Wylicz totalTeamsNeeded dla Round Robin
  let isRoundRobin = false;
  let rrTeamsPerGroup = 4;
  let rrGroups = 1;
  if (activeStageFormat === 'round-robin') {
    isRoundRobin = true;
    const stageOpts = activeStageSetup !== null && stageOptions[activeStageSetup] ? stageOptions[activeStageSetup] : options;
    rrTeamsPerGroup = typeof stageOpts.teamsPerGroup === 'number' ? stageOpts.teamsPerGroup : 4;
    rrGroups = typeof stageOpts.roundRobinGroups === 'number' ? stageOpts.roundRobinGroups : 1;
  }
  const totalTeamsNeeded = isRoundRobin ? rrTeamsPerGroup * rrGroups : parseInt(teamCount);

  // Add state for substitute teams
  const [substituteTeams, setSubstituteTeams] = useState<Participant[]>([]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        {/* Panel boczny z logo i krokami */}
        <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-[#222] p-6 space-y-8 overflow-y-auto">
          {/* Logo i nazwa turnieju */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-700 to-indigo-900 rounded-full flex items-center justify-center overflow-hidden">
              {tournamentLogo ? (
                <img src={tournamentLogo} alt="Tournament Logo" className="w-full h-full object-contain" />
              ) : (
                <Trophy className="h-10 w-10 text-yellow-500" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{tournamentName || "Mój turniej"}</h2>
            <div className="bg-green-500 text-black text-xs font-medium px-2 py-1 rounded-full">
              Konfiguracja
            </div>
          </div>
          
          {/* Nawigacja po krokach */}
          <div className="space-y-2">
            <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-4">OGÓLNE</h3>
            
            <button 
              onClick={() => setActiveTab("about")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "about" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              About
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "roles" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Users className="h-4 w-4 mr-2" />
              Role
            </button>

            <button 
              onClick={() => setActiveTab("basic")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "basic" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Panel kontrolny
            </button>

            {/* Move Appearance here */}
            <button 
              onClick={() => setActiveTab("appearance")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "appearance" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`} 
            > 
              <Sparkles className="h-4 w-4 mr-2" /> 
              Wygląd 
            </button> 
          </div>

          {/* Settings section remains, minus Appearance and Host */}
          <div className="space-y-2 mt-6">
            <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-4">USTAWIENIA</h3>
            
            <button 
              onClick={() => setActiveTab("teams")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "teams" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Users className="h-4 w-4 mr-2" />
              Drużyny
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "rules" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Regulamin
            </button>
            
            <button 
              onClick={() => setActiveTab("format")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "format" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Format
            </button>
            
            <button 
              onClick={() => setActiveTab("advanced")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "advanced" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Game Settings
            </button>

            {/* Dodaj zakładkę Time */}
            <button 
              onClick={() => setActiveTab("time")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "time" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`} 
            > 
              <Clock className="h-4 w-4 mr-2" /> 
              Czas 
            </button>

            {/* Dodaj zakładkę Prize Pool */}
            <button 
              onClick={() => setActiveTab("prizepool")} 
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "prizepool" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`} 
            > 
              <Trophy className="h-4 w-4 mr-2" /> 
              Prize Pool 
            </button>
          </div>

          {/* New section: Other (Reszta) */}
          <div className="space-y-2 mt-6">
            <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider mb-4">RESZTA</h3>
            <button
              onClick={() => setActiveTab("host")}
              className={`flex items-center w-full p-2 rounded-md ${activeTab === "host" ? "bg-[#222] text-white" : "text-gray-400 hover:bg-[#1a1a1a]"}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Host
            </button>
          </div>
        </div>
        
        {/* Główny panel z zawartością */}
        <div className="p-6 flex-1 overflow-auto">
          <div className={activeTab === "about" ? "block" : "hidden"}>
            <AboutTab
              name={tournamentName}
              setName={setTournamentName}
              description={aboutDescription}
              setDescription={setAboutDescription}
              contactUrl={aboutContactUrl}
              setContactUrl={setAboutContactUrl}
              videoUrl={aboutVideoUrl}
              setVideoUrl={setAboutVideoUrl}
              contactMethod={aboutContactMethod}
              setContactMethod={setAboutContactMethod}
            />
          </div>
          
          <div className={activeTab === "basic" ? "block" : "hidden"}>
            <BasicSettings
              tournamentFormat={tournamentStages.find((s: TournamentStage) => s.id === activeStageSetup)?.format || tournamentFormat}
              teamCount={teamCount}
              setTeamCount={setTeamCount}
              customTeamCount={customTeamCount}
              setCustomTeamCount={setCustomTeamCount}
              customCount={customCount}
              setCustomCount={setCustomCount}
              roundRobinGroups={roundRobinGroups}
              setRoundRobinGroups={setRoundRobinGroups}
              roundGroupsCount={roundGroupsCount}
              setRoundGroupsCount={setRoundGroupsCount}
              roundGroupsTeamsPerGroup={roundGroupsTeamsPerGroup}
              setRoundGroupsTeamsPerGroup={setRoundGroupsTeamsPerGroup}
              tournamentStages={tournamentStages}
              setTournamentStages={setTournamentStages}
              activeStageSetup={activeStageSetup}
              setActiveStageSetup={setActiveStageSetup}
              teamFormat={teamFormat}
              setTeamFormat={setTeamFormat}
            />
          </div>
          
          <div className={activeTab === "teams" ? "block" : "hidden"}>
            <TeamSelector 
              selectedTeams={selectedTeams}
              setSelectedTeams={setSelectedTeams}
              substituteTeams={substituteTeams}
              setSubstituteTeams={setSubstituteTeams}
              teamCount={totalTeamsNeeded.toString()}
              customTeamCount={isRoundRobin ? false : customTeamCount}
              customCount={customCount}
            />
          </div>
          
          <div className={activeTab === "format" ? "block" : "hidden"}>
            <FormatOptions
              tournamentFormat={activeStageFormat}
              thirdPlaceMatch={thirdPlaceMatch}
              setThirdPlaceMatch={setThirdPlaceMatch}
              grandFinalAdvantage={grandFinalAdvantage}
              setGrandFinalAdvantage={setGrandFinalAdvantage}
              doubleElimThirdPlace={doubleElimThirdPlace}
              setDoubleElimThirdPlace={setDoubleElimThirdPlace}
              roundRobinRematches={roundRobinRematches}
              setRoundRobinRematches={setRoundRobinRematches}
              roundRobinPlayoffs={roundRobinPlayoffs}
              setRoundRobinPlayoffs={setRoundRobinPlayoffs}
              roundRobinPlayoffTeams={roundRobinPlayoffTeams}
              setRoundRobinPlayoffTeams={setRoundRobinPlayoffTeams}
              roundRobinAdvancingTeams={roundRobinAdvancingTeams}
              setRoundRobinAdvancingTeams={setRoundRobinAdvancingTeams}
              teamCount={teamCount}
              setTeamCount={setTeamCount}
              customTeamCount={customTeamCount}
              setCustomTeamCount={setCustomTeamCount}
              customCount={customCount}
              setCustomCount={setCustomCount}
              roundRobinGroups={roundRobinGroups}
              setRoundRobinGroups={setRoundRobinGroups}
              swissRounds={swissRounds}
              setSwissRounds={setSwissRounds}
              swissPlayoffs={swissPlayoffs}
              setSwissPlayoffs={setSwissPlayoffs}
              swissPlayoffTeams={swissPlayoffTeams}
              setSwissPlayoffTeams={setSwissPlayoffTeams}
              options={activeStageSetup !== null && stageOptions[activeStageSetup] ? stageOptions[activeStageSetup] : options}
              setOptions={handleSetOptions}
              stageId={activeStageSetup || 1}
              activeStageFormat={activeStageFormat}
              skipGrandFinal={skipGrandFinal}
              setSkipGrandFinal={setSkipGrandFinal}
              skipLowerBracketFinal={skipLowerBracketFinal}
              setSkipLowerBracketFinal={setSkipLowerBracketFinal}
              roundGroupsCount={roundGroupsCount}
              tournamentStages={tournamentStages}
              setTournamentStages={setTournamentStages}
              activeStageSetup={activeStageSetup}
              setActiveStageSetup={setActiveStageSetup}
            />
          </div>
          
          <div className={activeTab === "advanced" ? "block" : "hidden"}>
            <AdvancedSettings
              swissTiebreakers={options.tiebreakers || []}
              setSwissTiebreakers={tiebreakers => setOptions(prev => ({ ...prev, tiebreakers }))}
              format={tournamentStages.find((s: TournamentStage) => s.id === activeStageSetup)?.format || tournamentFormat}
              teamFormat={teamFormat}
              setTeamFormat={setTeamFormat}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              gameMode={gameMode}
              setGameMode={setGameMode}
              maxRounds={maxRounds}
              setMaxRounds={setMaxRounds}
              maps={maps}
              setMaps={setMaps}
              vetoType={vetoType}
              setVetoType={setVetoType}
              substituteCount={substituteCount}
              setSubstituteCount={setSubstituteCount}
            />
          </div>
          
          <div className={activeTab === "appearance" ? "block" : "hidden"}>
            <AppearanceSelection
              tournamentLogo={tournamentLogo || ""}
              setTournamentLogo={setTournamentLogo}
              backgroundImage={backgroundImage || ""}
              setBackgroundImage={setBackgroundImage}
              organizerLogo={organizerLogo || ""}
              setOrganizerLogo={setOrganizerLogo}
            />
          </div>
          <div className={activeTab === "time" ? "block" : "hidden"}>
             <TimeSettings
               startDateTime={startDateTime}
               setStartDateTime={setStartDateTime}
               registrationOpenDateTime={registrationOpenDateTime}
               setRegistrationOpenDateTime={setRegistrationOpenDateTime}
               registrationCloseDateTime={registrationCloseDateTime}
               setRegistrationCloseDateTime={setRegistrationCloseDateTime}
               readyOpenDateTime={readyOpenDateTime}
               setReadyOpenDateTime={setReadyOpenDateTime}
               readyCloseDateTime={readyCloseDateTime}
               setReadyCloseDateTime={setReadyCloseDateTime}
             />
           </div>
           <div className={activeTab === "prizepool" ? "block" : "hidden"}>
             <PrizePoolSettings
               prizePool={prizePool}
               setPrizePool={setPrizePool}
               prizeDistribution={prizeDistribution}
               setPrizeDistribution={setPrizeDistribution}
               customPrizeDistribution={customPrizeDistribution}
               setCustomPrizeDistribution={setCustomPrizeDistribution}
               teamCount={selectedTeams.length || parseInt(teamCount)}
             />
           </div>
           <div className={activeTab === "roles" ? "block" : "hidden"}>
             <RolesTab roles={roles} setRoles={setRoles} />
           </div>
           <div className={activeTab === "rules" ? "block" : "hidden"}>
             <RulesTab rules={rules} setRules={setRules} rulesMeta={rulesMeta} setRulesMeta={setRulesMeta} />
           </div>
           <div className={activeTab === "host" ? "block" : "hidden"}>
             <HostTab
               organizerName={organizerName}
               setOrganizerName={setOrganizerName}
               organizerDescription={organizerDescription}
               setOrganizerDescription={setOrganizerDescription}
               organizerContact={organizerContact}
               setOrganizerContact={setOrganizerContact}
               organizerSocials={organizerSocials}
               setOrganizerSocials={setOrganizerSocials}
             />
           </div>
        </div>
        
        {/* Przyciski nawigacyjne */}
        <div className="p-6 border-t border-[#333] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
          <Button
            onClick={() => {
              console.log("Generate button clicked - direct handler");
              generateBracket();
            }}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-medium"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Bracket
          </Button>
        </div>
      </div>
    </div>
  )
}