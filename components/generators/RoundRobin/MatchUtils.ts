// Match utilities for Round Robin
// (Extracted from RoundRobinGenerator.ts)

import type { Match, RoundRobinMatch, Participant } from "@/types/index";

type ExtendedMatch = Match & { walkover?: boolean; bye?: boolean; overtime?: boolean; draw?: boolean; loser?: Participant };

export function updateMatchWinner(matches: Match[], matchId: number, winnerId: string, score1?: number, score2?: number, options?: { walkover?: boolean; disqualifiedId?: string; overtime?: boolean; bye?: boolean; scoreConfig?: any; }): Match[] {
  const updatedMatches = [...matches];
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return updatedMatches;
  const match = updatedMatches[matchIndex] as ExtendedMatch;
  // Obsługa walkowera
  if (options?.walkover && options.disqualifiedId) {
    if (match.participant1?.id === options.disqualifiedId) {
      match.winner = match.participant2;
      match.loser = match.participant1;
      match.score1 = 0;
      match.score2 = (options.scoreConfig?.win ?? 3);
    } else if (match.participant2?.id === options.disqualifiedId) {
      match.winner = match.participant1;
      match.loser = match.participant2;
      match.score1 = (options.scoreConfig?.win ?? 3);
      match.score2 = 0;
    }
    match.walkover = true;
    return updatedMatches;
  }
  // Obsługa bye
  if (options?.bye) {
    if (match.participant1?.id === winnerId) {
      match.winner = match.participant1;
      match.loser = match.participant2;
      match.score1 = (options.scoreConfig?.bye ?? 3);
      match.score2 = 0;
    } else if (match.participant2?.id === winnerId) {
      match.winner = match.participant2;
      match.loser = match.participant1;
      match.score1 = 0;
      match.score2 = (options.scoreConfig?.bye ?? 3);
    }
    match.bye = true;
    return updatedMatches;
  }
  // Obsługa dogrywki
  if (options?.overtime) {
    if (match.participant1?.id === winnerId) {
      match.winner = match.participant1;
      match.loser = match.participant2;
      match.score1 = (score1 ?? options.scoreConfig?.winOvertime ?? 2);
      match.score2 = (score2 ?? options.scoreConfig?.lossOvertime ?? 1);
    } else if (match.participant2?.id === winnerId) {
      match.winner = match.participant2;
      match.loser = match.participant1;
      match.score1 = (score1 ?? options.scoreConfig?.lossOvertime ?? 1);
      match.score2 = (score2 ?? options.scoreConfig?.winOvertime ?? 2);
    }
    match.overtime = true;
    return updatedMatches;
  }
  // Obsługa remisu
  if (score1 !== undefined && score2 !== undefined && score1 === score2) {
    match.winner = undefined;
    match.loser = undefined;
    match.score1 = score1;
    match.score2 = score2;
    match.draw = true;
    return updatedMatches;
  }
  // Standardowa wygrana/przegrana
  if (match.participant1?.id === winnerId) {
    match.winner = match.participant1;
    match.loser = match.participant2;
    match.score1 = score1 ?? (options?.scoreConfig?.win ?? 3);
    match.score2 = score2 ?? (options?.scoreConfig?.loss ?? 0);
  } else if (match.participant2?.id === winnerId) {
    match.winner = match.participant2;
    match.loser = match.participant1;
    match.score1 = score1 ?? (options?.scoreConfig?.loss ?? 0);
    match.score2 = score2 ?? (options?.scoreConfig?.win ?? 3);
  }
  return updatedMatches;
}

// Add more match-related helpers as needed 