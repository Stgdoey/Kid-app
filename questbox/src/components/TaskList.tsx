import React, { useState, useEffect } from 'react';
import { Task, Progress } from '../types';
import { getAvailableQuests, getCompletedTodayQuests } from '../lib/questGenerator';
import QuestInfoModal from './QuestInfoModal';

// --- Web Audio API for Sound Effects ---
// Create a single audio context to be reused.
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

/**
 * Plays a sound effect for various actions.
 * @param type - 'start', 'end', or 'complete'
 */
const playSound = (type: 'start' | 'end' | 'complete' | 'reset') => {
  if (!audioContext || audioContext.state === 'suspended') {
    audioContext?.resume();
  }
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Set volume

  if (type === 'start') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } else if (type === 'end') { 
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(330, audioContext.currentTime); // E4 note
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime + 0.1); // A3 note
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } else if (type === 'complete') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.linearRampToValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else if (type === 'reset') {
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }
};


interface TaskListProps {
  allTasks: Task[];
  progress: Progress;
  onComplete: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onPauseTimer: (taskId: string) => void;
  onResumeTimer: (taskId: string) => void;
  onResetTimer: (taskId: string) => void;
  onGenerateQuest: () => void;
  onEditQuest: (task: Task) => void;
  isGeneratingQuest: boolean;
  aiError: string | null;
}

