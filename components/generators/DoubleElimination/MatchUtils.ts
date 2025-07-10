import type { Match, Participant } from "@/types/index";

type ExtendedMatch = Match & { walkover?: boolean; bye?: boolean; overtime?: boolean; draw?: boolean; loser?: Participant };

export function updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
  const updatedMatches = [...matches];
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return updatedMatches;
  const match = updatedMatches[matchIndex] as ExtendedMatch;
  if (match.participant1?.id === winnerId) {
    match.winner = match.participant1;
  } else if (match.participant2?.id === winnerId) {
    match.winner = match.participant2;
  }
  updateNextMatches(updatedMatches, match);
  return updatedMatches;
}

export function updateNextMatches(matches: Match[], currentMatch: Match): void {
  const nextMatches = matches.filter(m => m.connectedMatches && m.connectedMatches.includes(currentMatch.id));
  for (const nextMatch of nextMatches) {
    if (currentMatch.round > 0 && nextMatch.round > 0) {
      if (nextMatch.connectedMatches && nextMatch.connectedMatches.length === 2) {
        const position = nextMatch.connectedMatches.indexOf(currentMatch.id);
        if (position === 0) {
          nextMatch.participant1 = currentMatch.winner;
        } else {
          nextMatch.participant2 = currentMatch.winner;
        }
      }
    } else if (currentMatch.round > 0 && nextMatch.round < 0) {
      if (currentMatch.participant1 && currentMatch.participant2) {
        const loser = currentMatch.winner?.id === currentMatch.participant1.id ? currentMatch.participant2 : currentMatch.participant1;
        if (nextMatch.participant1 === undefined) {
          nextMatch.participant1 = loser;
        } else {
          nextMatch.participant2 = loser;
        }
      }
    } else if (currentMatch.round < 0 && nextMatch.round < 0) {
      if (nextMatch.connectedMatches && nextMatch.connectedMatches.length === 2) {
        const position = nextMatch.connectedMatches.indexOf(currentMatch.id);
        if (position === 0) {
          nextMatch.participant1 = currentMatch.winner;
        } else {
          nextMatch.participant2 = currentMatch.winner;
        }
      } else {
        if (nextMatch.participant1 === undefined) {
          nextMatch.participant1 = currentMatch.winner;
        } else {
          nextMatch.participant2 = currentMatch.winner;
        }
      }
    } else if (nextMatch.round === 0) {
      if (currentMatch.round > 0) {
        nextMatch.participant1 = currentMatch.winner;
      } else if (currentMatch.round < 0) {
        nextMatch.participant2 = currentMatch.winner;
      }
    } else if (currentMatch.round === 0 && nextMatch.round === 0) {
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

// Dyskwalifikacja drużyny w Double Elimination
export function walkoverDisqualification(matches: Match[], participants: Participant[], disqualifiedTeamId: string): Match[] {
  let updatedMatches = [...matches];
  // 1. Znajdź mecze, w których brała udział ta drużyna
  const teamMatches = updatedMatches.filter(m =>
    (m.participant1 && m.participant1.id === disqualifiedTeamId) ||
    (m.participant2 && m.participant2.id === disqualifiedTeamId)
  );
  // 2. Znajdź ostatni wygrany mecz tej drużyny (najwyższa runda, gdzie winner.id === disqualifiedTeamId)
  const lastWin = [...teamMatches]
    .filter(m => m.winner && m.winner.id === disqualifiedTeamId)
    .sort((a, b) => b.round - a.round)[0];
  if (!lastWin) return updatedMatches; // Nie wygrała żadnego meczu

  // 3. Przeciwnik z tego meczu
  const opponent = lastWin.participant1 && lastWin.participant1.id === disqualifiedTeamId
    ? lastWin.participant2
    : lastWin.participant1;
  if (!opponent) return updatedMatches;

  // 4. Cofnij zwycięstwo w tym meczu i przyznaj je przeciwnikowi
  const matchIdx = updatedMatches.findIndex(m => m.id === lastWin.id);
  updatedMatches[matchIdx] = {
    ...lastWin,
    winner: opponent,
    walkover: true
  };

  // 5. Znajdź kolejny mecz, gdzie winner tej pary gra dalej (winner lub loser bracket)
  // Szukamy meczu, gdzie DSQ gra dalej jako participant1 lub participant2
  const nextMatches = updatedMatches.filter(m =>
    (m.participant1 && m.participant1.id === disqualifiedTeamId) ||
    (m.participant2 && m.participant2.id === disqualifiedTeamId)
  ).filter(m => m.id !== lastWin.id && m.round >= lastWin.round);

  for (const nextMatch of nextMatches) {
    const nextIdx = updatedMatches.findIndex(m => m.id === nextMatch.id);
    let newNextMatch = { ...nextMatch };
    if (nextMatch.participant1 && nextMatch.participant1.id === disqualifiedTeamId) {
      newNextMatch.participant1 = opponent;
    }
    if (nextMatch.participant2 && nextMatch.participant2.id === disqualifiedTeamId) {
      newNextMatch.participant2 = opponent;
    }
    // Usuwamy winnera w tym meczu (jeśli był ustawiony)
    newNextMatch.winner = undefined;
    updatedMatches[nextIdx] = newNextMatch;
  }

  // 6. Odśwież Looser Bracket: automatycznie awansuj przeciwnika w meczach Loser Bracket, gdzie DSQ występuje po tej rundzie
  const affectedLoserMatches = updatedMatches.filter(m =>
    m.round < 0 &&
    ((m.participant1 && m.participant1.id === disqualifiedTeamId) || (m.participant2 && m.participant2.id === disqualifiedTeamId)) &&
    m.round >= lastWin.round // tylko mecze po tej samej lub dalszej rundzie
  );
  for (const match of affectedLoserMatches) {
    const idx = updatedMatches.findIndex(m => m.id === match.id);
    const loserOpponent = match.participant1 && match.participant1.id === disqualifiedTeamId ? match.participant2 : match.participant1;
    if (loserOpponent) {
      updatedMatches[idx] = {
        ...match,
        winner: loserOpponent,
        walkover: true
      };
    }
  }

  // Nie zmieniamy wcześniejszych rund!
  return updatedMatches;
} 