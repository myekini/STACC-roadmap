'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, Hourglass, Lock } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <span className="micro-label text-cyan">{'// choose your direction'}</span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
          What do you want to become good at?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          Choose by the work you want to do. Every path starts from the same Foundations block, and you can switch
          later without losing progress.
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
                locked ? 'opacity-80' : 'hover:-translate-y-0.5 hover:border-cyan/35 hover:shadow-[0_16px_50px_rgba(0,0,0,0.35)]',
              )}
            >
              {isActive && (
                <Badge variant="success" className="absolute -top-2.5 right-5 gap-1 shadow-sm">
                  <CheckCircle2 className="h-3 w-3" /> current path
                </Badge>
              )}
              {locked && (
                <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 border border-outline-variant bg-navy px-2 py-0.5 font-code text-[10px] font-semibold uppercase tracking-[0.12em] text-outline">
                  <Lock className="h-3 w-3" /> unlocks after {gateTitles}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center border', meta.accent)}>
                  <AppIcon name={path.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-on-surface">{path.title}</h2>
                  <p className="mt-1 font-code text-[11px] lowercase text-cyan">{`// ${meta.outcome.toLowerCase()}`}</p>
                </div>
              </div>

              <p className="mt-5 flex-grow text-sm leading-6 text-on-surface-variant">{path.description}</p>

              <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-outline-variant py-4 text-xs">
                <div>
                  <dt className="micro-label text-outline">est time</dt>
                  <dd className="mt-1 flex items-center gap-1 font-code font-semibold text-on-surface"><Hourglass className="h-3 w-3 text-outline" />{estHours}h</dd>
                </div>
                <div>
                  <dt className="micro-label text-outline">level</dt>
                  <dd className="mt-1 font-semibold text-on-surface">{meta.level}</dd>
                </div>
                <div>
                  <dt className="micro-label text-outline">modules</dt>
                  <dd className="mt-1 font-code font-semibold text-on-surface">
                    {done > 0 ? `${done}/${pathNodes.length}` : pathNodes.length}
                  </dd>
                </div>
              </dl>

              {done > 0 && (
                <div className="mt-4 h-1 w-full bg-surface-container-high">
                  <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${pathNodes.length ? (done / pathNodes.length) * 100 : 0}%` }} />
                </div>
              )}

              <div className="mt-4 border border-outline-variant/60 bg-surface-container-low p-3">
                <p className="micro-label text-outline">portfolio outcome</p>
                <p className="mt-1 text-sm font-medium text-on-surface">{meta.project}</p>
              </div>

              <Button
                onClick={() => handlePathSelect(path.id)}
                variant={isActive ? 'default' : 'outline'}
                className="mt-5 w-full"
              >
                {isActive ? 'Open roadmap' : locked ? 'Preview path' : 'Choose this path'}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.article>
          );
        })}
      </div>

    </div>
  );
}
