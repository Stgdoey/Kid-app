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
  xpPolicy: XPPolicy,
  allTasks: Task[]
): Progress {
  const today = getTodayDateString();
  const todaysCompletionsIds = currentProgress.dailyCompletions[today] || [];

  // --- Refined Daily XP Cap Logic ---

  // 1. Calculate total XP already earned today by re-evaluating each completed task.
  // This ensures diminishing returns are correctly factored into the daily total.
  let currentDailyXp = 0;
  todaysCompletionsIds.forEach((completedTaskId, index) => {
    const completedTask = allTasks.find(t => t.id === completedTaskId);
    if (completedTask) {
      let xpForThisTask = completedTask.xp;
      // Apply diminishing returns based on when the task was completed (its index in the array)
      if (index >= xpPolicy.diminishingReturns.afterTaskCount) {
        xpForThisTask = Math.round(xpForThisTask * xpPolicy.diminishingReturns.reductionFactor);
      }
      currentDailyXp += xpForThisTask;
    }
  });

  // 2. Calculate XP for the *new* task, applying diminishing returns.
  let earnedXpForNewTask = task.xp;
  if (todaysCompletionsIds.length >= xpPolicy.diminishingReturns.afterTaskCount) {
    earnedXpForNewTask = Math.round(earnedXpForNewTask * xpPolicy.diminishingReturns.reductionFactor);
  }

  // 3. Determine the final XP to be awarded, respecting the daily cap.
  const remainingXpRoom = xpPolicy.dailyXpCap - currentDailyXp;
  const cappedXp = Math.max(0, Math.min(earnedXpForNewTask, remainingXpRoom));

  // 4. Update streak logic. This happens regardless of XP earned.
  let newStreak = currentProgress.streak;
  const lastDate = currentProgress.lastCompletionDate;
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      newStreak += 1; // Continued streak
    } else {
      newStreak = 1; // Streak was broken, start a new one
    }
  }
  
  // Apply streak bonus if it's the first task of a bonus day.
  // Assumed that bonus XP is exempt from the daily cap.
  let bonusXp = 0;
  if (newStreak > 0 && newStreak % xpPolicy.streakBonus.days === 0) {
     if(todaysCompletionsIds.length === 0){
        bonusXp = xpPolicy.streakBonus.days * 10; // Simple bonus for reaching streak milestone
     }
  }

  // 5. Create the new progress object. The task completion is always recorded, even if 0 XP is awarded.
  const newProgress: Progress = {
    ...currentProgress,
    xp: currentProgress.xp + cappedXp + bonusXp,
    streak: newStreak,
    lastCompletionDate: today,
    dailyCompletions: {
      ...currentProgress.dailyCompletions,
      [today]: [...todaysCompletionsIds, task.id],
    },
  };

  return newProgress;
}