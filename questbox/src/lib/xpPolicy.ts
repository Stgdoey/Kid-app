
import { Progress, Task, XPPolicy } from '../types';
import { getTodayDateString } from './utils';

/**
 * Calculates the user's current level and progress towards the next level.
 */
export function calculateLevel(xp: number, xpPerLevel: number) {
  if (xpPerLevel <= 0) return { level: 1, xpInLevel: 0, xpToNextLevel: 0, progress: 0 };
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpInLevel = xp % xpPerLevel;
  const progress = (xpInLevel / xpPerLevel) * 100;
  return {
    level,
    xpInLevel,
    xpToNextLevel: xpPerLevel,
    progress,
  };
}

/**
 * Calculates the new progress state after a task is completed.
 */
export function processTaskCompletion(
  task: Task,
  currentProgress: Progress,
  xpPolicy: XPPolicy
): Progress {
  const today = getTodayDateString();
  const todaysCompletions = currentProgress.dailyCompletions[today] || [];

  // 1. Calculate base XP, applying diminishing returns if applicable
  let earnedXp = task.xp;
  if (todaysCompletions.length >= xpPolicy.diminishingReturns.afterTaskCount) {
    earnedXp = Math.round(earnedXp * xpPolicy.diminishingReturns.reductionFactor);
  }
  
  // 2. Check against daily XP cap
  const currentDailyXp = todaysCompletions.reduce((total, taskId) => {
    // This is a simplification; a more accurate system would store earned XP per task.
    // For now, we assume we don't need to re-calculate past XP.
    return total;
  }, 0);
  
  const cappedXp = Math.min(earnedXp, xpPolicy.dailyXpCap - currentDailyXp);
  if(cappedXp <= 0) return currentProgress; // No change if cap is reached

  // 3. Update streak
  let newStreak = currentProgress.streak;
  const lastDate = currentProgress.lastCompletionDate;
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      newStreak += 1; // It's a new day and yesterday had a completion
    } else {
      newStreak = 1; // Streak was broken, start a new one
    }
  }
  
  // Apply streak bonus
  if (newStreak > 0 && newStreak % xpPolicy.streakBonus.days === 0) {
     // Apply bonus on the *first* task of the bonus day
     if(todaysCompletions.length === 0){
        // This is a simple bonus XP, not a multiplier on this task's XP
        currentProgress.xp += xpPolicy.streakBonus.days * 10;
     }
  }


  // 4. Create new progress object
  const newProgress: Progress = {
    ...currentProgress,
    xp: currentProgress.xp + cappedXp,
    streak: newStreak,
    lastCompletionDate: today,
    dailyCompletions: {
      ...currentProgress.dailyCompletions,
      [today]: [...todaysCompletions, task.id],
    },
  };

  return newProgress;
}
