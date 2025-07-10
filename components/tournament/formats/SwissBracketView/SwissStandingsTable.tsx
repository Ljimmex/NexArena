import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, Trophy } from "lucide-react";
import type { Participant } from "@/types/index";

interface SwissStandingsTableProps {
  standings: Participant[];
  options: any;
  requiredStats: { wins: number; losses: number };
  showTiebreakers: boolean;
  setShowTiebreakers: (v: boolean) => void;
  getTiebreakerLabel: (tiebreaker: string) => string;
}

export const SwissStandingsTable: React.FC<SwissStandingsTableProps> = ({
  standings,
  options,
  requiredStats,
  showTiebreakers,
  setShowTiebreakers,
  getTiebreakerLabel
}) => {
  const scoreConfig = options.scoreConfig || {
    win: 3,
    loss: 0,
    draw: 1,
    bye: 3,
    winOvertime: 2,
    lossOvertime: 1
  };
  const sortedStandings = [...standings].sort((a, b) => {
    const aPoints = a.points || 0;
    const bPoints = b.points || 0;
    if (aPoints !== bPoints) return bPoints - aPoints;
    
    const aLosses = a.losses || 0;
    const bLosses = b.losses || 0;
    if (aLosses !== bLosses) return aLosses - bLosses;
    
    if (options.tiebreakers && options.tiebreakers.length > 0) {
      for (const tiebreaker of options.tiebreakers) {
        const aTiebreaker = a.tiebreakers?.[tiebreaker] || 0;
        const bTiebreaker = b.tiebreakers?.[tiebreaker] || 0;
        if (aTiebreaker !== bTiebreaker) return bTiebreaker - aTiebreaker;
      }
    }
    
    return (a.seed || 0) - (b.seed || 0);
  });
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Standings</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTiebreakers(!showTiebreakers)}>
            {showTiebreakers ? "Hide Tiebreakers" : "Show Tiebreakers"}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            {showTiebreakers && options.tiebreakers?.map((tiebreaker: string, index: number) => (
              <TableHead key={index} className="text-center">
                {getTiebreakerLabel(tiebreaker)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStandings.map((team, index) => {
            const wins = team.wins || 0;
            const losses = team.losses || 0;
            let qualificationStatus = null;
            if (wins >= requiredStats.wins) {
              qualificationStatus = (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-800 text-white">Qualified</span>
              );
            } else if (losses >= requiredStats.losses) {
              qualificationStatus = (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-800 text-white">Eliminated</span>
              );
            }
            return (
              <TableRow key={team.id} className={index < (options.playoffTeams || 0) ? "bg-green-900 bg-opacity-20" : ""}>
                <TableCell className="text-center font-medium">
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-700 text-white">{index + 1}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {team.logo && <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-full" />}
                    <span>{team.name}</span>
                    {qualificationStatus}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">{team.points || 0}</TableCell>
                <TableCell className="text-center">{team.wins || 0}</TableCell>
                <TableCell className="text-center">{team.losses || 0}</TableCell>
                {showTiebreakers && options.tiebreakers?.map((tiebreaker: string, index: number) => (
                  <TableCell key={index} className="text-center">
                    {team.tiebreakers?.[tiebreaker] !== undefined
                      ? tiebreaker === 'gameWin'
                        ? `${(team.tiebreakers[tiebreaker] * 100).toFixed(1)}%`
                        : team.tiebreakers[tiebreaker]
                      : '-'}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Info size={14} />
          <span>Point system: Win = {scoreConfig.win}, Loss = {scoreConfig.loss}</span>
        </div>
        {options.playoffTeams && (
          <div className="flex items-center gap-1 mt-1">
            <Trophy size={14} />
            <span>Top {options.playoffTeams} teams advance to playoffs</span>
          </div>
        )}
      </div>
    </div>
  );
}; 