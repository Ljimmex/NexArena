// Utils for bracket logic

export function getStageOptions(stageFormat: string, formatOptions: any, tournamentData: any, maxTeams: number) {
  const stageOptions = {...formatOptions};
  stageOptions.format = stageFormat.toLowerCase().trim();
  if (stageFormat.toLowerCase().trim() === 'swiss') {
    stageOptions.usePlayoffs = true;
    stageOptions.playoffTeams = Math.floor(tournamentData.selectedTeams.length / 2);
  }
  if (stageFormat.toLowerCase().trim() === 'round-robin') {
    stageOptions.roundRobinAdvancingTeams = tournamentData.formatOptions?.roundRobin?.advancingTeams || 1;
    stageOptions.roundRobinGroups = tournamentData.formatOptions?.roundRobin?.groups || 1;
  }
  if (stageFormat.toLowerCase().trim() === 'double-elimination') {
    stageOptions.usePlayoffs = true;
    stageOptions.playoffTeams = Math.floor(tournamentData.selectedTeams.length * 0.75);
  }
  if (stageFormat.toLowerCase().trim() === 'single-elimination') {
    // ZAWSZE przekazuj bracketSize = maxTeams (nie 8)
    stageOptions.bracketSize = maxTeams;
  }
  return stageOptions;
}

// Główna funkcja do pobierania uczestników danego etapu
export function getStageParticipants(stage: any, tournamentData: any) {
  // Single Elimination: zawsze generuj pustą drabinkę na maxTeams, dopóki nie ma seedingu
  if (stage.format === 'single-elimination') {
    // Pobierz drużyny z przypisanym seedem (nie tylko ready!)
    const teams = (tournamentData.selectedTeams || []).filter((t: any) => Number.isInteger(t.seed));
    // Jeśli seedów jest mniej niż maxTeams, generuj placeholdery
    if (teams.length < tournamentData.teamCount) {
      // Zwróć pustą tablicę, generator i tak wygeneruje placeholdery na maxTeams
      return [];
    }
    // Zwróć posortowane drużyny po seedzie (nie filtruj po statusie!)
    return teams.sort((a: any, b: any) => (a.seed || 9999) - (b.seed || 9999));
  }
  // Double Elimination: analogicznie, można dodać logikę seedingu
  if (stage.format === 'double-elimination') {
    // Pobierz drużyny z przypisanym seedem (nie tylko ready!)
    const teams = (tournamentData.selectedTeams || []).filter((t: any) => Number.isInteger(t.seed));
    // Jeśli seedów jest mniej niż maxTeams, generuj placeholdery
    if (teams.length < tournamentData.teamCount) {
      return [];
    }
    // Zwróć posortowane drużyny po seedzie (nie filtruj po statusie!)
    return teams.sort((a: any, b: any) => (a.seed || 9999) - (b.seed || 9999));
  }
  // Swiss: tylko drużyny 'ready'
  if (stage.format === 'swiss') {
    const teams = (tournamentData.selectedTeams || []).filter((t: any) => t.status === 'ready');
    return teams;
  }
  // Round Robin: tylko drużyny 'ready'
  if (stage.format === 'round-robin') {
    const teams = (tournamentData.selectedTeams || []).filter((t: any) => t.status === 'ready');
    return teams;
  }
  return [];
}

// Funkcje sprawdzające czy etap jest zakończony
export function isSingleEliminationStageComplete(stageId: number, tournamentData: any, formatOptions: any) {
  // Pobierz mecze z localStorage
  try {
    const matchesRaw = typeof window !== 'undefined' ? localStorage.getItem(`matches-stage-${stageId}`) : null;
    if (!matchesRaw) return false;
    const matches = JSON.parse(matchesRaw);
    if (!Array.isArray(matches) || matches.length === 0) return false;
    // Wszystkie mecze muszą mieć winner i score1/score2
    return matches.every((match: any) => match.winner !== undefined && match.winner !== null && match.score1 !== undefined && match.score2 !== undefined);
  } catch {
    return false;
  }
}
export function isDoubleEliminationStageComplete(stageId: number, tournamentData: any, formatOptions: any) {
  // Analogicznie do single elimination
  try {
    const matchesRaw = typeof window !== 'undefined' ? localStorage.getItem(`matches-stage-${stageId}`) : null;
    if (!matchesRaw) return false;
    const matches = JSON.parse(matchesRaw);
    if (!Array.isArray(matches) || matches.length === 0) return false;
    return matches.every((match: any) => match.winner !== undefined && match.winner !== null && match.score1 !== undefined && match.score2 !== undefined);
  } catch {
    return false;
  }
}
export function isSwissStageComplete(stageId: number, tournamentData: any, formatOptions: any) {
  // Swiss: wszystkie mecze muszą mieć winner
  try {
    const matchesRaw = typeof window !== 'undefined' ? localStorage.getItem(`matches-stage-${stageId}`) : null;
    if (!matchesRaw) return false;
    const matches = JSON.parse(matchesRaw);
    if (!Array.isArray(matches) || matches.length === 0) return false;
    return matches.every((match: any) => match.winner !== undefined && match.winner !== null);
  } catch {
    return false;
  }
}
export function isRoundRobinStageComplete(stageId: number, tournamentData: any, formatOptions: any) {
  // Round Robin: wszystkie mecze muszą mieć winner (lub być remisem)
  try {
    const matchesRaw = typeof window !== 'undefined' ? localStorage.getItem(`matches-stage-${stageId}`) : null;
    if (!matchesRaw) return false;
    const matches = JSON.parse(matchesRaw);
    if (!Array.isArray(matches) || matches.length === 0) return false;
    // winner może być undefined przy remisie, ale score1 i score2 muszą być ustawione
    return matches.every((match: any) => (match.winner !== undefined || (match.score1 !== undefined && match.score2 !== undefined)));
  } catch {
    return false;
  }
} 