import React from 'react';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelectProfile }) => {
  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center w-full max-w-sm">
        <h1 className="text-4xl font-bold text-sky-400 mb-2">Welcome to QuestBox</h1>
        <p className="text-slate-400 mb-8">Please select your profile to begin.</p>
        
        <div className="space-y-4">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className="w-full text-2xl font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg shadow-lg p-6 transition-colors duration-200"
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
