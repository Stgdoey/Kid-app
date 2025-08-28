import React from 'react';
import { Reward, Progress, ThemeStyle } from '../types';

interface RewardShopProps {
  rewards: Reward[];
  progress: Progress;
  onPurchase: (reward: Reward) => void;
  themeStyles: ThemeStyle;
}

const RewardItem: React.FC<{
  reward: Reward,
  onPurchase: () => void,
  canAfford: boolean,
  isLimited: boolean,
  themeStyles: ThemeStyle
}> = ({ reward, onPurchase, canAfford, isLimited, themeStyles }) => {
  const isDisabled = !canAfford || isLimited;
  return (
    <div className={`${themeStyles.secondary} p-4 rounded-lg flex flex-col justify-between`}>
      <div>
        <h3 className="font-bold">{reward.name}</h3>
        {reward.description && <p className="text-sm text-slate-400 mt-1">{reward.description}</p>}
        {reward.needsApproval && <div className="text-xs text-blue-400 mt-1 font-semibold">Requires Approval</div>}
      </div>
      <button
        onClick={onPurchase}
        disabled={isDisabled}
        className={`w-full mt-4 px-4 py-2 rounded-lg font-bold transition-colors ${
          isDisabled 
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : `${themeStyles.accent} text-white hover:opacity-90`
        }`}
      >
        {isLimited ? 'Limit Reached' : `${reward.cost} XP`}
      </button>
    </div>
  );
}

const RewardShop: React.FC<RewardShopProps> = ({ rewards, progress, onPurchase, themeStyles }) => {
  
  const checkLimit = (reward: Reward): boolean => {
    // If there's no limit type or count defined, the reward is not limited.
    if (reward.limit.type === 'none' || !reward.limit.count) return false;

    const purchases = progress.purchasedRewards[reward.id] || [];
    // Optimization: if the total number of purchases is less than the limit, it can't be reached yet.
    if (purchases.length < reward.limit.count) return false;

    const now = new Date();
    // Normalize 'now' to the start of the current day in the local timezone for accurate comparisons.
    now.setHours(0, 0, 0, 0);

    const relevantPurchases = purchases.filter(pDate => {
      // The pDate is a 'YYYY-MM-DD' string. new Date(pDate) can be unreliable due to timezones (parses as UTC).
      // To ensure correct local time comparison, we parse the string manually.
      const [year, month, day] = pDate.split('-').map(Number);
      // This creates a date at midnight in the user's local timezone.
      const purchaseDate = new Date(year, month - 1, day);

      switch (reward.limit.type) {
        case 'daily':
          // Check if the purchase was made on the same day as today.
          return purchaseDate.getTime() === now.getTime();
        case 'weekly': {
          const weekStart = new Date(now);
          // Set to the beginning of the current week (Sunday).
          weekStart.setDate(now.getDate() - now.getDay());
          return purchaseDate.getTime() >= weekStart.getTime();
        }
        case 'monthly':
          // Check if the purchase was made in the same month and year as today.
          return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });

    // The limit is reached if the number of purchases within the relevant period is equal to or exceeds the count.
    return relevantPurchases.length >= reward.limit.count;
  };

  return (
    <div className={`${themeStyles.primary} rounded-xl shadow-lg p-4`}>
      <h2 className="text-xl font-bold mb-3">Reward Shop</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rewards.map(reward => (
          <RewardItem
            key={reward.id}
            reward={reward}
            onPurchase={() => onPurchase(reward)}
            canAfford={progress.xp >= reward.cost}
            isLimited={checkLimit(reward)}
            themeStyles={themeStyles}
          />
        ))}
      </div>
    </div>
  );
};

export default RewardShop;
