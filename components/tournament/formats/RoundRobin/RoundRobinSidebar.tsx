import React from 'react';

interface Props {
  groupCount: number;
  selectedGroup: number | 'all';
  setSelectedGroup: (g: number | 'all') => void;
  activeTab: string;
  showTiebreakers: boolean;
  setShowTiebreakers: (v: boolean) => void;
}

export const RoundRobinSidebar: React.FC<Props> = ({ groupCount, selectedGroup, setSelectedGroup, activeTab, showTiebreakers, setShowTiebreakers }) => (
  <div className="min-w-[180px] mr-8">
    <ul className="space-y-2">
      <li>
        <button
          className={`w-full text-left px-4 py-2 rounded border border-gray-700 transition-all ${selectedGroup === 'all' ? 'bg-yellow-400 text-black font-bold shadow' : 'bg-[#23272f] text-gray-200 hover:bg-yellow-500/20 hover:text-yellow-400'}`}
          onClick={() => setSelectedGroup('all')}
        >
          All groups
        </button>
      </li>
      {Array.from({ length: groupCount }, (_, i) => (
        <li key={i}>
          <button
            className={`w-full text-left px-4 py-2 rounded border border-gray-700 transition-all ${selectedGroup === i + 1 ? 'bg-yellow-400 text-black font-bold shadow' : 'bg-[#23272f] text-gray-200 hover:bg-yellow-500/20 hover:text-yellow-400'}`}
            onClick={() => setSelectedGroup(i + 1)}
          >
            Group {String.fromCharCode(65 + i)}
          </button>
        </li>
      ))}
    </ul>
    {activeTab === 'standings' && selectedGroup !== 'all' && (
      <div className="mt-4">
        <button
          className={`w-full text-left px-4 py-2 rounded border border-gray-700 transition-all ${showTiebreakers ? 'bg-yellow-400 text-black font-bold shadow' : 'bg-[#232b3b] text-white hover:bg-yellow-500/20 hover:text-yellow-400'}`}
          onClick={() => setShowTiebreakers(!showTiebreakers)}
        >
          {showTiebreakers ? 'Hide Tiebreakers' : 'Show Tiebreakers'}
        </button>
      </div>
    )}
  </div>
); 