import { PlayerState, StoredGamePlayer, GameRecord, MatchGroup } from '../types';

/**
 * Generates a unique signature for a group of players based on their names.
 * Names are trimmed, lowercased, sorted, and joined by a pipe.
 * @param playerNames Array of player names.
 * @returns A unique string signature.
 */
export const generatePlayerSignature = (playerNames: string[]): string => {
  return playerNames
    .map(name => name.trim().toLowerCase())
    .sort()
    .join('|');
};

/**
 * Creates a GameRecord from the current game state.
 * @param playerStates Final states of all players.
 * @param winnerName Optional name of the winner.
 * @param gameName Optional custom name for the game.
 * @param note Optional note for the game.
 * @param gameDuration Total duration of the game in seconds.
 * @param rounds Number of rounds completed.
 * @returns A new GameRecord object.
 */
export const createGameRecord = (
  playerStates: PlayerState[],
  winnerName: string | undefined | null,
  gameName: string | undefined,
  note: string | undefined,
  gameDuration: number,
  rounds: number
): GameRecord => {
  const storedPlayers: StoredGamePlayer[] = playerStates.map(p => ({
    id: p.id,
    name: p.name,
    finalTime: p.mainTimeRemaining,
  }));

  return {
    id: crypto.randomUUID(),
    gameName: gameName?.trim() || undefined,
    note: note?.trim() || undefined,
    date: Date.now(),
    players: storedPlayers,
    winnerName: winnerName || undefined,
    gameDuration,
    rounds,
  };
};

/**
 * Adds a new game record to the appropriate match group or creates a new group.
 * @param rankings Current array of all MatchGroups.
 * @param newRecord The GameRecord to add.
 * @returns The updated array of MatchGroups.
 */
export const addRecordToRankings = (
  rankings: MatchGroup[],
  newRecord: GameRecord
): MatchGroup[] => {
  const playerNamesInRecord = newRecord.players.map(p => p.name);
  const signature = generatePlayerSignature(playerNamesInRecord);

  const existingGroupIndex = rankings.findIndex(group => group.playerSignature === signature);

  if (existingGroupIndex !== -1) {
    // Add to existing group
    const updatedRankings = [...rankings];
    updatedRankings[existingGroupIndex].games.push(newRecord);
    // Sort games by date, newest first
    updatedRankings[existingGroupIndex].games.sort((a, b) => b.date - a.date);
    return updatedRankings;
  } else {
    // Create new group
    const representativeNames = playerNamesInRecord
        .map(name => ({ name, lower: name.trim().toLowerCase() }))
        .sort((a,b) => a.lower.localeCompare(b.lower))
        .map(item => item.name);

    const newGroup: MatchGroup = {
      id: crypto.randomUUID(),
      playerSignature: signature,
      representativePlayerNames: representativeNames,
      games: [newRecord],
    };
    return [...rankings, newGroup].sort((a,b) => 
      a.representativePlayerNames.join(',').localeCompare(b.representativePlayerNames.join(','))
    );
  }
};
