import React, { useMemo } from 'react';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelectProfile }) => {
  // A palette of vibrant, kid-friendly colors.
  // We use useMemo to shuffle the colors only once when the component mounts,
  // ensuring each orb has a unique color for the session.
  const profileColors = useMemo(() => {
    const palette = [
      'bg-sky-500', 'bg-emerald-500', 'bg-amber-400',
      'bg-fuchsia-500', 'bg-indigo-500', 'bg-rose-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-orange-500'
    ];
    // Simple shuffle to randomize colors on each load
    return palette.sort(() => 0.5 - Math.random());
  }, []);


  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-sky-400 mb-2">Welcome to QuestBox</h1>
        <p className="text-slate-400 mb-12">Who is playing today?</p>
        
        <div className="flex flex-wrap items-center justify-center gap-8">
          {profiles.map((profile, index) => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className={`
                w-40 h-40 rounded-full 
                flex items-center justify-center 
                font-bold text-3xl text-white
                shadow-lg hover:shadow-2xl 
                transform hover:scale-105 
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                ${profileColors[index % profileColors.length]}
              `}
              aria-label={`Select profile for ${profile.name}`}
            >
              {profile.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
