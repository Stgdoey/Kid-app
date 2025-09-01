import React from 'react';
import { Task, ThemeStyle } from '../types';
import { getStyleAndClasses } from '../App';

interface QuestInfoModalProps {
  task: Task | null;
  onClose: () => void;
  themeStyles: ThemeStyle;
}

const QuestInfoModal: React.FC<QuestInfoModalProps> = ({ task, onClose, themeStyles }) => {
  if (!task) return null;
  
  const primaryProps = getStyleAndClasses(themeStyles.primary, 'bg');
  const secondaryProps = getStyleAndClasses(themeStyles.secondary, 'bg');
  const accentProps = getStyleAndClasses(themeStyles.accent, 'accent');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const repeatableText = {
    daily: 'Daily',
    weekly: 'Weekly',
    none: 'One-Time Quest'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        style={primaryProps.style}
        className={`${primaryProps.className} rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-fade-in-up`}
        role="document"
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold mb-2 pr-4">{task.name}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close quest details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-slate-400 mb-4">{task.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-4">
            <div style={secondaryProps.style} className={`flex-1 ${secondaryProps.className} rounded-lg p-3 text-center`}>
                <div className="font-bold text-2xl text-amber-400">{task.xp}</div>
                <div className="text-xs text-slate-400">XP Reward</div>
            </div>
            <div style={secondaryProps.style} className={`flex-1 ${secondaryProps.className} rounded-lg p-3 text-center`}>
                <div className="font-bold text-2xl text-sky-400">{repeatableText[task.repeatable]}</div>
                <div className="text-xs text-slate-400">Frequency</div>
            </div>
        </div>
        
        <button
          onClick={onClose}
          style={accentProps.style}
          className={`w-full mt-4 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${accentProps.className} hover:opacity-90`}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default QuestInfoModal;
