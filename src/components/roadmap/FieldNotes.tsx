'use client';

/**
 * Floating "field notes" popover (bottom-right of /roadmap): terminal-prompt
 * framing around the curriculum copy of whichever module is hovered or
 * keyboard-focused on the tree — defaulting to the member's current module.
 * Content comes straight from the roadmap config (node descriptions); this is
 * curated curriculum, not an assistant. Only shown while the tree is scrolled
 * into view; auto-closes when it leaves. Desktop only (mobile has the bottom
 * bar in that corner and the sheet covers the same need).
 */
import { useEffect, useMemo, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Hourglass, X } from 'lucide-react';
import type { UserData } from '@/hooks/useUserData';
import { useUiStore } from '@/store/useUiStore';
import { StatusChip } from './bits';
import { cn } from '@/lib/utils';

export default function FieldNotes({ data, watchRef }: { data: UserData; watchRef: RefObject<HTMLElement | null> }) {
  const router = useRouter();
  const { focusedNodeId } = useUiStore();
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) setOpen(false);
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Reading order: foundations first, then the active specialization.
  const ordered = useMemo(() => {
    const foundations = data.nodesByPath['foundations'] ?? [];
    const rest = data.activePath && data.activePath !== 'foundations' ? (data.nodesByPath[data.activePath] ?? []) : [];
    return [...foundations, ...rest];
  }, [data.nodesByPath, data.activePath]);

  const node =
    data.nodes.find((n) => n.id === focusedNodeId) ??
    ordered.find((n) => ['available', 'in_progress'].includes(data.nodeStatus(n.id))) ??
    ordered[0];

  if (!node) return null;

  const status = data.nodeStatus(node.id);
  const tasks = data.tasks.filter((t) => t.node_id === node.id);
  const tasksDone = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 hidden flex-col items-end transition-all duration-500 md:flex',
        inView ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      {/* explanation popover */}
      <div
        id="field-notes-panel"
        role="dialog"
        aria-label={`Field notes for ${node.name}`}
        className={cn(
          'mb-3 w-[340px] origin-bottom-right border border-cyan/40 bg-navy/95 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-300 sm:w-[380px]',
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0',
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center border border-cyan/40 bg-cyan/15 font-code text-[10px] font-bold text-cyan">$</span>
            <span className="micro-label text-cyan">field notes</span>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close field notes" className="text-on-surface-variant transition-colors hover:text-on-surface">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border border-outline-variant bg-surface-container-low p-2.5 font-code text-xs text-on-surface">
          <span className="mr-2 text-primary-neon">❯</span>stacc explain &quot;{node.name}&quot;
        </div>

        <p className="mt-3 text-xs leading-5 text-on-surface-variant">{node.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusChip status={status} />
          <span className="inline-flex items-center gap-1.5 border border-outline-variant px-2 py-0.5 font-code text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
            <Hourglass className="h-3 w-3" />{node.est_hours}h est
          </span>
          {tasks.length > 0 && (
            <span className="border border-outline-variant px-2 py-0.5 font-code text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
              {tasksDone}/{tasks.length} tasks
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.push(`/roadmap/${node.slug}`);
          }}
          className="mt-4 flex w-full items-center justify-between border border-cyan/30 bg-cyan/5 px-3 py-2 font-code text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan transition-colors hover:border-cyan/60 hover:bg-cyan/10"
        >
          open module
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="field-notes-panel"
        className="group flex cursor-pointer items-center gap-3 rounded-full border border-cyan/40 bg-navy/95 py-2.5 px-5 shadow-lg backdrop-blur transition-all hover:border-cyan hover:shadow-[0_0_20px_rgba(0,217,255,0.18)]"
      >
        <span className="flex items-center gap-2 font-code text-xs font-semibold uppercase tracking-wider text-cyan transition-colors group-hover:text-on-surface">
          <span aria-hidden className="font-bold">❯</span>
          stacc explain
        </span>
        <span aria-hidden className="h-4 w-px bg-outline-variant" />
        <span className="max-w-[160px] truncate rounded-none bg-surface-container-high px-2 py-0.5 font-code text-xs text-on-surface">
          &quot;{node.name}&quot;
        </span>
        <span
          aria-hidden
          className={cn(
            'rounded-full border px-2 py-0.5 font-code text-[10px] transition-all duration-300',
            open ? 'rotate-180 border-primary/40 bg-primary/20 text-primary-neon' : 'border-cyan/20 bg-cyan/10 text-cyan',
          )}
        >
          ↑
        </span>
      </button>
    </div>
  );
}
