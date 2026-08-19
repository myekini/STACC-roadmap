'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ListVideo, Lock, Play, Star } from 'lucide-react';
import type { NodeStatus, TaskType } from '@/lib/database.types';
import { cn } from '@/lib/utils';

/** Fraction of a video's duration that counts as "watched" — YouTube Analytics uses the same bar. */
const WATCH_THRESHOLD = 0.9;

interface YTPlayer {
  getDuration: () => number;
  getCurrentTime: () => number;
  destroy: () => void;
}
interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}
interface YTNamespace {
  Player: new (
    element: HTMLElement,
    config: {
      events: {
        onStateChange: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let iframeApiPromise: Promise<YTNamespace> | null = null;

/** Loads the YouTube IFrame Player API script once, lazily (only once a user opts into playback). */
function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (iframeApiPromise) return iframeApiPromise;
  iframeApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT!);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return iframeApiPromise;
}

export type YouTubeRef = {
  kind: 'video';
  id: string;
  startSeconds?: number;
  endSeconds?: number;
} | { kind: 'playlist'; id: string };

function parseYouTubeTime(value: string | null): number | undefined {
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return undefined;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

/** Extracts a YouTube video/playlist ref from watch/short/embed/playlist URL shapes; null if not YouTube. */
export function getYouTubeRef(url: string): YouTubeRef | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)youtube\.com$/.test(u.hostname) && u.hostname !== 'youtu.be') return null;
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? { kind: 'video', id, startSeconds: parseYouTubeTime(u.searchParams.get('t')), endSeconds: parseYouTubeTime(u.searchParams.get('end')) } : null;
    }
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return id ? { kind: 'video', id, startSeconds: parseYouTubeTime(u.searchParams.get('t') ?? u.searchParams.get('start')), endSeconds: parseYouTubeTime(u.searchParams.get('end')) } : null;
    }
    if (u.pathname === '/playlist') {
      const id = u.searchParams.get('list');
      return id ? { kind: 'playlist', id } : null;
    }
    const embedMatch = u.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
    return embedMatch ? { kind: 'video', id: embedMatch[2], startSeconds: parseYouTubeTime(u.searchParams.get('start')), endSeconds: parseYouTubeTime(u.searchParams.get('end')) } : null;
  } catch {
    return null;
  }
}

/** Click-to-load inline player — shows a thumbnail (or a playlist marker) until the user
 * opts in, so the node sheet doesn't fire YouTube's embed scripts/cookies for every
 * resource up front. Once loaded, polls the real IFrame Player API for playback position
 * so `onWatchThreshold` reflects actually watching ~90% of the video, not just opening it. */
export function YouTubeEmbed({
  source,
  title,
  onPlay,
  onWatchThreshold,
}: {
  source: YouTubeRef;
  title: string;
  onPlay?: () => void;
  onWatchThreshold?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const segmentStartSeconds = source.kind === 'video' ? source.startSeconds : undefined;
  const segmentEndSeconds = source.kind === 'video' ? source.endSeconds : undefined;
  const embedSrc =
    source.kind === 'video'
      ? `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&enablejsapi=1${source.startSeconds != null ? `&start=${source.startSeconds}` : ''}${source.endSeconds != null ? `&end=${source.endSeconds}` : ''}`
      : `https://www.youtube-nocookie.com/embed/videoseries?list=${source.id}&autoplay=1&enablejsapi=1`;

  useEffect(() => {
    // Playlists don't expose a single duration to track against — leave them on the
    // simpler "opened it" signal via onPlay below.
    if (!loaded || source.kind !== 'video' || !iframeRef.current) return;

    let cancelled = false;
    let player: YTPlayer | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let thresholdFired = false;

    const stopPolling = () => {
      if (pollId) clearInterval(pollId);
      pollId = null;
    };

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      player = new YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            if (event.data !== YT.PlayerState.PLAYING) {
              stopPolling();
              return;
            }
            if (pollId) return;
            pollId = setInterval(() => {
              const fullDuration = player?.getDuration() ?? 0;
              const segmentStart = segmentStartSeconds ?? 0;
              const segmentEnd = segmentEndSeconds ?? fullDuration;
              const duration = segmentEnd - segmentStart;
              if (!duration) return;
              const fraction = Math.min(1, Math.max(0, ((player?.getCurrentTime() ?? 0) - segmentStart) / duration));
              setProgress(fraction);
              if (!thresholdFired && fraction >= WATCH_THRESHOLD) {
                thresholdFired = true;
                onWatchThreshold?.();
              }
            }, 1000);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopPolling();
      player?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callback identity churn must not tear down an active player
  }, [loaded, source.kind, source.id, segmentStartSeconds, segmentEndSeconds]);

  if (loaded) {
    return (
      <div className="mt-3">
        <div className="aspect-video w-full overflow-hidden border border-outline-variant bg-black">
          <iframe
            ref={iframeRef}
            className="h-full w-full"
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {source.kind === 'video' && (
          <div className="mt-2 h-1 w-full bg-surface-container-high">
            <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
        <a
          href={source.kind === 'video' ? `https://www.youtube.com/watch?v=${source.id}${source.startSeconds != null ? `&t=${source.startSeconds}s` : ''}` : `https://www.youtube.com/playlist?list=${source.id}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block font-code text-[10px] text-on-surface-variant underline decoration-outline-variant underline-offset-2 hover:text-cyan"
        >
          Open on youtube.com ↗ {source.kind === 'video' && <span className="text-outline">— watch here to complete this step</span>}
        </a>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setLoaded(true);
        onPlay?.();
      }}
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
  practice: 'text-tertiary',
  build: 'text-primary-neon',
  quiz: 'text-secondary',
  challenge: 'text-tertiary',
};

export function TaskTypeBadge({ type, label }: { type: TaskType; label?: string }) {
  return (
    <span className={cn('shrink-0 font-code text-[9px] font-semibold uppercase tracking-[0.14em]', TASK_TYPE_STYLE[type])}>
      {label ?? type}
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
