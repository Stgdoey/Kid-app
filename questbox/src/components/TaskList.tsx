
import React from 'react';
import { Task, Progress, ThemeStyle } from '../types';
import { getAvailableQuests, getCompletedTodayQuests } from '../lib/questGenerator';

interface TaskListProps {
  allTasks: Task[];
  progress: Progress;
  onComplete: (task: Task) => void;
  onGenerateQuest: () => void;
  isGeneratingQuest: boolean;
  aiError: string | null;
  themeStyles: ThemeStyle;
}

const TaskItem: React.FC<{ task: Task, onComplete: () => void, completed: boolean, themeStyles: ThemeStyle }> = ({ task, onComplete, completed, themeStyles }) => (
  <div className={`p-4 rounded-lg flex items-center gap-4 transition-all ${completed ? `${themeStyles.secondary} opacity-60` : `${themeStyles.secondary} hover:scale-[1.02]`}`}>
    <button
      onClick={onComplete}
      disabled={completed}
      className={`w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors ${completed ? 'bg-green-500 border-green-400' : `${themeStyles.bg} border-slate-500 hover:border-green-400`}`}
    >
      {completed && <span className="text-white font-bold">✓</span>}
    </button>
    <div className="flex-grow">
      <h3 className={`font-bold ${completed ? 'line-through' : ''}`}>{task.name}</h3>
      <p className="text-sm text-slate-400">{task.description}</p>
    </div>
    <div className={`font-bold text-lg text-amber-400 ${completed ? 'opacity-50' : ''}`}>
      {task.xp} XP
    </div>
  </div>
);

const TaskList: React.FC<TaskListProps> = ({ allTasks, progress, onComplete, onGenerateQuest, isGeneratingQuest, aiError, themeStyles }) => {
  const availableQuests = getAvailableQuests(allTasks, progress);
  const completedQuests = getCompletedTodayQuests(allTasks, progress);

  return (
    <div className={`${themeStyles.primary} rounded-xl shadow-lg p-4`}>
      <h2 className="text-xl font-bold mb-3">Today's Quests</h2>
      
      {/* AI Quest Generator Button */}
      <div className="mb-4">
        <button
          onClick={onGenerateQuest}
          disabled={isGeneratingQuest}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isGeneratingQuest
              ? 'bg-slate-600 cursor-wait'
              : `${themeStyles.accent} hover:opacity-90`
          }`}
          aria-live="polite"
        >
          {isGeneratingQuest ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
             </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM4.032 4.032a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06L4.032 5.093a.75.75 0 010-1.06zm9.898 9.898a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06l-1.06-1.061a.75.75 0 010-1.06zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zm12.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.092 14.032a.75.75 0 010-1.06l1.06-1.061a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 01-1.06 0zM14.032 5.092a.75.75 0 010-1.06l1.06-1.061a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                </svg>
                Discover a New Quest
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
              completed={false}
              themeStyles={themeStyles}
            />
          ))
        ) : (
          <p className="text-center text-slate-400 py-4">No more quests for today. Try discovering one!</p>
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
                completed={true}
                themeStyles={themeStyles}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;
