'use client';

/**
 * Two renderings of the skill tree list:
 *  - "rail" (mobile / compact): vertical mission log with a left spine.
 *  - "spine" (desktop list view): landing-page-style zigzag — a central spine
 *    with an animated progress fill, module cards alternating sides, and the
 *    module's skills fanning out on curved dashed connectors opposite each
 *    card. Connector geometry is row-local (fixed chip heights, no global
 *    index math) so it holds up for any phase/node count.
 */
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Hourglass } from 'lucide-react';
import type { NodeRow, NodeStatus } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { AppIcon } from '@/components/ui/app-icon';
import { StatusMarker } from './bits';
import { cn } from '@/lib/utils';

export type TreeVariant = 'rail' | 'spine';

interface SkillTreeProps {
  data: UserData;
  pathId: string;
  variant?: TreeVariant;
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
        <span className="font-code text-xs font-semibold text-on-surface-variant">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

/** Centered phase badge sitting on the spine (zigzag view) */
function SpinePill({ index, title, done, total }: { index: string; title: string; done: number; total: number }) {
  const allDone = total > 0 && done === total;
  return (
    <div className="relative z-10 flex justify-center">
      <div
        className={cn(
          'border px-5 py-2 text-center font-code text-xs font-semibold uppercase tracking-[0.08em] backdrop-blur transition-colors duration-500',
          allDone
            ? 'border-secondary/50 bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : 'border-cyan/40 bg-surface/90 text-cyan shadow-[0_0_15px_rgba(0,217,255,0.08)]',
        )}
      >
        {index} · {title}
        <span className={cn('ml-2', allDone ? 'text-secondary' : 'text-outline')}>{done}/{total}</span>
      </div>
    </div>
  );
}

function FoundationCard({ data, node, status, isCurrent }: { data: UserData; node: NodeRow; status: NodeStatus; isCurrent: boolean }) {
  const router = useRouter();
  const { done, total } = taskProgress(data, node.id);
  const locked = status === 'locked';

  return (
    <button
      type="button"
      onClick={() => router.push(`/roadmap/${node.slug}`)}
      aria-haspopup="dialog"
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
      <p className="mt-0.5 font-code text-xs lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
      {total > 0 && (
        <div className="mt-3 h-1 w-full bg-surface-container-high">
          <div
            className={cn('h-full transition-all duration-500', status === 'complete' ? 'bg-secondary' : 'bg-cyan')}
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      )}
      {isCurrent && (
        <span className="absolute -top-2 right-2 border border-cyan/50 bg-navy px-1.5 font-code text-[11px] font-bold uppercase tracking-[0.08em] text-cyan">
          next up
        </span>
      )}
    </button>
  );
}

/** The module card itself — shared between the rail rows and the zigzag rows.
 *  `showMarker` renders the status square inline (spine rows have no side rail to carry it). */
function ModuleCard({ data, node, index, status, isCurrent, showMarker }: { data: UserData; node: NodeRow; index: number; status: NodeStatus; isCurrent: boolean; showMarker?: boolean }) {
  const router = useRouter();
  const { done, total } = taskProgress(data, node.id);
  const locked = status === 'locked';
  const missing = locked ? prereqNames(data, node) : [];

  return (
    <button
      type="button"
      onClick={() => router.push(`/roadmap/${node.slug}`)}
      aria-haspopup="dialog"
      className={cn(
        'group relative block w-full overflow-hidden border bg-surface/80 p-5 text-left transition-all sm:p-6',
        locked
          ? 'border-outline-variant/60 opacity-55'
          : 'border-outline-variant hover:border-cyan/40 hover:bg-surface-container-low',
        status === 'complete' && 'border-secondary/35',
        isCurrent && 'border-cyan/60 bg-cyan/[0.04]',
      )}
    >
      {/* ghost index */}
      <span aria-hidden className="pointer-events-none absolute -right-1 -top-4 font-code text-6xl font-bold leading-none text-on-surface/[0.05]">
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
              <span className="border border-cyan/50 bg-cyan/10 px-1.5 py-0.5 font-code text-[11px] font-bold uppercase tracking-[0.08em] text-cyan">
                ▸ current
              </span>
            )}
            {showMarker && (
              <span className="ml-auto">
                <StatusMarker status={status} size="sm" />
              </span>
            )}
          </div>
          <p className="mt-0.5 font-code text-[11px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
          <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-5 text-on-surface-variant">{node.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-code text-xs text-on-surface-variant">
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
  );
}

