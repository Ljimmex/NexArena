import type { BracketGeneratorInterface } from "@/types/generators"
import type { Participant, Match, RoundRobinMatch, GroupStanding } from "@/types/index"
import type { ScoreConfig } from "@/types/tournament"
import { SingleEliminationGenerator } from './SingleEliminationGenerator';
// Import helpers
import { generateGroupMatches, initializeStandings, generatePlayoffs } from "./RoundRobin/BracketStructure";
import { updateMatchWinner } from "./RoundRobin/MatchUtils";
import { assignTeamsByPattern, createGenericSeeding } from "./RoundRobin/SeedUtils";
import { updateStandings, calculateStandings, sortStandings } from "./RoundRobin/StandingsUtils";

export class RoundRobinGenerator implements BracketGeneratorInterface {
  private matches: RoundRobinMatch[] = [];
  private standings: Map<number, GroupStanding[]> = new Map();
  private matchId: number = 1;
  private tiebreaker: string = 'headToHead'; // Default tiebreaker
  private scoreConfig: ScoreConfig = {
    win: 3,
    loss: 0,
    draw: 1,
    bye: 3,
    winOvertime: 2,
    lossOvertime: 1
  }; // Default score configuration

  generateBracket(participants: Participant[], options: any = {}): Match[] {
    const tournamentOptions = {
      groups: options.groups || 1,
      doubleRoundRobin: options.doubleRoundRobin || false,
      usePlayoffs: options.usePlayoffs || false,
      playoffTeams: options.playoffTeams || 0,
      advancingTeams: options.advancingTeams || options.playoffTeams || 0, // Liczba drużyn awansujących z każdej grupy
      tiebreaker: options.tiebreaker || 'headToHead', // Add tiebreaker option
      scoreConfig: options.scoreConfig || this.scoreConfig, // Add score configuration
      emptyBracket: options.emptyBracket || false // Dodaj opcję pustej drabinki
    };
    
    // Set the class tiebreaker property
    this.tiebreaker = tournamentOptions.tiebreaker;
    
    // Set the score configuration
    if (tournamentOptions.scoreConfig) {
      this.scoreConfig = tournamentOptions.scoreConfig;
    }
    
    console.log("RoundRobinGenerator - Using score config:", this.scoreConfig);
    console.log("RoundRobinGenerator - Advancing teams per group:", tournamentOptions.advancingTeams);
    console.log("RoundRobinGenerator - Empty bracket mode:", tournamentOptions.emptyBracket);
    
    return this.generateTournament(participants, tournamentOptions).matches;
  }

  calculateBracketLayout(matches: Match[]): Match[] {
    // Calculate positions for visualization
    const layoutMatches = [...matches];
    
    // Group matches by group and round
    const groupedMatches = new Map<number | string, Map<number, Match[]>>();
    
    // Initialize group maps
    const groups = new Set<number | string>();
    matches.forEach(match => {
      if (match.group) groups.add(match.group);
    });
    
    // Create nested maps for each group and round
    groups.forEach(group => {
      groupedMatches.set(group, new Map<number, Match[]>());
    });
    
    // Populate the grouped matches
    matches.forEach(match => {
      if (!match.group) return;
      
      const groupMap = groupedMatches.get(match.group);
      if (!groupMap) return;
      
      if (!groupMap.has(match.round)) {
        groupMap.set(match.round, []);
      }
      
      groupMap.get(match.round)?.push(match);
    });
    
    // Calculate layout for each group separately
    groupedMatches.forEach((roundMatches, groupId) => {
      // Calculate layout for each round within this group
      roundMatches.forEach((matchesInRound, round) => {
        const matchCount = matchesInRound.length;
        
        matchesInRound.forEach((match, index) => {
          const matchIndex = layoutMatches.findIndex(m => m.id === match.id);
          if (matchIndex !== -1) {
            // Apply horizontal spacing between groups
            // Convert groupId to number for calculation, or use 0 if it's a string
            const groupOffset = (typeof groupId === 'number' ? groupId - 1 : 0) * 1200;
            
            layoutMatches[matchIndex] = {
              ...match,
              layoutX: (round * 280) + groupOffset,
              layoutY: (index * 120) + (index * 20)
            };
          }
        });
      });
    });
    
    return layoutMatches;
  }

