import React from "react";

interface WinnerBracketLabelsProps {
  maxWinnerRound: number;
  winnerMatchCountByRound: Record<number, number>;
  options: any;
  layoutMatches: any[];
}

export const WinnerBracketLabels: React.FC<WinnerBracketLabelsProps> = ({ maxWinnerRound, winnerMatchCountByRound, options, layoutMatches }) => {
  const safeWinnerRoundCount = Math.max(0, Math.min(maxWinnerRound + 2, 20));
  // Znajdź Grand Final Match i jego pozycję (left)
  const grandFinalMatch = layoutMatches.find(m => m.grandFinal || m.round === 0);
  const grandFinalLeft = grandFinalMatch && grandFinalMatch.left ? parseInt(grandFinalMatch.left) : null;
  return (
    <div className="flex w-full relative z-10">
      {Array.from({ length: safeWinnerRoundCount }).map((_, index) => {
        const matchCount = winnerMatchCountByRound[index] || 0;
        if (index === 0) return null;
        const getRoundName = (round: number, maxRound: number, matchCount: number) => {
          if (round === maxRound) return "WB Final";
          if (round > maxRound) return "Grand Final";
          if (matchCount === 2) return "WB Semifinal";
          if (matchCount === 4) return "WB Quarterfinal";
          return `WB Round ${round}`;
        };
        if (index > maxWinnerRound && index === maxWinnerRound + 1) {
          // Grand Final label - pozycjonuj absolutnie nad Grand Final Match
          if (grandFinalLeft !== null && !options.skipGrandFinal) {
            return (
              <div
                key={`winner-round-${index}`}
                className="absolute text-center py-2"
                style={{
                  left: `${grandFinalLeft + 80}px`, // 80px to połowa szerokości karty
                  transform: "translateX(-50%)"
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-black shadow-md">
                    Grand Final
                  </span>
                  <span className="text-xs text-gray-400">
                    1 match
                  </span>
                </div>
              </div>
            );
          }
          return null;
        }
        return (
          <div
            key={`winner-round-${index}`}
            className="w-[340px] text-center py-2"
            style={{ marginLeft: index === 1 ? "0px" : "0" }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium text-sm px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-md">
                {getRoundName(index, maxWinnerRound, matchCount)}
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