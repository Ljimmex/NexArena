import React from "react";
import type { Match } from "@/types/index";

interface MatchConnectionLinesProps {
  layoutMatches: any[];
  getMatchPosition: (match: any) => { left: string; top: string };
}

export const MatchConnectionLines: React.FC<MatchConnectionLinesProps> = ({ layoutMatches, getMatchPosition }) => {
  return (
    <>
      {layoutMatches.filter(match => match.round > 0).map(match => {
        if (!match.connectedMatches || match.connectedMatches.length === 0) return null;
        const position = getMatchPosition(match);
        return match.connectedMatches.map((connectedId: number, index: number) => {
          const connectedMatch = layoutMatches.find(m => m.id === connectedId);
          if (!connectedMatch) return null;
          const connectedPos = getMatchPosition(connectedMatch);
          const startX = parseInt(connectedPos.left) + 280;
          const startY = parseInt(connectedPos.top) + 15;
          const endX = parseInt(position.left);
          const endY = parseInt(position.top) + 15;
          return (
            <div key={`connector-${match.id}-${connectedId}-container`} className="absolute">
              <div className="absolute bg-[#333]" style={{ left: `${startX}px`, top: `${startY}px`, width: `${(endX - startX) / 2}px`, height: '2px' }} />
              <div className="absolute bg-[#333]" style={{ left: `${startX + (endX - startX) / 2}px`, top: `${Math.min(startY, endY)}px`, width: '2px', height: `${Math.abs(endY - startY)}px` }} />
              <div className="absolute bg-[#333]" style={{ left: `${startX + (endX - startX) / 2}px`, top: `${endY}px`, width: `${(endX - startX) / 2}px`, height: '2px' }} />
            </div>
          );
        });
      })}
    </>
  );
}; 