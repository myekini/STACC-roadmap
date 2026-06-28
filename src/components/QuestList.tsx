'use client';

import { useUserData } from '@/hooks/useUserData';

export default function QuestList() {
  const { quests, toggleQuest } = useUserData();

  const handleQuestToggle = (questId: string, currentStatus: boolean) => {
    toggleQuest({ questId, completed: !currentStatus });
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm h-full dark:bg-inverse-surface/10 dark:border-outline/25">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed">military_tech</span>
          Daily Quests
        </h3>
        <span className="text-xs text-outline font-code">Resets Daily</span>
      </div>

      <div className="space-y-3">
        {quests.length === 0 ? (
          <p className="text-xs text-on-surface-variant dark:text-outline-variant text-center py-4">
            No quests available today. Check back tomorrow!
          </p>
        ) : (
          quests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => handleQuestToggle(quest.id, quest.completed)}
              className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                quest.completed
                  ? 'bg-secondary/5 border-secondary/20 text-on-surface/65 dark:bg-secondary/10 dark:border-secondary/20'
                  : 'bg-surface border-outline-variant hover:border-outline hover:shadow-sm dark:bg-inverse-surface/5 dark:border-outline/20 dark:hover:border-outline-variant'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox Icon */}
                <span
                  className={`material-symbols-outlined text-xl transition-all ${
                    quest.completed
                      ? 'text-secondary icon-fill dark:text-secondary-fixed-dim'
                      : 'text-outline dark:text-outline-variant'
                  }`}
                >
                  {quest.completed ? 'check_box' : 'check_box_outline_blank'}
                </span>
                
                <span
                  className={`font-body-sm text-xs sm:text-sm font-medium ${
                    quest.completed ? 'line-through text-on-surface-variant dark:text-outline-variant' : 'text-on-surface dark:text-on-surface'
                  }`}
                >
                  {quest.title}
                </span>
              </div>

              {/* XP Badge */}
              <span
                className={`font-code text-[11px] font-bold px-2 py-0.5 rounded ${
                  quest.completed
                    ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-fixed-dim'
                    : 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-fixed'
                }`}
              >
                +{quest.xp_reward} XP
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
