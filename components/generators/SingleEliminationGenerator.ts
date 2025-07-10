import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant } from "@/types/participants"
import type { Match } from "@/types/matches"
import { generateStandardBracket, generateGroupBasedBracket, generateWithPreliminaryMatches, getClosestBracketSize } from "./SingleElimination/BracketStructure"
import { updateMatchWinner, getMatchById, getNextMatches, updateThirdPlaceMatch, calculateBracketLayout, getRoundName, getSlotLabel } from "./SingleElimination/MatchUtils"
import { validateParticipants, getSeededPositions, getSnakeSeededPositions, isValidSeedingPattern } from "./SingleElimination/SeedUtils"

export class SingleEliminationGenerator implements BracketGeneratorInterface {
  private options: any;

  validateParticipants(participants: Participant[]): boolean {
    return validateParticipants(participants);
  }

  generateBracket(participants: Participant[], options: any = {}): Match[] {
    this.options = options;
    this.validateParticipants(participants);
    const matches: Match[] = [];
    const hasGroupInfo = participants.some(p => p.groupId !== undefined && p.groupPosition !== undefined);
    const seedingPattern = options.seedingPattern || 'standard';
    let seededPositions: number[] = [];
    if (seedingPattern === 'snake') {
      seededPositions = getSnakeSeededPositions(participants.length);
    } else {
      seededPositions = getSeededPositions(participants.length);
    }
    if (options.emptyBracket) {
      let bracketSize = 8; // Default size
      if (options.bracketSize) {
        bracketSize = options.bracketSize; // Użyj dokładnie tyle slotów ile maxTeams
      } else if (participants.length > 0) {
        bracketSize = getClosestBracketSize(participants.length);
      }
      
      const firstRoundMatchCount = bracketSize / 2;
      let matchId = 1;
      
      // Generate first round matches with proper slot labels
      for (let i = 0; i < firstRoundMatchCount; i++) {
        const p1 = participants[i * 2];
        const p2 = participants[i * 2 + 1];
        
        // Create better slot labels based on participant names
        let label1 = `Slot ${i * 2 + 1}`;
        let label2 = `Slot ${i * 2 + 2}`;
        
        if (p1) {
          if (p1.name && p1.name.startsWith('Swiss Place')) {
            label1 = p1.name;
          } else if (p1.name && p1.name.startsWith('Group')) {
            label1 = p1.name;
          } else if (p1.name && p1.name.startsWith('Slot')) {
            label1 = p1.name;
          }
        }
        
        if (p2) {
          if (p2.name && p2.name.startsWith('Swiss Place')) {
            label2 = p2.name;
          } else if (p2.name && p2.name.startsWith('Group')) {
            label2 = p2.name;
          } else if (p2.name && p2.name.startsWith('Slot')) {
            label2 = p2.name;
          }
        }
        
        matches.push({
          id: matchId++,
          round: 1,
          position: i + 1,
          participant1: p1,
          participant2: p2,
          connectedMatches: [],
          slotLabel1: label1,
          slotLabel2: label2
        });
      }
      
      // Generate subsequent rounds with proper connections
      let round = 2;
      let prevRoundMatchCount = firstRoundMatchCount;
      while (prevRoundMatchCount > 1) {
        const thisRoundMatchCount = prevRoundMatchCount / 2;
        for (let i = 0; i < thisRoundMatchCount; i++) {
          const prevMatch1 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 1);
          const prevMatch2 = matches.find(m => m.round === round - 1 && m.position === i * 2 + 2);
          
          matches.push({
            id: matchId++,
            round: round,
            position: i + 1,
            participant1: undefined,
            participant2: undefined,
            connectedMatches: [
              ...(prevMatch1 ? [prevMatch1.id] : []),
              ...(prevMatch2 ? [prevMatch2.id] : [])
            ],
            slotLabel1: `Winner of Match #${prevMatch1?.id || 'TBD'}`,
            slotLabel2: `Winner of Match #${prevMatch2?.id || 'TBD'}`
          });
        }
        prevRoundMatchCount = thisRoundMatchCount;
        round++;
      }
      
      // Add third place match if requested
      if (options.thirdPlaceMatch) {
        const semifinalMatches = matches.filter(m => m.round === round - 1);
        if (semifinalMatches.length >= 2) {
          matches.push({
            id: matchId++,
            round: round,
            position: 2,
            participant1: undefined,
            participant2: undefined,
            thirdPlaceMatch: true,
            connectedMatches: semifinalMatches.map(m => m.id),
            slotLabel1: `Loser of Match #${semifinalMatches[0]?.id || 'TBD'}`,
            slotLabel2: `Loser of Match #${semifinalMatches[1]?.id || 'TBD'}`
          });
        }
      }
      
      return matches;
    }
    if (hasGroupInfo) {
      generateGroupBasedBracket(matches, participants, { ...options, seededPositions });
    } else {
      const totalTeams = participants.length;
      const bracketSize = getClosestBracketSize(totalTeams);
      const byes = bracketSize - totalTeams;
      const rounds = Math.ceil(Math.log2(bracketSize));
      generateStandardBracket(matches, participants, totalTeams, bracketSize, byes, rounds, { ...options, seededPositions }, 1);
    }
    return matches;
  }

  updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[] {
    // Pobierz participants z this.options, jeśli są dostępne
    const participants = this.options?.participants || [];
    return updateMatchWinner(matches, matchId, winnerId, participants);
  }

  getMatchById(matches: Match[], matchId: number): Match | undefined {
    return getMatchById(matches, matchId);
  }

  getNextMatches(matches: Match[], matchId: number): Match[] {
    return getNextMatches(matches, matchId);
  }

  updateThirdPlaceMatch(matches: Match[]): Match[] {
    return updateThirdPlaceMatch(matches);
  }

  calculateBracketLayout(matches: Match[]): Match[] {
    return calculateBracketLayout(matches);
  }

  getRoundName(round: number, maxRound: number, matchCount: number): string {
    return getRoundName(round, maxRound, matchCount);
  }

  getSlotLabel(participant: Participant | undefined, idx: number, teamCount: number): string {
    return getSlotLabel(participant, idx, teamCount);
  }
}

