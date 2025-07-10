import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GroupStanding, RoundRobinMatch, TournamentResultsProps } from "@/types/tournament"
import Image from "next/image"

export function TournamentResults({ standings, matches, format }: TournamentResultsProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Tournament Results</h2>
      
      {/* Standings Tables */}
      {Array.from(standings.entries()).map(([groupId, groupStandings]) => (
        <div key={groupId} className="space-y-2">
          <h3 className="text-lg font-medium">Group {groupId}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">MP</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupStandings.map((standing, index) => (
                <TableRow key={standing.participant.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {standing.participant.logo && (
                      <Image 
                        src={standing.participant.logo} 
                        alt={`${standing.participant.name} logo`}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    {standing.participant.name}
                  </TableCell>
                  <TableCell className="text-center">{standing.matches}</TableCell>
                  <TableCell className="text-center">{standing.wins}</TableCell>
                  <TableCell className="text-center">{standing.draws}</TableCell>
                  <TableCell className="text-center">{standing.losses}</TableCell>
                  <TableCell className="text-center">{standing.goalsFor}</TableCell>
                  <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                  <TableCell className="text-center">
                    {standing.goalsFor - standing.goalsAgainst}
                  </TableCell>
                  <TableCell className="text-center font-bold">{standing.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      {/* Recent Matches */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Recent Matches</h3>
        <div className="space-y-1">
          {matches
            .filter(m => m.score1 !== undefined && m.score2 !== undefined)
            .slice(-5)
            .map(match => (
              <div 
                key={match.id}
                className="flex items-center justify-between bg-[#252525] p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Group {match.group}</span>
                  <span className="text-sm">{match.participant1?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{match.score1} - {match.score2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{match.participant2?.name}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}