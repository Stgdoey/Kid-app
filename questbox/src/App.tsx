
import React, { useState, useEffect, useCallback } from 'react';
import {
  Task,
  Reward,
  Profile,
  Progress,
  ThemesConfig,
  SeasonsConfig,
  XPPolicy as IXPPolicy,
  AllProgress,
  ThemeStyle,
} from './types';
import { loadProgress, saveProgress, resetAllProgress, loadCustomThemes, saveCustomThemes } from './lib/storage';
import { usePinVerification } from './lib/pin';

// --- Inlined Config Data to fix loading issues ---
const tasksData: Task[] = [
  { "id": "brush_teeth_am", "name": "Brush Your Teeth (Morning)", "description": "Keep those pearly whites shining!", "xp": 10, "repeatable": "daily", "difficulty": "easy" },
  { "id": "make_bed", "name": "Make Your Bed", "description": "A tidy room starts with a tidy bed.", "xp": 15, "repeatable": "daily", "difficulty": "easy" },
  { "id": "read_book", "name": "Read for 20 Minutes", "description": "Explore a new world in a book.", "xp": 30, "repeatable": "daily", "difficulty": "medium" },
  { "id": "homework", "name": "Finish Homework", "description": "Get all your schoolwork done.", "xp": 50, "repeatable": "daily", "difficulty": "medium", "timer": 45, "xpPenaltyFactor": 0.5 },
  { "id": "clean_room", "name": "Clean Your Room", "description": "Put away toys and clothes.", "xp": 75, "repeatable": "weekly", "difficulty": "hard" },
  { "id": "help_dishes", "name": "Help with Dishes", "description": "Help clear the table or load the dishwasher.", "xp": 25, "repeatable": "daily", "difficulty": "easy" }
];

const rewardsData: Reward[] = [
  { "id": "screen_time_30", "name": "30 Mins Screen Time", "description": "Extra time for games or videos.", "cost": 100, "limit": { "type": "daily", "count": 2 }, "needsApproval": true },
  { "id": "ice_cream", "name": "Ice Cream Treat", "description": "A yummy bowl of your favorite ice cream.", "cost": 150, "limit": { "type": "weekly", "count": 2 }, "needsApproval": true },
  { "id": "new_book", "name": "Choose a New Book", "description": "Pick out a new book to read.", "cost": 400, "limit": { "type": "monthly", "count": 1 }, "needsApproval": false },
  { "id": "movie_night", "name": "Family Movie Night", "description": "You get to pick the movie!", "cost": 500, "limit": { "type": "weekly", "count": 1 }, "needsApproval": false },
  { "id": "stay_up_late", "name": "Stay Up 30 Mins Late", "description": "A little extra time before bed.", "cost": 250, "limit": { "type": "weekly", "count": 1 }, "needsApproval": true }
];

const profilesData: Profile[] = [
  { "id": "kairi01", "name": "Kairi", "pin": "1234" },
  { "id": "alex02", "name": "Alex", "pin": "5678" }
];

const themesData: ThemesConfig = {
  "default_light": { "name": "Default Light", "styles": { "bg": "bg-slate-100", "primary": "bg-white", "secondary": "bg-slate-200", "accent": "bg-blue-500", "text": "text-slate-800" } },
  "default_dark": { "name": "Default Dark", "styles": { "bg": "bg-slate-900", "primary": "bg-slate-800", "secondary": "bg-slate-700", "accent": "bg-sky-500", "text": "text-slate-100" } },
  "forest": { "name": "Forest Adventure", "styles": { "bg": "bg-emerald-900", "primary": "bg-emerald-800", "secondary": "bg-emerald-700", "accent": "bg-amber-400", "text": "text-stone-100" } },
  "ocean": { "name": "Ocean Depths", "styles": { "bg": "bg-blue-900", "primary": "bg-blue-800", "secondary": "bg-blue-700", "accent": "bg-cyan-300", "text": "text-slate-100" } },
  "space": { "name": "Cosmic Voyager", "styles": { "bg": "bg-indigo-950", "primary": "bg-indigo-900", "secondary": "bg-slate-800", "accent": "bg-fuchsia-500", "text": "text-slate-200" } },
  "autumn": { "name": "Autumn", "styles": { "bg": "bg-orange-950", "primary": "bg-orange-900", "secondary": "bg-amber-800", "accent": "bg-yellow-400", "text": "text-orange-100" } },
  "winter": { "name": "Winter", "styles": { "bg": "bg-slate-700", "primary": "bg-slate-600", "secondary": "bg-sky-900", "accent": "bg-cyan-400", "text": "text-white" } },
  "spring": { "name": "Spring", "styles": { "bg": "bg-green-100", "primary": "bg-green-200", "secondary": "bg-pink-200", "accent": "bg-pink-400", "text": "text-green-900" } },
  "summer": { "name": "Summer", "styles": { "bg": "bg-yellow-100", "primary": "bg-yellow-200", "secondary": "bg-sky-300", "accent": "bg-orange-500", "text": "text-gray-800" } }
};