function MissionRow({ data, node, index, status, isCurrent }: { data: UserData; node: NodeRow; index: number; status: NodeStatus; isCurrent: boolean }) {
  return (
    <div className="relative pl-12 sm:pl-16">
      {/* rail marker */}
      <div className={cn('absolute left-[13px] top-6 z-10 sm:left-[21px]', isCurrent && 'node-active')}>
        <StatusMarker status={status} />
      </div>
      <ModuleCard data={data} node={node} index={index} status={status} isCurrent={isCurrent} />
    </div>
  );
}

// ── Zigzag spine view ────────────────────────────────────────
const SPINE_COL = 112; // middle grid column width (px)
const CHIP_H = 28;
const CHIP_GAP = 8;
const CHIP_PITCH = CHIP_H + CHIP_GAP;
const MAX_CHIPS = 3;

const STROKE = {
  done: 'var(--cyan)',
  next: 'var(--cyan-dim)',
  todo: 'var(--fg-muted)',
  locked: 'var(--border-subtle)',
};

/**
 * Row-local connectors: a card-side stub from the module to the spine junction,
 * and a bezier fan from the junction out to each skill chip. Chip y-offsets are
 * exact because chip heights/gaps are fixed constants that the chip column also
 * uses — no rendered-height measurement needed.
 */
