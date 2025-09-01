import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { AllProgress, Profile, ThemesConfig } from '../types';

const ajv = new Ajv();
addFormats(ajv);

// Inlined schema to prevent JSON module loading issues
const progressSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QuestBox All Progress Schema",
  "type": "object",
  "patternProperties": {
    "^[a-zA-Z0-9_]+$": {
      "type": "object",
      "properties": {
        "xp": { "type": "integer" },
        "streak": { "type": "integer" },
        "lastCompletionDate": { "type": ["string", "null"] },
        "dailyCompletions": {
          "type": "object",
          "patternProperties": {
            "^[0-9]{4}-[0-9]{2}-[0-9]{2}$": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "purchasedRewards": {
          "type": "object",
          "patternProperties": {
            "^[a-zA-Z0-9_]+$": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "streakSavers": { "type": "integer" },
        "activeTimers": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z0-9_]+$": { "type": "string" }
            }
        },
        "completionHistory": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "taskId": { "type": "string" },
              "taskName": { "type": "string" },
              "completionDate": { "type": "string" },
              "xpEarned": { "type": "integer" }
            },
            "required": ["taskId", "taskName", "completionDate", "xpEarned"]
          }
        }
      },
      "required": [
        "xp",
        "streak",
        "lastCompletionDate",
        "dailyCompletions",
        "purchasedRewards",
        "streakSavers",
        "completionHistory"
      ]
    }
  }
};


const validate = ajv.compile(progressSchema);

const PROGRESS_STORAGE_KEY = 'questbox_progress';
const CUSTOM_THEMES_STORAGE_KEY = 'questbox_custom_themes';


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
      streakSavers: 0,
      completionHistory: [],
      activeTimers: {},
    };
  });
  return progress;
};

export function loadProgress(profiles: Profile[]): AllProgress {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
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
        // Backwards compatibility: add new fields if they're missing
        if (!parsedData[p.id].completionHistory) {
            parsedData[p.id].completionHistory = [];
        }
        if (!parsedData[p.id].activeTimers) {
            parsedData[p.id].activeTimers = {};
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
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    } else {
      console.error('Attempted to save invalid progress data.', validate.errors);
    }
  } catch (error) {
    console.error('Failed to save progress.', error);
  }
}


export function resetAllProgress(profiles: Profile[]): AllProgress {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
  return createInitialProgressForProfiles(profiles);
}

// --- Custom Theme Storage ---

export function loadCustomThemes(): ThemesConfig {
    try {
        const data = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
        if (!data) return {};
        // Add basic validation if needed
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to load custom themes.", error);
        return {};
    }
}

export function saveCustomThemes(themes: ThemesConfig): void {
    try {
        localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes));
    } catch (error) {
        console.error("Failed to save custom themes.", error);
    }
}