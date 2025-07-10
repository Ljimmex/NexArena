// Seeding utilities for Round Robin
// (Extracted from RoundRobinGenerator.ts)

import type { Participant } from "@/types/index";

export function assignTeamsByPattern(sortedTeams: Participant[], seededTeams: Participant[], pattern: string[]): void {
  const teamsByIdentifier = new Map<string, Participant>();
  sortedTeams.forEach(team => {
    if ((team as any).groupIdentifier) {
      teamsByIdentifier.set((team as any).groupIdentifier, team);
    }
  });
  pattern.forEach(identifier => {
    const team = teamsByIdentifier.get(identifier);
    if (team) {
      seededTeams.push(team);
    }
  });
  sortedTeams.forEach(team => {
    if (!seededTeams.includes(team)) {
      seededTeams.push(team);
    }
  });
}

export function createGenericSeeding(teams: Participant[], totalGroups: number, teamsPerGroup: number): Participant[] {
  const totalTeams = teams.length;
  const teamsByGroup = new Map<number, Participant[]>();
  teams.forEach(team => {
    const groupId = (team as any).groupId || 0;
    if (!teamsByGroup.has(groupId)) {
      teamsByGroup.set(groupId, []);
    }
    teamsByGroup.get(groupId)?.push(team);
  });
  teamsByGroup.forEach(groupTeams => {
    groupTeams.sort((a, b) => ((a as any).groupPosition || 0) - ((b as any).groupPosition || 0));
  });
  const seededTeams: Participant[] = [];
  const positionPots: Participant[][] = [];
  for (let position = 1; position <= teamsPerGroup; position++) {
    const pot: Participant[] = [];
    for (let groupId = 1; groupId <= totalGroups; groupId++) {
      const groupTeams = teamsByGroup.get(groupId) || [];
      const teamAtPosition = groupTeams.find(team => (team as any).groupPosition === position);
      if (teamAtPosition) {
        pot.push(teamAtPosition);
      }
    }
    positionPots.push(pot);
  }
  for (let potIndex = 0; potIndex < positionPots.length; potIndex++) {
    const pot = positionPots[potIndex];
    const teamsToAdd = potIndex % 2 === 0 ? [...pot] : [...pot].reverse();
    seededTeams.push(...teamsToAdd);
  }
  return seededTeams;
}

// Add more seeding-related helpers as needed 