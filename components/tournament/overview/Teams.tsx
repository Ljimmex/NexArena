import React from "react";

interface Team {
  id: string;
  name: string;
  logo?: string;
  status?: 'registered' | 'ready' | 'confirmed' | 'declined' | 'disqualified' | 'substitute';
}

interface TeamsProps {
  teams: Team[];
  substituteTeams?: Team[];
  maxTeams?: number;
}

const statusLabels = {
  registered: 'Registered',
  ready: 'Ready',
  confirmed: 'Confirmed',
  declined: 'Declined',
  disqualified: 'Disqualified',
  substitute: 'Substitute',
};

const statusColors = {
  registered: 'text-yellow-400',
  ready: 'text-green-400',
  confirmed: 'text-blue-400',
  declined: 'text-red-500',
  disqualified: 'text-orange-400',
  substitute: 'text-purple-400',
};

const Teams: React.FC<TeamsProps> = ({ teams, substituteTeams = [], maxTeams }) => {
  const slots = maxTeams || teams.length;
  // Liczniki statusów tylko dla teams (główne)
  const statusCounts = {
    registered: teams.filter(t => t.status === 'registered').length,
    ready: teams.filter(t => t.status === 'ready').length,
    confirmed: teams.filter(t => t.status === 'confirmed').length,
    declined: teams.filter(t => t.status === 'declined').length,
    disqualified: teams.filter(t => t.status === 'disqualified').length,
    substitute: teams.filter(t => t.status === 'substitute').length,
  };
  const activeTeams = teams.filter(t => t.status !== 'substitute').length;

  return (
    <div className="mb-4 w-full max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold mb-2 text-white">Teams</h3>
      <div className="bg-[#181c23] rounded-lg p-6 border border-[#333] flex flex-col items-center w-full">
        {/* Liczniki statusów */}
        <div className="grid grid-cols-4 gap-4 w-full mb-4">
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-gray-400">Active Teams</span>
            <span className="text-2xl font-bold text-white">{activeTeams}/{slots}</span>
          </div>
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-green-400">Ready</span>
            <span className="text-2xl font-bold text-green-400">{statusCounts.ready}</span>
          </div>
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-blue-400">Confirmed</span>
            <span className="text-2xl font-bold text-blue-400">{statusCounts.confirmed}</span>
          </div>
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-yellow-400">Registered</span>
            <span className="text-2xl font-bold text-yellow-400">{statusCounts.registered}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full mb-4">
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-red-500">Declined</span>
            <span className="text-2xl font-bold text-red-500">{statusCounts.declined}</span>
          </div>
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-orange-400">Disqualified</span>
            <span className="text-2xl font-bold text-orange-400">{statusCounts.disqualified}</span>
          </div>
          <div className="flex flex-col items-center bg-[#191b22] rounded-lg p-3">
            <span className="text-xs text-purple-400">Substitute</span>
            <span className="text-2xl font-bold text-purple-400">{statusCounts.substitute}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams; 