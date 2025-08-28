

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
} from './types';
import { loadProgress, saveProgress, resetAllProgress } from './lib/storage';
import { usePinVerification } from './lib/pin';

// Import config data
import tasksData from '../config/tasks.json';
import rewardsData from '../config/rewards.json';
import profilesData from '../config/profiles.json';
import themesData from '../config/themes.json';
import seasonsData from '../config/seasons.json';
import xpPolicyData from '../config/xpPolicy.json';

// Import components and libs
import HUD from './components/HUD';
import TaskList from './components/TaskList';
import RewardShop from './components/RewardShop';
import ThemePicker from './components/ThemePicker';
import DataPanel from './components/DataPanel';
import Leaderboard from './components/Leaderboard';
import ProfileSelector from './components/ProfileSelector';
import { processTaskCompletion } from './lib/xpPolicy';
import { generateQuest } from './lib/aiQuestGenerator';
import { generateReward } from './lib/aiRewardGenerator';

const App: React.FC = () => {
  // Config state now includes tasks that can be updated with AI quests
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [rewards, setRewards] = useState<Reward[]>(rewardsData);
  const [profiles] = useState<Profile[]>(profilesData);
  const [themes] = useState<ThemesConfig>(themesData);
  const [seasons] = useState<SeasonsConfig>(seasonsData);
  const [xpPolicy] = useState<IXPPolicy>(xpPolicyData);

  // Dynamic user state
  const [allProgress, setAllProgress] = useState<AllProgress | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // UI State
  const [activeThemeKey, setActiveThemeKey] = useState<string>('default_light');
  
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
    // Pass the full tasks list to accurately calculate daily XP cap
    const newProgress = processTaskCompletion(task, currentProgress, xpPolicy, tasks);
    updateProgress(newProgress);
  }, [allProgress, activeProfile, xpPolicy, tasks, updateProgress]);

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

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
  };
  
  const handleSwitchUser = () => {
      setActiveProfile(null);
  };

  const themeStyles = themes[activeThemeKey]?.styles || themes.default_light.styles;

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
    <div className={`min-h-screen font-sans transition-colors duration-500 ${themeStyles.bg} ${themeStyles.text}`}>
      <PinVerificationComponent />
      <div className="container mx-auto p-4 max-w-7xl">
        {validationError && <div className="bg-red-500 text-white p-2 rounded-md mb-4">{validationError}</div>}
        
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">QuestBox</h1>
          <div className="text-right flex items-center gap-4">
             <div>
                <div className="text-lg font-semibold">{activeProfile.name}'s Quests</div>
                <ThemePicker themes={themes} seasons={seasons} onThemeChange={setActiveThemeKey} />
             </div>
             <button onClick={handleSwitchUser} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold">Switch User</button>
          </div>
        </header>

        <HUD progress={currentProgress} xpPolicy={xpPolicy} rewards={rewards} />
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskList
                  allTasks={tasks}
                  progress={currentProgress}
                  onComplete={handleTaskComplete}
                  onGenerateQuest={handleGenerateQuest}
                  isGeneratingQuest={isGeneratingQuest}
                  aiError={aiError}
                  themeStyles={themeStyles}
                />
                <RewardShop
                  rewards={rewards}
                  progress={currentProgress}
                  onPurchase={handleRewardPurchase}
                  onGenerateReward={handleGenerateReward}
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
          <div className="lg:col-span-1">
             <Leaderboard
                allProgress={allProgress}
                profiles={profiles}
                xpPolicy={xpPolicy}
                activeProfileId={activeProfile.id}
                themeStyles={themeStyles}
              />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;