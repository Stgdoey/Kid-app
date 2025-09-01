import React, { useState } from 'react';
import { Task, Progress, ThemeStyle } from '../types';
import { getAvailableQuests, getCompletedTodayQuests } from '../lib/questGenerator';
import QuestInfoModal from './QuestInfoModal';
import { getStyleAndClasses } from '../App';

interface TaskListProps {
  allTasks: Task[];
  progress: Progress;
  onComplete: (task: Task) => void;
  onGenerateQuest: () => void;
  isGeneratingQuest: boolean;
  aiError: string | null;
  themeStyles: ThemeStyle;
}

const TaskItem: React.FC<{ task: Task, onComplete: () => void, onViewInfo: () => void, completed: boolean, themeStyles: ThemeStyle }> = ({ task, onComplete, onViewInfo, completed, themeStyles }) => {
  const secondaryProps = getStyleAndClasses(themeStyles.secondary, 'bg');
  const bgProps = getStyleAndClasses(themeStyles.bg, 'bg');

  return (
    <div 
      style={secondaryProps.style}
      className={`p-4 rounded-lg flex items-center gap-4 transition-all ${completed ? `${secondaryProps.className} opacity-60` : `${secondaryProps.className} hover:scale-[1.02] cursor-pointer`}`}
      onClick={onViewInfo}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewInfo(); }}}
      aria-label={`View details for ${task.name}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        disabled={completed}
        style={bgProps.style}
        className={`w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors ${completed ? 'bg-green-500 border-green-400' : `${bgProps.className} border-slate-500 hover:border-green-400`}`}
        aria-label={completed ? `Task ${task.name} completed` : `Complete task: ${task.name}`}
      >
        {completed && <span className="text-white font-bold">✓</span>}
      </button>
      <div className="flex-grow overflow-hidden">
        <h3 className={`font-bold truncate ${completed ? 'line-through' : ''}`}>{task.name}</h3>
        <p className="text-sm text-slate-400 truncate">{task.description}</p>
      </div>
      <div className={`font-bold text-lg text-amber-400 ${completed ? 'opacity-50' : ''}`}>
        {task.xp} XP
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ allTasks, progress, onComplete, onGenerateQuest, isGeneratingQuest, aiError, themeStyles }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const availableQuests = getAvailableQuests(allTasks, progress);
  const completedQuests = getCompletedTodayQuests(allTasks, progress);
  
  const primaryProps = getStyleAndClasses(themeStyles.primary, 'bg');
  const accentProps = getStyleAndClasses(themeStyles.accent, 'accent');

  return (
    <>
      <QuestInfoModal 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        themeStyles={themeStyles}
      />
      <div style={primaryProps.style} className={`${primaryProps.className} rounded-xl shadow-lg p-4`}>
        <h2 className="text-xl font-bold mb-3">Today's Quests</h2>
        
        {/* AI Quest Generator Button */}
        <div className="mb-4">
          <button
            onClick={onGenerateQuest}
            disabled={isGeneratingQuest}
            style={accentProps.style}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isGeneratingQuest
                ? 'bg-slate-600 cursor-wait'
                : `${accentProps.className} hover:opacity-90`
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
          {aiError && <p className="text-red-400 text-sm text-center mt-2" role="alert">{aiError}</p>}
        </div>

        <div className="space-y-3">
          {availableQuests.length > 0 ? (
            availableQuests.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => onComplete(task)}
                onViewInfo={() => setSelectedTask(task)}
                completed={false}
                themeStyles={themeStyles}
              />
            ))
          ) : (
            <p className="text-center text-slate-400 py-4">No more quests for today. Try generating one!</p>
          )}
          
          {completedQuests.length > 0 && (
            <>
              <div className="border-t border-slate-700 my-4"></div>
              <h3 className="font-semibold text-slate-400">Completed</h3>
              {completedQuests.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onViewInfo={() => setSelectedTask(task)}
                  completed={true}
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
