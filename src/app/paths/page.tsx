'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, Hourglass, Layers, Lock, Sparkles } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppIcon } from '@/components/ui/app-icon';
import { cn } from '@/lib/utils';

const PATH_META: Record<
  string,
  { outcome: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; project: string; accent: string }
> = {
  da: {
    outcome: 'Turn raw data into business intelligence and clear executive dashboards',
    level: 'Beginner',
    project: 'Business Insights Dashboard',
    accent: 'border-cyan/40 bg-cyan/10 text-cyan',
  },
  de: {
    outcome: 'Design scalable data pipelines, automated ETL workflows, and lakehouses',
    level: 'Intermediate',
    project: 'Production Data Pipeline',
    accent: 'border-secondary/40 bg-secondary/10 text-secondary',
  },
  ds: {
    outcome: 'Build statistical models, conduct hypothesis tests, and interpret predictions',
    level: 'Intermediate',
    project: 'Predictive ML Research',
    accent: 'border-tertiary/40 bg-tertiary/10 text-tertiary',
  },
  'ai-engineering': {
    outcome: 'Engineer production RAG apps, fine-tune LLMs, and deploy AI services',
    level: 'Advanced',
    project: 'RAG Assistant System',
    accent: 'border-primary/40 bg-primary/10 text-primary-neon',
  },
  mlops: {
    outcome: 'Automate model training, monitor drift, and manage ML infrastructure',
    level: 'Advanced',
    project: 'Automated ML Ops Platform',
    accent: 'border-outline-variant bg-surface-container-high text-on-surface-variant',
  },
};

type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';

export default function PathSelectionPage() {
  const data = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const { paths, nodesByPath, progress, activePath, hasSelectedPath } = data;

  const specializations = paths.filter((p) => p.id !== 'foundations');

  const filteredPaths = specializations.filter((p) => {
    if (selectedLevel === 'all') return true;
    const meta = PATH_META[p.id];
    return meta?.level === selectedLevel;
  });

  const handlePathSelect = async (pathId: string) => {
    await data.selectPath(pathId);
    router.push('/roadmap');
  };

  return (
    <div className="py-6 md:py-10 max-w-6xl mx-auto px-4">
      {/* ── Modern Hero Header ── */}
      <header className="mb-10 text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan text-xs font-code tracking-wider px-3 py-1">
          Career Track Navigator
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">
          Choose Your Direction
        </h1>

        <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
          Outcome-first roadmaps designed for real engineering work. Pick a track to unlock your skill tree — switch anytime without losing progress.
        </p>

        {/* Level Filter Tabs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={cn(
                'px-3.5 py-1.5 font-code text-xs font-semibold uppercase tracking-[0.1em] border transition-all',
                selectedLevel === level
                  ? 'border-cyan bg-cyan/15 text-cyan shadow-sm'
                  : 'border-outline-variant/60 bg-surface/60 text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
              )}
            >
              {level === 'all' ? 'All Tracks' : `${level} Level`}
            </button>
          ))}
        </div>
      </header>

      {/* ── Recommended Quick-Start Callout (When no path selected) ── */}
      {!hasSelectedPath && (
        <div className="mb-8 border border-cyan/30 bg-cyan/[0.05] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan/40 bg-cyan/15 text-cyan">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-on-surface">New to Data Careers?</p>
              <p className="text-xs text-on-surface-variant">Data Analysis offers the fastest feedback loop and quickest portfolio win.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => handlePathSelect('da')} className="gap-1.5 shrink-0">
            Start with Analysis <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── Track Grid ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredPaths.map((path, index) => {
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
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(0.15, index * 0.05) }}
              className={cn(
                'group relative flex flex-col justify-between border bg-surface/90 p-5 transition-all sm:p-6',
                isActive
                  ? 'border-cyan ring-1 ring-cyan/30 shadow-[0_0_25px_rgba(0,217,255,0.08)]'
                  : 'border-outline-variant/80',
                locked
                  ? 'bg-surface/50 opacity-80'
                  : 'hover:-translate-y-0.5 hover:border-cyan/50 hover:shadow-xl',
              )}
            >
              {/* Top Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center border', meta.accent)}>
                      <AppIcon name={path.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-on-surface group-hover:text-cyan transition-colors">
                        {path.title}
                      </h2>
                      <span className="font-code text-[10px] font-semibold uppercase tracking-wider text-outline">
                        {meta.level} Track
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <Badge variant="success" className="gap-1 rounded-none px-2 py-0.5 font-code text-[10px] uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  )}

                  {locked && (
                    <Badge variant="outline" className="gap-1 rounded-none border-warning/40 bg-warning/10 text-warning px-2 py-0.5 font-code text-[10px] uppercase tracking-wider">
                      <Lock className="h-3 w-3" /> Locked
                    </Badge>
                  )}
                </div>

                {/* Outcome Statement */}
                <p className="mt-4 text-xs font-medium text-cyan leading-5">{meta.outcome}</p>

                {/* Description */}
                <p className="mt-2 text-xs leading-5 text-on-surface-variant line-clamp-3">
                  {path.description}
                </p>
              </div>

              {/* Card Footer Section */}
              <div className="mt-6 pt-4 border-t border-outline-variant/60 space-y-4">
                {/* Modern Pill Metrics Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 font-code text-[11px] text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <Hourglass className="h-3.5 w-3.5 text-outline" /> {estHours}h est
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-outline" /> {pathNodes.length} modules
                  </span>
                  <span className="inline-flex items-center gap-1 text-on-surface font-semibold">
                    <Compass className="h-3.5 w-3.5 text-cyan" /> {meta.project}
                  </span>
                </div>

                {/* Progress bar if user has completed nodes in this track */}
                {done > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between font-code text-[10px] text-on-surface-variant">
                      <span>Track Progress</span>
                      <span className="font-bold text-cyan">{done}/{pathNodes.length} completed</span>
                    </div>
                    <Progress
                      value={pathNodes.length ? (done / pathNodes.length) * 100 : 0}
                      className="h-1.5 rounded-none bg-surface-container-high [&>div]:rounded-none [&>div]:bg-cyan"
                    />
                  </div>
                )}

                {/* Main Action Button */}
                <Button
                  onClick={() => handlePathSelect(path.id)}
                  variant={isActive ? 'default' : locked ? 'outline' : 'outline'}
                  disabled={locked}
                  className={cn(
                    'w-full justify-between font-code text-xs uppercase tracking-[0.1em] rounded-none py-2.5',
                    isActive
                      ? 'bg-cyan text-navy hover:bg-cyan/90 font-bold'
                      : locked
                        ? 'border-outline-variant/60 text-outline cursor-not-allowed opacity-70'
                        : 'border-cyan/40 text-on-surface hover:border-cyan hover:bg-cyan/10 hover:text-cyan',
                  )}
                >
                  {isActive ? (
                    <>
                      <span>▸ Continue Roadmap</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : locked ? (
                    <span>Requires {gateTitles}</span>
                  ) : (
                    <>
                      <span>Select Track</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

