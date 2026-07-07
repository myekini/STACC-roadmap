'use client';

/**
 * Landing hero visual: a live "stacc://roadmap" terminal window. Two modules
 * complete, one in progress with a blinking cursor, a cyan data pulse
 * traveling down the rail, and a shimmering sync bar. Pure CSS motion
 * (keyframes in globals.css) with prefers-reduced-motion fallbacks.
 */
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type RailStatus = 'complete' | 'current' | 'locked';

const RAIL: { name: string; status: RailStatus; note: string }[] = [
  { name: 'Foundations', status: 'complete', note: 'sql · python · git' },
  { name: 'ETL Concepts', status: 'complete', note: 'pipelines that re-run safely' },
  { name: 'Data Modeling', status: 'current', note: 'star schemas in progress' },
  { name: 'dbt', status: 'locked', note: 'unlocks next' },
  { name: 'Orchestration', status: 'locked', note: 'airflow / prefect' },
];

function Marker({ status }: { status: RailStatus }) {
  return (
    <span
      className={cn(
        'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center border',
        status === 'complete' && 'border-secondary bg-secondary text-navy',
        status === 'current' && 'node-active border-cyan bg-cyan/15 text-cyan',
        status === 'locked' && 'border-outline-variant bg-surface-container-low text-outline',
      )}
    >
      {status === 'complete' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : status === 'locked' ? <Lock className="h-3 w-3" /> : <span className="h-2 w-2 bg-cyan" />}
    </span>
  );
}

export default function HeroRail() {
  return (
    <div className="hero-float relative mx-auto w-full max-w-md">
      {/* glow */}
      <div aria-hidden className="absolute -inset-6 bg-cyan/[0.04] blur-2xl" />

      <div className="relative border border-cyan/25 bg-surface/95 shadow-[0_28px_80px_rgba(0,0,0,0.5)] backdrop-blur">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-2.5">
          <span className="h-2.5 w-2.5 bg-error/80" />
          <span className="h-2.5 w-2.5 bg-tertiary/80" />
          <span className="h-2.5 w-2.5 bg-secondary/80" />
          <span className="ml-3 font-code text-[10px] lowercase tracking-[0.08em] text-on-surface-variant">stacc://roadmap</span>
          <span className="ml-auto flex items-center gap-1.5 font-code text-[9px] uppercase tracking-[0.14em] text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse bg-secondary" /> live
          </span>
        </div>

        {/* rail */}
        <div className="relative p-5 sm:p-6">
          {/* spine + traveling pulse */}
          <div aria-hidden className="absolute bottom-8 left-[33px] top-8 w-px sm:left-[37px]">
            <div className="absolute inset-0 bg-outline-variant" />
            <div className="absolute left-0 top-0 h-[46%] w-px bg-gradient-to-b from-secondary via-secondary to-cyan" />
            <span className="hero-pulse-dot absolute -left-[3px] h-[7px] w-[7px] bg-cyan shadow-[0_0_10px_rgba(0,217,255,0.9)]" />
          </div>

          <ul className="space-y-4">
            {RAIL.map((row) => (
              <li key={row.name} className={cn('flex items-center gap-3.5', row.status === 'locked' && 'opacity-55')}>
                <Marker status={row.status} />
                <div className={cn('flex min-w-0 flex-1 items-center justify-between gap-3 border px-3.5 py-2.5', row.status === 'current' ? 'border-cyan/40 bg-cyan/[0.06]' : 'border-outline-variant/70 bg-surface-container-low/50')}>
                  <div className="min-w-0">
                    <p className={cn('truncate font-display text-sm font-semibold', row.status === 'current' ? 'text-cyan' : 'text-on-surface')}>{row.name}</p>
                    <p className="truncate font-code text-[10px] lowercase text-on-surface-variant">
                      {`// ${row.note}`}
                      {row.status === 'current' && <span aria-hidden className="hero-cursor ml-1 inline-block h-2.5 w-[5px] translate-y-0.5 bg-cyan" />}
                    </p>
                  </div>
                  {row.status === 'complete' && <span className="shrink-0 font-code text-[9px] font-bold uppercase tracking-[0.14em] text-secondary">done</span>}
                  {row.status === 'current' && <span className="shrink-0 border border-cyan/50 bg-navy px-1.5 py-0.5 font-code text-[9px] font-bold uppercase tracking-[0.14em] text-cyan">now</span>}
                </div>
              </li>
            ))}
          </ul>

          {/* sync bar */}
          <div className="mt-6 border-t border-outline-variant pt-4">
            <div className="flex items-center justify-between font-code text-[10px] lowercase text-on-surface-variant">
              <span>{'// 2/5 modules · next: data modeling'}</span>
              <span className="font-bold text-cyan">40%</span>
            </div>
            <div className="relative mt-2 h-1.5 w-full overflow-hidden bg-surface-container-high">
              <div className="hero-shimmer relative h-full w-[40%] overflow-hidden bg-cyan" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