  updateMatchWinner(matches: Match[], matchId: number, winnerId: string, score1?: number, score2?: number): Match[] {
    const updatedMatches = [...matches];
    const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) return updatedMatches;
    
    const match = updatedMatches[matchIndex];
    
    // Set winner and scores
    if (match.participant1?.id === winnerId) {
      match.winner = match.participant1;
      match.score1 = score1 ?? 1;
      match.score2 = score2 ?? 0;
    } else if (match.participant2?.id === winnerId) {
      match.winner = match.participant2;
      match.score1 = score1 ?? 0;
      match.score2 = score2 ?? 1;
    }
    
    // Update standings
    updateStandings(match as RoundRobinMatch);
    
    return updatedMatches;
  }

  getRoundName(round: number, maxRound: number, matchCount: number): string {
    return `Round ${round}`;
  }

  // Update the generateTournament method to accept tiebreaker and handle playoffs
  generateTournament(
    participants: Participant[],
    options: {
      groups: number;
      doubleRoundRobin: boolean;
      usePlayoffs: boolean;
      playoffTeams: number;
      advancingTeams?: number;
      tiebreaker?: string;
      scoreConfig?: ScoreConfig;
      emptyBracket?: boolean;
    }
  ): { matches: Match[]; standings: Map<number, GroupStanding[]> } {
    this.matches = [];
    this.standings = new Map();
    this.tiebreaker = options.tiebreaker || 'headToHead';
    
    // Set score configuration if provided
    if (options.scoreConfig) {
      this.scoreConfig = options.scoreConfig;
    }
    
    // Divide participants into groups
    const participantsPerGroup = Math.ceil(participants.length / options.groups);
    const groups: Participant[][] = Array.from({ length: options.groups }, () => []);
    
    // Check if we have seeded participants
    const hasSeededParticipants = participants.some(p => typeof p.standingId === 'string');
    
    if (hasSeededParticipants) {
      // If we have seeded participants, assign them to groups based on their standingId
      participants.forEach(participant => {
        const standingId = participant.standingId as unknown as string;
        if (typeof standingId === 'string') {
          const groupLetter = standingId.charAt(0);
          const groupNumber = groupLetter.charCodeAt(0) - 64; // Convert A->1, B->2, etc.
          if (groupNumber >= 1 && groupNumber <= options.groups) {
            groups[groupNumber - 1].push(participant);
          }
        }
      });
    } else {
      // If no seeded participants, create placeholder teams
      console.log("Generating empty bracket with placeholder participants");
      
      for (let i = 0; i < options.groups; i++) {
        for (let j = 0; j < participantsPerGroup; j++) {
          const placeholderId = `placeholder-${i+1}-${j+1}`;
          const standingId = `${String.fromCharCode(65 + i)}${j+1}`;
          groups[i].push({
            id: placeholderId,
            name: 'To be decided',
            logo: '',
            seed: i * participantsPerGroup + j + 1,
            placeholder: true,
            standingId: standingId
          } as unknown as Participant);
        }
      }
    }
    
    // Generate matches for each group
    for (let i = 0; i < options.groups; i++) {
      const groupMatches = generateGroupMatches(groups[i], i + 1, options.doubleRoundRobin);
      this.matches.push(...groupMatches);
      const groupStandings = initializeStandings(groups[i], i + 1);
      this.standings.set(i + 1, groupStandings);
    }

    // If using playoffs, generate additional matches
    if (options.usePlayoffs && !options.emptyBracket) {
      const advancingTeams = options.advancingTeams || options.playoffTeams || 0;
      
      if (advancingTeams > 0) {
        calculateStandings(this.matches.filter(m => m.group !== undefined) as RoundRobinMatch[]);
        const playoffMatches = generatePlayoffs(advancingTeams, options.groups, this.standings);
        this.matches.push(...playoffMatches as RoundRobinMatch[]);
      }
    }

    return {
      matches: this.matches,
      standings: this.standings
    };
  }

  // Public method to get the current standings
  public getStandings(): Map<number, GroupStanding[]> {
    return this.standings;
  }
}
