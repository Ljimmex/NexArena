import type { Match } from "@/types/matches";
import type { Participant } from "@/types/participants";

export function updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
  const updatedMatches = [...matches];
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) return updatedMatches;
  
  const match = updatedMatches[matchIndex];
  const winner = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
  const loser = match.participant1?.id === winnerId ? match.participant2 : match.participant1;
  
  if (!winner) return updatedMatches;
  
  // Update the match with winner
  updatedMatches[matchIndex] = { ...match, winner };
  
  // Find and update connected matches
  updateNextMatches(updatedMatches, match, winner, loser);
  
  return updatedMatches;
}

export function updateNextMatches(matches: Match[], currentMatch: Match, winner: Participant, loser?: Participant | null): void {
  const nextMatches = matches.filter(m => m.connectedMatches && m.connectedMatches.includes(currentMatch.id));
  
  for (const nextMatch of nextMatches) {
    // Winner bracket to winner bracket
    if (currentMatch.round > 0 && nextMatch.round > 0) {
      if (nextMatch.participant1 === undefined) {
        nextMatch.participant1 = winner;
      } else {
        nextMatch.participant2 = winner;
      }
    }
    // Winner bracket to loser bracket (loser falls down)
    else if (currentMatch.round > 0 && nextMatch.round < 0 && loser) {
      if (nextMatch.connectedMatches && nextMatch.connectedMatches.length === 2) {
        const position = nextMatch.connectedMatches.indexOf(currentMatch.id);
        if (position === 0) {
          nextMatch.participant1 = loser;
        } else {
          nextMatch.participant2 = loser;
        }
      } else {
        if (nextMatch.participant1 === undefined) {
          nextMatch.participant1 = loser;
        } else {
          nextMatch.participant2 = loser;
        }
      }
    }
    // Loser bracket to loser bracket
    else if (currentMatch.round < 0 && nextMatch.round < 0) {
      if (nextMatch.connectedMatches && nextMatch.connectedMatches.length === 2) {
        const position = nextMatch.connectedMatches.indexOf(currentMatch.id);
        if (position === 0) {
          nextMatch.participant1 = winner;
        } else {
          nextMatch.participant2 = winner;
        }
      } else {
        if (nextMatch.participant1 === undefined) {
          nextMatch.participant1 = winner;
        } else {
          nextMatch.participant2 = winner;
        }
      }
    }
    // To grand final
    else if (nextMatch.round === 0) {
      if (currentMatch.round > 0) {
        nextMatch.participant1 = winner; // Winner bracket champion
      } else if (currentMatch.round < 0) {
        nextMatch.participant2 = winner; // Loser bracket champion
      }
    }
    // Grand final reset scenario
    else if (currentMatch.round === 0 && nextMatch.round === 0) {
      if (currentMatch.winner?.id === currentMatch.participant2?.id) {
        nextMatch.participant1 = currentMatch.participant1;
        nextMatch.participant2 = currentMatch.participant2;
      }
    }
  }
}

export function getMatchById(matches: Match[], matchId: number): Match | undefined {
  return matches.find(m => m.id === matchId);
}

export function getNextMatches(matches: Match[], matchId: number): Match[] {
  const match = getMatchById(matches, matchId);
  if (!match) return [];
  return matches.filter(m => m.connectedMatches && m.connectedMatches.includes(matchId));
}

/**
 * Funkcja automatycznie przyznająca zwycięstwo przeciwnikowi w przypadku dyskwalifikacji
 * Podobna do Single Elimination ale uwzględnia specyfikę Double Elimination
 */
export function autoAdvanceOnDisqualification(matches: Match[], participants: Participant[]): Match[] {
  let updatedMatches = [...matches];
  let changed = false;

  for (const match of updatedMatches) {
    if (!match.winner && match.participant1 && match.participant2) {
      const p1 = participants.find(p => p.id === match.participant1!.id);
      const p2 = participants.find(p => p.id === match.participant2!.id);

      if (p1?.status === 'disqualified' && p2?.status !== 'disqualified') {
        match.winner = match.participant2;
        match.walkover = true;
        changed = true;
        
        // Propaguj zwycięzców do kolejnych meczów
        const loser = match.participant1;
        updateNextMatches(updatedMatches, match, match.participant2, loser);
        
      } else if (p2?.status === 'disqualified' && p1?.status !== 'disqualified') {
        match.winner = match.participant1;
        match.walkover = true;
        changed = true;
        
        // Propaguj zwycięzców do kolejnych meczów
        const loser = match.participant2;
        updateNextMatches(updatedMatches, match, match.participant1, loser);
      }
    }
  }

  // Rekurencyjnie wywołaj, dopóki są zmiany
  if (changed) {
    return autoAdvanceOnDisqualification(updatedMatches, participants);
  }
  
  return updatedMatches;
}

