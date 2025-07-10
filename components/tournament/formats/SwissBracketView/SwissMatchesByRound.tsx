import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SwissMatchList } from "./SwissMatchList";
import type { Match } from "@/types/index";

interface SwissMatchesByRoundProps {
  matchesByRound: Record<number, Match[]>;
  currentRound: number;
  expandedRounds: Record<number, boolean>;
  toggleRound: (round: number) => void;
  handleWinnerChange: (matchId: string, winnerId: string) => void;
  formatDate?: (date: string) => string;
  matchesPerRoundArr?: number[];
}

export const SwissMatchesByRound: React.FC<SwissMatchesByRoundProps> = ({
  matchesByRound,
  currentRound,
  expandedRounds,
  toggleRound,
  handleWinnerChange,
  formatDate,
  matchesPerRoundArr
}) => {
  return (
    <>
      {Object.keys(matchesByRound)
        .map(Number)
        .sort((a, b) => a - b)
        .filter(round => {
          // Nie wyświetlaj rund z 0 meczami
          const roundMatches = matchesByRound[round];
          return roundMatches && roundMatches.length > 0;
        })
        .map(round => {
          const roundMatches = matchesByRound[round];
          const isRoundComplete = roundMatches.every(m => m.winner);
          const isRoundActive = round === currentRound;
          const isRoundEmpty = roundMatches.every(m => !m.participant1 && !m.participant2);
          // Get date range for this round
          const roundDates = roundMatches
            .map(match => match.matchDate)
            .filter(Boolean) as string[];
          let dateRangeText = "";
          if (roundDates.length > 0) {
            const uniqueDates = [...new Set(roundDates)].sort();
            if (uniqueDates.length === 1) {
              dateRangeText = formatDate ? formatDate(uniqueDates[0]) : uniqueDates[0];
            } else {
              dateRangeText = formatDate
                ? `${formatDate(uniqueDates[0])} - ${formatDate(uniqueDates[uniqueDates.length - 1])}`
                : `${uniqueDates[0]} - ${uniqueDates[uniqueDates.length - 1]}`;
            }
          }
          // Pobierz liczbę meczów dla tej rundy
          const matchesCount = matchesPerRoundArr && matchesPerRoundArr[round - 1];
          return (
            <Collapsible
              key={`round-${round}`}
              open={expandedRounds[round]}
              onOpenChange={() => toggleRound(round)}
              className="mb-6 border border-gray-800 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger
                className={`w-full p-3 flex justify-between items-center ${
                  isRoundEmpty ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'
                } ${isRoundComplete ? 'border-l-4 border-green-500' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Round {round}</span>
                  {typeof matchesCount === 'number' && (
                    <span className="text-xs text-gray-400">({matchesCount} matches)</span>
                  )}
                  {dateRangeText && (
                    <span className="text-xs text-gray-400">({dateRangeText})</span>
                  )}
                  {isRoundComplete && (
                    <span className="text-xs bg-green-800 text-white px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                  {isRoundActive && !isRoundComplete && !isRoundEmpty && (
                    <span className="text-xs bg-yellow-800 text-white px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                  {isRoundEmpty && (
                    <span className="text-xs bg-blue-800 text-white px-2 py-0.5 rounded-full">
                      Empty
                    </span>
                  )}
                  {round > currentRound && !isRoundEmpty && (
                    <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
                {expandedRounds[round] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 bg-[#1a1a1a]">
                <SwissMatchList
                  matches={roundMatches}
                  editable={isRoundActive && !isRoundEmpty}
                  onWinnerChange={handleWinnerChange}
                  formatDate={formatDate}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
    </>
  );
}; 