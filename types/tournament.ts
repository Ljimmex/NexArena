import type { Participant } from './participants';

export interface TournamentTiebreakers {
  [key: string]: number | undefined;
  buchholz: number;
  medianBuchholz: number;
  gameWin: number;
  headToHead: number;
  matchesPlayed: number;
  gameWL: number;
}

// Add the ScoreConfig type
export interface ScoreConfig {
  win: number;
  loss: number;
  draw: number;
  bye: number;
  winOvertime: number;
  lossOvertime: number;
}

export interface RoundRobinFormatOptions {
  groups: number;
  doubleRoundRobin: boolean;
  usePlayoffs: boolean;
  playoffTeams: number;
  tiebreaker?: string;
  scoreConfig?: ScoreConfig;
  advancingTeams?: number; // Upewnij się, że ta właściwość istnieje
  emptyBracket?: boolean; // Dodaj opcję pustej drabinki
}

export interface Match {
  id: number;
  round: number;
  position: number;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  thirdPlaceMatch?: boolean;
  preliminaryRound?: boolean;
  awaitingPreliminaryWinner?: number;
  awaitingPreliminaryWinners?: number[];
  layoutX?: number;
  layoutY?: number;
  connectedMatches?: number[];
  nextMatchId?: number;
  nextMatchPosition?: number;
  score1?: number;
  score2?: number;
  options?: {
    swissMode: 'playAllRounds' | 'topCut';
    tiebreaker: 'buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL';
    tiebreakers?: ('buchholz' | 'medianBuchholz' | 'gameWin' | 'headToHead' | 'matchesPlayed' | 'gameWL')[];
  };
}

export interface TournamentOptions {
  singleElimination: {
    thirdPlaceMatch: boolean;
  };
  doubleElimination: {
    winnersAdvantage: boolean;
    skipGrandFinal: boolean;
    skipLowerBracketFinal: boolean;
  };
  swiss: {
    mode: 'playAllRounds' | 'topCut';
  };
  roundRobin: {
    doubleRoundRobin: false
  };
}

export type TournamentFormat = 'singleElimination' | 'doubleElimination' | 'swiss' | 'roundRobin' | 'gauntlet';

// Update the TeamType interface to include required properties
export interface TeamType {
  id: string
  name: string
  logo: string
  seed?: number
  // Add any other required properties from your team data
}

export interface MapType {
  id: string
  name: string
  image: string
  game: string
  selected: boolean
}

export interface TournamentSetupProps {
  onGenerateBracket: (data: TournamentData) => void;
  activeStageSetup?: number | null;
  setActiveStageSetup?: (stageId: number) => void;
}

// Update the formatOptions.doubleElimination type in TournamentData interface
export interface TournamentData {
  tournamentName: string;
  tournamentFormat: string;
  teamCount: number;
  thirdPlaceMatch: boolean;
  selectedTeams: Participant[];
  substituteTeams: Participant[]; // <-- NOWE POLE
  startDateTime: string;
  prizePool?: string;
  prizeDistribution?: string;
  customPrizeDistribution?: Record<string, number>;
  selectedGame: string;
  selectedMaps: MapType[];
  mapSelectionType: string;
  emptyBracket?: boolean;
  //Timers
  registrationOpenDateTime: string;
  registrationCloseDateTime: string;
  readyOpenDateTime: string;
  readyCloseDateTime: string;
  // Dodaj brakujące właściwości:
  tournamentLogo?: string;
  organizer: string;
  organizerDescription: string;
  organizerContact: string;
  organizerSocials: {
    discord?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    twitch?: string;
    kick?: string;
    [key: string]: string | undefined;
  };
  teamFormat?: string;
  organizerLogo?: string;
  backgroundImage?: string;
  formatOptions?: {
    doubleElimination?: {
      grandFinalAdvantage: boolean;
      thirdPlace: boolean;
      skipGrandFinal: boolean;
      skipLowerBracketFinal: boolean;
      grandFinal?: "single" | "double";
    };
    swiss?: {
      rounds: number;
      usePlayoffs: boolean;
      playoffTeams: number;
      useTiebreakers: boolean;
      swissMode?: 'playAllRounds' | 'topCut';
      tiebreaker?: string;
      tiebreakers?: string[];
      endCondition: string;
      winsRequired: number;
      lossesElimination: number;
      scoreConfig?: ScoreConfig;
    };
    roundRobin?: {
      groups: number;
      doubleRoundRobin: boolean;
      usePlayoffs: boolean;
      playoffTeams: number;
      tiebreaker?: string;
      scoreConfig?: ScoreConfig;
      advancingTeams?: number;
    };
    roundGroups?: {
      groupCount: number;
      teamsPerGroup: number;
      qualificationMatches: boolean;
    };
  };
  gauntlet?: {
    reverse: boolean
    advantage: boolean
  };
  kingOfTheHill?: {
    multipleLives: boolean
    livesCount: number
  }
  stages?: TournamentStage[];
  about?: TournamentAbout;
  admins?: { name: string; role: string; avatar?: string }[];
  rules?: RulesProps;
  substituteCount?: number;
}

