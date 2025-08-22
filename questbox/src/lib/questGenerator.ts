
import { Progress, Task } from '@/src/types';
import { getTodayDateString } from '@/src/lib/utils';

/**
 * Filters the list of all tasks to show only those available to the user.
 * It checks for daily and weekly completion status.
 * @param allTasks - The complete list of tasks from config.
 * @param progress - The user's current progress data.
 * @returns An array of tasks that are currently available to be completed.
 */
export function getAvailableQuests(allTasks: Task[], progress: Progress): Task[] {
  const today = getTodayDateString();
  const todaysCompletions = progress.dailyCompletions[today] || [];
  
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Assuming Sunday is the start of the week
  
  return allTasks.filter(task => {
    if (task.repeatable === 'daily') {
      return !todaysCompletions.includes(task.id);
    }
    if (task.repeatable === 'weekly') {
      // Check if task was completed this week
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        if (progress.dailyCompletions[dateStr]?.includes(task.id)) {
          return false; // Already completed this week
        }
      }
      return true;
    }
    if (task.repeatable === 'none') {
        // Check if it has ever been completed. This requires a different progress structure.
        // For simplicity, we'll assume 'none' means it can only be done once ever,
        // and we check all past daily completions.
        const allCompletedIds = Object.values(progress.dailyCompletions).flat();
        return !allCompletedIds.includes(task.id);
    }
    return true;
  });
}

export function getCompletedTodayQuests(allTasks: Task[], progress: Progress): Task[] {
    const today = getTodayDateString();
    const todaysCompletions = progress.dailyCompletions[today] || [];
    return allTasks.filter(task => todaysCompletions.includes(task.id));
}
