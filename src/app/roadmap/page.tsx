'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lock, Route } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import SkillTree from '@/components/roadmap/SkillTree';
import { GithubStatusToast } from '@/components/roadmap/GithubStatusToast';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CardListSkeleton } from '@/components/ui/loading-skeletons';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const data = useUserData();
  const reduceMotion = useReducedMotion();
  const { paths, nodesByPath, progress, activePath, hasSelectedPath, isLoading } = data;

  const specializations = paths.filter((p) => p.id !== 'foundations');
  const pathId = activePath && activePath !== 'foundations' ? activePath : specializations[0]?.id;

  // Scoped to exactly what's rendered below (Foundations + the selected
  // track) rather than every module across all 6 paths — an unlabeled,
  // curriculum-wide % here never matched the per-tab or in-tree numbers
  // sitting right next to it.
  const visibleNodes = [...(nodesByPath['foundations'] ?? []), ...(pathId ? nodesByPath[pathId] ?? [] : [])];
  const visibleDone = visibleNodes.filter((n) => progress.completedNodes[n.id]).length;
  const trackPct = visibleNodes.length ? Math.round((visibleDone / visibleNodes.length) * 100) : 0;

  if (!isLoading && !hasSelectedPath && !data.isAdmin) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-5">
        <div className="max-w-md border border-outline-variant bg-surface/70 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-primary/40 bg-primary/10 text-primary-neon">
            <Route className="h-6 w-6" />
          </div>
          <p className="micro-label mt-5 text-outline">no active path</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">Choose your direction first</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Your roadmap is built around the role you want. Pick a path now — you can switch later without losing progress.
          </p>
          <Button asChild className="mt-6"><Link href="/paths">Explore paths <ArrowRight /></Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 pt-3 md:pb-6">
      <Suspense fallback={null}>
        <GithubStatusToast />
      </Suspense>
      {/* Course navigation */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border-b border-outline-variant bg-background"
        >
          <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
            {/* Left: Section title & overall progress */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4">
              <h1 className="font-display text-lg font-bold tracking-tight text-on-surface sm:text-xl">
                Your roadmap
              </h1>
              <div className="h-4 w-px bg-outline-variant/60" />
              <div className="flex items-center gap-2">
                <span className="hidden font-code text-xs uppercase tracking-[0.08em] text-outline sm:inline">This track</span>
                <Progress
                  value={trackPct}
                  className="h-1.5 w-16 rounded-none bg-surface-container-high sm:w-24 [&>div]:rounded-none [&>div]:bg-cyan"
                />
                <span className="font-code text-xs font-bold text-cyan">{trackPct}%</span>
              </div>
            </div>
          </div>

          {/* Path switcher segmented tab bar */}
          <div className="flex gap-1 overflow-x-auto border-t border-outline-variant/60 py-2 no-scrollbar">
            {specializations.map((path) => {
              const pathNodes = nodesByPath[path.id] ?? [];
              const done = pathNodes.filter((n) => progress.completedNodes[n.id]).length;
              const locked = !data.pathUnlocked(path.id);
              const active = path.id === pathId;
              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => data.selectPath(path.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors',
                    active
                      ? 'bg-cyan/10 text-cyan'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                  )}
                >
                  {locked ? <Lock className="h-3 w-3 text-outline" /> : <AppIcon name={path.icon} className="h-3.5 w-3.5" />}
                  {path.title}
                  <span className={cn('font-bold', done === pathNodes.length && pathNodes.length > 0 ? 'text-secondary' : 'text-outline')}>
                    {done}/{pathNodes.length}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.header>
      </div>

      <div className="relative mt-4">
        <div className="relative">
          {isLoading ? (
            <CardListSkeleton count={3} className="mx-auto max-w-5xl grid-cols-1 px-4 py-10 sm:px-6" />
          ) : (
            pathId && (
              <>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:hidden">
                  <SkillTree data={data} pathId={pathId} />
                </div>
                <div className="mx-auto hidden max-w-5xl px-4 py-6 sm:px-6 lg:block">
                  <SkillTree data={data} pathId={pathId} variant="spine" />
                </div>
              </>
            )
          )}
        </div>
      </div>

    </div>
  );
}
