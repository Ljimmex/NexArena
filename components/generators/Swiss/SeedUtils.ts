import type { Participant } from "@/types/index";

export function validateParticipants(participants: Participant[]): boolean {
  if (participants.length < 2) throw new Error('At least 2 participants are required');
  const ids = new Set(participants.map(p => p.id));
  if (ids.size !== participants.length) throw new Error('Duplicate participant IDs found');
  return true;
}

export function shuffleParticipants(participants: Participant[]): Participant[] {
  return [...participants].sort(() => Math.random() - 0.5);
} 