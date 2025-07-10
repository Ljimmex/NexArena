"use client";
import { useEffect, useState } from "react";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import TournamentHeader from "@/components/tournament/TournamentHeader";
import { FormatDescription, TournamentDescription, Teams, Timeline, Results, Admins, Rules, OrganizerDescription } from "@/components/tournament/overview";
import GameSettings from '@/components/tournament/overview/GameSettings';

export default function OverviewPage() {
  const [tournamentData, setTournamentData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("tournamentData");
      if (data) {
        setTournamentData(JSON.parse(data));
      }
    }
  }, []);

  if (!tournamentData) {
    return (
      <div className="container mx-auto py-8">
        <TournamentNavigation />
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
          <div className="text-center py-12">
            <p className="text-gray-400">Brak danych turnieju.</p>
          </div>
        </div>
      </div>
    );
  }

  // Example data for timeline, admins, rules, results (replace with real data as needed)
  const timeline = [
    tournamentData.registrationOpenDateTime && {
      date: tournamentData.registrationOpenDateTime,
      title: "Registration Opens",
      description: "Registration opens for the tournament."
    },
    tournamentData.registrationCloseDateTime && {
      date: tournamentData.registrationCloseDateTime,
      title: "Registration Closes",
      description: "Registration closes for the tournament."
    },
    tournamentData.readyOpenDateTime && {
      date: tournamentData.readyOpenDateTime,
      title: "Confirmation Opens",
      description: "Confirmation window opens for teams."
    },
    tournamentData.readyCloseDateTime && {
      date: tournamentData.readyCloseDateTime,
      title: "Confirmation Closes",
      description: "Confirmation window closes for teams."
    },
    tournamentData.startDateTime && {
      date: tournamentData.startDateTime,
      title: "Tournament Start",
      description: "The tournament starts and you will get notified about your first match."
    }
  ].filter(Boolean);

  // Helper to flatten RuleSection[] to string[] for display (for fallback only)
  function flattenRules(rulesData: any): string[] {
    if (!Array.isArray(rulesData)) return [];
    const result: string[] = [];
    const walk = (points: any[], prefix = "") => {
      points.forEach((point, idx) => {
        const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        if (typeof point === 'string') {
          result.push(point);
        } else if (point && typeof point === 'object' && point.text) {
          result.push((number ? number + ". " : "") + point.text);
          if (Array.isArray(point.children)) walk(point.children, number);
        }
      });
    };
    rulesData.forEach((section: any) => {
      if (section && section.title) {
        result.push(section.icon ? `${section.icon} ${section.title}` : section.title);
      }
      if (Array.isArray(section.points)) walk(section.points);
    });
    return result;
  }

  const admins = tournamentData.admins || [];
  // Prepare rules sections and meta fields for Rules component
  const rulesSections = Array.isArray(tournamentData.rules) && tournamentData.rules.length > 0 && typeof tournamentData.rules[0] === 'object'
    ? tournamentData.rules
    : [];
  const rulesMeta = {
    version: tournamentData.rulesVersion || '',
    approvedBy: tournamentData.rulesApprovedBy || '',
    approvedDate: tournamentData.rulesApprovedDate || '',
  };
  // Fallback for old string[] rules
  const rulesFallback = rulesSections.length === 0 ? (tournamentData.rules || ["Zasada 1", "Zasada 2", "Zasada 3"]) : undefined;
  const results = tournamentData.results || [];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <FormatDescription formatName={tournamentData.tournamentFormat} description={tournamentData.formatDescription || "Brak opisu formatu."} />
        <TournamentDescription description={tournamentData.about?.description || tournamentData.tournamentDescription || "Brak opisu turnieju."} />
        <Teams teams={tournamentData.selectedTeams || []} substituteTeams={tournamentData.substituteTeams || []} maxTeams={tournamentData.teamCount} />
        <GameSettings maps={tournamentData.selectedMaps || []} />
        <Timeline tournamentData={tournamentData} />
        <Results 
          results={results}
          prizePool={tournamentData.prizePool}
          prizeDistribution={tournamentData.prizeDistribution}
          customPrizeDistribution={tournamentData.customPrizeDistribution}
          teams={tournamentData.selectedTeams}
        />
        <Admins admins={admins} />
        <div className="col-span-1 lg:col-span-2">
          <OrganizerDescription 
            description={tournamentData.organizerDescription || "Brak opisu organizatora."}
            logo={tournamentData.organizerLogo}
            name={tournamentData.organizer}
            contact={tournamentData.organizerContact}
            socials={tournamentData.organizerSocials}
          />
        </div>
      </div>
      {/* Standalone Rules tile below the grid */}
      <div className="mt-8">
        {tournamentData.rules && <Rules {...tournamentData.rules} />}
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