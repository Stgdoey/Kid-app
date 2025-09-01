export interface Task {
  id: string;
  name: string;
  description: string;
  xp: number;
  repeatable: 'daily' | 'weekly' | 'none';
  difficulty?: 'easy' | 'medium' | 'hard';
  timer?: number; // Duration in minutes
  xpPenaltyFactor?: number; // e.g., 0.5 for 50% penalty
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  cost: number;
  limit: {
    type: 'daily' | 'weekly' | 'monthly' | 'none';
    count?: number;
  };
  needsApproval: boolean;
}

export interface Profile {
  id: string;
  name: string;
  pin: string;
}

export interface CompletionRecord {
  taskId: string;
  taskName: string;
  completionDate: string;
  xpEarned: number;
}

export interface Progress {
  xp: number;
  streak: number;
  lastCompletionDate: string | null;
  dailyCompletions: { [date: string]: string[] }; // date string -> array of task ids
  purchasedRewards: { [rewardId: string]: string[] }; // reward id -> array of purchase date strings
  streakSavers: number;
  completionHistory: CompletionRecord[];
  activeTimers?: { [taskId: string]: string }; // taskId -> start time ISO string
}

export interface AllProgress {
  [profileId: string]: Progress;
}

export interface ThemeStyle {
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export interface Theme {
  name: string;
  styles: ThemeStyle;
}

export interface ThemesConfig {
  [key: string]: Theme;
}

export interface Season {
    name: string;
    theme: string;
    startDate: string;
    endDate: string;
}

export interface SeasonsConfig {
    seasons: Season[];
    fallbackTheme: string;
}

export interface XPPolicy {
    xpPerLevel: number;
    dailyXpCap: number;
    streakBonus: {
        days: number;
        multiplier: number;
    };
    diminishingReturns: {
        afterTaskCount: number;
        reductionFactor: number;
    };
    noStreakReductionFactor?: number;
}