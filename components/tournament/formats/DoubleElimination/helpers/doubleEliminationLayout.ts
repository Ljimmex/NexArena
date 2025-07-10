// Double Elimination layout helpers

import type { Match } from "@/types/index";

export function getMatchPositionWithoutGrandFinal(match: any, layoutMatches: any[], winnerMatchCountByRound: Record<number, number>): { left: string; top: string } {
  // For loser bracket matches
  if (match.round < 0) {
    const absRound = Math.abs(match.round);
    const matchesInRound = layoutMatches.filter(m => Math.abs(m.round) === absRound && m.round < 0);
    const matchIndex = matchesInRound.findIndex(m => m.id === match.id);
    const roundSpacing = 340;
    const verticalSpacing = 200;
    const leftPosition = (absRound - 1) * roundSpacing + 20;
    const winnerBracketMatches = layoutMatches.filter(m => m.round > 0 && !m.grandFinal);
    let winnerBracketBottom = 600;
    if (winnerBracketMatches.length > 0) {
      winnerBracketBottom = Math.max(...winnerBracketMatches.map(m => {
        if (m.round === 1) {
          const matchesInRound = layoutMatches.filter(rm => rm.round === 1);
          const matchIndex = matchesInRound.findIndex(rm => rm.id === m.id);
          return matchIndex * verticalSpacing + 190 + 160;
        } else {
          const matchesInRound = layoutMatches.filter(rm => rm.round === m.round && !m.grandFinal);
          const matchIndex = matchesInRound.findIndex(rm => rm.id === m.id);
          const matchesPerCurrentRoundMatch = Math.pow(2, m.round - 1);
          const startingFirstRoundIndex = matchIndex * matchesPerCurrentRoundMatch;
          const midpoint = startingFirstRoundIndex + (matchesPerCurrentRoundMatch / 2) - 0.5;
          return midpoint * verticalSpacing + 190 + 160;
        }
      }));
    }
    winnerBracketBottom += 250;
    if (absRound === 1) {
      const topPosition = winnerBracketBottom + matchIndex * verticalSpacing;
      return { left: `${leftPosition}px`, top: `${topPosition}px` };
    }
    if (match.connectedMatches && match.connectedMatches.length > 0) {
      const connectedMatches = match.connectedMatches
        .map((id: number) => layoutMatches.find((m: any) => m.id === id))
        .filter((m: any) => m && Math.abs(m.round) === absRound - 1 && m.round < 0);
      if (connectedMatches.length > 0) {
        const connectedPositions = connectedMatches.map((m: any) => {
          const pos = getMatchPositionWithoutGrandFinal(m, layoutMatches, winnerMatchCountByRound);
          return parseInt(pos.top);
        });
        const avgPosition = connectedPositions.reduce((sum: number, pos: number) => sum + pos, 0) / connectedPositions.length;
        return { left: `${leftPosition}px`, top: `${avgPosition}px` };
      }
    }
    const topPosition = winnerBracketBottom + matchIndex * verticalSpacing;
    return { left: `${leftPosition}px`, top: `${topPosition}px` };
  }
  // For winner bracket matches
  const matchesInRound = layoutMatches.filter(m => m.round === match.round && m.round > 0 && !m.grandFinal);
  const matchIndex = matchesInRound.findIndex(m => m.id === match.id);
  const roundSpacing = 340;
  const verticalSpacing = 200;
  const leftPosition = (match.round - 1) * roundSpacing + 20;
  if (match.round === 1) {
    return { left: `${leftPosition}px`, top: `${matchIndex * verticalSpacing + 190}px` };
  } else {
    const firstRoundMatches = winnerMatchCountByRound[1] || 0;
    const matchesPerCurrentRoundMatch = Math.pow(2, match.round - 1);
    const startingFirstRoundIndex = matchIndex * matchesPerCurrentRoundMatch;
    const midpoint = startingFirstRoundIndex + (matchesPerCurrentRoundMatch / 2) - 0.5;
    const topPosition = midpoint * verticalSpacing + 190;
    return { left: `${leftPosition}px`, top: `${topPosition}px` };
  }
}

export function getMatchPosition(match: any, layoutMatches: any[], winnerMatchCountByRound: Record<number, number>, maxWinnerRound: number, maxLoserRound: number): { left: string; top: string } {
  if (!match) return { left: "0px", top: "0px" };
  if (match.grandFinal || match.round === 0) {
    const finalRound = Math.max(maxWinnerRound, maxLoserRound);
    const winnerFinalMatch = layoutMatches.find((m: any) => m.round === maxWinnerRound && !m.grandFinal);
    const grandFinalMatches = layoutMatches.filter((m: any) => m.grandFinal || m.round === 0);
    if (grandFinalMatches.length > 1 && match.id !== Math.min(...grandFinalMatches.map((m: any) => m.id))) {
      return { left: `-9999px`, top: `-9999px` };
    }
    if (winnerFinalMatch) {
      const winnerFinalPos = getMatchPositionWithoutGrandFinal(winnerFinalMatch, layoutMatches, winnerMatchCountByRound);
      return { left: `${finalRound * 340 + 20}px`, top: winnerFinalPos.top };
    }
    return { left: `${finalRound * 340 + 20}px`, top: `150px` };
  }
  return getMatchPositionWithoutGrandFinal(match, layoutMatches, winnerMatchCountByRound);
}

export function calculateBracketHeight(layoutMatches: any[], winnerMatchCountByRound: Record<number, number>): number {
  const firstRoundMatches = winnerMatchCountByRound[1] || 0;
  if (firstRoundMatches === 0) return 1200;
  const baseMatchHeight = 140;
  const baseSpacing = 40;
  const lastMatchPosition = firstRoundMatches * 200 + 150;
  const winnerBracketHeight = lastMatchPosition + baseMatchHeight;
  const loserBracketMatches = layoutMatches.filter((m: any) => m.round < 0);
  let loserBracketHeight = 600;
  if (loserBracketMatches.length > 0) {
    const maxLoserPosition = Math.max(...loserBracketMatches.map((m: any) => {
      const absRound = Math.abs(m.round);
      const matchesInRound = layoutMatches.filter((rm: any) => Math.abs(rm.round) === absRound && rm.round < 0);
      const matchIndex = matchesInRound.findIndex((rm: any) => rm.id === m.id);
      return matchIndex * 200 + 200;
    }));
    loserBracketHeight = maxLoserPosition + baseMatchHeight;
  }
  return winnerBracketHeight + loserBracketHeight + 400;
} 