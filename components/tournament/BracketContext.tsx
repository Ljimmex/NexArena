import { createContext, useContext, useState } from 'react';
import { Match } from '@/types/matches';
import { Participant } from '@/types/participants';

interface BracketContextType {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  updateMatch: (matchId: number, updates: Partial<Match>) => void;
}

const BracketContext = createContext<BracketContextType | undefined>(undefined);

export function BracketProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const updateMatch = (matchId: number, updates: Partial<Match>) => {
    setMatches(matches.map(match => 
      match.id === matchId ? { ...match, ...updates } : match
    ));
  };

  return (
    <BracketContext.Provider value={{
      matches,
      setMatches,
      participants,
      setParticipants,
      updateMatch,
    }}>
      {children}
    </BracketContext.Provider>
  );
}

export function useBracket() {
  const context = useContext(BracketContext);
  if (context === undefined) {
    throw new Error('useBracket must be used within a BracketProvider');
  }
  return context;
} 