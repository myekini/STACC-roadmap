'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame, Lock, Route } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import SkillTree from '@/components/roadmap/SkillTree';
import NodeSheet from '@/components/roadmap/NodeSheet';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const data = useUserData();
  const reduceMotion = useReducedMotion();
  const { paths, nodes, nodesByPath, progress, activePath, hasSelectedPath, isLoading } = data;

  const specializations = paths.filter((p) => p.id !== 'foundations');
  const pathId = activePath && activePath !== 'foundations' ? activePath : specializations[0]?.id;

  const completedCount = Object.keys(progress.completedNodes).length;
  const overallPct = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0;

  if (!isLoading && !hasSelectedPath) {
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
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
      {/* Command header */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-outline-variant bg-surface/80 backdrop-blur"
      >
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="micro-label text-cyan">{`// roadmap · all systems`}</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-on-surface sm:text-3xl">
              Your skill tree
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <p className="micro-label text-outline">overall</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block h-1.5 w-28 bg-surface-container-high">
                  <span className="block h-full bg-cyan transition-all duration-700" style={{ width: `${overallPct}%` }} />
                </span>
                <span className="font-code text-sm font-bold text-cyan">{overallPct}%</span>
              </div>
            </div>
            <div className="border-l border-outline-variant pl-5">
              <p className="micro-label text-outline">streak</p>
              <p className="mt-1 flex items-center gap-1 font-code text-sm font-bold text-tertiary">
                <Flame className="h-3.5 w-3.5" />{data.streak}d
              </p>
            </div>
          </div>
        </div>

        {/* Path switcher */}
        <div className="flex gap-1 overflow-x-auto border-t border-outline-variant p-2 no-scrollbar">
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
                  'flex shrink-0 items-center gap-2 border px-3 py-2 font-code text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                  active
                    ? 'border-cyan/50 bg-cyan/10 text-cyan'
                    : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
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

      {/* Tree */}
      <div className="relative mt-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 blueprint-grid opacity-50" />
        <div className="relative">
          {isLoading ? (
            <div className="space-y-4 py-10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse border border-outline-variant/40 bg-surface/50" />
              ))}
            </div>
          ) : (
            pathId && <SkillTree data={data} pathId={pathId} />
          )}
        </div>
      </div>

      <NodeSheet data={data} />
    </div>
  );
}
