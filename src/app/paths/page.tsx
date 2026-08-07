'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, Hourglass, Lock } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppIcon } from '@/components/ui/app-icon';
import { cn } from '@/lib/utils';

const PATH_META: Record<string, { outcome: string; level: string; project: string; accent: string }> = {
  da: { outcome: 'Turn messy data into decisions', level: 'Beginner friendly', project: 'Business insights dashboard', accent: 'border-cyan/40 bg-cyan/10 text-cyan' },
  de: { outcome: 'Build reliable data systems', level: 'Intermediate', project: 'Production data pipeline', accent: 'border-secondary/40 bg-secondary/10 text-secondary' },
  ds: { outcome: 'Model, test, and explain predictions', level: 'Intermediate', project: 'Predictive research project', accent: 'border-tertiary/40 bg-tertiary/10 text-tertiary' },
  'ai-engineering': { outcome: 'Build useful AI products', level: 'Advanced track', project: 'RAG-powered assistant', accent: 'border-primary/40 bg-primary/10 text-primary-neon' },
  mlops: { outcome: 'Ship and monitor ML systems', level: 'Advanced track', project: 'Automated ML platform', accent: 'border-outline-variant bg-surface-container-high text-on-surface-variant' },
};

export default function PathSelectionPage() {
  const data = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { paths, nodesByPath, progress, activePath, hasSelectedPath } = data;
  const specializations = paths.filter((p) => p.id !== 'foundations');

  const handlePathSelect = async (pathId: string) => {
    await data.selectPath(pathId);
    router.push('/roadmap');
  };

  return (
    <div className="py-8 md:py-12">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
          What do you want to build?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          Pick the work you want to do. Every path starts from the same Foundations block — and you can switch later without losing progress.
        </p>
      </header>

      {!hasSelectedPath && (
        <section className="mb-8 grid gap-5 border border-cyan/20 bg-cyan/[0.04] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center bg-primary text-white"><Compass className="h-5 w-5" /></div>
          <div>
            <p className="font-display text-base font-semibold text-on-surface">Not sure where to begin?</p>
            <p className="mt-1 text-sm text-on-surface-variant">Data Analysis is the friendliest on-ramp and produces portfolio work fastest.</p>
          </div>
          <Button variant="outline" onClick={() => handlePathSelect('da')}>Start with analysis</Button>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {specializations.map((path, index) => {
          const isActive = hasSelectedPath && activePath === path.id;
          const meta = PATH_META[path.id] ?? PATH_META.da;
          const pathNodes = nodesByPath[path.id] ?? [];
          const done = pathNodes.filter((n) => progress.completedNodes[n.id]).length;
          const estHours = pathNodes.reduce((sum, n) => sum + n.est_hours, 0);
          const locked = !data.pathUnlocked(path.id);
          const gateTitles = path.requires_paths
            .map((id) => paths.find((p) => p.id === id)?.title)
            .filter(Boolean)
            .join(' + ');

          return (
            <motion.article
              key={path.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(0.2, index * 0.05) }}
              className={cn(
                'group relative flex h-full flex-col border bg-surface p-5 transition-all sm:p-6',
                isActive ? 'border-primary ring-1 ring-primary/15' : 'border-outline-variant',
                locked ? 'border-outline-variant/60 bg-surface/60' : 'hover:-translate-y-0.5 hover:border-cyan/35 hover:shadow-[0_16px_50px_rgba(0,0,0,0.35)]',
              )}
            >
              {isActive && (
                <Badge variant="success" className="absolute -top-2.5 right-5 gap-1 shadow-sm z-10">
                  <CheckCircle2 className="h-3 w-3" /> current path
                </Badge>
              )}
              {locked && (
                <span className="absolute -top-2.5 right-5 z-10 inline-flex items-center gap-1.5 border border-warning/40 bg-surface-container-high px-2.5 py-1 font-code text-[10px] font-bold uppercase tracking-[0.12em] text-warning shadow-md">
                  <Lock className="h-3 w-3 text-warning" /> unlocks after {gateTitles}
                </span>
              )}

              {/* Main Content — blurred/dimmed when locked per Udacity/Coursera design */}
              <div className={cn('flex flex-col flex-1', locked && 'card-locked-blur')}>
                <div className="flex items-start gap-4">
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center border', meta.accent)}>
                    <AppIcon name={path.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-on-surface">{path.title}</h2>
                    <p className="mt-1 text-xs font-medium text-cyan">{meta.outcome}</p>
                  </div>
                </div>

                <p className="mt-5 flex-grow text-sm leading-6 text-on-surface-variant">{path.description}</p>

                <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-outline-variant py-4 text-xs">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-outline">Est. Time</dt>
                    <dd className="mt-1 flex items-center gap-1 font-semibold text-on-surface"><Hourglass className="h-3 w-3 text-outline" />{estHours}h</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-outline">Level</dt>
                    <dd className="mt-1 font-semibold text-on-surface">{meta.level}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-outline">Modules</dt>
                    <dd className="mt-1 font-semibold text-on-surface">
                      {done > 0 ? `${done}/${pathNodes.length}` : pathNodes.length}
                    </dd>
                  </div>
                </dl>

                {done > 0 && (
                  <Progress
                    value={pathNodes.length ? (done / pathNodes.length) * 100 : 0}
                    className="mt-4 h-1 w-full rounded-none bg-surface-container-high [&>div]:rounded-none [&>div]:bg-cyan"
                  />
                )}

                <div className="mt-4 border border-outline-variant/60 bg-surface-container-low p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">Portfolio Project</p>
                  <p className="mt-1 text-sm font-medium text-on-surface">{meta.project}</p>
                </div>
              </div>

              {locked && (
                <div className="mt-4 border border-warning/30 bg-warning/[0.06] p-3 flex items-start gap-2.5 text-xs">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                  <p className="text-[11px] text-on-surface-variant leading-4">
                    Finish <span className="font-semibold text-warning">{gateTitles}</span> to unlock this track.
                  </p>
                </div>
              )}

              <Button
                onClick={() => handlePathSelect(path.id)}
                variant={isActive ? 'default' : locked ? 'outline' : 'outline'}
                className={cn('mt-5 w-full', locked && 'border-outline-variant text-outline hover:bg-transparent hover:text-outline cursor-not-allowed')}
                disabled={locked}
              >
                {isActive ? 'Open roadmap' : locked ? `Locked — Finish ${gateTitles}` : 'Choose this path'}
                {!locked && <ArrowRight className="transition-transform group-hover:translate-x-0.5" />}
              </Button>
            </motion.article>
          );
        })}
      </div>

    </div>
  );
}
