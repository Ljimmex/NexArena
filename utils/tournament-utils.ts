import { Participant } from "@/types/participants";

/**
 * Calculates the maximum number of teams per group
 */
export const calculateMaxTeamsPerGroup = (totalTeams: number, groups: number) => {
  return Math.ceil(totalTeams / groups);
};

/**
 * Shuffles the teams randomly and reassigns seeds
 */
export const shuffleTeams = (teams: Participant[]) => {
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Reassign seeds based on new order
  return shuffled.map((team, index) => ({
    ...team,
    seed: index + 1,
  }));
};

/**
 * Optimizes seeding according to tournament standards
 */
export const optimizeSeeding = (teams: Participant[]) => {
  if (teams.length < 2) return teams;
  
  // Sort teams by their current seed (lower number = higher seed)
  const sortedTeams = [...teams].sort((a, b) => 
    (a.seed || Number.MAX_SAFE_INTEGER) - (b.seed || Number.MAX_SAFE_INTEGER)
  );
  
  // Get the next power of 2 that is greater than or equal to the number of teams
  const totalTeams = teams.length;
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
  
  // Calculate number of byes (teams that get a free pass in first round)
  const numberOfByes = nextPowerOfTwo - totalTeams;
  
  // Create array for final seeded positions
  const reorderedTeams = new Array(nextPowerOfTwo);
  
  // Standard tournament bracket positions for first 8 seeds
  const standardPositions: Record<number, number> = {
      1: 1,    // Top seed
      2: nextPowerOfTwo,  // Bottom seed
      3: Math.floor(nextPowerOfTwo/2),  // Middle-top quarter
      4: Math.floor(nextPowerOfTwo/2) + 1,  // Middle-bottom quarter
      5: Math.floor(nextPowerOfTwo/4),
      6: Math.floor(3*nextPowerOfTwo/4),
      7: Math.floor(3*nextPowerOfTwo/4) + 1,
      8: Math.floor(nextPowerOfTwo/4) + 1
  };

  // First, assign the seeded teams to their positions
  for (let i = 0; i < Math.min(sortedTeams.length, Object.keys(standardPositions).length); i++) {
      const seedNumber = i + 1;
      const position = standardPositions[seedNumber];
      if (position) {
          reorderedTeams[position - 1] = {
              ...sortedTeams[i],
              seed: seedNumber
          };
      }
  }

  // Calculate bye positions using the formula: 2N, 2N-2, 2N-4, ..., 2N-2(b-1)
  const byePositions = new Set<number>();
  for (let i = 0; i < numberOfByes; i++) {
      const byePosition = nextPowerOfTwo - (2 * i);
      byePositions.add(byePosition);
  }

  // Then, assign remaining teams to empty positions, avoiding bye positions
  let remainingTeamIndex = Object.keys(standardPositions).length;
  let currentPosition = 1;

  while (remainingTeamIndex < sortedTeams.length) {
      // Find next empty position that is not a bye position
      while (currentPosition <= nextPowerOfTwo && 
             (reorderedTeams[currentPosition - 1] || byePositions.has(currentPosition))) {
          currentPosition++;
      }
      
      if (currentPosition <= nextPowerOfTwo) {
          reorderedTeams[currentPosition - 1] = {
              ...sortedTeams[remainingTeamIndex],
              seed: remainingTeamIndex + 1
          };
          remainingTeamIndex++;
      }
  }
  
  // Filter out undefined entries (empty positions that will be byes)
  return reorderedTeams.filter(team => team !== undefined);
};