export interface MatchCardProps {
  matchId: string
  matchNumber: number
  matchFormat?: string
  matchTime?: string
  teamA: TeamProps
  teamB: TeamProps
  className?: string
  onWinnerChange?: (matchId: string, winnerId: string) => void
  editable?: boolean
  status?: "upcoming" | "live" | "completed"
  mapScore?: Record<string, number>
}

export interface TeamProps {
  id: string
  name: string
  logo: string
  score: number
  winner?: boolean
  seed?: number
}

// Adding RoundRobin specific interfaces
export interface RoundRobinMatch extends Match {
  score1?: number;
  score2?: number;
  group?: number;
}

export interface GroupStanding {
  participant: Participant;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number; // Add this property as required
}

// Add BracketGeneratorInterface if it doesn't exist
export interface BracketGeneratorInterface {
  generateBracket(participants: Participant[], options?: any): Match[];
  calculateBracketLayout(matches: Match[]): Match[];
  updateMatchWinner(matches: Match[], matchId: number, winnerId: string): Match[];
  getRoundName(round: number, maxRound: number, matchCount: number): string;
}

export interface TournamentResultsProps {
  standings: Map<number, GroupStanding[]>;
  matches: RoundRobinMatch[];
  format: string;
}


// Add the ScoreConfig type and update the format options interfaces

// First, define a ScoreConfig type
// Add this interface if it doesn't exist
export interface ScoreConfig {
  win: number;
  loss: number;
  draw: number;
  bye: number;
  winOvertime: number;
  lossOvertime: number;
}

// Then update the SwissFormatOptions and RoundRobinFormatOptions interfaces
export interface SwissFormatOptions {
  rounds: number;
  usePlayoffs: boolean;
  playoffTeams: number;
  useTiebreakers: boolean;
  endCondition: string;
  winsRequired: number;
  lossesElimination: number;
  swissMode?: 'playAllRounds' | 'topCut'; // Add this property
  tiebreaker?: string;
  tiebreakers?: string[];
  scoreConfig?: ScoreConfig;
}

export interface RoundRobinFormatOptions {
  groups: number;
  doubleRoundRobin: boolean;
  usePlayoffs: boolean;
  playoffTeams: number;
  tiebreaker?: string;
  scoreConfig?: ScoreConfig;
  advancingTeams?: number; // Dodana właściwość dla liczby drużyn awansujących
}

// Add this if it doesn't exist already
export interface TournamentStage {
  id: number;
  name: string;
  format: string;
}

// Update TournamentData interface to include stages
export interface TournamentData {
  // ... existing properties
  stages?: TournamentStage[];
  // ... other properties
}

export interface BracketViewProps {
  participants: Participant[];
  options?: {
    format?: string;
    thirdPlaceMatch?: boolean;
    winnersAdvantage?: boolean;
    rounds?: number;
    roundRobinGroups?: number;
    doubleRoundRobin?: boolean;
    usePlayoffs?: boolean;
    playoffTeams?: number;
    tiebreaker?: string;
    tiebreakers?: string[];
    scoreConfig?: ScoreConfig;
    swissMode?: 'playAllRounds' | 'topCut';
roundRobinAdvancingTeams?: number;
  };
  className?: string;
}

export interface TournamentAbout {
  name: string;
  organizerName: string;
  description: string;
  contactUrl: string;
  videoUrl: string;
  contactMethod: string;
}

// Przenieś typy RulePoint, RuleSection, RulesMeta, RulesProps z Rules.tsx
export interface RulePoint {
  text: string;
  children?: RulePoint[];
}

export interface RuleSection {
  title: string;
  icon: string;
  points: RulePoint[];
}

export interface RulesMeta {
  version?: string;
  approvedBy?: string;
  approvedDate?: string;
  pdfUrl?: string;
  wordUrl?: string;
  previewUrl?: string;
}

export interface RulesProps {
  rulesSections?: RuleSection[];
  rulesMeta?: RulesMeta;
  rulesFallback?: string[];
}