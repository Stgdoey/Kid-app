import React, { useState, useEffect } from 'react';
import { Task, Progress, ThemeStyle } from '../types';
import { getAvailableQuests, getCompletedTodayQuests } from '../lib/questGenerator';
import QuestInfoModal from './QuestInfoModal';
import { getStyleAndClasses } from '../App';

interface TaskListProps {
  allTasks: Task[];
  progress: Progress;
  onComplete: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onGenerateQuest: () => void;
  onEditQuest: (task: Task) => void;
  isGeneratingQuest: boolean;
  aiError: string | null;
  themeStyles: ThemeStyle;
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
    completed: boolean,
    progress: Progress,
    themeStyles: ThemeStyle 
}> = ({ task, onComplete, onViewInfo, onStartTimer, completed, progress, themeStyles }) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const secondaryProps = getStyleAndClasses(themeStyles.secondary, 'bg');
  const bgProps = getStyleAndClasses(themeStyles.bg, 'bg');

  const isTimed = task.timer && task.timer > 0;
  const timerStartTime = progress.activeTimers?.[task.id];
  const isTimerActive = isTimed && !!timerStartTime;

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive && timerStartTime) {
        const calculateRemaining = () => {
            const startTime = new Date(timerStartTime).getTime();
            const durationMillis = task.timer! * 60 * 1000;
            const endTime = startTime + durationMillis;
            const now = Date.now();
            const remainingMillis = Math.max(0, endTime - now);
            setRemainingTime(formatTime(remainingMillis / 1000));
        }
        calculateRemaining();
        interval = setInterval(calculateRemaining, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerStartTime, task.timer]);


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

  return (
    <div 
      style={secondaryProps.style}
      className={`p-4 rounded-lg flex items-center gap-4 transition-all ${completed ? `${secondaryProps.className} opacity-60` : `${secondaryProps.className} hover:scale-[1.02] cursor-pointer`}`}
      onClick={() => onViewInfo(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewInfo(task); }}}
      aria-label={`View details for ${task.name}`}
    >
      {/* Action Button: Checkmark, Start, or Countdown */}
      <div className="flex-shrink-0 w-8 h-8">
        {!isTimed || isTimerActive ? (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task);
                }}
                disabled={completed}
                style={bgProps.style}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${completed ? 'bg-green-500 border-green-400' : `${bgProps.className} border-slate-500 hover:border-green-400`}`}
                aria-label={completed ? `Task ${task.name} completed` : `Complete task: ${task.name}`}
            >
            {completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-checkmark-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
            </button>
        ) : (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onStartTimer(task.id);
                }}
                disabled={completed}
                className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center transition-colors hover:bg-amber-500/20"
                aria-label={`Start timer for task: ${task.name}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
            </button>
        )}
      </div>

      <div className="flex-grow overflow-hidden">
        <h3 className={`font-bold truncate ${completed ? 'line-through' : ''}`}>{task.name}</h3>
        <div className="flex items-center gap-2">
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRepeatableColor(task.repeatable)}`}>
                {repeatableText[task.repeatable]}
            </div>
            <p className="text-sm text-slate-400 truncate">{task.description}</p>
        </div>
      </div>
      <div className={`font-bold text-lg text-center ${completed ? 'opacity-50' : ''}`}>
        {isTimerActive ? (
             <div className={`text-lg font-mono ${remainingTime === '00:00:00' ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>{remainingTime}</div>
        ) : (
             <div className="text-amber-400">{task.xp} XP</div>
        )}
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ allTasks, progress, onComplete, onStartTimer, onGenerateQuest, onEditQuest, isGeneratingQuest, aiError, themeStyles }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const availableQuests = getAvailableQuests(allTasks, progress);
  const completedQuests = getCompletedTodayQuests(allTasks, progress);
  
  const primaryProps = getStyleAndClasses(themeStyles.primary, 'bg');
  const accentProps = getStyleAndClasses(themeStyles.accent, 'accent');

  return (
    <>
      <QuestInfoModal 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={onEditQuest}
        themeStyles={themeStyles}
      />
      <div style={primaryProps.style} className={`${primaryProps.className} rounded-xl shadow-lg p-4`}>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Today's Quests</h2>
            {completedQuests.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                <label htmlFor="show-completed-toggle" className="cursor-pointer">Show Completed</label>
                <button
                    id="show-completed-toggle"
                    role="switch"
                    aria-checked={showCompleted}
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`${showCompleted ? accentProps.className : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500`}
                    style={showCompleted ? accentProps.style : {}}
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
            style={accentProps.style}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isGeneratingQuest
                ? 'bg-slate-600 cursor-wait'
                : `${accentProps.className} hover:opacity-90 hover:scale-105 transform`
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
            availableQuests.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onComplete}
                onStartTimer={onStartTimer}
                onViewInfo={setSelectedTask}
                completed={false}
                progress={progress}
                themeStyles={themeStyles}
              />
            ))
          ) : (
            <p className="text-center text-slate-400 py-4">No more quests for today. Try generating one!</p>
          )}
          
          {showCompleted && completedQuests.length > 0 && (
            <>
              <div className="border-t border-slate-700 my-4"></div>
              <h3 className="font-semibold text-slate-400">Completed</h3>
              {completedQuests.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onStartTimer={() => {}}
                  onViewInfo={setSelectedTask}
                  completed={true}
                  progress={progress}
                  themeStyles={themeStyles}
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