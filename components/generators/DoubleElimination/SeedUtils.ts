import type { Participant } from "@/types/index";

export function sortParticipantsBySeed(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => {
    if (a.seed !== undefined && b.seed !== undefined) {
      return a.seed - b.seed;
    }
    return 0;
  });
}

export function calculateByes(participantCount: number): number {
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  return nextPowerOfTwo - participantCount;
} 