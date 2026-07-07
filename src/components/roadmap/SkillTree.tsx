'use client';

/**
 * The skill tree as a "transmission rail": Foundations block on top (section 00),
 * then the active specialization as a vertical mission log (section 01). A cyan
 * spine fills with progress; the next available node pulses.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Hourglass } from 'lucide-react';
import type { NodeRow, NodeStatus } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { useUiStore } from '@/store/useUiStore';
import { AppIcon } from '@/components/ui/app-icon';
import { StatusMarker } from './bits';
import { cn } from '@/lib/utils';

interface SkillTreeProps {
  data: UserData;
  pathId: string;
}

function taskProgress(data: UserData, nodeId: string) {
  const tasks = data.tasks.filter((t) => t.node_id === nodeId);
  const done = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  return { done, total: tasks.length };
}

function prereqNames(data: UserData, node: NodeRow): string[] {
  const unmet = (data.prereqs[node.id] ?? []).filter((p) => !data.progress.completedNodes[p]);
  const names = unmet.map((id) => data.nodes.find((n) => n.id === id)?.name ?? '').filter(Boolean);
  const path = data.paths.find((p) => p.id === node.path_id);
  const lockedPaths = (path?.requires_paths ?? []).filter((pid) => !data.pathFullyComplete(pid));
  for (const pid of lockedPaths) {
    const title = data.paths.find((p) => p.id === pid)?.title;
    if (title) names.push(`${title} path`);
  }
  return names;
}

function SectionHeader({ index, title, done, total }: { index: string; title: string; done: number; total: number }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="micro-label text-outline">{`section ${index}`}</p>
        <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-on-surface">{title}</h3>
      </div>
      <div className="flex items-center gap-2 pb-0.5">
        <div className="flex gap-[3px]">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={cn('h-2.5 w-1.5', i < done ? 'bg-cyan' : 'bg-surface-container-high')} />
          ))}
        </div>
        <span className="font-code text-[10px] font-semibold text-on-surface-variant">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

function FoundationCard({ data, node, status, isCurrent }: { data: UserData; node: NodeRow; status: NodeStatus; isCurrent: boolean }) {
  const { setActiveNodeId } = useUiStore();
  const { done, total } = taskProgress(data, node.id);
  const locked = status === 'locked';

  return (
    <button
      type="button"
      onClick={() => setActiveNodeId(node.id)}
      className={cn(
        'group relative flex flex-col border bg-surface/80 p-4 text-left transition-all',
        locked
          ? 'border-outline-variant/60 opacity-55'
          : 'border-outline-variant hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        status === 'complete' && 'border-secondary/35',
        isCurrent && 'node-active border-cyan/60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <AppIcon name={node.icon} className={cn('h-6 w-6', status === 'complete' ? 'text-secondary' : isCurrent ? 'text-cyan' : locked ? 'text-outline' : 'text-on-surface-variant')} />
        <StatusMarker status={status} size="sm" />
      </div>
      <h4 className="mt-3 font-display text-sm font-semibold leading-tight text-on-surface">{node.name}</h4>
      <p className="mt-0.5 font-code text-[10px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
      {total > 0 && (
        <div className="mt-3 h-1 w-full bg-surface-container-high">
          <div
            className={cn('h-full transition-all duration-500', status === 'complete' ? 'bg-secondary' : 'bg-cyan')}
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      )}
      {isCurrent && (
        <span className="absolute -top-2 right-2 border border-cyan/50 bg-navy px-1.5 font-code text-[9px] font-bold uppercase tracking-[0.14em] text-cyan">
          next up
        </span>
      )}
    </button>
  );
}

function MissionCard({ data, node, index, status, isCurrent }: { data: UserData; node: NodeRow; index: number; status: NodeStatus; isCurrent: boolean }) {
  const { setActiveNodeId } = useUiStore();
  const { done, total } = taskProgress(data, node.id);
  const locked = status === 'locked';
  const missing = locked ? prereqNames(data, node) : [];

  return (
    <div className="relative pl-12 sm:pl-16">
      {/* rail marker */}
      <div className={cn('absolute left-[13px] top-6 z-10 sm:left-[21px]', isCurrent && 'node-active')}>
        <StatusMarker status={status} />
      </div>

      <button
        type="button"
        onClick={() => setActiveNodeId(node.id)}
        className={cn(
          'group relative block w-full overflow-hidden border bg-surface/80 p-5 text-left transition-all sm:p-6',
          locked
            ? 'border-outline-variant/60 opacity-55'
            : 'border-outline-variant hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-[0_14px_40px_rgba(0,0,0,0.4)]',
          status === 'complete' && 'border-secondary/35',
          isCurrent && 'border-cyan/60 shadow-[0_0_40px_rgba(0,217,255,0.07)]',
        )}
      >
        {/* ghost index */}
        <span aria-hidden className="pointer-events-none absolute -right-1 -top-4 font-code text-[68px] font-bold leading-none text-on-surface/[0.05]">
          {String(index).padStart(2, '0')}
        </span>

        <div className="relative flex items-start gap-4">
          <div className={cn('hidden h-12 w-12 shrink-0 items-center justify-center border sm:flex', status === 'complete' ? 'border-secondary/40 bg-secondary/10 text-secondary' : isCurrent ? 'border-cyan/40 bg-cyan/10 text-cyan' : locked ? 'border-outline-variant bg-surface-container-low text-outline' : 'border-outline-variant bg-surface-container-low text-on-surface-variant')}>
            <AppIcon name={node.icon} className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-base font-bold text-on-surface sm:text-lg">{node.name}</h4>
              {isCurrent && (
                <span className="border border-cyan/50 bg-cyan/10 px-1.5 py-0.5 font-code text-[9px] font-bold uppercase tracking-[0.14em] text-cyan">
                  ▸ current
                </span>
              )}
            </div>
            <p className="mt-0.5 font-code text-[11px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
            <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-5 text-on-surface-variant">{node.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-code text-[10px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5"><Hourglass className="h-3 w-3 text-outline" />{node.est_hours}h est</span>
              {total > 0 && !locked && (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1 w-16 bg-surface-container-high align-middle">
                    <span className={cn('block h-full transition-all duration-500', status === 'complete' ? 'bg-secondary' : 'bg-cyan')} style={{ width: `${(done / total) * 100}%` }} />
                  </span>
                  {done}/{total} tasks
                </span>
              )}
              {locked && missing.length > 0 && (
                <span className="text-outline">requires: {missing.slice(0, 3).join(', ')}{missing.length > 3 ? '…' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function SkillTree({ data, pathId }: SkillTreeProps) {
  const reduceMotion = useReducedMotion();
  const foundations = data.nodesByPath['foundations'] ?? [];
  const pathNodes = pathId === 'foundations' ? [] : (data.nodesByPath[pathId] ?? []);
  const path = data.paths.find((p) => p.id === pathId);

  const statusOf = (n: NodeRow) => data.nodeStatus(n.id);
  const allOrdered = [...foundations, ...pathNodes];
  const current = allOrdered.find((n) => ['available', 'in_progress'].includes(statusOf(n)));

  const foundationsDone = foundations.filter((n) => statusOf(n) === 'complete').length;
  const pathDone = pathNodes.filter((n) => statusOf(n) === 'complete').length;
  const railProgress = pathNodes.length ? pathDone / pathNodes.length : 0;

  const entrance = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-10">
      {/* SECTION 00 — FOUNDATIONS */}
      <motion.section {...entrance} transition={{ duration: 0.4 }}>
        <SectionHeader index="00 // required" title="Foundations" done={foundationsDone} total={foundations.length} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {foundations.map((node) => (
            <FoundationCard key={node.id} data={data} node={node} status={statusOf(node)} isCurrent={current?.id === node.id} />
          ))}
        </div>
      </motion.section>

      {/* connector */}
      {pathNodes.length > 0 && (
        <div aria-hidden className="flex justify-center">
          <div className={cn('h-10 w-px', foundationsDone === foundations.length ? 'bg-cyan/60' : 'bg-outline-variant')} style={{ backgroundImage: foundationsDone === foundations.length ? undefined : 'repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 8px)' }} />
        </div>
      )}

      {/* SECTION 01 — ACTIVE PATH */}
      {pathNodes.length > 0 && path && (
        <motion.section {...entrance} transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1 }}>
          <SectionHeader index={`01 // specialization`} title={path.title} done={pathDone} total={pathNodes.length} />
          <div className="relative">
            {/* spine */}
            <div aria-hidden className="absolute bottom-6 left-[26px] top-6 w-px bg-outline-variant sm:left-[34px]" />
            <div
              aria-hidden
              className="absolute left-[26px] top-6 w-px bg-cyan shadow-[0_0_12px_rgba(0,217,255,0.6)] transition-all duration-700 sm:left-[34px]"
              style={{ height: `calc(${Math.min(railProgress * 100, 100)}% - 24px)` }}
            />
            <div className="space-y-4">
              {pathNodes.map((node, i) => (
                <MissionCard key={node.id} data={data} node={node} index={i + 1} status={statusOf(node)} isCurrent={current?.id === node.id} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
