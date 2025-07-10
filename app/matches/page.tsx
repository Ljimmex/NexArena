"use client";
import { useEffect, useState } from "react";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import TournamentHeader from "@/components/tournament/TournamentHeader";

export default function MatchesPage() {
  const [tournamentData, setTournamentData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("tournamentData");
      if (data) {
        setTournamentData(JSON.parse(data));
      }
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      {tournamentData && (
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
          maxTeams={tournamentData.customTeamCount ? tournamentData.customCount : parseInt(tournamentData.teamCount)}
          prizePool={tournamentData.prizePool}
        />
      )}
      <TournamentNavigation />
      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-4">Mecze</h1>
        <p className="text-gray-300 mb-6">Terminarz i wyniki meczów turnieju.</p>
        
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Funkcja meczów będzie dostępna wkrótce.</p>
            <p className="text-sm text-gray-500">
              Tutaj będzie można przeglądać terminarz meczów, wyniki i statystyki.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const getGameIcon = (gameId: string): string => {
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
};