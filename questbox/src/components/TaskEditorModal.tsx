import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskEditorModalProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ task, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [xp, setXp] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Task['difficulty']>('easy');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setXp(String(task.xp));
      setDifficulty(task.difficulty || 'easy');
    }
  }, [task]);

  const handleSave = () => {
    setError('');
    const parsedXp = parseInt(xp, 10);

    if (!name.trim()) {
      setError('Task name cannot be empty.');
      return;
    }
    if (isNaN(parsedXp) || parsedXp < 0) {
      setError('XP must be a non-negative number.');
      return;
    }

    const updatedTask: Task = {
      ...task,
      name: name.trim(),
      description: description.trim(),
      xp: parsedXp,
      difficulty: difficulty,
    };

    onSave(updatedTask);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-800 text-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-fade-in-up" role="document">
        <h2 className="text-2xl font-bold mb-4">Edit Quest</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-slate-300 mb-1">Quest Name</label>
            <input
              id="taskName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="taskDesc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="taskDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="taskXp" className="block text-sm font-medium text-slate-300 mb-1">XP Reward</label>
            <input
              id="taskXp"
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
            <div className="flex justify-between gap-2">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`w-full p-2 rounded-md font-semibold transition-colors text-center capitalize ${
                    difficulty === level
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {error && <p className="text-red-400 text-sm mt-3 text-center" role="alert">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg font-semibold bg-slate-600 hover:bg-slate-500 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all duration-200 hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorModal;