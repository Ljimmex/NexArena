"use client";
import { useEffect, useState } from "react";
import TournamentNavigation from "@/components/tournament/TournamentNavigation";
import TournamentHeader from "@/components/tournament/TournamentHeader";
import { autoAdvanceOnDisqualification, walkoverDisqualification } from "@/components/generators/SingleElimination/MatchUtils";

export default function TeamsPage() {
  const [tournamentData, setTournamentData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("tournamentData");
      if (data) {
        setTournamentData(JSON.parse(data));
      }
    }
  }, []);

  // Liczniki statusów
  const readyCount = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'ready').length || 0;
  const confirmedCount = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'confirmed').length || 0;
  const registeredCount = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'registered').length || 0;
  const declinedCount = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'declined').length || 0;
  const disqualifiedCount = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'disqualified').length || 0;
  const substituteCount = tournamentData?.substituteTeams?.length || 0;
  // Liczba aktywnych drużyn (Registered Teams) - tylko status 'ready'
  const activeTeams = tournamentData?.selectedTeams?.filter((t: any) => t.status === 'ready').length || 0;
  const maxTeams = tournamentData?.customTeamCount ? tournamentData.customCount : parseInt(tournamentData?.teamCount || '0');

  // Dodaj funkcje do zmiany statusu
  const updateTeamStatus = (teamId: string, newStatus: string, reason?: string) => {
    if (!tournamentData) return;
    let updatedSelected = [...(tournamentData.selectedTeams || [])];
    let updatedSubstitutes = [...(tournamentData.substituteTeams || [])];
    const teamIdx = updatedSelected.findIndex((t: any) => t.id === teamId);
    if (teamIdx === -1) return;
    // Zmień status
    updatedSelected[teamIdx] = { ...updatedSelected[teamIdx], status: newStatus };
    // Jeśli dyskwalifikacja, zapisz powód
    if (newStatus === 'disqualified' && reason) {
      updatedSelected[teamIdx].disqualificationReason = reason;
      // --- WALKOWER: automatycznie awansuj przeciwnika w Single Elimination ---
      // Zakładamy, że pierwszy etap to single-elimination
      const firstStage = tournamentData?.stages?.[0];
      if (firstStage && firstStage.format === 'single-elimination') {
        const matchesKey = `matches-stage-${firstStage.id}`;
        const matchesRaw = localStorage.getItem(matchesKey);
        if (matchesRaw) {
          try {
            const matches = JSON.parse(matchesRaw);
            // Użyj nowej logiki walkowera!
            const updatedMatches = walkoverDisqualification(matches, updatedSelected, teamId);
            localStorage.setItem(matchesKey, JSON.stringify(updatedMatches));
          } catch (e) {
            console.error('Błąd walkowera:', e);
          }
        }
      }
    }
    // Jeśli Declined, promuj rezerwową, ale nie przenoś Declined do substituteTeams
    if (newStatus === 'declined') {
      if (updatedSubstitutes.length > 0) {
        const promoted = { ...updatedSubstitutes[0], status: 'registered' };
        updatedSelected.push(promoted);
        updatedSubstitutes.splice(0, 1);
      }
      // Declined zostaje w selectedTeams ze statusem 'declined'
    }
    const newTournamentData = { ...tournamentData, selectedTeams: updatedSelected, substituteTeams: updatedSubstitutes };
    setTournamentData(newTournamentData);
    localStorage.setItem('tournamentData', JSON.stringify(newTournamentData));
  };

  // Dodaj logikę okna Ready Window
  const now = new Date();
  const readyOpen = tournamentData?.readyOpenDateTime ? new Date(tournamentData.readyOpenDateTime) : null;
  const readyClose = tournamentData?.readyCloseDateTime ? new Date(tournamentData.readyCloseDateTime) : null;
  const isReadyWindowOpen = readyOpen && readyClose && now >= readyOpen && now <= readyClose;
  const isReadyWindowClosed = readyClose && now > readyClose;
  // Dodaj logikę czy można dyskwalifikować (po zamknięciu Ready Window)
  const canDisqualify = !!isReadyWindowClosed;

  // Start turnieju
  const startDate = tournamentData?.startDateTime ? new Date(tournamentData.startDateTime) : null;
  const canReplaceTeams = !!isReadyWindowClosed && startDate && now < startDate;

  // Funkcja do zamiany drużyny na rezerwową
  const replaceWithSubstitute = (teamId: string) => {
    if (!tournamentData) return;
    let updatedSelected = [...(tournamentData.selectedTeams || [])];
    let updatedSubstitutes = [...(tournamentData.substituteTeams || [])];
    const teamIdx = updatedSelected.findIndex((t: any) => t.id === teamId);
    if (teamIdx === -1 || updatedSubstitutes.length === 0) return;
    // Zastąp drużynę pierwszym rezerwowym
    const substitute = { ...updatedSubstitutes[0], status: 'ready' };
    // Dodaj zastępowaną drużynę na koniec rezerwowych (opcjonalnie z statusem 'substitute')
    // updatedSubstitutes.push({ ...updatedSelected[teamIdx], status: 'substitute' });
    updatedSelected[teamIdx] = substitute;
    updatedSubstitutes.splice(0, 1);
    const newTournamentData = { ...tournamentData, selectedTeams: updatedSelected, substituteTeams: updatedSubstitutes };
    setTournamentData(newTournamentData);
    localStorage.setItem('tournamentData', JSON.stringify(newTournamentData));
  };

  // Stan do obsługi wyboru rezerwowego
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [showSubstitutePicker, setShowSubstitutePicker] = useState(false);

  // Funkcja zamiany na wybraną drużynę rezerwową (nie usuwa zastąpionej, zmienia jej status na 'replaced')
  const replaceWithSelectedSubstitute = (teamId: string, substituteId: string) => {
    if (!tournamentData) return;
    let updatedSelected = [...(tournamentData.selectedTeams || [])];
    let updatedSubstitutes = [...(tournamentData.substituteTeams || [])];
    const teamIdx = updatedSelected.findIndex((t: any) => t.id === teamId);
    const subIdx = updatedSubstitutes.findIndex((t: any) => t.id === substituteId);
    if (teamIdx === -1 || subIdx === -1) return;
    // Oznacz zastępowaną drużynę jako replaced
    updatedSelected[teamIdx] = { ...updatedSelected[teamIdx], status: 'replaced' };
    // Dodaj rezerwowego na koniec listy z statusem 'ready'
    const substitute = { ...updatedSubstitutes[subIdx], status: 'ready' };
    updatedSelected.push(substitute);
    updatedSubstitutes.splice(subIdx, 1);
    const newTournamentData = { ...tournamentData, selectedTeams: updatedSelected, substituteTeams: updatedSubstitutes };
    setTournamentData(newTournamentData);
    localStorage.setItem('tournamentData', JSON.stringify(newTournamentData));
  };

  // Dodaj na górze komponentu:
  const [disqualifyTargetId, setDisqualifyTargetId] = useState<string | null>(null);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [selectedDisqualifyReason, setSelectedDisqualifyReason] = useState<string>("");
  const disqualificationReasons = [
    "Brak obecności",
    "Naruszenie regulaminu",
    "Nieuprawniony skład",
    "Cheety",
    "Zgłoszenie organizatora",
    "Inny powód"
  ];

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
        {/* Licznik statusów drużyn */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="rounded-lg bg-[#181c23] px-4 py-2 flex items-center gap-2">
            <span className="font-semibold text-white">Active Teams</span>
            <span className="text-lg font-bold text-yellow-400">{activeTeams}/{maxTeams}</span>
          </div>
          <div className="rounded-lg bg-green-900 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-green-200">Ready</span>
            <span className="font-bold">{readyCount}</span>
          </div>
          <div className="rounded-lg bg-blue-900 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-blue-200">Confirmed</span>
            <span className="font-bold">{confirmedCount}</span>
          </div>
          <div className="rounded-lg bg-yellow-700 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-yellow-200">Registered</span>
            <span className="font-bold">{registeredCount}</span>
          </div>
          <div className="rounded-lg bg-red-900 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-red-200">Declined</span>
            <span className="font-bold">{declinedCount}</span>
          </div>
          <div className="rounded-lg bg-orange-900 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-orange-200">Disqualified</span>
            <span className="font-bold">{disqualifiedCount}</span>
          </div>
          <div className="rounded-lg bg-purple-900 px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-purple-200">Substitute</span>
            <span className="font-bold">{substituteCount}</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Drużyny</h1>
        <p className="text-gray-300 mb-6">Lista drużyn biorących udział w turnieju.</p>
        {/* Podzielone listy drużyn według statusu */}
        {tournamentData?.selectedTeams && tournamentData.selectedTeams.length > 0 ? (
          <div className="space-y-8">
            {/* Ready */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'ready') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-green-400">Ready Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'ready').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-green-700 text-green-200">Ready</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                      {/* Przycisk Disqualify po zamknięciu Ready Window tylko dla statusu 'ready' */}
                      {(canDisqualify) && (
                        <div className="flex flex-row gap-2 ml-2">
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-700 hover:bg-orange-800 transition-colors duration-150 text-white text-xl focus:outline-none"
                            title="Disqualify team"
                            onClick={() => { setDisqualifyTargetId(team.id); setShowDisqualifyModal(true); }}
                          >
                            <span role="img" aria-label="Disqualify">🚫</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {/* Confirmed */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'confirmed') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-blue-400">Confirmed Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'confirmed').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-blue-700 text-blue-200">Confirmed</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                      {/* Przycisk Ready tylko gdy Ready Window otwarte */}
                      {isReadyWindowOpen && (
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-600 hover:bg-yellow-700 transition-colors duration-150 text-white text-xl focus:outline-none ml-2"
                          title="Mark as Ready"
                          onClick={() => updateTeamStatus(team.id, 'ready')}
                        >
                          <span role="img" aria-label="Ready">⏳</span>
                        </button>
                      )}
                      {/* Przycisk Zastąp rezerwowym po Ready Window, przed startem turnieju - otwiera modal wyboru */}
                      {canReplaceTeams && tournamentData.substituteTeams?.length > 0 && (
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-700 hover:bg-purple-800 transition-colors duration-150 text-white text-xl focus:outline-none ml-2"
                          title="Zastąp rezerwowym"
                          onClick={() => { setReplaceTargetId(team.id); setShowSubstitutePicker(true); }}
                        >
                          <span role="img" aria-label="Replace">🔄</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {/* Registered */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'registered') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-yellow-400">Registered Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'registered').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-yellow-700 text-yellow-200">Registered</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                      {/* Przyciski Confirmed/Declined dla Registered */}
                      <div className="flex flex-row gap-2 ml-2">
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-150 text-white text-xl focus:outline-none"
                          title="Mark as Confirmed"
                          onClick={() => updateTeamStatus(team.id, 'confirmed')}
                        >
                          ✓
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-150 text-white text-xl focus:outline-none"
                          title="Mark as Declined"
                          onClick={() => updateTeamStatus(team.id, 'declined')}
                        >
                          ✗
                        </button>
                      </div>
                      {/* Przycisk Zastąp rezerwowym po Ready Window, przed startem turnieju - otwiera modal wyboru */}
                      {canReplaceTeams && tournamentData.substituteTeams?.length > 0 && (
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-700 hover:bg-purple-800 transition-colors duration-150 text-white text-xl focus:outline-none ml-2"
                          title="Zastąp rezerwowym"
                          onClick={() => { setReplaceTargetId(team.id); setShowSubstitutePicker(true); }}
                        >
                          <span role="img" aria-label="Replace">🔄</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {/* Replaced */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'replaced') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-400">Replaced Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'replaced').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] opacity-50 grayscale">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-gray-700 text-gray-200">Replaced</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {/* Declined */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'declined') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-red-400">Declined Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'declined').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] opacity-50 grayscale">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-red-700 text-red-200">Declined</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {/* Disqualified */}
            {tournamentData.selectedTeams.some((team: any) => team.status === 'disqualified') && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-orange-400">Disqualified Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.selectedTeams.filter((team: any) => team.status === 'disqualified').map((team: any) => (
                  <div key={team.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] opacity-50 grayscale">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                          <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-orange-700 text-orange-200">Disqualified</span>
                        </h3>
                        {team.seed && (
                          <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Brak drużyn w turnieju.</p>
          </div>
        )}
        {/* Sekcja rezerwowych drużyn */}
        {tournamentData?.substituteTeams && tournamentData.substituteTeams.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3 text-purple-300 flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-purple-400 rounded-full"></span>
              Substitute Teams
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isReadyWindowClosed ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
              {tournamentData.substituteTeams.map((team: any, index: number) => (
                <div key={team.id} className="bg-[#18112a] rounded-lg p-4 border border-[#333]">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white flex items-center gap-2">{team.name}
                        <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-purple-900 text-purple-300">Substitute</span>
                      </h3>
                      {team.seed && (
                        <p className="text-sm text-gray-400">Seed: {team.seed}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modal wyboru rezerwowego */}
      {showSubstitutePicker && replaceTargetId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-lg shadow-lg min-w-[300px]">
            <h2 className="text-lg font-bold mb-4 text-white">Wybierz drużynę rezerwową</h2>
            <ul>
              {tournamentData.substituteTeams.map((sub: any) => (
                <li key={sub.id} className="mb-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      replaceWithSelectedSubstitute(replaceTargetId, sub.id);
                      setShowSubstitutePicker(false);
                      setReplaceTargetId(null);
                    }}
                  >
                    {sub.logo && <img src={sub.logo} alt={sub.name} className="w-6 h-6 rounded-full" />}
                    <span>{sub.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => { setShowSubstitutePicker(false); setReplaceTargetId(null); }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
      {showDisqualifyModal && disqualifyTargetId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-lg shadow-lg min-w-[320px]">
            <h2 className="text-lg font-bold mb-4 text-white">Wybierz powód dyskwalifikacji</h2>
            <ul className="mb-4">
              {disqualificationReasons.map(reason => (
                <li key={reason} className="mb-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => {
                      updateTeamStatus(disqualifyTargetId, 'disqualified', reason);
                      setShowDisqualifyModal(false);
                      setDisqualifyTargetId(null);
                      setSelectedDisqualifyReason("");
                    }}
                  >
                    {reason}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-2 px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => { setShowDisqualifyModal(false); setDisqualifyTargetId(null); setSelectedDisqualifyReason(""); }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
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