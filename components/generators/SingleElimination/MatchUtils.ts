import type { Match } from "@/types/matches";
import type { Participant } from "@/types/participants";

// Funkcja automatycznie przyznająca zwycięstwo przeciwnikowi, jeśli ktoś jest zdyskwalifikowany
export function autoAdvanceOnDisqualification(matches: Match[], participants: Participant[]): Match[] {
  let updatedMatches = [...matches];
  let changed = false;
  for (const match of updatedMatches) {
    if (!match.winner && match.participant1 && match.participant2) {
      const p1 = match.participant1 ? participants.find(p => p.id === match.participant1!.id) : undefined;
      const p2 = match.participant2 ? participants.find(p => p.id === match.participant2!.id) : undefined;
      if (p1?.status === 'disqualified' && p2?.status !== 'disqualified') {
        match.winner = match.participant2;
        match.walkover = true; // DODAJ znacznik walkover
        changed = true;
        // PRZEPCHNIJ zwycięzcę do kolejnej rundy
        updatedMatches = updateMatchWinner(updatedMatches, match.id, match.participant2.id, participants);
      } else if (p2?.status === 'disqualified' && p1?.status !== 'disqualified') {
        match.winner = match.participant1;
        match.walkover = true; // DODAJ znacznik walkover
        changed = true;
        updatedMatches = updateMatchWinner(updatedMatches, match.id, match.participant1.id, participants);
      }
    }
  }
  if (changed) {
    return autoAdvanceOnDisqualification(updatedMatches, participants);
  }
  return updatedMatches;
}

export function updateMatchWinner(matches: Match[], matchId: number, winnerId: string, participants?: Participant[]): Match[] {
  const updatedMatches = [...matches];
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return updatedMatches;
  const match = updatedMatches[matchIndex];
  let winner: Participant | undefined;
  if (match.participant1?.id === winnerId) {
    winner = match.participant1;
  } else if (match.participant2?.id === winnerId) {
    winner = match.participant2;
  }
  if (!winner) return updatedMatches;
  updatedMatches[matchIndex] = { ...match, winner };
  if (!match.thirdPlaceMatch) {
    const nextRound = match.round + 1;
    const nextPosition = Math.ceil(match.position / 2);
    const nextMatch = updatedMatches.find(
      m => m.round === nextRound && m.position === nextPosition && !m.thirdPlaceMatch
    );
    if (nextMatch) {
      const nextMatchIndex = updatedMatches.findIndex(m => m.id === nextMatch.id);
      const updatedNextMatch = { ...nextMatch };
      if (match.position % 2 === 1) {
        updatedNextMatch.participant1 = winner;
        updatedNextMatch.slotLabel1 = winner.name;
      } else {
        updatedNextMatch.participant2 = winner;
        updatedNextMatch.slotLabel2 = winner.name;
      }
      updatedMatches[nextMatchIndex] = updatedNextMatch;
    }
  }
  const maxRound = Math.max(...updatedMatches.map(m => m.round));
  if (match.round === maxRound - 1) {
    return updateThirdPlaceMatch(updatedMatches);
  }
  // Po każdej aktualizacji sprawdź, czy ktoś jest zdyskwalifikowany i automatycznie awansuj przeciwnika
  if (participants) {
    return autoAdvanceOnDisqualification(updatedMatches, participants);
  }
  return updatedMatches;
}

export function getMatchById(matches: Match[], matchId: number): Match | undefined {
  return matches.find(m => m.id === matchId);
}

export function getNextMatches(matches: Match[], matchId: number): Match[] {
  const match = getMatchById(matches, matchId);
  if (!match) return [];
  return matches.filter(m => m.id === match.nextMatchId);
}

export function updateThirdPlaceMatch(matches: Match[]): Match[] {
  const updatedMatches = [...matches];
  const thirdPlaceMatch = updatedMatches.find(m => m.thirdPlaceMatch);
  if (!thirdPlaceMatch) return updatedMatches;
  const maxRound = Math.max(...updatedMatches.map(m => m.round));
  const semifinalRound = maxRound - 1;
  const semifinalMatches = updatedMatches.filter(m => m.round === semifinalRound && !m.thirdPlaceMatch);
  const semifinalLosers: Participant[] = [];
  semifinalMatches.forEach(match => {
    if (match.winner) {
      if (match.participant1 && match.participant2) {
        if (match.winner.id === match.participant1.id) {
          semifinalLosers.push(match.participant2);
        } else {
          semifinalLosers.push(match.participant1);
        }
      }
    }
  });
  if (semifinalLosers.length === 2) {
    const thirdPlaceIndex = updatedMatches.findIndex(m => m.id === thirdPlaceMatch.id);
    if (thirdPlaceIndex !== -1) {
      updatedMatches[thirdPlaceIndex] = {
        ...thirdPlaceMatch,
        participant1: semifinalLosers[0],
        participant2: semifinalLosers[1]
      };
    }
  }
  return updatedMatches;
}

export function calculateBracketLayout(matches: Match[]): Match[] {
  if (!matches.length) return [];
  const layoutMatches = [...matches];
  const maxRound = Math.max(...matches.map(m => m.round));
  for (let round = 1; round <= maxRound; round++) {
    const roundMatches = layoutMatches.filter(m => m.round === round);
    const spacing = 120;
    roundMatches.forEach((match, index) => {
      match.layoutX = (round - 1) * 280;
      match.layoutY = index * spacing * (Math.pow(2, maxRound - round));
    });
  }
  const thirdPlaceMatch = layoutMatches.find(m => m.thirdPlaceMatch);
  if (thirdPlaceMatch) {
    thirdPlaceMatch.layoutX = (maxRound - 1) * 280;
    thirdPlaceMatch.layoutY = (Math.pow(2, maxRound - 1) * 120) + 60;
  }
  return layoutMatches;
}

