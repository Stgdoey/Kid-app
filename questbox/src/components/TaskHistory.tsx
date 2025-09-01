import React from 'react';
import { CompletionRecord, ThemeStyle } from '../types';
import { getStyleAndClasses } from '../App';

interface TaskHistoryProps {
  history: CompletionRecord[];
  themeStyles: ThemeStyle;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ history, themeStyles }) => {
  const primaryProps = getStyleAndClasses(themeStyles.primary, 'bg');
  const secondaryProps = getStyleAndClasses(themeStyles.secondary, 'bg');

  const reversedHistory = history ? [...history].reverse() : [];

  return (
    <div style={primaryProps.style} className={`${primaryProps.className} rounded-xl shadow-lg p-4`}>
      <h2 className="text-xl font-bold mb-4 text-center">Quest History</h2>
      {reversedHistory.length === 0 ? (
        <div className="text-center text-slate-400 py-4">
          <p>Complete a quest to see your history!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {reversedHistory.map((record, index) => (
            <div
              key={`${record.taskId}-${record.completionDate}-${index}`}
              style={{ ...secondaryProps.style, animationDelay: `${index * 50}ms` }}
              className={`${secondaryProps.className} p-3 rounded-lg flex items-center justify-between animate-fade-in-up`}
            >
              <div>
                <p className="font-semibold">{record.taskName}</p>
                <p className="text-xs text-slate-400">{new Date(record.completionDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="font-bold text-lg text-amber-400 whitespace-nowrap pl-2">
                +{record.xpEarned} XP
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
