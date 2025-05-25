import { MatchGroup } from '../types';

const RANKINGS_STORAGE_KEY = 'gameClockRankings_v1';

export const loadRankingsFromStorage = (): MatchGroup[] => {
  try {
    const storedData = localStorage.getItem(RANKINGS_STORAGE_KEY);
    if (storedData) {
      // TODO: Add validation/migration logic if schema changes in future
      return JSON.parse(storedData) as MatchGroup[];
    }
  } catch (error) {
    console.error("Error loading rankings from localStorage:", error);
  }
  return [];
};

export const saveRankingsToStorage = (rankings: MatchGroup[]): void => {
  try {
    localStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(rankings));
  } catch (error) {
    console.error("Error saving rankings to localStorage:", error);
  }
};
