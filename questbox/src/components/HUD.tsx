import React from 'react';
import { Progress, Reward, XPPolicy } from '../types';
import { calculateLevel } from '../lib/xpPolicy';

interface HUDProps {
  progress: Progress;
  xpPolicy: XPPolicy;
  rewards: Reward[];
  lastXpGain: { amount: number; key: number } | null;
}

const HUD: React.FC<HUDProps> = ({ progress, xpPolicy, rewards, lastXpGain }) => {
  const { level, xpInLevel, xpToNextLevel, progress: levelProgress } = calculateLevel(progress.xp, xpPolicy.xpPerLevel);

  const nextReward = rewards
    .filter(r => r.cost > progress.xp)
    .sort((a, b) => a.cost - b.cost)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Combined Level and Progress Bar */}
      <div className="bg-slate-800/50 rounded-xl p-4 md:col-span-3 flex items-center gap-4 animate-fade-in-up relative">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-sky-800 flex flex-col items-center justify-center border-4 border-sky-600 shadow-lg">
            <span className="text-xs text-sky-300 -mb-1">LEVEL</span>
            <span className="text-3xl font-bold text-white">{level}</span>
        </div>
        <div className="flex-grow relative">
            {/* XP Gain Animation */}
            {lastXpGain && lastXpGain.amount > 0 && (
                <div 
                    key={lastXpGain.key} 
                    className="absolute -top-8 right-0 text-2xl font-bold text-amber-300 pointer-events-none animate-xp-gain"
                    aria-live="polite"
                >
                    +{lastXpGain.amount} XP
                </div>
            )}
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold text-slate-300">Level Progress</span>
                <span className="font-bold text-amber-300">{xpInLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 border-2 border-slate-600 overflow-hidden">
                <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${levelProgress}%` }}
                    role="progressbar"
                    aria-valuenow={levelProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Level progress: ${levelProgress.toFixed(0)}%`}
                ></div>
            </div>
            {nextReward && (
            <div className="text-xs text-slate-400 mt-1.5 text-right">
                Next Reward: <span className="font-semibold text-slate-300">{nextReward.name}</span> ({nextReward.cost.toLocaleString()} XP)
            </div>
            )}
        </div>
      </div>

      {/* Streak */}
      <div className="bg-emerald-800/50 rounded-xl p-4 text-center flex flex-col justify-center animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <div className="text-4xl font-bold">{progress.streak}</div>
        <div className="text-sm text-emerald-300">Day Streak</div>
      </div>
    </div>
  );
};

export default HUD;
