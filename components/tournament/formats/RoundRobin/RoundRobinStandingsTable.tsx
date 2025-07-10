import React from 'react';

export const RoundRobinStandingsTable = ({
  standings,
  groupCount,
  showTiebreakers,
  getSelectedTiebreakers,
  selectedGroup,
  advancingTeams = 1
}: any) => {
  // Helper do renderowania tabeli dla jednej grupy
  const renderGroupTable = (groupId: number, groupLetter: string) => {
    const groupStandings = standings[groupId] || [];
    return (
      <div key={`group-${groupId}`} className="space-y-2">
        <h3 className="text-2xl font-bold mb-2 text-yellow-400">Group {groupLetter}</h3>
        <table className="min-w-full text-center bg-black rounded-lg overflow-hidden">
          <thead>
            <tr className="text-gray-400 bg-[#18181b]">
              <th className="py-2">#</th>
              <th className="py-2">TEAM</th>
              <th className="py-2">MP</th>
              <th className="py-2">W</th>
              <th className="py-2">D</th>
              <th className="py-2">L</th>
              <th className="py-2">GF</th>
              <th className="py-2">GA</th>
              <th className="py-2">GD</th>
              {showTiebreakers && getSelectedTiebreakers().map((tiebreaker: string) => {
                let headerText = '';
                switch(tiebreaker) {
                  case 'headToHead': headerText = 'H2H'; break;
                  case 'inGameTiebreaker': headerText = 'GD'; break;
                  case 'gameWin': headerText = 'WIN%'; break;
                  case 'gameWL': headerText = 'W-L'; break;
                  case 'gamesWon': headerText = 'WINS'; break;
                  case 'pointDifference': headerText = 'PD'; break;
                  case 'pointsScored': headerText = 'PTS+'; break;
                }
                return <th key={tiebreaker} className="py-2 text-yellow-400">{headerText}</th>;
              })}
              <th className="py-2">PTS</th>
            </tr>
          </thead>
          <tbody>
            {groupStandings.map((team: any, idx: number) => (
              <tr key={team.participant.id} className={`border-b border-gray-700 ${idx < advancingTeams ? 'bg-yellow-400 text-black font-bold' : 'bg-black text-white'}`}>
                <td className="py-2">
                  {idx < advancingTeams && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-400 text-black rounded-full text-xs mr-1 border border-yellow-500">{idx + 1}</span>
                  )}
                  {idx >= advancingTeams && (
                    <span>{idx + 1}</span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-dashed border-gray-500 p-2 bg-gray-900">
                      {team.participant.logo ? (
                        <img src={team.participant.logo} alt={team.participant.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="2"/><path d="M12 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#555"/></svg>
                      )}
                    </span>
                    <span className="text-left">{team.participant.name || "To be decided"}</span>
                  </div>
                </td>
                <td className="py-2">{team.matches ?? '-'}</td>
                <td className="py-2">{team.wins ?? '-'}</td>
                <td className="py-2">{team.draws ?? '-'}</td>
                <td className="py-2">{team.losses ?? '-'}</td>
                <td className="py-2">{team.goalsFor ?? '-'}</td>
                <td className="py-2">{team.goalsAgainst ?? '-'}</td>
                <td className="py-2">{team.goalDifference ?? '-'}</td>
                {showTiebreakers && getSelectedTiebreakers().map((tiebreaker: string) => {
                  let value = '-';
                  const teamStats = team;
                  switch(tiebreaker) {
                    case 'headToHead':
                      value = teamStats.headToHead ? (Object.values(teamStats.headToHead) as number[]).reduce((a, b) => a + b, 0).toString() : '-';
                      break;
                    case 'inGameTiebreaker':
                      value = teamStats.goalDifference?.toString() ?? '-';
                      break;
                    case 'gameWin':
                      value = teamStats.matches ? ((teamStats.wins / teamStats.matches) * 100).toFixed(1) + '%' : '-';
                      break;
                    case 'gameWL':
                      value = teamStats.wins && teamStats.losses ? `${teamStats.wins}-${teamStats.losses}` : '-';
                      break;
                    case 'gamesWon':
                      value = teamStats.wins.toString();
                      break;
                    case 'pointDifference':
                      value = teamStats.goalDifference?.toString() ?? '-';
                      break;
                    case 'pointsScored':
                      value = teamStats.goalsFor?.toString() ?? '-';
                      break;
                  }
                  return <td key={tiebreaker} className="py-2">{value}</td>;
                })}
                <td className="py-2">{team.points ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Widok wszystkich grup
  if (!selectedGroup || selectedGroup === 'all') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: groupCount }, (_, i) => {
          const groupId = i + 1;
          const groupLetter = String.fromCharCode(65 + i);
          return renderGroupTable(groupId, groupLetter);
        })}
      </div>
    );
  }

  // Widok pojedynczej grupy
  const groupId = typeof selectedGroup === 'number' ? selectedGroup : 1;
  const groupLetter = String.fromCharCode(65 + (groupId - 1));
  return renderGroupTable(groupId, groupLetter);
}; 