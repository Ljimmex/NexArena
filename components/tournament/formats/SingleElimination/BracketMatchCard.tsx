import React from "react";
import { MatchCard } from "@/components/tournament/MatchCard";
import type { Participant, Match } from "@/types/index";

interface BracketMatchCardProps {
  match: any;
  position: { left: string; top: string };
  getTeamName: (participant: Participant | undefined, match: any, isFirstParticipant: boolean) => string;
  handleWinnerChange: (matchId: number, winnerId: string) => void;
  editable?: boolean;
}

export const BracketMatchCard: React.FC<BracketMatchCardProps> = ({ match, position, getTeamName, handleWinnerChange, editable }) => {
  // Helper function to get display name for a participant or slot
  const getDisplayName = (participant: Participant | undefined, slotLabel: string | undefined, isFirstParticipant: boolean) => {
    if (participant && participant.name) {
      return participant.name;
    }
    if (slotLabel) {
      return slotLabel;
    }
    return getTeamName(participant, match, isFirstParticipant);
  };

  // Helper function to get display seed
  const getDisplaySeed = (participant: Participant | undefined) => {
    if (participant && participant.seed) {
      return participant.seed;
    }
    return "";
  };

  // Helper function to get display logo
  const getDisplayLogo = (participant: Participant | undefined) => {
    if (participant && participant.logo) {
      return participant.logo;
    }
    return "/placeholder-team.svg";
  };

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
    <span className="text-xs text-gray-500">#{getDisplaySeed(match.participant1)}</span>
    <div className="w-6 h-6 bg-[#333] rounded-sm overflow-hidden">
      <img src={getDisplayLogo(match.participant1)} alt={getDisplayName(match.participant1, match.slotLabel1, true) || "TBD"} className="w-full h-full object-cover" />
    </div>
    <span className={`font-medium ${match.winner?.id === match.participant1?.id ? 'text-yellow-500' : 'text-white'}`}>
      {getDisplayName(match.participant1, match.slotLabel1, true)}
    </span>
    {/* DODAJ ZNACZNIK DSQ */}
    {(match.participant1?.status === 'disqualified' ||
      (match.walkover && match.winner?.id === match.participant2?.id)) && (
      <span className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded" title="Dyskwalifikacja">DSQ</span>
    )}
  </div>
  <div className="flex items-center gap-1">
    <span className={`text-sm ${match.winner?.id === match.participant1?.id ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>
      {match.winner?.id === match.participant1?.id ? '1' : '0'}
    </span>
  </div>
</div>
        {/* Team B */}
<div className={`flex items-center justify-between px-3 py-2 ${match.winner?.id === match.participant2?.id ? 'bg-[#1e1e1e]' : 'bg-[#1a1a1a]'} border-l-4 border-blue-600`}>
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500">#{getDisplaySeed(match.participant2)}</span>
    <div className="w-6 h-6 bg-[#333] rounded-sm overflow-hidden">
      <img src={getDisplayLogo(match.participant2)} alt={getDisplayName(match.participant2, match.slotLabel2, false) || "TBD"} className="w-full h-full object-cover" />
    </div>
    <span className={`font-medium ${match.winner?.id === match.participant2?.id ? 'text-yellow-500' : 'text-white'}`}>
      {getDisplayName(match.participant2, match.slotLabel2, false)}
    </span>
    {/* DODAJ ZNACZNIK DSQ */}
    {(match.participant2?.status === 'disqualified' ||
      (match.walkover && match.winner?.id === match.participant1?.id)) && (
      <span className="ml-2 px-2 py-1 text-xs bg-red-700 text-white rounded" title="Dyskwalifikacja">DSQ</span>
    )}
  </div>
  <div className="flex items-center gap-1">
    <span className={`text-sm ${match.winner?.id === match.participant2?.id ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>
      {match.winner?.id === match.participant2?.id ? '1' : '0'}
    </span>
  </div>
</div>
        {/* Winner select (only if both participants are real teams) */}
        {editable && !match.winner && match.participant1 && match.participant2 && 
          !match.participant1.placeholder && !match.participant2.placeholder &&
          !match.participant1.id?.startsWith('placeholder-') && !match.participant2.id?.startsWith('placeholder-') &&
          !match.participant1.name?.startsWith('Swiss Place') && !match.participant2.name?.startsWith('Swiss Place') &&
          !match.participant1.name?.startsWith('Group ') && !match.participant2.name?.startsWith('Group ') &&
          !match.participant1.name?.startsWith('Slot ') && !match.participant2.name?.startsWith('Slot ') && (
          <div className="flex border-t border-[#222]">
            <button
              className="flex-1 py-1 text-center text-xs text-gray-400 hover:bg-[#252525] transition-colors"
              onClick={() => handleWinnerChange(match.id, match.participant1.id)}
            >
              {getDisplayName(match.participant1, match.slotLabel1, true)} wygrywa
            </button>
            <div className="w-px bg-[#333]"></div>
            <button
              className="flex-1 py-1 text-center text-xs text-gray-400 hover:bg-[#252525] transition-colors"
              onClick={() => handleWinnerChange(match.id, match.participant2.id)}
            >
              {getDisplayName(match.participant2, match.slotLabel2, false)} wygrywa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 