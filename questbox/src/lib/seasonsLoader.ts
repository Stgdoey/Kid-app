
import { SeasonsConfig } from '@/src/types';

/**
 * Determines the active seasonal theme based on the current date.
 * @param seasonsConfig The seasons configuration object.
 * @returns The key of the active theme, or the fallback theme if no season is active.
 */
export function getActiveSeasonTheme(seasonsConfig: SeasonsConfig): string {
  const now = new Date();
  // Set time to 0 to compare dates only
  now.setHours(0, 0, 0, 0);

  const currentSeason = seasonsConfig.seasons.find(season => {
    // Adding a day to endDate to make it inclusive
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    endDate.setDate(endDate.getDate() + 1);
    return now >= startDate && now < endDate;
  });

  return currentSeason ? currentSeason.theme : seasonsConfig.fallbackTheme;
}
