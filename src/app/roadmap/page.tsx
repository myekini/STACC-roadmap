'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame, List, Lock, Route, Waypoints } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useUiStore, type TreeView } from '@/store/useUiStore';
import SkillTree from '@/components/roadmap/SkillTree';
import SkillTreeCanvas from '@/components/roadmap/SkillTreeCanvas';
import FieldNotes from '@/components/roadmap/FieldNotes';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const TREE_VIEWS: { id: TreeView; label: string; icon: typeof List }[] = [
  { id: 'canvas', label: 'canvas', icon: Waypoints },
  { id: 'rail', label: 'list', icon: List },
];

export default function RoadmapPage() {
  const data = useUserData();
  const reduceMotion = useReducedMotion();
  const treeRef = useRef<HTMLDivElement | null>(null);
  const { treeView, setTreeView } = useUiStore();
  const { paths, nodes, nodesByPath, progress, activePath, hasSelectedPath, isLoading } = data;

  const specializations = paths.filter((p) => p.id !== 'foundations');
  const pathId = activePath && activePath !== 'foundations' ? activePath : specializations[0]?.id;

  const completedCount = Object.keys(progress.completedNodes).length;
  const overallPct = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0;

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
      {/* Streamlined Command Header Sub-bar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-outline-variant/80 bg-surface/90 shadow-md backdrop-blur-md"
        >
          <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
            {/* Left: Section title & overall progress */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4">
              <h1 className="font-display text-lg font-bold tracking-tight text-on-surface sm:text-xl">
                Skill Tree
              </h1>
              <div className="h-4 w-px bg-outline-variant/60" />
              <div className="flex items-center gap-2">
                <Progress
                  value={overallPct}
                  className="h-1.5 w-16 rounded-none bg-surface-container-high sm:w-24 [&>div]:rounded-none [&>div]:bg-cyan"
                />
                <span className="font-code text-xs font-bold text-cyan">{overallPct}%</span>
              </div>
              <div className="h-4 w-px bg-outline-variant/60" />
              <div className="flex items-center gap-1 font-code text-xs font-bold text-tertiary">
                <Flame className="h-3.5 w-3.5 fill-tertiary" />
                <span>{data.streak}d streak</span>
              </div>
            </div>

            {/* Right: View switcher */}
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-outline">View:</span>
              <div className="flex border border-outline-variant/70 bg-surface-container-low">
                {TREE_VIEWS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTreeView(id)}
                    aria-pressed={treeView === id}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 font-code text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                      treeView === id ? 'bg-cyan/15 text-cyan' : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Path switcher segmented tab bar */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-outline-variant/60 p-2 no-scrollbar bg-surface-container-low/40">
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
                    'flex shrink-0 items-center gap-2 border px-3 py-1.5 font-code text-[10px] font-semibold uppercase tracking-[0.1em] transition-all',
                    active
                      ? 'border-cyan bg-cyan/10 text-cyan shadow-sm'
                      : 'border-outline-variant/40 bg-surface/50 text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
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

      {/* Tree Container — Spacious & Full-Bleed Canvas */}
      <div ref={treeRef} className="relative mt-4">
        <div aria-hidden className="pointer-events-none absolute inset-0 blueprint-grid opacity-50" />
        <div className="relative">
          {isLoading ? (
            <div className="mx-auto max-w-5xl space-y-4 px-4 py-10 sm:px-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse border border-outline-variant/40 bg-surface/50" />
              ))}
            </div>
          ) : (
            pathId && (
              <>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 md:hidden">
                  <SkillTree data={data} pathId={pathId} />
                </div>
                <div className="hidden md:block">
                  {treeView === 'canvas' ? (
                    <SkillTreeCanvas data={data} pathId={pathId} />
                  ) : (
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
                      <SkillTree data={data} pathId={pathId} variant="spine" />
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>

      <FieldNotes data={data} watchRef={treeRef} />
    </div>
  );
}
