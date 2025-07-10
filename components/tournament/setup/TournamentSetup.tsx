"use client"

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentStages from "./TournamentStages";
import FormatOptions from "./FormatOptions";
import TeamSelector from "./TeamSelector";
import { TournamentStage } from "@/types/tournament";
import { Participant } from "@/types/participants";
import { AppearanceSelection } from "./AppearanceSelection";
import TimeSettings from "./TimeSettings";
import PrizePoolSettings from "./PrizePoolSettings";
import RolesTab, { RolesTabProps, RoleEntry } from "./RolesTab";
import RulesTab, { RuleSection } from "./RulesTab";
import HostTab from "./HostTab";
import { MapType } from "@/types/ui";
import AdvancedSettings from "./AdvancedSettings";
import BasicSettings from "./BasicSettings";

interface TournamentSetupProps {
  onGenerateBracket: (data: any) => void;
  activeStageSetup: number | null;
  setActiveStageSetup: (stageId: number) => void;
}

export default function TournamentSetup({ 
  onGenerateBracket, 
  activeStageSetup, 
  setActiveStageSetup 
}: TournamentSetupProps) {
  // Dodaj brakujące stany
  const [tournamentStages, setTournamentStages] = useState<TournamentStage[]>([
    { id: 1, name: "Stage 1", format: "single-elimination" }
  ]);
  
  // Format-specific options
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(false);
  const [grandFinalAdvantage, setGrandFinalAdvantage] = useState(false);
  const [doubleElimThirdPlace, setDoubleElimThirdPlace] = useState(false);
  const [roundRobinRematches, setRoundRobinRematches] = useState(false);
  const [roundRobinPlayoffs, setRoundRobinPlayoffs] = useState(false);
  const [roundRobinPlayoffTeams, setRoundRobinPlayoffTeams] = useState(4);
  const [roundRobinAdvancingTeams, setRoundRobinAdvancingTeams] = useState(2);
  const [roundRobinGroups, setRoundRobinGroups] = useState(2);
  const [swissRounds, setSwissRounds] = useState(0);
  const [swissPlayoffs, setSwissPlayoffs] = useState(false);
  const [swissPlayoffTeams, setSwissPlayoffTeams] = useState(4);

  // Dodaj brakujące stany dla Appearance
  const [tournamentLogo, setTournamentLogo] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [organizerLogo, setOrganizerLogo] = useState<string>("");

  // Add missing states for other options
  const [skipGrandFinal, setSkipGrandFinal] = useState(false);
  const [skipLowerBracketFinal, setSkipLowerBracketFinal] = useState(false);
  const [teamCount, setTeamCount] = useState("8");
  const [customTeamCount, setCustomTeamCount] = useState(false);
  const [customCount, setCustomCount] = useState(8);
  const [roundGroupsCount, setRoundGroupsCount] = useState(4);

  // Dodaj nową funkcję do generowania daty przesuniętej o X minut od teraz
  function getDateTimePlusMinutes(offsetMinutes: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + offsetMinutes);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }

  // Dodaj funkcję do generowania lokalnego czasu w formacie datetime-local
  function getLocalDateTimePlusMinutes(offsetMinutes: number) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + offsetMinutes);
    d.setSeconds(0, 0);
    // Zwróć lokalny czas w formacie YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Zmień domyślne wartości terminów turnieju na lokalne
  const [registrationOpenDateTime, setRegistrationOpenDateTime] = useState(getLocalDateTimePlusMinutes(0));
  const [registrationCloseDateTime, setRegistrationCloseDateTime] = useState(getLocalDateTimePlusMinutes(3));
  const [readyOpenDateTime, setReadyOpenDateTime] = useState(getLocalDateTimePlusMinutes(4));
  const [readyCloseDateTime, setReadyCloseDateTime] = useState(getLocalDateTimePlusMinutes(7));
  const [startDateTime, setStartDateTime] = useState(getLocalDateTimePlusMinutes(10));

    // Dodaj stany dla Prize Pool
    const [prizePool, setPrizePool] = useState("$1000");
    const [prizeDistribution, setPrizeDistribution] = useState("50-percent-rule");
    const [customPrizeDistribution, setCustomPrizeDistribution] = useState<Record<string, number>>({
      "1": 50,
      "2": 25,
      "3": 15,
      "4": 10
    });

  // Dodaj stan dla wybranych drużyn
  const [selectedTeams, setSelectedTeams] = useState<Participant[]>([]);

  // Add options state
  const [options, setOptions] = useState({
    swissMode: 'topCut' as 'playAllRounds' | 'topCut',
    tiebreaker: 'buchholz',
    roundRobinTiebreaker: 'headToHead',
    useTiebreakers: true,
    tiebreakers: [] as string[],
    roundRobinAdvancingTeams: 2,
    scoreConfig: {
      win: 3,
      loss: 0,
      draw: 1,
      bye: 3,
      winOvertime: 2,
      lossOvertime: 1
    }
  });

  // Add the missing handler function
  const handleFormatChange = (format: string) => {
    // Update the main tournament format when the first stage format changes
    console.log(`Format changed to: ${format}`);
  };

  const handleStageFormatChange = (format: string) => {
    handleFormatChange(format);
  };

  const [activeTab, setActiveTab] = useState("basic");

  // Resetuj zakładkę do "basic" po zmianie aktywnego etapu
  useEffect(() => {
    setActiveTab("basic");
  }, [activeStageSetup]);

  // Add roles state
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

  // Add rulesMeta state for meta info from RulesTab
  const [rulesMeta, setRulesMeta] = useState({
    approvedBy: "",
    approvedDate: "",
    version: "",
    pdfUrl: "",
    wordUrl: "",
    previewUrl: ""
  });

  // Synchronizuj rules z localStorage
  useEffect(() => {
    localStorage.setItem("tournamentRules", JSON.stringify(rules));
  }, [rules]);

  // Dodaj stany dla HostTab
  const [organizerName, setOrganizerName] = useState("Tournament Organizer");
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

  // Funkcja do generowania turnieju i przekazania WSZYSTKICH pól do onGenerateBracket
  const handleGenerate = () => {
    const tournamentData = {
      // Przykładowe pola, rozwiń według potrzeb
      tournamentName: "Turniej bez nazwy", // Dodaj pobieranie z inputa jeśli masz
      tournamentFormat: tournamentStages[0]?.format || "single-elimination",
      teamCount: customTeamCount ? customCount : parseInt(teamCount),
      thirdPlaceMatch,
      selectedTeams,
      startDateTime,
      registrationOpenDateTime,
      registrationCloseDateTime,
      readyOpenDateTime,
      readyCloseDateTime,
      stages: tournamentStages,
      formatOptions: options,
      tournamentLogo,
      backgroundImage,
      organizerLogo,
      prizePool,
      prizeDistribution,
      customPrizeDistribution,
      admins: roles, // Add roles as admins
      rules, // Dodaj rules do tournamentData
      organizer: organizerName,
      organizerDescription,
      organizerContact,
      organizerSocials,
      teamFormat,
      gameMode,
      maxRounds,
      maps,
      vetoType,
      substituteCount,
      // Dodaj inne pola jeśli są potrzebne
    };
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData)); // Ensure localStorage is updated
    onGenerateBracket(tournamentData);
  };

  // Add state for new advanced fields
  const [teamFormat, setTeamFormat] = useState("5v5");
  const [gameMode, setGameMode] = useState("");
  const [maxRounds, setMaxRounds] = useState(16);
  const [maps, setMaps] = useState<MapType[]>([]);
  const [vetoType, setVetoType] = useState("challengermode");
  const [substituteCount, setSubstituteCount] = useState(1);

  // Add selectedGame state
  const [selectedGame, setSelectedGame] = useState("cs2");

  // Dodaj brakujący stan na górze komponentu:
  const [roundGroupsTeamsPerGroup, setRoundGroupsTeamsPerGroup] = useState(4);

  return (
    <div className="space-y-8">
      {/* Pasek z tytułem i opisem zakładki na górze ekranu */}
      <div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6 shadow-lg">
        <h3 className="text-2xl font-bold m-0 p-0">Panel kontrolny</h3>
        <p className="text-gray-400 mt-0 p-0">Konfiguruj turniej krok po kroku z tego panelu kontrolnego.</p>
      </div>

      <Separator />

      {/* Tournament Stages - przeniesione na samą górę */}
      <div className="space-y-4">
        <TournamentStages 
          stages={tournamentStages} 
          setStages={setTournamentStages} 
          onFormatChange={handleStageFormatChange}
          activeStageSetup={activeStageSetup}
          setActiveStageSetup={setActiveStageSetup}
        />
        <FormatOptions
          tournamentFormat={tournamentStages[0]?.format || "single-elimination"}
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
          options={options}
          setOptions={setOptions}
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

      {/* Stage-specific format options */}
      {tournamentStages.length > 0 && (
        <div className="space-y-4">
          {/* Zakładki */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-8">
              <TabsTrigger value="basic">Podstawowe Ustawienia</TabsTrigger>
              <TabsTrigger value="teams">Wybór Drużyn</TabsTrigger>
              <TabsTrigger value="advanced">Zaawansowane Ustawienia</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="time">Czas</TabsTrigger>
              <TabsTrigger value="prizepool">Prize Pool</TabsTrigger>
              <TabsTrigger value="host">Host</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              {/* Podstawowe opcje dla etapu */}
              {activeStageSetup !== null ? (() => {
                const activeStage = tournamentStages.find((s: TournamentStage) => s.id === activeStageSetup);
                if (!activeStage) return null;
                return (
                  <div>
                    <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                      <h3 className="text-2xl font-bold m-0 p-0">Podstawowe Ustawienia</h3>
                      <p className="text-gray-400 mt-0 p-0">Skonfiguruj podstawowe ustawienia wybranego etapu turnieju.</p>
                    </div>
                    <div className={activeTab === "basic" ? "block" : "hidden"}>
                      <BasicSettings
                        tournamentFormat={activeStage.format}
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
                  </div>
                );
              })() : (
                <div className="text-gray-400">Wybierz etap, aby edytować podstawowe ustawienia.</div>
              )}
            </TabsContent>
            
            <TabsContent value="teams" className="space-y-4 pt-4">
              {/* Zakładka z wyborem drużyn */}
              {activeStageSetup !== null ? (
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                    <h3 className="text-2xl font-bold m-0 p-0">Wybór Drużyn</h3>
                    <p className="text-gray-400 mt-0 p-0">Wybierz drużyny biorące udział w tym etapie.</p>
                  </div>
                  <div className={activeTab === "teams" ? "block" : "hidden"}>
                    <TeamSelector
                      selectedTeams={selectedTeams}
                      setSelectedTeams={setSelectedTeams}
                      substituteTeams={[]} // Assuming substituteTeams is an empty array for now
                      setSubstituteTeams={() => {}} // Assuming setSubstituteTeams is a no-op for now
                      teamCount={teamCount}
                      customTeamCount={customTeamCount}
                      customCount={customCount}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Wybierz etap, aby wybrać drużyny.</div>
              )}
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-4">
              {/* Zaawansowane opcje dla etapu */}
              {activeStageSetup !== null ? (
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                    <h3 className="text-2xl font-bold m-0 p-0">Zaawansowane Ustawienia</h3>
                    <p className="text-gray-400 mt-0 p-0">Skonfiguruj zaawansowane opcje formatu dla tego etapu.</p>
                  </div>
                  <div className={activeTab === "advanced" ? "block" : "hidden"}>
                    <AdvancedSettings
                      swissTiebreakers={options.tiebreakers || []}
                      setSwissTiebreakers={tiebreakers => setOptions(prev => ({ ...prev, tiebreakers }))}
                      format={tournamentStages.find((s: TournamentStage) => s.id === activeStageSetup)?.format || "single-elimination"}
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
                </div>
              ) : (
                <div className="text-gray-400">Wybierz etap, aby edytować zaawansowane ustawienia.</div>
              )}
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4 pt-4">
              {/* Zakładka Appearance */}
              {activeStageSetup !== null ? (
                <div>
                  <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                    <h3 className="text-2xl font-bold m-0 p-0">Appearance</h3>
                    <p className="text-gray-400 mt-0 p-0">Dostosuj logo, tło i wygląd turnieju.</p>
                  </div>
                  <AppearanceSelection
                    tournamentLogo={tournamentLogo || ""}
                    setTournamentLogo={setTournamentLogo}
                    backgroundImage={backgroundImage || ""}
                    setBackgroundImage={setBackgroundImage}
                    organizerLogo={organizerLogo || ""}
                    setOrganizerLogo={setOrganizerLogo}
                  />
                </div>
              ) : (
                <div className="text-gray-400">Wybierz etap, aby edytować ustawienia wyglądu.</div>
              )}
            </TabsContent>
            
            <TabsContent value="roles" className="space-y-4 pt-4">
              <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                <h3 className="text-2xl font-bold m-0 p-0">Roles</h3>
                <p className="text-gray-400 mt-0 p-0">Dodaj administratorów, moderatorów, komentatorów do turnieju.</p>
              </div>
              <RolesTab roles={roles} setRoles={setRoles} />
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-4 pt-4">
              <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                <h3 className="text-2xl font-bold m-0 p-0">Regulamin</h3>
                <p className="text-gray-400 mt-0 p-0">Edytuj sekcje regulaminu, pobierz PDF/Word lub zobacz online.</p>
              </div>
              <RulesTab rules={rules} setRules={setRules} rulesMeta={rulesMeta} setRulesMeta={setRulesMeta} />
            </TabsContent>
            
            <TabsContent value="time" className="space-y-4 pt-4">
              {/* Zakładka z ustawieniami czasu */}
              {activeStageSetup !== null ? (
                <div>
                  <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                    <h3 className="text-2xl font-bold m-0 p-0">Czas</h3>
                    <p className="text-gray-400 mt-0 p-0">Ustaw daty i godziny dla tego etapu turnieju.</p>
                  </div>
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
              ) : (
                <div className="text-gray-400">Wybierz etap, aby edytować ustawienia czasu.</div>
              )}
            </TabsContent>
            
            <TabsContent value="prizepool" className="space-y-4 pt-4">
              {/* Zakładka z ustawieniami puli nagród */}
              {activeStageSetup !== null ? (
                <div>
                  <div className="bg-[#1a1a1a] border-b border-[#333] px-6 py-3 rounded-t-md flex flex-row items-center gap-6">
                    <h3 className="text-2xl font-bold m-0 p-0">Prize Pool</h3>
                    <p className="text-gray-400 mt-0 p-0">Ustaw pulę nagród i sposób jej dystrybucji.</p>
                  </div>
                  <PrizePoolSettings
                    prizePool={prizePool}
                    setPrizePool={setPrizePool}
                    prizeDistribution={prizeDistribution}
                    setPrizeDistribution={setPrizeDistribution}
                    customPrizeDistribution={customPrizeDistribution}
                    setCustomPrizeDistribution={setCustomPrizeDistribution}
                    teamCount={selectedTeams.length || 8}
                  />
                </div>
              ) : (
                <div className="text-gray-400">Wybierz etap, aby edytować ustawienia puli nagród.</div>
              )}
            </TabsContent>
            
            <TabsContent value="host" className="space-y-4 pt-4">
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
            </TabsContent>
          </Tabs>
          <div className="flex justify-end pt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors"
              onClick={handleGenerate}
            >
              Generuj drabinkę
            </button>
          </div>
        </div>
      )}
    </div>
  );
}