const seasonsData: SeasonsConfig = {
  "seasons": [
    { "name": "Spring", "theme": "spring", "startDate": "2024-03-20", "endDate": "2024-06-20" },
    { "name": "Summer", "theme": "summer", "startDate": "2024-06-21", "endDate": "2024-09-22" },
    { "name": "Autumn", "theme": "autumn", "startDate": "2024-09-23", "endDate": "2024-12-20" },
    { "name": "Winter", "theme": "winter", "startDate": "2024-12-21", "endDate": "2025-03-19" }
  ],
  "fallbackTheme": "default_light"
};

const xpPolicyData: IXPPolicy = {
  "xpPerLevel": 500,
  "dailyXpCap": 200,
  "streakBonus": { "days": 3, "multiplier": 1.5 },
  "diminishingReturns": { "afterTaskCount": 5, "reductionFactor": 0.5 }
};
// --- End Inlined Config Data ---

// Import components and libs
import HUD from './components/HUD';
import TaskList from './components/TaskList';
import RewardShop from './components/RewardShop';
import ThemePicker from './components/ThemePicker';
import CustomThemeCreator from './components/CustomThemeCreator';
import CustomRewardCreator from './components/CustomRewardCreator';
import TaskEditorModal from './components/TaskEditorModal';
import DataPanel from './components/DataPanel';
import Leaderboard from './components/Leaderboard';
import ProfileSelector from './components/ProfileSelector';
import LevelUpModal from './components/LevelUpModal';
import TaskHistory from './components/TaskHistory';
import { processTaskCompletion, calculateLevel } from './lib/xpPolicy';
import { generateQuest } from './lib/aiQuestGenerator';
import { generateReward } from './lib/aiRewardGenerator';

// Helper to apply theme styles, supporting both Tailwind classes and hex colors
export const getStyleAndClasses = (value: string | undefined, property: 'bg' | 'text' | 'accent' = 'bg') => {
  if (!value) return { style: {}, className: '' };
  if (value.startsWith('#') || value.startsWith('rgb')) {
    const styleProp = property === 'text' ? 'color' : 'backgroundColor';
    return { style: { [styleProp]: value }, className: '' };
  }
  return { style: {}, className: value };
};