function SpineConnectors({ side, status, isCurrent, chipCount }: { side: 'left' | 'right'; status: NodeStatus; isCurrent: boolean; chipCount: number }) {
  const height = Math.max(chipCount * CHIP_PITCH, 40);
  const cy = height / 2;
  const cx = SPINE_COL / 2;
  const done = status === 'complete';
  const cardX = side === 'left' ? 0 : SPINE_COL;
  const cardStroke = done ? STROKE.done : isCurrent ? STROKE.next : status === 'locked' ? STROKE.locked : STROKE.todo;
  const chipStroke = done ? STROKE.next : status === 'locked' ? STROKE.locked : STROKE.todo;
  const dir = side === 'left' ? 1 : -1;

  return (
    <svg
      aria-hidden
      className="absolute left-0 top-1/2 -translate-y-1/2"
      width={SPINE_COL}
      height={height}
      viewBox={`0 0 ${SPINE_COL} ${height}`}
      fill="none"
    >
      <path
        d={`M ${cardX} ${cy} L ${cx} ${cy}`}
        stroke={cardStroke}
        strokeWidth={done ? 2 : 1.5}
        strokeDasharray={done ? undefined : '4 4'}
        style={done ? { filter: 'drop-shadow(0 0 3px rgba(0,217,255,0.5))' } : undefined}
        className="transition-all duration-500"
      />
      {Array.from({ length: chipCount }).map((_, i) => {
        const chipY = cy + (i - (chipCount - 1) / 2) * CHIP_PITCH;
        const endX = side === 'left' ? SPINE_COL : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} C ${cx + dir * 22} ${cy}, ${cx + dir * 34} ${chipY}, ${endX} ${chipY}`}
            stroke={chipStroke}
            strokeWidth={1.3}
            strokeDasharray="2 5"
          />
        );
      })}
    </svg>
  );
}

function SkillChip({ label, status, extra }: { label: string; status: NodeStatus; extra?: boolean }) {
  return (
    <span
      style={{ height: CHIP_H }}
      className={cn(
        'flex max-w-[220px] items-center border bg-surface-container-low px-2.5 font-code text-xs leading-none',
        status === 'complete'
          ? 'border-secondary/30 text-on-surface-variant'
          : status === 'locked'
            ? 'border-outline-variant/70 text-outline opacity-75'
            : 'border-outline-variant text-on-surface-variant',
        extra && 'text-outline',
      )}
    >
      {!extra && (
        <span className={cn('mr-1.5', status === 'complete' ? 'text-secondary' : 'text-outline')}>
          {status === 'complete' ? '▪' : '▫'}
        </span>
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

function SpineRow({ data, node, index, status, isCurrent, side }: { data: UserData; node: NodeRow; index: number; status: NodeStatus; isCurrent: boolean; side: 'left' | 'right' }) {
  const shown = node.skills.slice(0, MAX_CHIPS);
  const extra = node.skills.length - shown.length;
  const chipCount = shown.length + (extra > 0 ? 1 : 0);

  return (
    <li className="relative grid items-center" style={{ gridTemplateColumns: `1fr ${SPINE_COL}px 1fr` }}>
      {/* module card */}
      <div className={cn('row-start-1 w-full max-w-md', side === 'left' ? 'col-start-1 justify-self-end' : 'col-start-3 justify-self-start')}>
        <ModuleCard data={data} node={node} index={index} status={status} isCurrent={isCurrent} showMarker />
      </div>

      {/* connectors + junction diamond */}
      <div className="relative col-start-2 row-start-1 h-full">
        <SpineConnectors side={side} status={status} isCurrent={isCurrent} chipCount={chipCount} />
        <span
          aria-hidden
          className={cn(
            'absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors duration-500',
            status === 'complete'
              ? 'border-cyan bg-cyan/20 shadow-[0_0_12px_rgba(0,217,255,0.6)]'
              : isCurrent
                ? 'node-active border-cyan bg-navy'
                : 'border-outline-variant bg-surface-container-low',
          )}
        />
      </div>

      {/* skill chips fan out opposite the card */}
      <div
        aria-hidden
        className={cn('row-start-1 flex flex-col justify-center', side === 'left' ? 'col-start-3 items-start' : 'col-start-1 items-end')}
        style={{ gap: CHIP_GAP }}
      >
        {shown.map((skill) => (
          <SkillChip key={skill} label={skill} status={status} />
        ))}
        {extra > 0 && <SkillChip label={`+${extra} more`} status={status} extra />}
      </div>
    </li>
  );
}

/** Shared derivation for both tree variants — Foundations section, the
 * active specialization's nodes, the "current" (resume-here) node, and
 * progress fractions. Previously duplicated near-verbatim in SpineView and
 * RailView, which had already drifted: SpineView row-centers its spine fill
 * (`fillPct`), RailView used a cruder raw fraction for the visually
 * equivalent line. One source now, so both variants render off the same
 * numbers. */
function getTreeSections(data: UserData, pathId: string) {
  const foundations = data.nodesByPath['foundations'] ?? [];
  const pathNodes = pathId === 'foundations' ? [] : (data.nodesByPath[pathId] ?? []);
  const path = data.paths.find((p) => p.id === pathId);

  const statusOf = (n: NodeRow) => data.nodeStatus(n.id);
  const current = [...foundations, ...pathNodes].find((n) => ['available', 'in_progress'].includes(statusOf(n)));

  const foundationsDone = foundations.filter((n) => statusOf(n) === 'complete').length;
  const gateOpen = foundations.length > 0 && foundationsDone === foundations.length;
  const pathDone = pathNodes.filter((n) => statusOf(n) === 'complete').length;
  const pathProgress = pathNodes.length ? pathDone / pathNodes.length : 0;
  // Fill to the last completed junction (row centers sit at (i + 0.5) / n), not mid-gap.
  const fillPct = pathNodes.length === 0 || pathDone === 0 ? 0 : pathDone === pathNodes.length ? 100 : ((pathDone - 0.5) / pathNodes.length) * 100;

  return { foundations, pathNodes, path, statusOf, current, foundationsDone, gateOpen, pathDone, pathProgress, fillPct };
}

function SpineView({ data, pathId }: { data: UserData; pathId: string }) {
  const reduceMotion = useReducedMotion();
  const { foundations, pathNodes, path, statusOf, current, foundationsDone, gateOpen, pathDone, pathProgress, fillPct } = getTreeSections(data, pathId);

  const entrance = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

  return (
    <div>
      {/* SECTION 00 — FOUNDATIONS */}
      <motion.section {...entrance} transition={{ duration: 0.4 }}>
        <SpinePill index="00 // required" title="Foundations" done={foundationsDone} total={foundations.length} />
        <div className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-6">
          {foundations.map((node) => (
            <FoundationCard key={node.id} data={data} node={node} status={statusOf(node)} isCurrent={current?.id === node.id} />
          ))}
        </div>
      </motion.section>

      {/* gate between sections */}
      {pathNodes.length > 0 && (
        <div aria-hidden className="flex flex-col items-center py-3">
          <div
            className={cn('h-8 w-px', gateOpen ? 'bg-cyan/60' : 'bg-outline-variant')}
            style={{ backgroundImage: gateOpen ? undefined : 'repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 8px)' }}
          />
          <span
            className={cn(
              'h-3 w-3 rotate-45 border transition-colors',
              gateOpen ? 'border-cyan bg-cyan/20 shadow-[0_0_12px_rgba(0,217,255,0.6)]' : 'border-outline-variant bg-surface-container-low',
            )}
          />
        </div>
      )}

      {/* SECTION 01 — ACTIVE PATH, zigzag on a center spine */}
      {pathNodes.length > 0 && path && (
        <motion.section {...entrance} transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1 }}>
          <SpinePill index="01 // specialization" title={path.title} done={pathDone} total={pathNodes.length} />
          <div className="relative mt-8">
            {/* spine: dashed base + glowing progress fill */}
            <div aria-hidden className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dashed border-outline-variant" />
            <div
              aria-hidden
              className="absolute left-1/2 top-0 w-0.5 -translate-x-1/2 bg-cyan transition-all duration-700 ease-out"
              style={{ height: `${fillPct}%` }}
            />

            <ol className="relative flex flex-col gap-8">
              {pathNodes.map((node, i) => (
                <SpineRow
                  key={node.id}
                  data={data}
                  node={node}
                  index={i + 1}
                  status={statusOf(node)}
                  isCurrent={current?.id === node.id}
                  side={i % 2 === 0 ? 'left' : 'right'}
                />
              ))}
            </ol>

            {/* end cap */}
            <div className="relative mt-8 flex justify-center">
              <span
                className={cn(
                  'z-10 border px-3 py-1 font-code text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-500',
                  pathProgress === 1
                    ? 'border-secondary/50 bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-outline-variant bg-surface-container-low text-outline',
                )}
              >
                {pathProgress === 1 ? '▪ path complete' : '▫ ship it'}
              </span>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}

// ── Rail view (mobile / compact) ─────────────────────────────
function RailView({ data, pathId }: { data: UserData; pathId: string }) {
  const reduceMotion = useReducedMotion();
  const { foundations, pathNodes, path, statusOf, current, foundationsDone, pathDone, fillPct } = getTreeSections(data, pathId);

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
              style={{ height: `calc(${fillPct}% - 24px)` }}
            />
            <div className="space-y-4">
              {pathNodes.map((node, i) => (
                <MissionRow key={node.id} data={data} node={node} index={i + 1} status={statusOf(node)} isCurrent={current?.id === node.id} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}

export default function SkillTree({ data, pathId, variant = 'rail' }: SkillTreeProps) {
  return variant === 'spine' ? <SpineView data={data} pathId={pathId} /> : <RailView data={data} pathId={pathId} />;
}
