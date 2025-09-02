import React from 'react';
import { CompletionRecord } from '../types';

interface TaskHistoryProps {
  history: CompletionRecord[];
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ history }) => {
  const reversedHistory = history ? [...history].reverse() : [];

  return (
    <div className="bg-primary/40 backdrop-blur-md border border-secondary/50 rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Quest History</h2>
      {reversedHistory.length === 0 ? (
        <div className="text-center text-text-muted py-4">
          <p>Complete a quest to see your history!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {reversedHistory.map((record, index) => (
            <div
              key={`${record.taskId}-${record.completionDate}-${index}`}
              style={{ animationDelay: `${index * 50}ms` }}
              className="bg-secondary/30 p-3 rounded-lg flex items-center justify-between animate-fade-in-up"
            >
              <div>
                <p className="font-semibold">{record.taskName}</p>
                <p className="text-xs text-text-muted">{new Date(record.completionDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
