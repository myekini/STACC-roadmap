'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleCheck,
  Flame,
  Hourglass,
  Play,
  Trophy,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import ActivityHeatmap from '@/components/progress/ActivityHeatmap';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const hoursInvested = nodes.filter((n) => progress.completedNodes[n.id]).reduce((sum, n) => sum + n.est_hours, 0);
  const skillsPracticed = nodes.filter((n) => progress.completedNodes[n.id]).reduce((sum, n) => sum + n.skills.length, 0);

  // Next move on the active path (foundations first)
  const railNodes = [
    ...(nodesByPath['foundations'] ?? []),
    ...(activePath && activePath !== 'foundations' ? nodesByPath[activePath] ?? [] : []),
  ];
  const currentNode = railNodes.find((n) => ['available', 'in_progress'].includes(data.nodeStatus(n.id)));
  const activePathInfo = paths.find((p) => p.id === activePath);

  const foundationsDone =
    (nodesByPath['foundations'] ?? []).length > 0 &&
    (nodesByPath['foundations'] ?? []).every((n) => progress.completedNodes[n.id]);

  // "Track" here means whatever the learner is actually working through right
  // now — Foundations until it's done, then their chosen specialization.
  // `nodes`/`completedCount` above cover the *entire* curriculum (all 6
  // paths); using that for a metric labelled "Track Progress" understates
  // progress badly (e.g. finishing Foundations reads as ~16% of 38 modules
  // instead of 100% of the 6 modules actually done).
  const currentTrackLabel = foundationsDone ? activePathInfo?.title ?? 'Roadmap' : 'Foundations';
  const currentTrackNodes = foundationsDone ? nodesByPath[activePath ?? ''] ?? [] : nodesByPath['foundations'] ?? [];
  const trackCompletedCount = currentTrackNodes.filter((n) => progress.completedNodes[n.id]).length;
  const trackPct = currentTrackNodes.length ? Math.round((trackCompletedCount / currentTrackNodes.length) * 100) : 0;

  // Module list widget: incomplete nodes first so it always surfaces what's
  // actually next, instead of always showing Foundations' first 5 modules
  // regardless of how far the learner has actually gotten.
  const railNodesToShow = [...railNodes]
    .sort((a, b) => Number(Boolean(progress.completedNodes[a.id])) - Number(Boolean(progress.completedNodes[b.id])))
    .slice(0, 5);

  const anyPathComplete = paths.some(
    (p) =>
      p.id !== 'foundations' &&
      (nodesByPath[p.id] ?? []).length > 0 &&
      (nodesByPath[p.id] ?? []).every((n) => progress.completedNodes[n.id]),
  );

  const milestones = [
    { id: 'first-module', title: 'First module', description: 'Complete your first module.', icon: 'check_circle', unlocked: completedCount >= 1 },
    { id: 'foundations', title: 'Foundations complete', description: 'Finish the whole Foundations block.', icon: 'terminal', unlocked: foundationsDone },
    { id: 'week-streak', title: '7-day streak', description: 'Learn something seven days in a row.', icon: 'calendar_today', unlocked: streak >= 7 },
    { id: 'path-complete', title: 'Path complete', description: 'Finish a full specialization path.', icon: 'emoji_events', unlocked: anyPathComplete },
  ];
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const metrics = [
    { label: 'modules complete', value: `${trackCompletedCount}/${currentTrackNodes.length}`, icon: CircleCheck, tone: 'text-secondary border-secondary/40 bg-secondary/10' },
    { label: 'current streak', value: `${streak} days`, icon: Flame, tone: 'text-orange border-orange/40 bg-orange/10' },
    { label: 'hours invested', value: `${hoursInvested}h`, icon: Hourglass, tone: 'text-on-surface-variant border-outline-variant bg-surface-card' },
    { label: 'skills practiced', value: String(skillsPracticed), icon: Brain, tone: 'text-cyan border-cyan/40 bg-cyan/10' },
  ];

  return (
    <div className="space-y-8 py-6 md:py-10 max-w-7xl mx-auto px-4">
      {/* ── Theme-aware progress hero ── */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-none border border-cyan/25 bg-gradient-to-r from-surface-card via-surface-container-low to-surface-container-high p-6 md:p-8 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 font-code text-xs">
              <span className="rounded-none bg-cyan/20 px-3 py-0.5 font-bold text-cyan uppercase tracking-wider">
                Active Track
              </span>
              <span className="text-outline">·</span>
              <span className="font-semibold text-on-surface">{currentTrackLabel}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-on-surface tracking-tight">
              {currentNode ? `Resume: ${currentNode.name}` : 'Roadmap Overview'}
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-6 line-clamp-2">
              {currentNode?.subtitle ?? 'Keep pushing forward. Every completed module moves you closer to job-ready deliverables.'}
            </p>

            {/* Track Progress Bar */}
            <div className="pt-2 max-w-md space-y-1.5 font-code text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Overall Track Progress</span>
                <span className="font-bold text-cyan">{trackPct}%</span>
              </div>
              <Progress value={trackPct} className="h-2 bg-surface-container-high [&>div]:bg-cyan" />
            </div>
          </div>

          {/* Single Unified Primary CTA Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0">
            <Button asChild size="lg" className="rounded-none bg-cyan text-navy font-bold font-code text-xs uppercase tracking-wider hover:bg-cyan/90 shadow-lg px-8 py-3.5 gap-2">
              <Link href={currentNode ? `/roadmap/${currentNode.slug}` : '/roadmap'}>
                <Play className="h-4 w-4 fill-navy" />
                {currentNode ? 'Resume Learning' : 'Review Roadmap'}
              </Link>
            </Button>

            <Link href="/paths" className="font-code text-xs text-on-surface-variant hover:text-cyan text-center">
              Switch Track ↗
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── Key Metrics Grid ── */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-3.5 rounded-none border border-outline-variant/80 bg-surface-card p-4 shadow-sm">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-none border', metric.tone)}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-code text-[10px] font-bold uppercase tracking-wider text-on-surface-variant truncate">{metric.label}</p>
              <p className="mt-0.5 font-display text-xl font-bold text-on-surface">{metric.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── De-Duplicated Main Bento Grid ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Activity & Next Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* GitHub Style Activity Heatmap */}
          <div className="rounded-none border border-outline-variant/80 bg-surface-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-on-surface mb-4">Learning Activity</h3>
            <ActivityHeatmap activity={activity} />
          </div>

          {/* Current Track Module List Breakdown */}
          <div className="rounded-none border border-outline-variant/80 bg-surface-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-on-surface">Track Modules</h3>
              <Link href="/roadmap" className="font-code text-xs text-cyan hover:underline flex items-center gap-1">
                View Full Skill Tree <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {railNodesToShow.map((node) => {
                const nodeStatus = data.nodeStatus(node.id);
                const isDone = nodeStatus === 'complete';
                const isAvailable = nodeStatus === 'available' || nodeStatus === 'in_progress';

                return (
                  <div
                    key={node.id}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-none border text-xs transition-all',
                      isDone
                        ? 'border-secondary/30 bg-secondary/[0.05] text-on-surface'
                        : isAvailable
                          ? 'border-cyan/40 bg-cyan/[0.05] text-on-surface'
                          : 'border-outline-variant/40 bg-surface/40 text-on-surface-variant opacity-60',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-none border font-bold text-xs',
                        isDone ? 'border-secondary bg-secondary text-white' : isAvailable ? 'border-cyan bg-cyan/20 text-cyan' : 'border-outline-variant text-outline',
                      )}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <AppIcon name={node.icon} className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate">{node.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{node.subtitle}</p>
                      </div>
                    </div>

                    {isAvailable && !isDone && (
                      <Button asChild size="sm" className="rounded-none font-code text-xs">
                        <Link href={`/roadmap/${node.slug}`}>Open</Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Milestones */}
        <div className="space-y-8">
          <div className="rounded-none border border-outline-variant/80 bg-surface-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-on-surface">
                <Trophy className="h-5 w-5 text-orange" />
                Milestones
              </h3>
              <span className="font-code text-xs font-bold text-cyan">{unlockedCount}/{milestones.length}</span>
            </div>

            <ul className="space-y-2.5">
              {milestones.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    'flex items-center gap-3 rounded-none border p-3.5 transition-all',
                    m.unlocked
                      ? 'border-orange/40 bg-orange/[0.06]'
                      : 'border-outline-variant/60 bg-surface/50 opacity-60',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-none border',
                      m.unlocked ? 'border-orange bg-orange/15 text-orange' : 'border-outline-variant text-outline',
                    )}
                  >
                    <AppIcon name={m.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface">{m.title}</p>
                    <p className="mt-0.5 truncate text-[10px] text-on-surface-variant">{m.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