export function getRoundName(round: number, maxRound: number, matchCount: number): string {
  if (round === maxRound) return "Finał";
  if (round === maxRound - 1) return "Półfinał";
  if (round === maxRound - 2) return "Ćwierćfinał";
  return `Runda ${round}`;
}

export function getSlotLabel(participant: Participant | undefined, idx: number, teamCount: number): string {
  if (participant && participant.id && !participant.id.startsWith('placeholder')) {
    return participant.name;
  }
  if (participant && participant.id && participant.id.includes('placeholder-swiss')) {
    const position = parseInt(participant.id.split('-').pop() || '1');
    return `${position}. miejsce po Swiss`;
  }
  if (!participant || participant.placeholder) {
    const groupIdxLocal = Math.floor(idx / teamCount);
    const posLocal = (idx % teamCount) + 1;
    const groupLetter = String.fromCharCode(65 + groupIdxLocal);
    if (posLocal === 1) return `First Place of Group ${groupLetter}`;
    if (posLocal === 2) return `Second Place of Group ${groupLetter}`;
    if (posLocal === 3) return `Third Place of Group ${groupLetter}`;
    if (posLocal === 4) return `Fourth Place of Group ${groupLetter}`;
    return `${posLocal}th Place of Group ${groupLetter}`;
  }
  if (participant.groupId && participant.groupPosition) {
    const groupLetter = String.fromCharCode(65 + (participant.groupId - 1));
    if (participant.groupPosition === 1) return `First Place of Group ${groupLetter}`;
    if (participant.groupPosition === 2) return `Second Place of Group ${groupLetter}`;
    if (participant.groupPosition === 3) return `Third Place of Group ${groupLetter}`;
    if (participant.groupPosition === 4) return `Fourth Place of Group ${groupLetter}`;
    return `${participant.groupPosition}th Place of Group ${groupLetter}`;
  }
  if (participant) {
    if (participant.standingId !== undefined) {
      return `${participant.standingId}th Place after Swiss`;
    }
    if (participant.standingPosition !== undefined) {
      return `${participant.standingPosition}th Place after Swiss`;
    }
    if ('swissPosition' in participant && participant.swissPosition) {
      return `${participant.swissPosition}th Place after Swiss`;
    }
    if (participant.id && participant.id.includes('placeholder-swiss')) {
      const position = parseInt(participant.id.split('-').pop() || '1');
      return `${position}. miejsce po Swiss`;
    }
    return participant.name;
  }
  return `Slot ${idx + 1}`;
}

/**
 * Walkower: Cofnij zwycięstwo w ostatnim wygranym meczu dyskwalifikowanej drużyny i przepchnij przeciwnika do kolejnej rundy.
 * Nie zmieniaj wcześniejszych rund!
 * @param matches - wszystkie mecze
 * @param participants - lista uczestników
 * @param disqualifiedTeamId - ID drużyny zdyskwalifikowanej
 * @returns zaktualizowane mecze
 */
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
    walkover: true // DODAJ znacznik walkover
  };

  // 5. Znajdź kolejny mecz, gdzie winner tej pary gra dalej
  const nextRound = lastWin.round + 1;
  const nextPosition = Math.ceil(lastWin.position / 2);
  const nextMatch = updatedMatches.find(
    m => m.round === nextRound && m.position === nextPosition && !m.thirdPlaceMatch
  );

  if (nextMatch) {
    const nextMatchIndex = updatedMatches.findIndex(m => m.id === nextMatch.id);
    const updatedNextMatch = { ...nextMatch };

    // Usuń dyskwalifikowaną drużynę z kolejnego meczu i wstaw przeciwnika
    if (lastWin.position % 2 === 1) {
      updatedNextMatch.participant1 = opponent;
      updatedNextMatch.slotLabel1 = opponent.name;
    } else {
      updatedNextMatch.participant2 = opponent;
      updatedNextMatch.slotLabel2 = opponent.name;
    }

    // Jeśli kolejny mecz już ma winnera z powodu wcześniejszej dyskwalifikacji, usuń go
    if (updatedNextMatch.winner && 
        (updatedNextMatch.winner.id === disqualifiedTeamId || !updatedNextMatch.participant1 || !updatedNextMatch.participant2)) {
      updatedNextMatch.winner = undefined;
      updatedNextMatch.walkover = false;
    }

    updatedMatches[nextMatchIndex] = updatedNextMatch;

    // Rekurencyjnie usuń z kolejnych meczów
    updatedMatches = walkoverDisqualification(updatedMatches, participants, disqualifiedTeamId);
  }

  // Obsłuż trzecie miejsce
  const maxRound = Math.max(...updatedMatches.map(m => m.round));
  if (lastWin.round === maxRound - 1) {
    updatedMatches = updateThirdPlaceMatch(updatedMatches);
  }

  // Po każdej aktualizacji sprawdź, czy ktoś nie jest zdyskwalifikowany i automatycznie awansuj przeciwnika
  if (participants) {
    return autoAdvanceOnDisqualification(updatedMatches, participants);
  }
  return updatedMatches;
}