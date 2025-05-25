export interface PlayerSetting {
  id: string;
  name: string;
  initialTimeMinutes: number;
  initialTimeSeconds: number;
}

export interface PlayerState {
  id:string;
  name: string;
  mainTimeRemaining: number; // in seconds, will include increments after turn completion
  isEliminated: boolean;
}

export type GameStatus = 'setup' | 'playing' | 'paused' | 'finished' | 'completing'; // 'completing' for when game end modal is up

export interface GameSettings {
  numPlayers: number;
  players: PlayerSetting[];
  incrementPerMove: number; // in seconds, added after a player completes their turn
}

export interface GameHistoryEntry {
  playerStates: PlayerState[];
  activePlayerIndexBeforeSwitch: number | null;
  currentRoundBeforeSwitch: number;
  elapsedGameTimeBeforeSwitch: number;
}

// ---- New types for Ranking System ----
export interface StoredGamePlayer {
  name: string; // Original name as entered for that game
  finalTime: number;
  id: string; // Original ID from PlayerState for that game session
}

export interface GameRecord {
  id: string; // UUID for the game record
  gameName?: string;
  note?: string;
  date: number; // timestamp
  players: StoredGamePlayer[];
  winnerName?: string; // Original name of the winner, if any
  gameDuration: number;
  rounds: number;
}

export interface MatchGroup {
  id: string; // UUID for the match group
  playerSignature: string; // e.g., "alice|bob|charlie" (trimmed, lowercased, sorted, joined)
  representativePlayerNames: string[]; // e.g., ["Alice", "Bob ", "Charlie"] (original case, sorted like signature, from first game)
  games: GameRecord[];
}

export type View = 'setup' | 'game' | 'ranking';

export interface GameCompletionData {
  playerStates: PlayerState[];
  winner?: PlayerState | null; // Winner determined by game logic
  manuallyEnded: boolean;
  gameDuration: number;
  rounds: number;
}
