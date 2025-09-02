import React from 'react';
import { AllProgress, Profile, XPPolicy } from '../types';
import { calculateLevel } from '../lib/xpPolicy';

interface LeaderboardProps {
  allProgress: AllProgress;
  profiles: Profile[];
  xpPolicy: XPPolicy;
  activeProfileId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ allProgress, profiles, xpPolicy, activeProfileId }) => {
  const leaderboardData = profiles.map(profile => {
    const progress = allProgress[profile.id];
    if (!progress) {
      return {
        id: profile.id,
        name: profile.name,
        level: 1,
        xp: 0,
      };
    }
    const { level } = calculateLevel(progress.xp, xpPolicy.xpPerLevel);
    return {
      id: profile.id,
      name: profile.name,
      level: level,
      xp: progress.xp,
    };
  }).sort((a, b) => b.xp - a.xp);

  return (
    <div className="bg-primary/40 backdrop-blur-md border border-secondary/50 rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Leaderboard</h2>
      <div className="space-y-2">
        {leaderboardData.map((player, index) => {
          const isCurrentUser = player.id === activeProfileId;
          
          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg flex items-center transition-colors ${isCurrentUser ? 'bg-accent/80 text-white' : 'bg-secondary/30'}`}
            >
              <div className="font-bold text-lg w-8 text-center">{index + 1}</div>
              <div className="flex-grow font-semibold">{player.name}</div>
              <div className="flex flex-col items-end">
                  <div className="font-bold">{player.xp.toLocaleString()} XP</div>
                  <div className={`text-xs ${isCurrentUser ? 'text-slate-200' : 'text-text-muted'}`}>Level {player.level}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
