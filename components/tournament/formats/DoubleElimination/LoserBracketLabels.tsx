import React from "react";

interface LoserBracketLabelsProps {
  maxLoserRound: number;
  loserMatchCountByRound: Record<number, number>;
  options: any;
}

export const LoserBracketLabels: React.FC<LoserBracketLabelsProps> = ({ maxLoserRound, loserMatchCountByRound, options }) => {
  const safeLoserRoundCount = Math.max(0, Math.min(maxLoserRound + 1, 20));
  return (
    <div className="flex absolute w-full">
      {Array.from({ length: safeLoserRoundCount }).map((_, index) => {
        const matchCount = loserMatchCountByRound[index] || 0;
        if (index === 0) return null;
        const getRoundName = (round: number, maxRound: number, matchCount: number) => {
          const isLastExistingRound = round === maxRound;
          if (isLastExistingRound) {
            return "Lower Final";
          } else if (round === maxRound - 1 && options.skipLowerBracketFinal) {
            return "Lower Semifinal";
          } else {
            return `LB Round ${round}`;
          }
        };
        return (
          <div 
            key={`loser-round-${index}`} 
            className="w-[340px] text-center py-2"
            style={{ marginLeft: index === 1 ? "0px" : "0" }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium text-sm px-4 py-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-black shadow-md">
                {getRoundName(index, maxLoserRound, matchCount)}
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