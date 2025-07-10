"use client"

import React, { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import TournamentHeader from "@/components/tournament/TournamentHeader";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import StageTabs from "./components/StageTabs";
import StageBracketView from "./components/StageBracketView";
import {
  getStageOptions,
  getStageParticipants,
  isSwissStageComplete,
  isRoundRobinStageComplete,
  isSingleEliminationStageComplete,
  isDoubleEliminationStageComplete
} from "./components/bracketUtils";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BracketPage() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [stageProgress, setStageProgress] = useState<Record<number, number>>({});
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('tournamentData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setTournamentData(parsedData);
        if (parsedData.stages && parsedData.stages.length > 0) {
          const initialProgress: Record<number, number> = {};
          parsedData.stages.forEach((stage: any, index: number) => {
            initialProgress[stage.id] = index === 0 ? 100 : Math.max(0, 100 - (index * 50));
          });
          setStageProgress(initialProgress);
        }
      } catch (e) {
        console.error("Error parsing tournament data:", e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tournamentData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">No Tournament Data Found</h1>
        <p>Please go back and create a tournament first.</p>
      </div>
    )
  }

  // Ustal maxTeams bezpiecznie
  const maxTeams = Number(tournamentData?.teamCount);

  // Seedy i warunek seedowania dla Single/Double Elimination
  let seededTeams: any[] = [];
  const isFirstStageSingleElimination = tournamentData?.stages && tournamentData.stages.length > 0 && tournamentData.stages[0].format === 'single-elimination' && activeStage === tournamentData.stages[0].id;
  const isFirstStageDoubleElimination = tournamentData?.stages && tournamentData.stages.length > 0 && tournamentData.stages[0].format === 'double-elimination' && activeStage === tournamentData.stages[0].id;
  if (isFirstStageSingleElimination || isFirstStageDoubleElimination) {
    const data = localStorage.getItem('tournamentData');
    if (data) {
      const parsed = JSON.parse(data);
      seededTeams = (parsed.selectedTeams || []).filter((t: any) => Number.isInteger(t.seed));
      seededTeams = seededTeams.sort((a: any, b: any) => (a.seed || 9999) - (b.seed || 9999));
    }
  }
  const hasSeeding =
    seededTeams.length === maxTeams &&
    seededTeams.every(t => Number.isInteger(t.seed) && t.seed >= 1 && t.seed <= maxTeams);

  const isSingleStage = tournamentData.stages && tournamentData.stages.length === 1;

  const now = new Date();
  const readyClose = tournamentData?.readyCloseDateTime ? new Date(tournamentData.readyCloseDateTime) : null;
  const isReadyWindowClosed = !!(readyClose && now > readyClose);

  return (
    <div className="container mx-auto py-4">
      <TournamentHeader
        tournamentName={tournamentData.tournamentName}
        tournamentLogo={tournamentData.tournamentLogo}
        game={tournamentData.selectedGame}
        gameIcon={getGameIcon(tournamentData.selectedGame)}
        format={tournamentData.tournamentFormat}
        organizer={tournamentData.organizer}
        organizerLogo={tournamentData.organizerLogo}
        backgroundImage={tournamentData.backgroundImage}
        teamFormat={tournamentData.teamFormat}
        substituteCount={Array.isArray(tournamentData.selectedTeams) ? tournamentData.selectedTeams.filter((t: any) => t.status === 'substitute').length : 0}
        startDate={tournamentData.startDateTime}
        startTime={tournamentData.startDateTime ? tournamentData.startDateTime.split('T')[1] || '' : ''}
        registrationEndDate={tournamentData.registrationCloseDateTime}
        registrationEndTime={tournamentData.registrationCloseDateTime ? tournamentData.registrationCloseDateTime.split('T')[1] || '' : ''}
        confirmationEndDate={tournamentData.readyCloseDateTime}
        confirmationEndTime={tournamentData.readyCloseDateTime ? tournamentData.readyCloseDateTime.split('T')[1] || '' : ''}
        registeredTeams={Array.isArray(tournamentData.selectedTeams) ? tournamentData.selectedTeams.filter((t: any) => t.status !== 'substitute').length : 0}
        maxTeams={Number(tournamentData.teamCount)}
        prizePool={tournamentData.prizePool}
      />
      <TournamentNavigation />
      {/* Jeśli JEDEN etap: nie pokazuj StageTabs, tylko StageBracketView i przycisk Seeding */}
      {isSingleStage ? (
        <div className="relative">
          {/* Przycisk Seeding dla single-elimination i double-elimination, tylko jeśli nie ma pełnego seedowania */}
          {(tournamentData.stages[0].format === 'single-elimination' || tournamentData.stages[0].format === 'double-elimination') && !hasSeeding && isReadyWindowClosed && (
            <button
              className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 bg-[#222] border border-[#333] rounded-lg shadow hover:bg-[#333] text-white z-10"
              onClick={() => router.push('/seeding')}
            >
              <MoreHorizontal className="h-5 w-5" />
              Seeding
            </button>
          )}
          <StageBracketView
            stage={tournamentData.stages[0]}
            index={0}
            activeStage={tournamentData.stages[0].id}
            hasSeeding={hasSeeding}
            seededTeams={seededTeams}
            getStageOptions={(format) => getStageOptions(format, tournamentData.formatOptions, tournamentData, maxTeams)}
            getStageParticipants={(stage) => getStageParticipants(stage, tournamentData)}
            isSwissStageComplete={(stageId) => isSwissStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
            isRoundRobinStageComplete={(stageId) => isRoundRobinStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
            isSingleEliminationStageComplete={(stageId) => isSingleEliminationStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
            isDoubleEliminationStageComplete={(stageId) => isDoubleEliminationStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
            maxTeams={maxTeams}
          />
        </div>
      ) : (
        // WIELE etapów: StageTabs jak dotychczas
        <StageTabs
          stages={tournamentData.stages}
          activeStage={activeStage}
          setActiveStage={setActiveStage}
          stageProgress={stageProgress}
          menuOpenIdx={menuOpenIdx}
          setMenuOpenIdx={setMenuOpenIdx}
          menuPosition={menuPosition}
          setMenuPosition={setMenuPosition}
          menuRef={menuRef}
          isReadyWindowClosed={isReadyWindowClosed}
        >
          {tournamentData.stages.map((stage: any, index: number) => (
            <StageBracketView
              key={stage.id}
              stage={stage}
              index={index}
              activeStage={activeStage}
              hasSeeding={hasSeeding}
              seededTeams={seededTeams}
              getStageOptions={(format) => getStageOptions(format, tournamentData.formatOptions, tournamentData, maxTeams)}
              getStageParticipants={(stage) => getStageParticipants(stage, tournamentData)}
              isSwissStageComplete={(stageId) => isSwissStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
              isRoundRobinStageComplete={(stageId) => isRoundRobinStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
              isSingleEliminationStageComplete={(stageId) => isSingleEliminationStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
              isDoubleEliminationStageComplete={(stageId) => isDoubleEliminationStageComplete(stageId, tournamentData, tournamentData.formatOptions)}
              maxTeams={maxTeams}
            />
          ))}
        </StageTabs>
      )}
    </div>
  );
}

function getGameIcon(gameId: string): string {
  const iconMap: Record<string, string> = {
    'Counter Strike 2': '/games/cs2.png',
    'valorant': '/games/valo.png',
    'League of Legends': '/games/lol.png',
    'dota2': '/games/dota2.png',
    'rl': '/games/rocket-league.png',
    'fortnite': '/games/fortnite.png',
    'apex': '/games/apex.png',
    'overwatch': '/games/overwatch.png'
  };
  return iconMap[gameId] || '/games/default.png';
}



