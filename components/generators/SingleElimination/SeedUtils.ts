import type { Participant } from "@/types/participants";

export function validateParticipants(participants: Participant[]): boolean {
  if (participants.length < 2) {
    throw new Error('At least 2 participants are required');
  }
  const ids = new Set(participants.map(p => p.id));
  if (ids.size !== participants.length) {
    throw new Error('Duplicate participant IDs found');
  }
  return true;
}

// Klasyczne rozstawienie turniejowe (standard seeding)
export function getSeededPositions(teamCount: number): number[] {
  // Standardowe rozstawienie dla 4, 8, 16, 32
  const patterns: Record<number, number[]> = {
    4: [1, 4, 3, 2],
    8: [1, 8, 5, 4, 3, 6, 7, 2],
    16: [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2],
    32: [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2],
  };
  if (patterns[teamCount]) return patterns[teamCount];
  // Dla innych rozmiarów: po prostu kolejność 1..N
  return Array.from({ length: teamCount }, (_, i) => i + 1);
}

// Snake seeding (naprzemienne rozstawienie)
export function getSnakeSeededPositions(teamCount: number): number[] {
  const positions: number[] = [];
  let left = 1, right = teamCount;
  let leftTurn = true;
  while (left <= right) {
    if (leftTurn) {
      positions.push(left++);
    } else {
      positions.push(right--);
    }
    leftTurn = !leftTurn;
  }
  return positions;
}

// Sprawdź czy seedy są poprawne (unikalne, w zakresie 1..N)
export function isValidSeedingPattern(seeds: number[], teamCount: number): boolean {
  if (seeds.length !== teamCount) return false;
  const set = new Set(seeds);
  if (set.size !== teamCount) return false;
  for (const s of seeds) {
    if (s < 1 || s > teamCount) return false;
  }
  return true;
} 