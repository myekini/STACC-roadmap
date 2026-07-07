'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Brain, CircleCheck, Flame, Hourglass, Trophy } from 'lucide-react';
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
  const overallPct = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0;
  const hoursInvested = nodes.filter((n) => progress.completedNodes[n.id]).reduce((sum, n) => sum + n.est_hours, 0);
  const skillsPracticed = nodes.filter((n) => progress.completedNodes[n.id]).reduce((sum, n) => sum + n.skills.length, 0);

  // Next move on the active path (foundations first)
  const railNodes = [...(nodesByPath['foundations'] ?? []), ...(activePath && activePath !== 'foundations' ? nodesByPath[activePath] ?? [] : [])];
  const currentNode = railNodes.find((n) => ['available', 'in_progress'].includes(data.nodeStatus(n.id)));
  const activePathInfo = paths.find((p) => p.id === activePath);

  const foundationsDone =
    (nodesByPath['foundations'] ?? []).length > 0 && (nodesByPath['foundations'] ?? []).every((n) => progress.completedNodes[n.id]);
  const anyPathComplete = paths.some(
    (p) => p.id !== 'foundations' && (nodesByPath[p.id] ?? []).length > 0 && (nodesByPath[p.id] ?? []).every((n) => progress.completedNodes[n.id]),
  );

  const milestones = [
    { id: 'first-module', title: 'First module', description: 'Complete your first module.', icon: 'check_circle', unlocked: completedCount >= 1 },
    { id: 'foundations', title: 'Foundations complete', description: 'Finish the whole Foundations block.', icon: 'terminal', unlocked: foundationsDone },
    { id: 'week-streak', title: '7-day streak', description: 'Learn something seven days in a row.', icon: 'calendar_today', unlocked: streak >= 7 },
    { id: 'path-complete', title: 'Path complete', description: 'Finish a full specialization path.', icon: 'emoji_events', unlocked: anyPathComplete },
  ];
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  const metrics = [
    { label: 'modules complete', value: `${completedCount}/${nodes.length}`, icon: CircleCheck, tone: 'text-secondary border-secondary/40 bg-secondary/10' },
    { label: 'current streak', value: `${streak}d`, icon: Flame, tone: 'text-tertiary border-tertiary/40 bg-tertiary/10' },
    { label: 'hours invested', value: `${hoursInvested}h`, icon: Hourglass, tone: 'text-on-surface-variant border-outline-variant bg-surface-container-low' },
    { label: 'skills practiced', value: String(skillsPracticed), icon: Brain, tone: 'text-cyan border-cyan/40 bg-cyan/10' },
  ];

  return (
    <div className="space-y-6 py-8 md:py-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
      >
        <div>
          <p className="micro-label text-primary-neon">{'// learning progress'}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-4xl">Your progress, clearly.</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">What you have finished, how consistent you are, and what comes next.</p>
        </div>
        <Button asChild>
          <Link href="/roadmap">{currentNode ? `Continue ${currentNode.name}` : 'Review roadmap'}<ArrowRight /></Link>
        </Button>
      </motion.div>

      {/* Overview strip */}
      <section className="overflow-hidden border border-outline-variant bg-surface">
        <div className="flex flex-col justify-between gap-5 border-b border-outline-variant p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="micro-label text-outline">active path</p>
            <h2 className="mt-1 font-display text-xl font-bold text-on-surface">{activePathInfo?.title ?? 'Foundations'}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="micro-label text-outline">overall completion</p>
              <span className="mt-1 inline-block h-1.5 w-36 bg-surface-container-high">
                <span className="block h-full bg-cyan transition-all duration-700" style={{ width: `${overallPct}%` }} />
              </span>
            </div>
            <span className="border-l border-outline-variant pl-4 font-display text-2xl font-bold text-cyan">{overallPct}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant lg:grid-cols-4 lg:divide-y-0">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-3 p-4 sm:p-5">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center border', metric.tone)}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="micro-label text-outline">{metric.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-on-surface">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityHeatmap activity={activity} />
        </div>

        <div className="space-y-6">
          {/* Next move */}
          <div className="border border-cyan/30 bg-gradient-to-br from-cyan/[0.07] to-transparent p-5">
            <p className="micro-label text-cyan">{'// next move'}</p>
            {currentNode ? (
              <>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan/40 bg-cyan/10 text-cyan">
                    <AppIcon name={currentNode.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-on-surface">{currentNode.name}</h3>
                    <p className="mt-0.5 font-code text-[10px] lowercase text-on-surface-variant">{`// ${currentNode.subtitle}`}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-on-surface-variant">{currentNode.description}</p>
                <p className="mt-3 flex items-center gap-1 font-code text-[10px] text-on-surface-variant">
                  <Hourglass className="h-3 w-3" />{currentNode.est_hours}h estimated
                </p>
                <Button asChild size="sm" className="mt-4 w-full"><Link href="/roadmap">Open module<ArrowRight /></Link></Button>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Everything on your current rail is complete. Switch paths on the roadmap to keep going.</p>
            )}
          </div>

          {/* Milestones */}
          <div className="border border-outline-variant bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-on-surface">
                <Trophy className="h-5 w-5 text-tertiary" />
                Milestones
              </h3>
              <span className="font-code text-[10px] font-semibold text-on-surface-variant">{unlockedCount}/{milestones.length}</span>
            </div>
            <ul className="space-y-2">
              {milestones.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    'flex items-center gap-3 border p-3',
                    m.unlocked ? 'border-tertiary/30 bg-tertiary/5' : 'border-outline-variant/60 bg-surface-container-low/50 opacity-55',
                  )}
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center border', m.unlocked ? 'border-tertiary/40 bg-tertiary/10 text-tertiary' : 'border-outline-variant text-outline')}>
                    <AppIcon name={m.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-on-surface">{m.title}</p>
                    <p className="mt-0.5 truncate font-code text-[10px] lowercase text-on-surface-variant">{`// ${m.description.toLowerCase()}`}</p>
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