/**
 * Ulepszona implementacja dyskwalifikacji dla Double Elimination
 * Bazuje na logice Single Elimination ale dodaje obsługę lower bracket
 */
export function walkoverDisqualification(matches: Match[], participants: Participant[], disqualifiedTeamId: string): Match[] {
  let updatedMatches = [...matches];
  
  // Najpierw znajdź wszystkie mecze z udziałem dyskwalifikowanej drużyny
  const teamMatches = updatedMatches.filter(m =>
    (m.participant1 && m.participant1.id === disqualifiedTeamId) ||
    (m.participant2 && m.participant2.id === disqualifiedTeamId)
  );

  // Znajdź wszystkie wygrane mecze tej drużyny posortowane od najnowszych
  const wonMatches = teamMatches
    .filter(m => m.winner && m.winner.id === disqualifiedTeamId)
    .sort((a, b) => {
      // Sortuj po rundzie (wyższe rundy najpierw)
      // W Double Elimination: rundy winner bracket są dodatnie, loser bracket ujemne
      if (a.round !== b.round) {
        return b.round - a.round;
      }
      // Jeśli ta sama runda, sortuj po ID (wyższe ID = nowszy mecz)
      return b.id - a.id;
    });

  // Cofnij wszystkie zwycięstwa tej drużyny od najnowszego do najstarszego
  for (const match of wonMatches) {
    const matchIdx = updatedMatches.findIndex(m => m.id === match.id);
    if (matchIdx === -1) continue;

    // Znajdź przeciwnika
    const opponent = match.participant1 && match.participant1.id === disqualifiedTeamId
      ? match.participant2
      : match.participant1;
    
    if (!opponent) continue;

    // Cofnij zwycięstwo - przyznaj je przeciwnikowi
    updatedMatches[matchIdx] = {
      ...match,
      winner: opponent,
      walkover: true
    };

    // Propaguj nowego zwycięzcę do kolejnych meczów
    const loser = match.participant1 && match.participant1.id === disqualifiedTeamId 
      ? match.participant1 
      : match.participant2;
    
    updateNextMatches(updatedMatches, updatedMatches[matchIdx], opponent, loser);
  }

  // Teraz usuń dyskwalifikowaną drużynę z wszystkich przyszłych meczów gdzie jeszcze nie ma winnera
  const futureMatches = updatedMatches.filter(m =>
    !m.winner && 
    ((m.participant1 && m.participant1.id === disqualifiedTeamId) ||
     (m.participant2 && m.participant2.id === disqualifiedTeamId))
  );

  for (const match of futureMatches) {
    const matchIdx = updatedMatches.findIndex(m => m.id === match.id);
    if (matchIdx === -1) continue;

    const opponent = match.participant1 && match.participant1.id === disqualifiedTeamId
      ? match.participant2
      : match.participant1;

    if (opponent) {
      // Automatycznie przyznaj zwycięstwo przeciwnikowi
      updatedMatches[matchIdx] = {
        ...match,
        winner: opponent,
        walkover: true
      };

      // Propaguj zwycięzcę dalej
      const loser = match.participant1 && match.participant1.id === disqualifiedTeamId 
        ? match.participant1 
        : match.participant2;
      
      updateNextMatches(updatedMatches, updatedMatches[matchIdx], opponent, loser);
    }
  }

  // Na koniec użyj autoAdvanceOnDisqualification aby upewnić się, 
  // że wszystkie przypadki zostały obsłużone
  return autoAdvanceOnDisqualification(updatedMatches, participants);
}

/**
 * Funkcja do resetowania meczów po zmianie uczestników
 * Pomocnicza dla przypadków gdzie struktura drabinki się zmienia
 */
export function resetFutureMatches(matches: Match[], fromMatchId: number): Match[] {
  const updatedMatches = [...matches];
  const sourceMatch = getMatchById(updatedMatches, fromMatchId);
  if (!sourceMatch) return updatedMatches;

  // Znajdź wszystkie mecze "w przyszłości" od danego meczu
  const nextMatches = getNextMatches(updatedMatches, fromMatchId);
  
  for (const nextMatch of nextMatches) {
    const nextIdx = updatedMatches.findIndex(m => m.id === nextMatch.id);
    if (nextIdx !== -1) {
      // Resetuj zwycięzcę ale zachowaj strukturę uczestników
      updatedMatches[nextIdx] = {
        ...nextMatch,
        winner: undefined,
        walkover: false
      };
      
      // Rekurencyjnie resetuj kolejne mecze
      updatedMatches.splice(0, updatedMatches.length, ...resetFutureMatches(updatedMatches, nextMatch.id));
    }
  }

  return updatedMatches;
}