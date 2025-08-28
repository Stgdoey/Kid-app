
import React, { useState } from 'react';
import { Reward, Progress, ThemeStyle } from '../types';

interface RewardShopProps {
  rewards: Reward[];
  progress: Progress;
  onPurchase: (reward: Reward, onCancel: () => void, onSuccess: () => void) => void;
  onGenerateReward: () => void;
  isGeneratingReward: boolean;
  aiError: string | null;
  themeStyles: ThemeStyle;
}

const RewardItem: React.FC<{
  reward: Reward,
  onPurchase: () => void,
  canAfford: boolean,
  isLimited: boolean,
  isPending: boolean,
  isConfirmed: boolean,
  themeStyles: ThemeStyle
}> = ({ reward, onPurchase, canAfford, isLimited, isPending, isConfirmed, themeStyles }) => {
  const isDisabled = !canAfford || isLimited;
  
  const getButtonState = () => {
    if (isConfirmed) {
      return {
        content: (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Approved!
            </>
        ),
        className: 'bg-green-500 text-white',
        disabled: true,
      };
    }
    if (isPending) {
        return {
            content: (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Pending...
                </>
            ),
            className: 'bg-amber-500 text-white cursor-wait',
            disabled: true,
        };
    }
    if (isDisabled) {
        return {
            content: <>{isLimited ? 'Limit Reached' : `${reward.cost} XP`}</>,
            className: 'bg-slate-600 text-slate-400 cursor-not-allowed',
            disabled: true,
        };
    }
    return {
        content: <>{reward.cost} XP</>,
        className: `${themeStyles.accent} text-white hover:opacity-90`,
        disabled: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className={`${themeStyles.secondary} p-4 rounded-lg flex flex-col justify-between`}>
      <div>
        <h3 className="font-bold">{reward.name}</h3>
        {reward.description && <p className="text-sm text-slate-400 mt-1">{reward.description}</p>}
        {reward.needsApproval && <div className="text-xs text-blue-400 mt-1 font-semibold">Requires Approval</div>}
      </div>
      <button
        onClick={onPurchase}
        disabled={buttonState.disabled}
        className={`w-full mt-4 px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${buttonState.className}`}
      >
        {buttonState.content}
      </button>
    </div>
  );
}

const RewardShop: React.FC<RewardShopProps> = ({ rewards, progress, onPurchase, onGenerateReward, isGeneratingReward, aiError, themeStyles }) => {
  const [pendingApprovalRewardId, setPendingApprovalRewardId] = useState<string | null>(null);
  const [confirmedPurchaseId, setConfirmedPurchaseId] = useState<string | null>(null);
  
  const handlePurchaseClick = (reward: Reward) => {
    // Prevent multiple clicks while a confirmation is showing
    if (confirmedPurchaseId) return;

    const onCancel = () => {
      setPendingApprovalRewardId(null);
    };
    
    const onSuccess = () => {
      setPendingApprovalRewardId(null);
      setConfirmedPurchaseId(reward.id);
      setTimeout(() => setConfirmedPurchaseId(null), 1500); // Show confirmation for 1.5s
    };

    if (reward.needsApproval) {
      setPendingApprovalRewardId(reward.id);
    }
    
    onPurchase(reward, onCancel, onSuccess);
  };

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
      
      {/* AI Reward Generator Button */}
      <div className="mb-4">
        <button
          onClick={onGenerateReward}
          disabled={isGeneratingReward}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isGeneratingReward
              ? 'bg-slate-600 cursor-wait'
              : `${themeStyles.accent} hover:opacity-90`
          }`}
          aria-live="polite"
        >
          {isGeneratingReward ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Conjuring a Reward...
             </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Generate a New Reward
             </>
          )}
        </button>
        {aiError && <p className="text-red-400 text-sm text-center mt-2" role="alert">{aiError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rewards.map(reward => (
          <RewardItem
            key={reward.id}
            reward={reward}
            onPurchase={() => handlePurchaseClick(reward)}
            canAfford={progress.xp >= reward.cost}
            isLimited={checkLimit(reward)}
            isPending={pendingApprovalRewardId === reward.id}
            isConfirmed={confirmedPurchaseId === reward.id}
            themeStyles={themeStyles}
          />
        ))}
      </div>
    </div>
  );
};

export default RewardShop;