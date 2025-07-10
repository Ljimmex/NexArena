import type { Match } from "@/types/index";
import { SwissMatchCard } from "./SwissMatchCard";

interface SwissMatchListProps {
  matches: Match[];
  editable: boolean;
  onWinnerChange: (matchId: string, winnerId: string) => void;
  formatDate?: (date: string) => string;
}

export const SwissMatchList: React.FC<SwissMatchListProps> = ({ matches, editable, onWinnerChange, formatDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {matches.map(match => (
      <div key={match.id} className="relative">
        <SwissMatchCard
          match={match}
          editable={editable}
          onWinnerChange={winnerId => onWinnerChange(match.id.toString(), winnerId)}
          formatDate={formatDate}
        />
      </div>
    ))}
  </div>
); 