import React from "react";

interface DoubleEliminationConnectionLinesProps {
  layoutMatches: any[];
  getMatchPosition: (match: any) => { left: string; top: string };
}

export const DoubleEliminationConnectionLines: React.FC<DoubleEliminationConnectionLinesProps> = ({ layoutMatches, getMatchPosition }) => {
  return (
    <>
      {layoutMatches.filter(match => match.round !== undefined).map(match => {
        if (!match.connectedMatches || match.connectedMatches.length === 0) return null;
        const position = getMatchPosition(match);
        return match.connectedMatches.map((connectedId: number, index: number) => {
          const connectedMatch = layoutMatches.find(m => m.id === connectedId);
          if (!connectedMatch) return null;
          // Special handling for grand final connections
          if (match.grandFinal || match.round === 0) {
            const connectedPos = getMatchPosition(connectedMatch);
            const startX = parseInt(connectedPos.left) + 280;
            const startY = parseInt(connectedPos.top) + 76;
            const endX = parseInt(position.left);
            const endY = parseInt(position.top) + 76;
            return (
              <div key={`connector-${match.id}-${connectedId}-container`} className="absolute">
                <div 
                  className="absolute bg-yellow-500"
                  style={{
                    left: `${startX}px`,
                    top: `${startY}px`,
                    width: `${(endX - startX) / 2}px`,
                    height: '2px'
                  }}
                />
                <div 
                  className="absolute bg-yellow-500"
                  style={{
                    left: `${startX + (endX - startX) / 2}px`,
                    top: `${Math.min(startY, endY)}px`,
                    width: '2px',
                    height: `${Math.abs(endY - startY)}px`
                  }}
                />
                <div 
                  className="absolute bg-yellow-500"
                  style={{
                    left: `${startX + (endX - startX) / 2}px`,
                    top: `${endY}px`,
                    width: `${(endX - startX) / 2}px`,
                    height: '2px'
                  }}
                />
              </div>
            );
          }
          // Regular connections for other matches
          const connectedPos = getMatchPosition(connectedMatch);
          const startX = parseInt(connectedPos.left) + 280;
          const startY = parseInt(connectedPos.top) + 76;
          const endX = parseInt(position.left);
          const endY = parseInt(position.top) + 76;
          if ((connectedMatch.round > 0 && match.round < 0) || (connectedMatch.round < 0 && match.round > 0)) {
            return null;
          }
          const lineColor = match.round < 0 ? "bg-red-500" : "bg-yellow-500";
          return (
            <div key={`connector-${match.id}-${connectedId}-container`} className="absolute">
              <div 
                className={`absolute ${lineColor}`}
                style={{
                  left: `${startX}px`,
                  top: `${startY}px`,
                  width: `${(endX - startX) / 2}px`,
                  height: '2px'
                }}
              />
              <div 
                className={`absolute ${lineColor}`}
                style={{
                  left: `${startX + (endX - startX) / 2}px`,
                  top: `${Math.min(startY, endY)}px`,
                  width: '2px',
                  height: `${Math.abs(endY - startY)}px`
                }}
              />
              <div 
                className={`absolute ${lineColor}`}
                style={{
                  left: `${startX + (endX - startX) / 2}px`,
                  top: `${endY}px`,
                  width: `${(endX - startX) / 2}px`,
                  height: '2px'
                }}
              />
            </div>
          );
        });
      })}
    </>
  );
}; 