const App: React.FC = () => {
  // Config state now includes tasks that can be updated with AI quests
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [rewards, setRewards] = useState<Reward[]>(rewardsData);
  const [profiles] = useState<Profile[]>(profilesData);
  const [themes, setThemes] = useState<ThemesConfig>(() => {
      const customThemes = loadCustomThemes();
      return { ...themesData, ...customThemes };
  });
  const [seasons] = useState<SeasonsConfig>(seasonsData);
  const [xpPolicy] = useState<IXPPolicy>(xpPolicyData);

  // Dynamic user state
  const [allProgress, setAllProgress] = useState<AllProgress | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // UI State
  const [activeThemeKey, setActiveThemeKey] = useState<string>('default_light');
  const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
  const [isRewardCreatorOpen, setIsRewardCreatorOpen] = useState(false);
  const [lastXpGain, setLastXpGain] = useState<{ amount: number; key: number } | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // AI-related state
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingReward, setIsGeneratingReward] = useState(false);
  const [aiRewardError, setAiRewardError] = useState<string | null>(null);


  useEffect(() => {
    try {
      const loadedProgress = loadProgress(profiles);
      setAllProgress(loadedProgress);
    } catch (e) {
      setValidationError("There was an error loading your data. It might be corrupted.");
    }
  }, [profiles]);

  // Clear the lastXpGain after its animation finishes
  useEffect(() => {
    if (lastXpGain) {
        const timer = setTimeout(() => setLastXpGain(null), 1500);
        return () => clearTimeout(timer);
    }
  }, [lastXpGain]);

  const { requestPin, PinVerificationComponent } = usePinVerification(activeProfile?.pin || "0000");

  const updateProgress = useCallback((newProgressForProfile: Progress) => {
    if (!allProgress || !activeProfile) return;

    const updatedAllProgress = {
      ...allProgress,
      [activeProfile.id]: newProgressForProfile,
    };

    setAllProgress(updatedAllProgress);
    saveProgress(updatedAllProgress);
  }, [allProgress, activeProfile]);

  const handleTaskComplete = useCallback((task: Task) => {
    if (!allProgress || !activeProfile) return;
    const currentProgress = allProgress[activeProfile.id];
    const { level: oldLevel } = calculateLevel(currentProgress.xp, xpPolicy.xpPerLevel);

    const newProgress = processTaskCompletion(task, currentProgress, xpPolicy, tasks);
    
    const xpGained = newProgress.xp - currentProgress.xp;
    if (xpGained > 0) {
      setLastXpGain({ amount: xpGained, key: Date.now() });
    }
    
    const { level: newLevel } = calculateLevel(newProgress.xp, xpPolicy.xpPerLevel);
    if (newLevel > oldLevel) {
        // Delay level up modal to let the XP bar animation catch up
        setTimeout(() => {
            setLevelUpInfo({ newLevel });
        }, 600);
    }

    updateProgress(newProgress);
  }, [allProgress, activeProfile, xpPolicy, tasks, updateProgress]);

  const handleStartTimer = useCallback((taskId: string) => {
    if (!allProgress || !activeProfile) return;
    const currentProgress = allProgress[activeProfile.id];
    
    const newProgress = {
        ...currentProgress,
        activeTimers: {
            ...(currentProgress.activeTimers || {}),
            [taskId]: new Date().toISOString(),
        }
    };
    updateProgress(newProgress);
  }, [allProgress, activeProfile, updateProgress]);


  const handleRewardPurchase = useCallback((reward: Reward, onCancel: () => void, onSuccess: () => void) => {
    if (!allProgress || !activeProfile) return;
    const currentProgress = allProgress[activeProfile.id];
    if (currentProgress.xp < reward.cost) {
      onCancel(); // Not enough XP, cancel any pending state
      return;
    }

    const purchaseAction = () => {
        const today = new Date().toISOString().split('T')[0];
        const newProgress: Progress = {
          ...currentProgress,
          xp: currentProgress.xp - reward.cost,
          purchasedRewards: {
            ...currentProgress.purchasedRewards,
            [reward.id]: [...(currentProgress.purchasedRewards[reward.id] || []), today],
          },
        };
        updateProgress(newProgress);
        onSuccess();
    }
    
    if (reward.needsApproval) {
        requestPin(purchaseAction, onCancel);
    } else {
        purchaseAction();
    }
  }, [allProgress, activeProfile, requestPin, updateProgress]);

  const handleResetProgress = useCallback(() => {
    if(!allProgress || !activeProfile) return;

    requestPin(() => {
        const currentProgress = allProgress[activeProfile.id];
        const newProgress = {
            ...currentProgress,
            xp: 0,
            streak: 0,
            lastCompletionDate: null,
            dailyCompletions: {},
            purchasedRewards: {},
            completionHistory: [],
            activeTimers: {},
        };
       updateProgress(newProgress);
    });
  }, [requestPin, allProgress, activeProfile, updateProgress]);

  const handleGenerateQuest = useCallback(async () => {
    setIsGeneratingQuest(true);
    setAiError(null);
    try {
        const newQuestData = await generateQuest();
        const newQuest: Task = {
            ...newQuestData,
            id: `ai_${Date.now()}` // Create a unique ID for the session
        };
        // Add the new quest to the top of the list for immediate visibility
        setTasks(prevTasks => [newQuest, ...prevTasks]);
    } catch (error) {
        if (error instanceof Error) {
            setAiError(error.message);
        } else {
            setAiError("An unknown error occurred while generating a quest.");
        }
    } finally {
        setIsGeneratingQuest(false);
    }
  }, []);
  
  const handleOpenTaskEditor = (task: Task) => {
    requestPin(() => {
        setEditingTask(task);
    });
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(currentTasks => 
        currentTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        )
    );
    setEditingTask(null); // Close the modal
  };

  const handleGenerateReward = useCallback(async () => {
    setIsGeneratingReward(true);
    setAiRewardError(null);
    try {
        const newRewardData = await generateReward();
        const newReward: Reward = {
            ...newRewardData,
            id: `ai_${Date.now()}`, // Create a unique ID
            needsApproval: false, // Default to not needing approval
        };
        // Add the new reward to the top of the list
        setRewards(prevRewards => [newReward, ...prevRewards]);
    } catch (error) {
        if (error instanceof Error) {
            setAiRewardError(error.message);
        } else {
            setAiRewardError("An unknown error occurred while generating a reward.");
        }
    } finally {
        setIsGeneratingReward(false);
    }
  }, []);

  const handleSaveCustomTheme = (name: string, styles: ThemeStyle) => {
    const key = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const newTheme = { [key]: { name, styles } };
    
    setThemes(prevThemes => {
        const updatedThemes = { ...prevThemes, ...newTheme };
        // FIX: The type of `customThemesToSave` was being inferred incorrectly, causing a type error.
        // A type assertion is added to ensure TypeScript understands the object conforms to the ThemesConfig type.
        const customThemesToSave = Object.fromEntries(
            Object.entries(updatedThemes).filter(([k]) => k.startsWith('custom_'))
        );
        saveCustomThemes(customThemesToSave as ThemesConfig);
        return updatedThemes;
    });
    
    setActiveThemeKey(key);
    setIsThemeCreatorOpen(false);
  };

  const handleSaveCustomReward = useCallback((newRewardData: Omit<Reward, 'id'>) => {
    const rewardToSave: Reward = {
        id: `custom_${Date.now()}`, // Create a unique ID
        ...newRewardData,
    };
    setRewards(currentRewards => [rewardToSave, ...currentRewards]);
    setIsRewardCreatorOpen(false); // Close modal on save
  }, []);

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
  };
  
  const handleSwitchUser = () => {
      setActiveProfile(null);
  };

  const themeStyles = themes[activeThemeKey]?.styles || themes.default_light.styles;
  const bgProps = getStyleAndClasses(themeStyles.bg, 'bg');
  const textProps = getStyleAndClasses(themeStyles.text, 'text');


  if (!allProgress) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-sky-400">Loading QuestBox...</h1>
          {validationError && (
             <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
                <p className="font-bold">Loading Error!</p>
                <p>{validationError}</p>
                 <button onClick={() => {
                   const newProgress = resetAllProgress(profiles);
                   setAllProgress(newProgress);
                   window.location.reload();
                }} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md">Reset All Data</button>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (!activeProfile) {
      return <ProfileSelector profiles={profiles} onSelectProfile={handleSelectProfile} />;
  }

  const currentProgress = allProgress[activeProfile.id];

  return (
    <div
      style={{ ...bgProps.style, ...textProps.style }}
      className={`min-h-screen font-sans transition-colors duration-500 ${bgProps.className} ${textProps.className}`}
    >
      <PinVerificationComponent />
      {levelUpInfo && (
          <LevelUpModal newLevel={levelUpInfo.newLevel} onClose={() => setLevelUpInfo(null)} />
      )}
       {isThemeCreatorOpen && (
        <CustomThemeCreator
            onClose={() => setIsThemeCreatorOpen(false)}
            onSave={handleSaveCustomTheme}
            existingThemeNames={Object.values(themes).map(t => t.name)}
        />
      )}
      {isRewardCreatorOpen && (
        <CustomRewardCreator
            onClose={() => setIsRewardCreatorOpen(false)}
            onSave={handleSaveCustomReward}
        />
      )}
      {editingTask && (
        <TaskEditorModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={handleSaveTask}
        />
      )}
      <div className="container mx-auto p-4 max-w-7xl">
        {validationError && <div className="bg-red-500 text-white p-2 rounded-md mb-4">{validationError}</div>}
        
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">QuestBox</h1>
          <div className="text-right flex items-center gap-4">
             <div>
                <div className="text-lg font-semibold">{activeProfile.name}'s Quests</div>
                <ThemePicker
                    themes={themes}
                    seasons={seasons}
                    onThemeChange={setActiveThemeKey}
                    onOpenThemeCreator={() => setIsThemeCreatorOpen(true)}
                />
             </div>
             <button onClick={handleSwitchUser} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-transform duration-200 hover:scale-105">Switch User</button>
          </div>
        </header>

        <HUD progress={currentProgress} xpPolicy={xpPolicy} rewards={rewards} lastXpGain={lastXpGain} />
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskList
                  allTasks={tasks}
                  progress={currentProgress}
                  onComplete={handleTaskComplete}
                  onStartTimer={handleStartTimer}
                  onGenerateQuest={handleGenerateQuest}
                  onEditQuest={handleOpenTaskEditor}
                  isGeneratingQuest={isGeneratingQuest}
                  aiError={aiError}
                  themeStyles={themeStyles}
                />
                <RewardShop
                  rewards={rewards}
                  progress={currentProgress}
                  onPurchase={handleRewardPurchase}
                  onGenerateReward={handleGenerateReward}
                  onOpenRewardCreator={() => setIsRewardCreatorOpen(true)}
                  isGeneratingReward={isGeneratingReward}
                  aiError={aiRewardError}
                  themeStyles={themeStyles}
                />
            </div>
             <DataPanel 
              onResetProgress={handleResetProgress}
              progress={currentProgress}
              themeStyles={themeStyles}
            />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
             <Leaderboard
                allProgress={allProgress}
                profiles={profiles}
                xpPolicy={xpPolicy}
                activeProfileId={activeProfile.id}
                themeStyles={themeStyles}
              />
              <TaskHistory
                history={currentProgress.completionHistory || []}
                themeStyles={themeStyles}
              />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;