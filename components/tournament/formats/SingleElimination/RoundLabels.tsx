import React from "react";

interface RoundLabelsProps {
  maxRound: number;
  matchCountByRound: Record<number, number>;
}

export const RoundLabels: React.FC<RoundLabelsProps> = ({ maxRound, matchCountByRound }) => {
  const getRoundName = (round: number, maxRound: number, matchCount: number) => {
    if (round === maxRound) return "Finał";
    if (matchCount === 2) return "Półfinał";
    if (matchCount === 4) return "Ćwierćfinał";
    return `Round ${round}`;
  };
  return (
    <div className="flex absolute top-0 left-0 w-full">
      {Array.from({ length: maxRound + 1 }).map((_, index) => {
        const matchCount = matchCountByRound[index] || 0;
        if (index === 0) return null;
        return (
          <div key={`round-${index}`} className="w-[400px] text-center py-2" style={{ marginLeft: index === 1 ? "-40px" : "0" }}>
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium text-sm px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-md">
                {getRoundName(index, maxRound, matchCount)}
              </span>
              <span className="text-xs text-gray-400">
                {matchCount} {matchCount === 1 ? 'match' : 'matches'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 