'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The 404 as a failed skill-tree lookup: two resolved nodes on either side of
 * a dashed connector, the requested path typed into a terminal line, and the
 * gap where a third node should be pulsing where the edge just... stops.
 * Pure CSS (steps() typewriter + keyframe pulse) — no client JS beyond
 * reading the attempted path, so there's nothing to hydrate-mismatch on.
 * Reduced motion: the typewriter/pulse rules are gated by @media, so the
 * end state (full text, static gap) renders immediately.
 */
export default function NotFound() {
  const pathname = usePathname();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-on-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />

      <div className="relative w-full max-w-lg border border-outline-variant bg-surface/90">
        {/* ── Broken graph edge ── */}
        <div className="flex items-center justify-center gap-0 border-b border-outline-variant px-6 py-10 sm:px-10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-secondary/50 bg-secondary/10 text-secondary" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
          </span>
          <span className="h-px w-8 shrink-0 bg-secondary/50 sm:w-14" aria-hidden />

          <span className="relative mx-1 flex h-10 w-10 shrink-0 items-center justify-center border border-dashed border-error/60 bg-error/5 text-error" aria-hidden>
            <span className="absolute inset-0 border border-error/40 motion-safe:animate-[node-pulse_1.8s_ease-in-out_infinite]" />
            <span className="text-xs font-bold">?</span>
          </span>

          <span className="h-px w-8 shrink-0 border-t border-dashed border-outline-variant sm:w-14" aria-hidden />
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-outline-variant bg-surface-container-low text-outline" aria-hidden>
            <Route className="h-4 w-4" />
          </span>
        </div>

        {/* ── Terminal readout ── */}
        <div className="space-y-4 p-6 sm:p-10">
          <p className="micro-label text-outline">{'// 404 — node not found'}</p>
          <h1 className="font-display text-2xl font-bold text-on-surface">This module doesn&apos;t exist.</h1>

          <div className="border border-outline-variant bg-background px-4 py-3 font-code text-xs leading-6 text-on-surface-variant">
            <p>
              <span className="text-cyan">$</span> stacc lookup{' '}
              <span
                className="inline-block max-w-full overflow-hidden whitespace-nowrap align-bottom motion-safe:animate-[typewriter_1.1s_steps(30,end)_forwards] motion-safe:[width:0]"
                style={{ width: '100%' }}
              >
                {pathname || '/unknown'}
              </span>
            </p>
            <p className="mt-1 text-error opacity-0 motion-safe:animate-[fade-in_0.3s_ease-out_1.1s_forwards]">
              → no matching node in the current graph
            </p>
          </div>

          <p className="text-sm leading-6 text-on-surface-variant">
            The page you&apos;re looking for isn&apos;t on the tree. Head back to the rail and keep moving.
          </p>

          <Button asChild className="mt-2">
            <Link href="/roadmap">Back to roadmap <ArrowRight /></Link>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes node-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
