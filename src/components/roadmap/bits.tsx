'use client';

import { useState } from 'react';
import { Check, ListVideo, Lock, Play, Star } from 'lucide-react';
import type { NodeStatus, TaskType } from '@/lib/database.types';
import { cn } from '@/lib/utils';

export type YouTubeRef = { kind: 'video'; id: string } | { kind: 'playlist'; id: string };

/** Extracts a YouTube video/playlist ref from watch/short/embed/playlist URL shapes; null if not YouTube. */
export function getYouTubeRef(url: string): YouTubeRef | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)youtube\.com$/.test(u.hostname) && u.hostname !== 'youtu.be') return null;
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? { kind: 'video', id } : null;
    }
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return id ? { kind: 'video', id } : null;
    }
    if (u.pathname === '/playlist') {
      const id = u.searchParams.get('list');
      return id ? { kind: 'playlist', id } : null;
    }
    const embedMatch = u.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
    return embedMatch ? { kind: 'video', id: embedMatch[2] } : null;
  } catch {
    return null;
  }
}

/** Click-to-load inline player — shows a thumbnail (or a playlist marker) until the user
 * opts in, so the node sheet doesn't fire YouTube's embed scripts/cookies for every
 * resource up front. */
export function YouTubeEmbed({ source, title }: { source: YouTubeRef; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const embedSrc =
    source.kind === 'video'
      ? `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1`
      : `https://www.youtube-nocookie.com/embed/videoseries?list=${source.id}&autoplay=1`;

  if (loaded) {
    return (
      <div className="mt-3 aspect-video w-full overflow-hidden border border-outline-variant bg-black">
        <iframe
          className="h-full w-full"
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group/embed relative mt-3 block aspect-video w-full overflow-hidden border border-outline-variant bg-surface-container-low"
    >
      {source.kind === 'video' ? (
        // eslint-disable-next-line @next/next/no-img-element -- external YouTube CDN thumbnail, not an app asset
        <img
          src={`https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover opacity-80 transition-opacity group-hover/embed:opacity-100"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-container-low">
          <ListVideo className="h-8 w-8 text-outline" />
          <span className="font-code text-[10px] uppercase tracking-[0.12em] text-outline">full playlist</span>
        </div>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover/embed:bg-black/10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover/embed:scale-110">
          <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}

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
  read: 'text-cyan',
  watch: 'text-cyan',
  build: 'text-primary-neon',
  quiz: 'text-secondary',
};

export function TaskTypeBadge({ type }: { type: TaskType }) {
  return (
    <span className={cn('shrink-0 font-code text-[9px] font-semibold uppercase tracking-[0.14em]', TASK_TYPE_STYLE[type])}>
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
