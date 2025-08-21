
import React from 'react';
import { Progress, Reward, XPPolicy } from '../types';
import { calculateLevel } from '../lib/xpPolicy';

interface HUDProps {
  progress: Progress;
  xpPolicy: XPPolicy;
  rewards: Reward[];
}

const HUD: React.FC<HUDProps> = ({ progress, xpPolicy, rewards }) => {
  const { level, xpInLevel, xpToNextLevel, progress: levelProgress } = calculateLevel(progress.xp, xpPolicy.xpPerLevel);

  const nextReward = rewards
    .filter(r => r.cost > progress.xp)
    .sort((a, b) => a.cost - b.cost)[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-sky-800 bg-opacity-50 rounded-xl p-4 text-center">
        <div className="text-3xl font-bold">{level}</div>
        <div className="text-sm text-sky-300">Level</div>
      </div>
      <div className="bg-emerald-800 bg-opacity-50 rounded-xl p-4 text-center">
        <div className="text-3xl font-bold">{progress.streak}</div>
        <div className="text-sm text-emerald-300">Day Streak</div>
      </div>
      <div className="bg-amber-800 bg-opacity-50 rounded-xl p-4 text-center col-span-2">
         <div className="flex justify-between items-center mb-1 text-sm">
           <span>Level Progress</span>
           <span className="font-semibold">{xpInLevel} / {xpToNextLevel} XP</span>
         </div>
         <div className="w-full bg-slate-700 rounded-full h-4">
            <div className="bg-amber-500 h-4 rounded-full" style={{ width: `${levelProgress}%` }}></div>
         </div>
         <div className="text-xs mt-2 text-amber-300">
          Next Reward: {nextReward ? `${nextReward.name} (${nextReward.cost} XP)` : 'All unlocked!'}
         </div>
      </div>
    </div>
  );
};

export default HUD;
