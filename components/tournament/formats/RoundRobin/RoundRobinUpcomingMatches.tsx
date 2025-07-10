import React from 'react';
import { MatchCard } from '@/components/tournament/MatchCard';
import type { Participant, RoundRobinMatch } from '@/types/index';

interface RoundRobinUpcomingMatchesProps {
  matches: RoundRobinMatch[];
  participants: Participant[];
  selectedGroup: number | 'all';
  getSeededTeam: (standingId: string) => Participant | undefined;
  handleWinnerChange: (matchId: number, winnerId: string, score1?: number, score2?: number) => void;
  seeded: boolean;
  generateBracket: () => void;
}

export const RoundRobinUpcomingMatches: React.FC<RoundRobinUpcomingMatchesProps> = ({
  matches,
  participants,
  selectedGroup,
  getSeededTeam,
  handleWinnerChange,
  seeded,
  generateBracket
}) => {
  // Calculate match number offset for proper numbering
  const allGroupMatches = matches;
  let matchNumberOffset = 0;
  if (typeof selectedGroup === 'number' && selectedGroup > 1) {
    for (let g = 1; g < selectedGroup; g++) {
      matchNumberOffset += allGroupMatches.filter(m => m.group === g).length;
    }
  }

  // Filter matches for selected group
  const groupMatches = typeof selectedGroup === 'number' 
    ? matches.filter(m => m.group === selectedGroup)
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Upcoming matches</h3>
      {groupMatches.map((match, idx) => {
        const winnerId = match.winner?.id;
        
        // Get team information based on seeding state
        const team1 = seeded && match.participant1?.standingId
          ? getSeededTeam(match.participant1.standingId as unknown as string)
          : participants.find(p => p.id === match.participant1?.id);
          
        const team2 = seeded && match.participant2?.standingId
          ? getSeededTeam(match.participant2.standingId as unknown as string)
          : participants.find(p => p.id === match.participant2?.id);

        // Determine if both teams are real (not placeholders)
        const bothRealTeams = !!(team1 && team2 && !team1.placeholder && !team2.placeholder);

        return (
          <div key={match.id} className="bg-[#23272f] rounded-lg p-4">
            <MatchCard
              matchId={match.id.toString()}
              matchNumber={matchNumberOffset + idx + 1}
              matchFormat="Round Robin"
              matchTime={match.matchDate}
              teamA={{
                id: team1?.id || `placeholder-${match.participant1?.id}`,
                name: team1?.name || 'To be decided',
                logo: team1?.logo || '',
                score: match.score1 || 0,
                winner: winnerId === team1?.id,
                seed: team1?.seed
              }}
              teamB={{
                id: team2?.id || `placeholder-${match.participant2?.id}`,
                name: team2?.name || 'To be decided',
                logo: team2?.logo || '',
                score: match.score2 || 0,
                winner: winnerId === team2?.id,
                seed: team2?.seed
              }}
              onWinnerChange={(winnerId) => handleWinnerChange(match.id, winnerId)}
              allowDraw={true}
              editable={bothRealTeams && !winnerId}
              status={match.winner ? "completed" : "upcoming"}
              centerScores={true}
              scoreEditable={false}
            />
          </div>
        );
      })}
    </div>
  );
}; 