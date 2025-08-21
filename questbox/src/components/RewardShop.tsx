
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
    if (reward.limit.type === 'none' || !reward.limit.count) return false;
    
    const purchases = progress.purchasedRewards[reward.id] || [];
    if (purchases.length === 0) return false;
    
    const now = new Date();
    const relevantPurchases = purchases.filter(pDate => {
      const purchaseDate = new Date(pDate);
      if (reward.limit.type === 'daily') {
        return purchaseDate.toDateString() === now.toDateString();
      }
      if (reward.limit.type === 'weekly') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return purchaseDate >= weekStart;
      }
      if (reward.limit.type === 'monthly') {
        return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
      }
      return false;
    });
    
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
