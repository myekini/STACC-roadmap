'use client';

import { Check, Lock, Play, Star } from 'lucide-react';
import type { NodeStatus, TaskType } from '@/lib/database.types';
import { cn } from '@/lib/utils';

/** Square status marker used on tree rails and cards */
export function StatusMarker({ status, size = 'md' }: { status: NodeStatus; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';
  const icon = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border',
        box,
        status === 'complete' && 'border-secondary bg-secondary text-on-secondary',
        status === 'in_progress' && 'border-cyan bg-cyan/15 text-cyan',
        status === 'available' && 'border-primary bg-primary text-white',
        status === 'locked' && 'border-outline-variant bg-surface-container-low text-outline',
      )}
    >
      {status === 'complete' ? (
        <Check className={icon} strokeWidth={3} />
      ) : status === 'locked' ? (
        <Lock className={icon} />
      ) : (
        <Play className={icon} strokeWidth={2.5} />
      )}
    </span>
  );
}

export function StatusChip({ status }: { status: NodeStatus }) {
  const label = { complete: 'Complete', in_progress: 'In progress', available: 'Ready to start', locked: 'Locked' }[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 font-code text-[10px] font-semibold uppercase tracking-[0.12em]',
        status === 'complete' && 'border-secondary/40 bg-secondary/10 text-secondary',
        status === 'in_progress' && 'border-cyan/40 bg-cyan/10 text-cyan',
        status === 'available' && 'border-primary/40 bg-primary/10 text-primary-neon',
        status === 'locked' && 'border-outline-variant bg-surface-container-low text-outline',
      )}
    >
      {label}
    </span>
  );
}

const TASK_TYPE_STYLE: Record<TaskType, string> = {
  read: 'border-cyan/35 text-cyan',
  watch: 'border-cyan/35 text-cyan',
  build: 'border-primary/40 text-primary-neon',
  quiz: 'border-secondary/40 text-secondary',
};

export function TaskTypeBadge({ type }: { type: TaskType }) {
  return (
    <span className={cn('inline-flex w-14 shrink-0 items-center justify-center border bg-transparent px-1 py-0.5 font-code text-[9px] font-semibold uppercase tracking-[0.14em]', TASK_TYPE_STYLE[type])}>
      {type}
    </span>
  );
}

export function Stars({
  value,
  onRate,
  size = 'h-3.5 w-3.5',
}: {
  value: number;
  onRate?: (rating: number) => void;
  size?: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" role={onRate ? 'radiogroup' : undefined} aria-label={onRate ? 'Rate this resource' : `Rated ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) =>
        onRate ? (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5 text-outline transition-colors hover:text-tertiary focus-visible:text-tertiary"
          >
            <Star className={cn(size, star <= value && 'fill-tertiary text-tertiary')} />
          </button>
        ) : (
          <Star key={star} className={cn(size, star <= Math.round(value) ? 'fill-tertiary text-tertiary' : 'text-outline-variant')} />
        ),
      )}
    </span>
  );
}
