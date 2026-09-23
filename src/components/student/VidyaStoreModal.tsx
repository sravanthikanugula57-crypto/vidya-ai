import React, { useState } from 'react';
import { X, ShoppingBag, Coins, Sparkles, Check, Lock, Download, Award } from 'lucide-react';
import { StoreItem } from '../../types';
import { REWARD_STORE_ITEMS } from '../../data/storeRewardsData';
import { soundFx } from '../../lib/audio';
import confetti from 'canvas-confetti';

interface VidyaStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onUpdateCoins: (newBalance: number) => void;
}

export const VidyaStoreModal: React.FC<VidyaStoreModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  onUpdateCoins,
}) => {
  const [items, setItems] = useState<StoreItem[]>(REWARD_STORE_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Theme', 'Formula Sheet', 'Badge'];

  const filteredItems = items.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  const handleBuy = (item: StoreItem) => {
    if (userCoins < item.cost) {
      alert(`You need ${item.cost - userCoins} more Vidya Coins! Solve doubts and practice quizzes to earn more coins.`);
      return;
    }

    soundFx.playCoin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newBalance = userCoins - item.cost;
    onUpdateCoins(newBalance);

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, unlocked: true } : i))
    );

    setPurchaseSuccess(`Unlocked "${item.title}"!`);
    setTimeout(() => setPurchaseSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-b border-amber-200/30 dark:border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Vidya Rewards & Store
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700">
                  Free Rewards
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redeem your Vidya Coins earned from solving doubts & quizzes!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 font-bold text-sm shadow-sm">
              <Coins className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{userCoins} Coins</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Purchase Notification Banner */}
        {purchaseSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-inner animate-pulse">
            <Sparkles className="w-4 h-4" />
            {purchaseSuccess}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? '✨ All Rewards' : cat}
            </button>
          ))}
        </div>

        {/* Store Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`relative p-5 rounded-xl border transition-all flex flex-col justify-between ${
                item.unlocked
                  ? 'bg-slate-50/80 dark:bg-slate-800/50 border-emerald-500/40 dark:border-emerald-500/30'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-3xl p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    {item.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        <Check className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {item.cost} Coins
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {item.category}
                </span>

                {item.unlocked ? (
                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      alert(`Activated ${item.title}! Added to your profile.`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5" /> Equipped
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={userCoins < item.cost}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm ${
                      userCoins >= item.cost
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {userCoins >= item.cost ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Unlock
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Need Coins
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Pro Tip:</span> Ask 3 Socratic doubts or complete 1 practice test daily to earn +50 Vidya Coins every day!
        </div>
      </div>
    </div>
  );
};
