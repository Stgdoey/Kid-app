import React from 'react';
import { AllProgress, Profile, ThemeStyle, XPPolicy } from '../types';
import { calculateLevel } from '../lib/xpPolicy';
import { getStyleAndClasses } from '../App';

interface LeaderboardProps {
  allProgress: AllProgress;
  profiles: Profile[];
  xpPolicy: XPPolicy;
  activeProfileId: string;
  themeStyles: ThemeStyle;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ allProgress, profiles, xpPolicy, activeProfileId, themeStyles }) => {
  const primaryProps = getStyleAndClasses(themeStyles.primary, 'bg');
  
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
    <div style={primaryProps.style} className={`${primaryProps.className} rounded-xl shadow-lg p-4 h-full`}>
      <h2 className="text-xl font-bold mb-4 text-center">Leaderboard</h2>
      <div className="space-y-2">
        {leaderboardData.map((player, index) => {
          const isCurrentUser = player.id === activeProfileId;
          const itemAccentProps = getStyleAndClasses(themeStyles.accent, 'accent');
          const itemSecondaryProps = getStyleAndClasses(themeStyles.secondary, 'bg');
          
          const props = isCurrentUser ? itemAccentProps : itemSecondaryProps;
          const textClass = isCurrentUser ? 'text-white' : '';

          return (
            <div
              key={player.id}
              style={props.style}
              className={`p-3 rounded-lg flex items-center transition-colors ${props.className} ${textClass}`}
            >
              <div className="font-bold text-lg w-8 text-center">{index + 1}</div>
              <div className="flex-grow font-semibold">{player.name}</div>
              <div className="flex flex-col items-end">
                  <div className="font-bold">{player.xp.toLocaleString()} XP</div>
                  <div className={`text-xs ${isCurrentUser ? 'text-slate-200' : 'text-slate-400'}`}>Level {player.level}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
