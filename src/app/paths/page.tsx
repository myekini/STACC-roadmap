'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Layers, Lock, Route, Target } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PAUSED_PATH_IDS } from '@/config/roadmap';
import type { PathRow } from '@/lib/database.types';
import { PageFrame, PageHeader } from '@/components/ui/page-layout';

function TrackFocus({ paths, onFound }: { paths: PathRow[]; onFound: (pathId: string) => void }) {
  const track = useSearchParams().get('track');

  useEffect(() => {
    if (track && paths.some((path) => path.id === track)) onFound(track);
  }, [track, paths, onFound]);

  return null;
}

export default function PathSelectionPage() {
  const data = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [focusedTrack, setFocusedTrack] = useState<string | null>(null);
  const {
    paths,
    nodesByPath,
    progress,
    activePath,
    hasSelectedPath,
    isAuthenticated,
    isSupabaseConnected,
    signInWithGithub,
  } = data;

  const foundations = paths.find((path) => path.id === 'foundations');
  const foundationNodes = nodesByPath.foundations ?? [];
  const foundationsDone = foundationNodes.filter((node) => progress.completedNodes[node.id]).length;
  const foundationsPct = foundationNodes.length
    ? Math.round((foundationsDone / foundationNodes.length) * 100)
    : 0;

  const specializations = useMemo(() => paths.filter((path) => path.id !== 'foundations'), [paths]);
  const orderedPaths = useMemo(() => {
    if (!focusedTrack) return specializations;
    return [...specializations].sort((a, b) => {
      if (a.id === focusedTrack) return -1;
      if (b.id === focusedTrack) return 1;
      return a.order - b.order;
    });
  }, [focusedTrack, specializations]);

  const availablePaths = orderedPaths.filter((path) => data.pathUnlocked(path.id));
  const futurePaths = orderedPaths.filter((path) => !data.pathUnlocked(path.id));

  const handlePathSelect = async (pathId: string) => {
    if (isSupabaseConnected && !isAuthenticated) {
      await signInWithGithub();
      return;
    }
    await data.selectPath(pathId);
    router.push('/roadmap');
  };

  const renderPathCard = (path: PathRow, index: number, locked: boolean) => {
    const isActive = hasSelectedPath && activePath === path.id;
    const isFocused = focusedTrack === path.id;
    const pathNodes = nodesByPath[path.id] ?? [];
    const done = pathNodes.filter((node) => progress.completedNodes[node.id]).length;
    const estHours = pathNodes.reduce((sum, node) => sum + node.est_hours, 0);
    const gateTitles = path.requires_paths
      .map((id) => paths.find((candidate) => candidate.id === id)?.title)
      .filter(Boolean)
      .join(' + ');
    const isPaused = PAUSED_PATH_IDS.has(path.id);

    return (
      <motion.article
        key={path.id}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: reduceMotion ? 0 : Math.min(0.1, index * 0.04) }}
        className={cn(
          'group flex min-w-0 flex-col border bg-surface-card p-4 transition-colors sm:p-5',
          isActive || isFocused ? 'border-cyan ring-1 ring-cyan/30' : 'border-outline-variant',
          locked ? 'bg-surface-container-low/55' : 'hover:border-cyan/55',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold leading-6 text-on-surface sm:text-xl">{path.title}</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{path.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {isActive && (
              <Badge variant="success" className="px-2 py-1">
                <CheckCircle2 className="h-3 w-3" /> Active
              </Badge>
            )}
            {locked && (
              <Badge variant="outline" className="border-warning/45 bg-warning/10 px-2 py-1 text-on-surface">
                <Lock className="h-3 w-3" /> Later
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-outline-variant/70 py-3 font-code text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan" aria-hidden /> {estHours} hours
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan" aria-hidden /> {pathNodes.length} modules
          </span>
          {path.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="border border-outline-variant bg-surface-container-high px-2 py-1 font-code text-xs text-on-surface-variant">
              {tag}
            </span>
          ))}
        </div>

        {locked ? (
          <div className="mt-4 flex flex-1 flex-col justify-end">
            <p className="text-sm leading-6 text-on-surface-variant">
              {isPaused ? (
                <>This advanced path is paused while we strengthen and validate the core career paths.</>
              ) : (
                <>Complete <strong className="font-semibold text-on-surface">{gateTitles}</strong> to unlock this path.</>
              )}
            </p>
            <Button disabled className="mt-4 w-full justify-center border border-outline-variant bg-surface text-outline">
              {isPaused ? 'Coming later' : 'Locked'}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-1 flex-col justify-end">
            {done > 0 && (
              <div className="mb-4 space-y-1.5">
                <div className="flex justify-between font-code text-xs text-on-surface-variant">
                  <span>Path progress</span>
                  <span className="font-semibold text-on-surface">{done}/{pathNodes.length}</span>
                </div>
                <Progress
                  value={pathNodes.length ? (done / pathNodes.length) * 100 : 0}
                  className="h-1.5 bg-surface-container-high [&>div]:bg-cyan"
                />
              </div>
            )}
            <Button
              onClick={() => handlePathSelect(path.id)}
              className="w-full justify-center"
            >
              {isSupabaseConnected && !isAuthenticated
                ? 'Sign in to start'
                : isActive
                  ? 'Continue path'
                  : 'Choose path'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
      </motion.article>
    );
  };

  return (
    <PageFrame>
      <Suspense fallback={null}>
        <TrackFocus paths={paths} onFound={setFocusedTrack} />
      </Suspense>

      <PageHeader
        context="Explore paths"
        title="Choose what you want to ship next."
        description="Finish the shared foundations, then build one cumulative portfolio project through your specialization."
        action={(
          <div className="flex items-center gap-2 font-code text-xs text-on-surface-variant">
            <Target className="h-4 w-4 text-cyan" aria-hidden />
            {availablePaths.length} available now · {futurePaths.length} unlock later
          </div>
        )}
      />

      <section aria-labelledby="foundations-heading" className="grid gap-4 border border-outline-variant bg-surface-card p-4 sm:p-5 min-[1050px]:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] min-[1050px]:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan/40 bg-cyan/10 text-cyan">
            <Route className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="foundations-heading" className="font-display text-base font-bold text-on-surface">
                {foundations?.title ?? 'Foundations'}
              </h2>
              {foundationsPct === 100 && <Badge variant="success">Complete</Badge>}
            </div>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              The shared starting point for every specialization. Your progress carries into whichever path you choose.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between font-code text-xs text-on-surface-variant">
            <span>{foundationsDone} of {foundationNodes.length} modules</span>
            <span className="font-semibold text-on-surface">{foundationsPct}%</span>
          </div>
          <Progress value={foundationsPct} className="h-2 bg-surface-container-high [&>div]:bg-cyan" />
        </div>
      </section>

      <section aria-labelledby="available-heading" className="space-y-4">
        <div>
          <h2 id="available-heading" className="font-display text-xl font-bold text-on-surface">Available now</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Choose a specialization and start building toward one portfolio project.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2 min-[1600px]:grid-cols-3">
          {availablePaths.map((path, index) => renderPathCard(path, index, false))}
        </div>
      </section>

      {futurePaths.length > 0 && (
        <section aria-labelledby="future-heading" className="space-y-4 border-t border-outline-variant pt-7">
          <div className="max-w-2xl">
            <h2 id="future-heading" className="font-display text-xl font-bold text-on-surface">Unlock later</h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Advanced paths combine Data Engineering and Data Science. They will open automatically when both are complete.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-2">
            {futurePaths.map((path, index) => renderPathCard(path, index, true))}
          </div>
        </section>
      )}
    </PageFrame>
  );
}