const formatTime = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TaskItem: React.FC<{ 
    task: Task, 
    onComplete: (task: Task) => void, 
    onViewInfo: (task: Task) => void, 
    onStartTimer: (taskId: string) => void,
    onPauseTimer: (taskId: string) => void,
    onResumeTimer: (taskId: string) => void,
    onResetTimer: (taskId: string) => void,
    onEditQuest: (task: Task) => void,
    completed: boolean,
    progress: Progress,
}> = ({ task, onComplete, onViewInfo, onStartTimer, onPauseTimer, onResumeTimer, onResetTimer, onEditQuest, completed, progress }) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(100);
  const [alarmPlayed, setAlarmPlayed] = useState(false);

  const isTimed = task.timer && task.timer > 0;
  const timerInfo = progress.activeTimers?.[task.id];
  const isTimerActive = isTimed && !!timerInfo;
  const isTimerRunning = isTimerActive && timerInfo?.startTime !== null;
  const isCriticalTime = isTimerActive && !completed && progressPercent < 20;

  useEffect(() => {
    if (isTimerActive) {
      setAlarmPlayed(progressPercent <= 0);
    }
  }, [isTimerActive, progressPercent]);


  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive && timerInfo) {
        const durationMillis = task.timer! * 60 * 1000;

        const calculateRemaining = () => {
            let elapsedMillis = timerInfo.elapsedBeforePause;
            if (timerInfo.startTime) {
                elapsedMillis += Date.now() - new Date(timerInfo.startTime).getTime();
            }
            
            const remainingMillis = Math.max(0, durationMillis - elapsedMillis);
            
            setRemainingTime(formatTime(remainingMillis / 1000));
            setProgressPercent((remainingMillis / durationMillis) * 100);

            if (remainingMillis === 0 && !alarmPlayed) {
                setAlarmPlayed(true);
                playSound('end');
            }
        };

        calculateRemaining();
        if (timerInfo.startTime) { // Only run interval if timer is not paused
            interval = setInterval(calculateRemaining, 1000);
        }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerInfo, task.timer, alarmPlayed]);


  const repeatableText: Record<Task['repeatable'], string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    none: 'One-Time'
  };

  const getRepeatableColor = (repeatable: Task['repeatable']) => {
    switch(repeatable) {
        case 'daily': return 'bg-blue-500/50 text-blue-200';
        case 'weekly': return 'bg-purple-500/50 text-purple-200';
        case 'none': return 'bg-gray-500/50 text-gray-200';
    }
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getDueDateInfo = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dueDate.split('-').map(Number);
    const localDue = new Date(year, month - 1, day);
    localDue.setHours(0,0,0,0);

    const isOverdue = localDue < today;
    const diffTime = localDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let text = `Due: ${localDue.toLocaleDateString()}`;
    if (diffDays === 0) text = 'Due Today';
    if (diffDays === 1) text = 'Due Tomorrow';
    if (isOverdue) text = 'Overdue';
    
    return {
        isOverdue,
        text,
        textColor: isOverdue ? 'text-red-400' : 'text-text-muted'
    };
  };

  if (isTimed && !completed) {
    const timerDisplayColor = progressPercent <= 0 ? 'text-red-400' : 'text-amber-400';
    return (
        <div className={`relative p-4 rounded-lg flex flex-col gap-2 transition-all duration-200 overflow-hidden border ${isCriticalTime ? 'animate-pulse-critical border-red-500/75' : 'border-transparent'} bg-secondary/20`}>
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold truncate pr-2">{task.name}</h3>
                <div className="flex items-center flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onEditQuest(task); }} className="p-1 text-text-muted hover:text-white transition-colors" aria-label={`Edit task: ${task.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onViewInfo(task); }} className="p-1 text-text-muted hover:text-white transition-colors" aria-label={`View details for ${task.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
            <p className="text-sm text-text-muted truncate">{task.description}</p>
            
            <div className={`text-center font-mono text-4xl my-2 ${timerDisplayColor}`}>{remainingTime ?? formatTime(task.timer! * 60)}</div>

            <div className="flex items-center justify-center gap-4">
                {!isTimerActive && (
                    <button onClick={() => { playSound('start'); onStartTimer(task.id); }} className="w-full mt-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-accent text-white hover:opacity-90 active:scale-95 transform hover:scale-105" aria-label={`Start timer for task: ${task.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        Start Timer
                    </button>
                )}
                {isTimerRunning && (
                    <button onClick={() => onPauseTimer(task.id)} className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/70 transition-colors" aria-label="Pause timer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1zm5 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    </button>
                )}
                {isTimerActive && !isTimerRunning && (
                    <button onClick={() => onResumeTimer(task.id)} className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/70 transition-colors" aria-label="Resume timer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </button>
                )}
                {isTimerActive && (
                    <button onClick={() => { playSound('reset'); onResetTimer(task.id); }} className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/70 transition-colors" aria-label="Reset timer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    </button>
                )}
                <button onClick={() => { playSound('complete'); onComplete(task); }} className="h-12 w-12 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition-colors" aria-label={`Complete task: ${task.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </button>
            </div>
            {isTimerActive && (
                <div className={`absolute bottom-0 left-0 w-full h-2 bg-secondary/50 rounded-b-lg overflow-hidden transition-colors duration-300 ${progressPercent === 0 ? 'bg-red-900/75' : ''}`}>
                    <div className={`h-full transition-all duration-1000 linear ${getProgressBarColor(progressPercent)}`} style={{ width: `${progressPercent}%`}} role="progressbar" aria-valuenow={progressPercent} aria-label="Time remaining for quest"></div>
                </div>
            )}
        </div>
    );
  }


  const dueDateInfo = task.dueDate ? getDueDateInfo(task.dueDate) : null;
  const MAX_VISUAL_XP = 100; // Ceiling for the visual XP bar
  const xpPercent = Math.min((task.xp / MAX_VISUAL_XP) * 100, 100);

  return (
    <div
      className={`relative p-4 rounded-lg flex items-center gap-4 transition-all duration-200 overflow-hidden border ${
        completed
          ? 'bg-secondary/30 opacity-60 border-transparent'
          : `bg-secondary/20 hover:bg-secondary/40 cursor-pointer hover:-translate-y-1 transform border-transparent`
      }`}
      onClick={() => !completed && onViewInfo(task)}
      role="button"
      tabIndex={completed ? -1 : 0}
      onKeyDown={(e) => { if (!completed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onViewInfo(task); }}}
      aria-label={`View details for ${task.name}`}
    >
      {/* Action Button: Checkmark */}
      <div className="flex-shrink-0 w-8 h-8">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    playSound('complete');
                    onComplete(task);
                }}
                disabled={completed}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 ${completed ? 'bg-green-500 border-green-400' : 'bg-background/50 border-secondary hover:border-green-400'}`}
                aria-label={completed ? `Task ${task.name} completed` : `Complete task: ${task.name}`}
            >
            {completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-checkmark-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
            </button>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start gap-2">
            <h3 className={`font-bold truncate ${completed ? 'line-through' : ''}`}>{task.name}</h3>
            {!completed && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditQuest(task);
                    }}
                    className="flex-shrink-0 p-1 text-text-muted hover:text-white transition-colors"
                    aria-label={`Edit task: ${task.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </button>
            )}
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
            <div className={`font-semibold px-2 py-0.5 rounded-full ${getRepeatableColor(task.repeatable)}`}>
                {repeatableText[task.repeatable]}
            </div>
            {dueDateInfo && (
                <div className={`flex items-center gap-1 font-semibold ${dueDateInfo.textColor}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{dueDateInfo.text}</span>
                </div>
            )}
        </div>
        <p className="text-sm text-text-muted truncate mt-1">{task.description}</p>
      </div>
      <div className={`font-bold text-lg text-center ${completed ? 'opacity-50' : ''}`}>
         <div className="text-amber-400 w-20 text-center">
             <div>{task.xp} XP</div>
             <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${xpPercent}%`}}></div>
             </div>
         </div>
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ allTasks, progress, onComplete, onStartTimer, onPauseTimer, onResumeTimer, onResetTimer, onGenerateQuest, onEditQuest, isGeneratingQuest, aiError }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const availableQuests = getAvailableQuests(allTasks, progress);
  const completedQuests = getCompletedTodayQuests(allTasks, progress);
  
  return (
    <>
      <QuestInfoModal 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={onEditQuest}
      />
      <div className="bg-primary/40 backdrop-blur-md border border-secondary/50 rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Today's Quests</h2>
            {completedQuests.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                <label htmlFor="show-completed-toggle" className="cursor-pointer">Show Completed</label>
                <button
                    id="show-completed-toggle"
                    role="switch"
                    aria-checked={showCompleted}
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`${showCompleted ? 'bg-accent' : 'bg-secondary'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent`}
                >
                    <span className={`${showCompleted ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
                </div>
            )}
        </div>
        
        {/* AI Quest Generator Button */}
        <div className="mb-4">
          <button
            onClick={onGenerateQuest}
            disabled={isGeneratingQuest}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isGeneratingQuest
                ? 'bg-secondary cursor-wait'
                : 'bg-accent hover:opacity-90 hover:scale-105 transform active:scale-100'
            }`}
            aria-live="polite"
          >
            {isGeneratingQuest ? (
               <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Quest...
               </>
            ) : (
               <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Generate New Quest
               </>
            )}
          </button>
          {aiError && <div className="bg-red-900/50 border border-red-800 text-red-300 text-sm rounded-lg p-3 mt-2 text-center" role="alert">{aiError}</div>}
        </div>

        <div className="space-y-3">
          {availableQuests.length > 0 ? (
            availableQuests.map((task, index) => (
              <div key={task.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
                <TaskItem
                  task={task}
                  onComplete={onComplete}
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onResumeTimer={onResumeTimer}
                  onResetTimer={onResetTimer}
                  onViewInfo={setSelectedTask}
                  onEditQuest={onEditQuest}
                  completed={false}
                  progress={progress}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-text-muted py-4">No more quests for today. Try generating one!</p>
          )}
          
          {showCompleted && completedQuests.length > 0 && (
            <>
              <div className="border-t border-secondary/50 my-4"></div>
              <h3 className="font-semibold text-text-muted">Completed</h3>
              {completedQuests.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onStartTimer={() => {}}
                  onPauseTimer={() => {}}
                  onResumeTimer={() => {}}
                  onResetTimer={() => {}}
                  onViewInfo={setSelectedTask}
                  onEditQuest={onEditQuest}
                  completed={true}
                  progress={progress}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskList;