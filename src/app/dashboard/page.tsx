'use client';

import { useUserData } from '@/hooks/useUserData';
import { PATHS } from '@/config/roadmapData';
import ProgressChart from '@/components/ProgressChart';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import QuestList from '@/components/QuestList';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, activePath, completedNodes } = useUserData();
  
  const pathInfo = PATHS[activePath] || PATHS['data-engineering'];
  const totalNodes = pathInfo.nodes.length;
  const completedCount = pathInfo.nodes.filter(n => completedNodes.includes(n.id)).length;
  const progressPercent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  // Gamified achievements list
  const achievements = [
    {
      id: 'a1',
      title: 'SQL Starter',
      description: 'Completed the Foundations node in any learning path.',
      icon: 'database',
      unlocked: completedNodes.includes('foundations'),
      color: 'text-secondary bg-secondary/10 dark:text-secondary-fixed-dim dark:bg-secondary/20',
    },
    {
      id: 'a2',
      title: 'Pipeline Architect',
      description: 'Completed the ETL Concepts node in Data Engineering.',
      icon: 'transform',
      unlocked: completedNodes.includes('etl'),
      color: 'text-primary bg-primary/10 dark:text-primary-fixed dark:bg-primary/20',
    },
    {
      id: 'a3',
      title: 'Quiz Whiz',
      description: 'Answered an AI Assistant quiz correctly.',
      icon: 'quiz',
      unlocked: user.xp > DEFAULT_XP(), // Assume unlocked if they gained bonus XP
      color: 'text-tertiary bg-tertiary/10 dark:text-tertiary-fixed-dim dark:bg-tertiary/20',
    },
    {
      id: 'a4',
      title: 'Path Finder',
      description: 'Explored multiple learning trajectories.',
      icon: 'explore',
      unlocked: true, // Guest gets this by default
      color: 'text-surface-tint bg-surface-tint/10 dark:text-primary-fixed-dim dark:bg-surface-tint/20',
    },
  ];

  function DEFAULT_XP() {
    return 2450; // default guest XP
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-lg py-8">
      {/* Welcome Header Banner */}
      <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm dark:bg-inverse-surface/10 dark:border-outline/25">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-on-surface">
            Welcome back, {user.username}!
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant dark:text-outline-variant mt-1">
            You are making exceptional progress. Your current focus is <strong className="text-primary dark:text-primary-fixed">{pathInfo.title}</strong>.
          </p>
        </div>
        <Link href="/roadmap">
          <button className="bg-primary text-on-primary font-label-md text-sm py-2.5 px-5 rounded-xl hover:bg-primary/95 hover:shadow-md transition-all flex items-center gap-1.5 dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary-container/80">
            Resume Learning
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          </button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Metric 1: XP */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 dark:bg-inverse-surface/5 dark:border-outline/20">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center dark:bg-primary/20 dark:text-primary-fixed">
            <span className="material-symbols-outlined icon-fill">stars</span>
          </div>
          <div>
            <p className="text-[10px] text-outline uppercase font-code">Total XP</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface dark:text-on-surface">
              {user.xp.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Metric 2: Rank */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 dark:bg-inverse-surface/5 dark:border-outline/20">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center dark:bg-secondary/20 dark:text-secondary-fixed-dim">
            <span className="material-symbols-outlined icon-fill">workspace_premium</span>
          </div>
          <div>
            <p className="text-[10px] text-outline uppercase font-code">Current Rank</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface dark:text-on-surface">
              {user.rank}
            </h3>
          </div>
        </div>

        {/* Metric 3: Path Progress */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 dark:bg-inverse-surface/5 dark:border-outline/20">
          <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center dark:bg-tertiary/20 dark:text-tertiary-fixed-dim">
            <span className="material-symbols-outlined icon-fill">insights</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-outline uppercase font-code">Path Progress</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface dark:text-on-surface truncate">
              {progressPercent}%
            </h3>
          </div>
        </div>

        {/* Metric 4: Achievements */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 dark:bg-inverse-surface/5 dark:border-outline/20">
          <div className="w-10 h-10 rounded-lg bg-surface-tint/10 text-surface-tint flex items-center justify-center dark:bg-surface-tint/20 dark:text-primary-fixed-dim">
            <span className="material-symbols-outlined icon-fill">military_tech</span>
          </div>
          <div>
            <p className="text-[10px] text-outline uppercase font-code">Achievements</p>
            <h3 className="font-display text-lg sm:text-xl font-bold text-on-surface dark:text-on-surface">
              {unlockedCount} / {achievements.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Weekly Performance Chart */}
          <ProgressChart />

          {/* Study Consistency Heatmap */}
          <ActivityHeatmap />
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-lg">
          {/* Daily Quests */}
          <QuestList />

          {/* Recent Achievements */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm dark:bg-inverse-surface/10 dark:border-outline/25">
            <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-tertiary dark:text-tertiary-fixed-dim">emoji_events</span>
              Badges Earned
            </h3>

            <div className="space-y-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`flex items-start gap-3 p-3 border rounded-xl transition-all ${
                    ach.unlocked 
                      ? 'bg-surface border-outline-variant dark:bg-inverse-surface/5 dark:border-outline/20' 
                      : 'bg-surface-container-low border-outline-variant/40 opacity-50 dark:bg-inverse-surface/10 dark:border-outline/10'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    ach.unlocked ? ach.color : 'bg-outline-variant/20 text-outline dark:bg-outline/20'
                  }`}>
                    <span className="material-symbols-outlined text-[20px] icon-fill">
                      {ach.unlocked ? ach.icon : 'lock'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-label-md text-xs sm:text-sm font-semibold ${
                      ach.unlocked ? 'text-on-surface dark:text-on-surface' : 'text-on-surface-variant dark:text-outline-variant'
                    }`}>
                      {ach.title}
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-outline-variant mt-0.5 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
