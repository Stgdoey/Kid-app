

import Ajv from 'ajv';
import { AllProgress, Progress, Profile } from '../types';
import progressSchema from '../../schemas/progress.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(progressSchema);

const STORAGE_KEY = 'questbox_progress';

// Helper to generate a valid empty progress structure for a new profile
const createInitialProgressForProfiles = (profiles: Profile[]): AllProgress => {
  const progress: AllProgress = {};
  profiles.forEach(p => {
    progress[p.id] = {
      xp: 0,
      streak: 0,
      lastCompletionDate: null,
      dailyCompletions: {},
      purchasedRewards: {},
      streakSavers: 0
    };
  });
  return progress;
};

export function loadProgress(profiles: Profile[]): AllProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const initialProgress = createInitialProgressForProfiles(profiles);

    if (!data) {
      console.log('No progress found, using initial progress.');
      return initialProgress;
    }

    const parsedData = JSON.parse(data);
    if (validate(parsedData)) {
      console.log('Progress loaded successfully.');
      // Ensure all configured profiles have a progress entry
      profiles.forEach(p => {
        if (!parsedData[p.id]) {
          parsedData[p.id] = initialProgress[p.id];
        }
      });
      return parsedData as AllProgress;
    } else {
      console.warn('Stored progress is invalid, falling back to initial progress.', validate.errors);
      return initialProgress;
    }
  } catch (error) {
    console.error('Failed to load or parse progress, using initial progress.', error);
    return createInitialProgressForProfiles(profiles);
  }
}

export function saveProgress(allProgress: AllProgress): void {
  try {
    if (validate(allProgress)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } else {
      console.error('Attempted to save invalid progress data.', validate.errors);
    }
  } catch (error) {
    console.error('Failed to save progress.', error);
  }
}


export function resetAllProgress(profiles: Profile[]): AllProgress {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialProgressForProfiles(profiles);
}
