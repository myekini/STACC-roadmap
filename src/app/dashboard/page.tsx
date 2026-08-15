'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleCheck, Flame, Hourglass, Trophy } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import ActivityHeatmap from '@/components/progress/ActivityHeatmap';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/ui/app-icon';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const data = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { paths, nodes, nodesByPath, progress, activity, streak, activePath, hasSelectedPath, isLoading } = data;

  useEffect(() => {
    if (!isLoading && !hasSelectedPath) router.replace('/paths');
  }, [hasSelectedPath, isLoading, router]);

  if (!hasSelectedPath) return null;

  const completedCount = Object.keys(progress.completedNodes).length;
  const estimatedHoursCompleted = nodes
    .filter((node) => progress.completedNodes[node.id])
    .reduce((sum, node) => sum + node.est_hours, 0);

  const foundationsDone =
    (nodesByPath.foundations ?? []).length > 0 &&
    (nodesByPath.foundations ?? []).every((node) => progress.completedNodes[node.id]);
  const activePathInfo = paths.find((path) => path.id === activePath);
  const currentTrackLabel = foundationsDone ? activePathInfo?.title ?? 'Roadmap' : 'Foundations';
  const currentTrackNodes = foundationsDone
    ? nodesByPath[activePath ?? ''] ?? []
    : nodesByPath.foundations ?? [];
  const trackCompletedCount = currentTrackNodes.filter((node) => progress.completedNodes[node.id]).length;
  const trackPct = currentTrackNodes.length
    ? Math.round((trackCompletedCount / currentTrackNodes.length) * 100)
    : 0;

  const railNodes = [
    ...(nodesByPath.foundations ?? []),
    ...(activePath && activePath !== 'foundations' ? nodesByPath[activePath] ?? [] : []),
  ];
  const currentNode = railNodes.find((node) => ['available', 'in_progress'].includes(data.nodeStatus(node.id)));
  const anyPathComplete = paths.some(
    (path) =>
      path.id !== 'foundations' &&
      (nodesByPath[path.id] ?? []).length > 0 &&
      (nodesByPath[path.id] ?? []).every((node) => progress.completedNodes[node.id]),
  );

  const milestones = [
    { id: 'first-module', title: 'First module', description: 'Complete your first module.', icon: 'check_circle', unlocked: completedCount >= 1 },
    { id: 'foundations', title: 'Foundations complete', description: 'Finish the whole Foundations block.', icon: 'terminal', unlocked: foundationsDone },
    { id: 'week-streak', title: '7-day streak', description: 'Learn something seven days in a row.', icon: 'calendar_today', unlocked: streak >= 7 },
    { id: 'path-complete', title: 'Path complete', description: 'Finish a full specialization path.', icon: 'emoji_events', unlocked: anyPathComplete },
  ];
  const unlockedCount = milestones.filter((milestone) => milestone.unlocked).length;

  const metrics = [
    {
      label: 'track progress',
      value: `${trackPct}%`,
      detail: `${trackCompletedCount} of ${currentTrackNodes.length} modules`,
      icon: CircleCheck,
      tone: 'border-secondary/40 bg-secondary/10 text-secondary',
    },
    {
      label: 'current streak',
      value: `${streak} days`,
      detail: streak > 0 ? 'Keep the rhythm going' : 'Complete a task to begin',
      icon: Flame,
      tone: 'border-orange/40 bg-orange/10 text-orange',
    },
    {
      label: 'estimated hours completed',
      value: `${estimatedHoursCompleted}h`,
      detail: 'Based on completed modules',
      icon: Hourglass,
      tone: 'border-outline-variant bg-surface-container-high text-on-surface-variant',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 py-5 md:space-y-8 md:py-8">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-5 border-b border-outline-variant pb-6 min-[1000px]:grid-cols-[minmax(0,1fr)_auto] min-[1000px]:items-end"
      >
        <div className="max-w-3xl">
          <p className="font-code text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            {currentTrackLabel}
          </p>
          <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Your learning, at a glance.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
            See your momentum over time, the milestones you have reached, and what remains on your current track.
          </p>
        </div>
        <Button asChild className="w-full justify-center min-[1000px]:w-auto">
          <Link href={currentNode ? `/roadmap/${currentNode.slug}` : '/roadmap'}>
            {currentNode ? 'Continue learning' : 'Review roadmap'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </motion.header>

      <section aria-label="Progress summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-0 items-start gap-3 border border-outline-variant bg-surface-card p-4 sm:p-5">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center border', metric.tone)}>
              <metric.icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-code text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{metric.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-on-surface">{metric.value}</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{metric.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 min-[1180px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <ActivityHeatmap activity={activity} />

        <section aria-labelledby="milestones-heading" className="border border-outline-variant bg-surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="milestones-heading" className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
                <Trophy className="h-5 w-5 text-orange" aria-hidden /> Milestones
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant">Meaningful checkpoints across your roadmap.</p>
            </div>
            <span className="font-code text-xs font-semibold text-on-surface">{unlockedCount}/{milestones.length}</span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {milestones.map((milestone) => (
              <li
                key={milestone.id}
                className={cn(
                  'flex items-start gap-3 border p-3.5',
                  milestone.unlocked
                    ? 'border-orange/40 bg-orange/[0.06]'
                    : 'border-outline-variant bg-surface-container-low/55',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center border',
                    milestone.unlocked
                      ? 'border-orange/50 bg-orange/10 text-on-surface'
                      : 'border-outline-variant text-outline',
                  )}
                >
                  <AppIcon name={milestone.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{milestone.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{milestone.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
