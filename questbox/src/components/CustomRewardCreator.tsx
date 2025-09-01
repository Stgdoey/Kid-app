import React, { useState } from 'react';
import { Reward } from '../types';

interface CustomRewardCreatorProps {
  onClose: () => void;
  onSave: (rewardData: Omit<Reward, 'id'>) => void;
}

const CustomRewardCreator: React.FC<CustomRewardCreatorProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<string>('100');
  const [limitType, setLimitType] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');
  const [limitCount, setLimitCount] = useState<string>('1');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    const parsedCost = parseInt(cost, 10);
    const parsedCount = parseInt(limitCount, 10);

    if (!name.trim()) {
      setError('Reward name cannot be empty.');
      return;
    }
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setError('XP Cost must be a positive number.');
      return;
    }
    if (limitType !== 'none' && (isNaN(parsedCount) || parsedCount <= 0)) {
        setError('Limit count must be a positive number.');
        return;
    }

    const newRewardData: Omit<Reward, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      cost: parsedCost,
      limit: {
        type: limitType,
        count: limitType !== 'none' ? parsedCount : undefined,
      },
      needsApproval,
    };

    onSave(newRewardData);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-800 text-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-fade-in-up" role="document">
        <h2 className="text-2xl font-bold mb-4">Create Custom Reward</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="rewardName" className="block text-sm font-medium text-slate-300 mb-1">Reward Name</label>
            <input
              id="rewardName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Extra Bedtime Story"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="rewardDesc" className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              id="rewardDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A short, fun description of the reward"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="rewardCost" className="block text-sm font-medium text-slate-300 mb-1">XP Cost</label>
            <input
              id="rewardCost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="1"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="rewardLimitType" className="block text-sm font-medium text-slate-300 mb-1">Limit</label>
                <select
                    id="rewardLimitType"
                    value={limitType}
                    onChange={(e) => setLimitType(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
             </div>
             {limitType !== 'none' && (
                <div>
                    <label htmlFor="rewardLimitCount" className="block text-sm font-medium text-slate-300 mb-1">Count</label>
                    <input
                        id="rewardLimitCount"
                        type="number"
                        value={limitCount}
                        onChange={(e) => setLimitCount(e.target.value)}
                        min="1"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
             )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="needsApproval"
              type="checkbox"
              checked={needsApproval}
              onChange={(e) => setNeedsApproval(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
            />
            <label htmlFor="needsApproval" className="text-sm text-slate-300">Requires Parent Approval (PIN)</label>
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
            Save Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomRewardCreator;