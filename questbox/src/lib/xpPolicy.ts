import { Progress, Task, XPPolicy, CompletionRecord } from '../types';
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
  // allTasks parameter is kept for signature compatibility but is no longer used for daily cap calculation.
  allTasks: Task[]
): Progress {
  const today = getTodayDateString();
  const todaysCompletionsIds = currentProgress.dailyCompletions[today] || [];
  const todaysHistory = (currentProgress.completionHistory || []).filter(
    record => record.completionDate === today
  );

  // First, determine the streak for today. This is constant for all tasks completed today.
  let streakForToday = currentProgress.streak;
  const lastDate = currentProgress.lastCompletionDate;
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    streakForToday = (lastDate === yesterdayStr) ? currentProgress.streak + 1 : 1;
  }
  
  // Helper to calculate modified XP for the new task being completed.
  const calculateXpForNewTask = (taskToCalc: Task) => {
      let xp = taskToCalc.xp;
      const completionIndex = todaysCompletionsIds.length;

      // Penalty for timed quests completed late.
      const activeTimer = currentProgress.activeTimers?.[taskToCalc.id];
      if (taskToCalc.timer && activeTimer) {
        const durationMillis = taskToCalc.timer * 60 * 1000;
        let elapsedMillis = activeTimer.elapsedBeforePause;
        if (activeTimer.startTime) {
          elapsedMillis += Date.now() - new Date(activeTimer.startTime).getTime();
        }

        if (elapsedMillis > durationMillis) {
            // Apply penalty if time is up
            xp = Math.round(xp * (taskToCalc.xpPenaltyFactor ?? 0.5));
        }
      }

      // Diminishing returns
      if (completionIndex >= xpPolicy.diminishingReturns.afterTaskCount) {
          xp = Math.round(xp * xpPolicy.diminishingReturns.reductionFactor);
      }
      // Streak bonus OR penalty
      if (streakForToday >= xpPolicy.streakBonus.days && streakForToday % xpPolicy.streakBonus.days === 0) {
          xp = Math.round(xp * xpPolicy.streakBonus.multiplier);
      } else if (streakForToday <= 1 && xpPolicy.noStreakReductionFactor) {
          xp = Math.round(xp * xpPolicy.noStreakReductionFactor);
      }
      return xp;
  };

  // 1. Calculate total XP already earned today from history to check against the cap.
  // This correctly uses the final, stored XP for each completed task, fixing the recalculation bug.
  const currentDailyXp = todaysHistory.reduce((sum, record) => sum + record.xpEarned, 0);

  // 2. Calculate XP for the *new* task.
  const earnedXpForNewTask = calculateXpForNewTask(task);

  // 3. Determine the final XP to be awarded, respecting the daily cap.
  const remainingXpRoom = xpPolicy.dailyXpCap - currentDailyXp;
  const cappedXp = Math.max(0, Math.min(earnedXpForNewTask, remainingXpRoom));

  // 4. Create a record for the history.
  const newCompletionRecord: CompletionRecord = {
    taskId: task.id,
    taskName: task.name,
    completionDate: today,
    xpEarned: cappedXp,
  };

  // 5. Clean up active timer if it exists
  const newActiveTimers = { ...(currentProgress.activeTimers || {}) };
  if (task.id in newActiveTimers) {
    delete newActiveTimers[task.id];
  }

  // 6. Create the new progress object.
  const newProgress: Progress = {
    ...currentProgress,
    xp: currentProgress.xp + cappedXp,
    streak: streakForToday,
    lastCompletionDate: today,
    dailyCompletions: {
      ...currentProgress.dailyCompletions,
      [today]: [...todaysCompletionsIds, task.id],
    },
    completionHistory: [...(currentProgress.completionHistory || []), newCompletionRecord],
    activeTimers: newActiveTimers,
  };

  return newProgress;
}