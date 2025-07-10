export interface Participant {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
  standingId?: number; // Stałe ID pozycji w rankingu
  standingPosition?: number; // Aktualna pozycja w rankingu
  points?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  placeholder?: boolean; // Dodaj właściwość placeholder
  // Pola dla rozstawienia w fazie play-off
  groupId?: number; // ID grupy, z której pochodzi drużyna
  groupPosition?: number; // Pozycja w grupie (1, 2, 3, itd.)
  groupIdentifier?: string; // Identyfikator w formacie np. A1, B2, C3
  tiebreakers?: {
    buchholz?: number;
    medianBuchholz?: number;
    gameWin?: number;
    headToHead?: number;
    matchesPlayed?: number;
    gameWL?: number;
    [key: string]: number | undefined;
  };
  status?: 'registered' | 'ready' | 'confirmed' | 'declined' | 'disqualified' | 'substitute';
}

// Update the TeamType interface to include required properties
export interface TeamType {
  id: string
  name: string
  logo: string
  seed?: number
  // Add any other required properties from your team data
}