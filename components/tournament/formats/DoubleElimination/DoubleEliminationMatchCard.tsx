import React from "react";
import type { Participant, Match } from "@/types/index";

interface DoubleEliminationMatchCardProps {
  match: Match;
  position: { left: string; top: string };
  getTeamName: (participant: Participant | undefined, match: Match, isFirstParticipant: boolean) => string;
  handleWinnerChange: (matchId: number, winnerId: string) => void;
  editable?: boolean;
  onDisqualify?: (teamId: string) => void;
}

export const DoubleEliminationMatchCard: React.FC<DoubleEliminationMatchCardProps> = ({ match, position, getTeamName, handleWinnerChange, editable = false, onDisqualify }) => {
  const isPlaceholder = (participant: Participant | undefined) => !participant || participant.placeholder;
  const bothPlaceholders = isPlaceholder(match.participant1) || isPlaceholder(match.participant2);
  return (
    <div
      className="absolute transition-all duration-300"
      style={{
        left: position.left,
        top: position.top,
        width: "280px"
      }}
    >
      <div className="bg-[#1a1a1a] rounded overflow-hidden">
        {/* Match header */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#222]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">#{match.id}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-sm text-gray-400">{match.thirdPlaceMatch ? "3rd Place" : "Bo3"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">14:30</span>
          </div>
        </div>
        {/* Team A */}
        <div className={`flex items-center justify-between px-3 py-2 ${match.winner?.id === match.participant1?.id ? 'bg-[#1e1e1e]' : 'bg-[#1a1a1a]'} border-l-4 border-yellow-600`}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">#{match.participant1?.seed || ""}</span>
            <div className="w-6 h-6 bg-[#333] rounded-sm overflow-hidden">
              <img 
                src={match.participant1?.logo || "/placeholder-team.svg"} 
                alt={match.participant1?.name || "TBD"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`font-medium ${match.winner?.id === match.participant1?.id ? 'text-yellow-500' : 'text-white'}`}> 
              {match.participant1?.name || getTeamName(match.participant1, match, true)}
            </span>
            {/* DSQ STATUS ONLY */}
            {(match.participant1?.status === 'disqualified' ||
              (match.walkover && match.winner?.id === match.participant2?.id && (!match.participant1 || match.participant1.id === undefined))) && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded" title="Dyskwalifikacja">DSQ</span>
            )}
          </div>
          <div className="flex items-center">
            <span className={match.winner?.id === match.participant1?.id ? 'text-yellow-500 font-medium' : 'text-gray-400'}>
              {match.winner?.id === match.participant1?.id ? '1' : '0'}
            </span>
          </div>
        </div>
        {/* Team B */}
        <div className={`flex items-center justify-between px-3 py-2 ${match.winner?.id === match.participant2?.id ? 'bg-[#1e1e1e]' : 'bg-[#151515]'} border-l-4 border-blue-600`}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">#{match.participant2?.seed || ""}</span>
            <div className="w-6 h-6 bg-[#333] rounded-sm overflow-hidden">
              <img 
                src={match.participant2?.logo || "/placeholder-team.svg"} 
                alt={match.participant2?.name || "TBD"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`font-medium ${match.winner?.id === match.participant2?.id ? 'text-yellow-500' : 'text-white'}`}> 
              {match.participant2?.name || getTeamName(match.participant2, match, false)}
            </span>
            {/* DSQ STATUS ONLY */}
            {(match.participant2?.status === 'disqualified' ||
              (match.walkover && match.winner?.id === match.participant1?.id && (!match.participant2 || match.participant2.id === undefined))) && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded" title="Dyskwalifikacja">DSQ</span>
            )}
          </div>
          <div className="flex items-center">
            <span className={match.winner?.id === match.participant2?.id ? 'text-yellow-500 font-medium' : 'text-gray-400'}>
              {match.winner?.id === match.participant2?.id ? '1' : '0'}
            </span>
          </div>
        </div>
        {/* Match actions */}
        {editable && !match.winner && !bothPlaceholders && (
          <div className="flex">
            <button 
              className="flex-1 py-1 text-center text-xs text-gray-400 hover:bg-[#252525] transition-colors"
              onClick={() => handleWinnerChange(match.id, match.participant1?.id || "")}
              disabled={isPlaceholder(match.participant1)}
            >
              Team 1 Wins
            </button>
            <div className="w-px bg-[#333]"></div>
            <button 
              className="flex-1 py-1 text-center text-xs text-gray-400 hover:bg-[#252525] transition-colors"
              onClick={() => handleWinnerChange(match.id, match.participant2?.id || "")}
              disabled={isPlaceholder(match.participant2)}
            >
              Team 2 Wins
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 