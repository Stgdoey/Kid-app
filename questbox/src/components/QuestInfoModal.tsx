import React, { useEffect } from 'react';
import { Task } from '../types';

interface QuestInfoModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

const QuestInfoModal: React.FC<QuestInfoModalProps> = ({ task, onClose, onEdit }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!task) return null;
  
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

  const difficultyText = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  const difficultyColor = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-primary/80 backdrop-blur-xl border border-secondary/50 text-text-main rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-fade-in-up"
        role="document"
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold mb-2 pr-4">{task.name}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (task) {
                  onEdit(task);
                  // Don't close this modal immediately, let App handle PIN
                }
              }}
              className="text-text-muted hover:text-white transition-colors p-1 rounded-full"
              aria-label="Edit quest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={onClose} 
              className="text-text-muted hover:text-white transition-colors p-1 rounded-full"
              aria-label="Close quest details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-text-muted mb-4">{task.description}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/50 rounded-lg p-3">
                <div className="font-bold text-2xl text-amber-400">{task.xp}</div>
                <div className="text-xs text-text-muted">XP Reward</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
                <div className="font-bold text-lg text-sky-400 leading-8">{repeatableText[task.repeatable]}</div>
                <div className="text-xs text-text-muted">Frequency</div>
            </div>
             {task.difficulty && (
                <div className="bg-secondary/50 rounded-lg p-3">
                    <div className={`font-bold text-lg leading-8 capitalize ${difficultyColor[task.difficulty]}`}>{difficultyText[task.difficulty]}</div>
                    <div className="text-xs text-text-muted">Difficulty</div>
                </div>
            )}
            {task.timer && (
                <div className="bg-secondary/50 rounded-lg p-3 col-span-2 sm:col-span-3">
                    <div className="font-bold text-lg leading-8 text-fuchsia-400">{task.timer} Minute Time Limit</div>
                    <div className="text-xs text-text-muted">Completing this quest after the timer expires will result in reduced XP.</div>
                </div>
            )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 bg-accent hover:opacity-90 hover:scale-105"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default QuestInfoModal;
