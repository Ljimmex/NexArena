import { MatchCard } from "@/components/tournament/MatchCard";
import type { Match, Participant } from "@/types/index";

interface SwissMatchCardProps {
  match: Match;
  editable: boolean;
  onWinnerChange: (winnerId: string) => void;
  formatDate?: (date: string) => string;
}

export const SwissMatchCard: React.FC<SwissMatchCardProps> = ({ match, editable, onWinnerChange, formatDate }) => {
  return (
    <MatchCard
      matchId={match.id.toString()}
      matchNumber={match.position}
      matchFormat="Swiss"
      matchTime={match.matchDate && formatDate ? formatDate(match.matchDate) : undefined}
      teamA={{
        id: match.participant1?.id || "",
        name: match.participant1?.name || "TBD",
        logo: match.participant1?.logo || "",
        score: match.score1 || 0,
        winner: match.winner?.id === match.participant1?.id,
        seed: match.participant1?.seed
      }}
      teamB={{
        id: match.participant2?.id || "",
        name: match.participant2?.name || "TBD",
        logo: match.participant2?.logo || "",
        score: match.score2 || 0,
        winner: match.winner?.id === match.participant2?.id,
        seed: match.participant2?.seed
      }}
      onWinnerChange={onWinnerChange}
      allowDraw={false}
      editable={editable}
      status={
        match.winner ? "completed" : "live"
      }
      centerScores={true}
      scoreEditable={false}
    />
  );
}; 