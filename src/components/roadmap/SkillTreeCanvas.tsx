'use client';

/**
 * The skill tree as a pan/zoom canvas (React Flow): Foundations converge into a
 * junction gate, the active specialization runs down a central trunk, and each
 * module fans its skills out on curved dotted connectors. Traversed edges fill
 * cyan; the next available module pulses. Layout is deterministic from node
 * order — hand-tuned constants, no auto-layout library.
 */
import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Handle,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useReducedMotion } from 'framer-motion';
import { Hourglass, Maximize, Minus, Plus } from 'lucide-react';
import type { NodeRow, NodeStatus } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { useUiStore } from '@/store/useUiStore';
import { AppIcon } from '@/components/ui/app-icon';
import { StatusMarker } from './bits';
import { cn } from '@/lib/utils';

// Token hexes for SVG edge strokes (Tailwind config values; SVG can't use classes).
// "todo" edges use `outline` (lighter than outlineVariant) at partial alpha —
// full outlineVariant reads as near-invisible hairlines against the navy canvas.
const C = {
  cyan: '#00d9ff',
  cyanDim: 'rgba(0, 217, 255, 0.55)',
  outlineVariant: '#2a3547',
  outline: '#526174',
  edgeTodo: 'rgba(131, 149, 172, 0.4)',
  edgeTodoLocked: 'rgba(82, 97, 116, 0.35)',
};

// ── Layout constants (canvas units) ─────────────────────────
const MODULE_W = 300;
const FOUND_W = 220;
const CHIP_W = 180;
const FOUND_PITCH_Y = 118;
const TRUNK_PITCH_Y = 215;
const CHIP_PITCH_Y = 46;

type ModuleData = {
  node: NodeRow;
  status: NodeStatus;
  done: number;
  total: number;
  isCurrent: boolean;
  index: number;
};
type FoundationData = { node: NodeRow; status: NodeStatus; isCurrent: boolean };
type ChipData = { label: string; status: NodeStatus };
type LabelData = { index: string; title: string };
type JunctionData = { open: boolean };

const ghostHandle = 'pointer-events-none !h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-transparent';

function ModuleNode({ data }: NodeProps<Node<ModuleData>>) {
  const { setActiveNodeId } = useUiStore();
  const { node, status, done, total, isCurrent, index } = data;
  const locked = status === 'locked';

  return (
    <div style={{ width: MODULE_W }}>
      <Handle type="target" position={Position.Top} id="in" className={ghostHandle} />
      <button
        type="button"
        onClick={() => setActiveNodeId(node.id)}
        className={cn(
          'group relative block w-full overflow-hidden border bg-surface/90 p-4 text-left transition-all',
          locked
            ? 'border-outline-variant opacity-70'
            : 'border-outline-variant hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-[0_14px_40px_rgba(0,0,0,0.4)]',
          status === 'complete' && 'border-secondary/35',
          isCurrent && 'node-active border-cyan/60 shadow-[0_0_40px_rgba(0,217,255,0.07)]',
        )}
      >
        <span aria-hidden className="pointer-events-none absolute -right-1 -top-4 font-code text-[56px] font-bold leading-none text-on-surface/[0.05]">
          {String(index).padStart(2, '0')}
        </span>
        <div className="relative flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center border',
              status === 'complete'
                ? 'border-secondary/40 bg-secondary/10 text-secondary'
                : isCurrent
                  ? 'border-cyan/40 bg-cyan/10 text-cyan'
                  : locked
                    ? 'border-outline-variant bg-surface-container-low text-outline'
                    : 'border-outline-variant bg-surface-container-low text-on-surface-variant',
            )}
          >
            <AppIcon name={node.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate font-display text-sm font-bold text-on-surface">{node.name}</h4>
              <StatusMarker status={status} size="sm" />
            </div>
            <p className="mt-0.5 truncate font-code text-[10px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
            <div className="mt-3 flex items-center gap-4 font-code text-[9px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1"><Hourglass className="h-2.5 w-2.5 text-outline" />{node.est_hours}h</span>
              {total > 0 && !locked && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1 w-14 bg-surface-container-high align-middle">
                    <span
                      className={cn('block h-full transition-all duration-500', status === 'complete' ? 'bg-secondary' : 'bg-cyan')}
                      style={{ width: `${(done / total) * 100}%` }}
                    />
                  </span>
                  {done}/{total}
                </span>
              )}
            </div>
          </div>
        </div>
        {isCurrent && (
          <span className="absolute -top-px right-3 border border-cyan/50 bg-navy px-1.5 font-code text-[8px] font-bold uppercase tracking-[0.14em] text-cyan">
            ▸ current
          </span>
        )}
      </button>
      <Handle type="source" position={Position.Bottom} id="out" className={ghostHandle} />
      <Handle type="source" position={Position.Left} id="skills-l" className={ghostHandle} />
      <Handle type="source" position={Position.Right} id="skills-r" className={ghostHandle} />
    </div>
  );
}

function FoundationNode({ data }: NodeProps<Node<FoundationData>>) {
  const { setActiveNodeId } = useUiStore();
  const { node, status, isCurrent } = data;
  const locked = status === 'locked';

  return (
    <div style={{ width: FOUND_W }}>
      <button
        type="button"
        onClick={() => setActiveNodeId(node.id)}
        className={cn(
          'flex w-full items-center gap-3 border bg-surface/90 p-3 text-left transition-all',
          locked
            ? 'border-outline-variant opacity-70'
            : 'border-outline-variant hover:-translate-y-0.5 hover:border-cyan/40',
          status === 'complete' && 'border-secondary/35',
          isCurrent && 'node-active border-cyan/60',
        )}
      >
        <AppIcon
          name={node.icon}
          className={cn('h-5 w-5 shrink-0', status === 'complete' ? 'text-secondary' : isCurrent ? 'text-cyan' : locked ? 'text-outline' : 'text-on-surface-variant')}
        />
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-display text-xs font-semibold text-on-surface">{node.name}</h4>
          <p className="truncate font-code text-[9px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
        </div>
        <StatusMarker status={status} size="sm" />
      </button>
      <Handle type="source" position={Position.Bottom} id="out" className={ghostHandle} />
    </div>
  );
}

function ChipNode({ data }: NodeProps<Node<ChipData>>) {
  const { label, status } = data;
  return (
    <div
      style={{ width: CHIP_W }}
      className={cn(
        'border bg-surface-container-low px-2.5 py-2 font-code text-[10px] leading-tight',
        status === 'complete'
          ? 'border-secondary/30 text-on-surface-variant'
          : status === 'locked'
            ? 'border-outline-variant/70 text-outline opacity-75'
            : 'border-outline-variant text-on-surface-variant',
      )}
    >
      <Handle type="target" position={Position.Left} id="in-l" className={ghostHandle} />
      <Handle type="target" position={Position.Right} id="in-r" className={ghostHandle} />
      <span className={cn('mr-1.5', status === 'complete' ? 'text-secondary' : 'text-outline')}>
        {status === 'complete' ? '▪' : '▫'}
      </span>
      {label}
    </div>
  );
}

function LabelNode({ data }: NodeProps<Node<LabelData>>) {
  return (
    <div className="pointer-events-none">
      <p className="micro-label text-outline">{`section ${data.index}`}</p>
      <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-on-surface">{data.title}</h3>
    </div>
  );
}

function JunctionNode({ data }: NodeProps<Node<JunctionData>>) {
  return (
    <div
      className={cn(
        'h-3 w-3 rotate-45 border transition-colors',
        data.open ? 'border-cyan bg-cyan/20 shadow-[0_0_12px_rgba(0,217,255,0.6)]' : 'border-outline-variant bg-surface-container-low',
      )}
    >
      <Handle type="target" position={Position.Top} id="in" className={ghostHandle} />
      <Handle type="source" position={Position.Bottom} id="out" className={ghostHandle} />
    </div>
  );
}

const nodeTypes = {
  module: ModuleNode,
  foundation: FoundationNode,
  chip: ChipNode,
  label: LabelNode,
  junction: JunctionNode,
};

// ── Edge styling ─────────────────────────────────────────────
const edgeDone = { stroke: C.cyan, strokeWidth: 2, filter: 'drop-shadow(0 0 3px rgba(0,217,255,0.5))' };
const edgeTodo = { stroke: C.edgeTodo, strokeWidth: 1.75, strokeDasharray: '4 4' };
const edgeNext = { stroke: C.cyanDim, strokeWidth: 1.75, strokeDasharray: '4 4' };

function chipEdgeStyle(status: NodeStatus) {
  return {
    stroke: status === 'complete' ? C.cyanDim : status === 'locked' ? C.edgeTodoLocked : C.edgeTodo,
    strokeWidth: 1.3,
    strokeDasharray: '2 5',
  };
}

function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const btn =
    'flex h-8 w-8 items-center justify-center text-on-surface-variant transition-colors hover:bg-cyan/10 hover:text-cyan';
  return (
    <Panel position="bottom-right" className="!m-3">
      <div className="flex items-center border border-outline-variant bg-surface/95 backdrop-blur">
        <button type="button" className={btn} onClick={() => zoomOut()} aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
        <span className="w-12 border-x border-outline-variant text-center font-code text-[10px] font-semibold text-on-surface-variant">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" className={btn} onClick={() => zoomIn()} aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
        <button
          type="button"
          className={cn(btn, 'border-l border-outline-variant')}
          onClick={() => fitView({ padding: 0.1, duration: 300 })}
          aria-label="Fit tree in view"
        >
          <Maximize className="h-3.5 w-3.5" />
        </button>
      </div>
    </Panel>
  );
}

// ── Graph builder ────────────────────────────────────────────
function buildGraph(data: UserData, pathId: string, reduceMotion: boolean) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const foundations = data.nodesByPath['foundations'] ?? [];
  const pathNodes = pathId === 'foundations' ? [] : (data.nodesByPath[pathId] ?? []);
  const path = data.paths.find((p) => p.id === pathId);
  const statusOf = (n: NodeRow) => data.nodeStatus(n.id);
  const current = [...foundations, ...pathNodes].find((n) => ['available', 'in_progress'].includes(statusOf(n)));
  // Nodes the initial fitView should frame: current + its immediate neighbors,
  // so the opening view is zoomed in enough to actually read (not the whole tree).
  let focusIds: string[] = [];
  const taskCount = (nodeId: string) => {
    const tasks = data.tasks.filter((t) => t.node_id === nodeId);
    return { total: tasks.length, done: tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length };
  };

  // Section 00 — foundations grid (2 columns) converging into a junction gate.
  nodes.push({ id: 'label-00', type: 'label', position: { x: -FOUND_W - 15, y: 0 }, data: { index: '00 // required', title: 'Foundations' }, draggable: false, selectable: false });
  const foundStartY = 64;
  foundations.forEach((n, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    nodes.push({
      id: n.id,
      type: 'foundation',
      position: { x: col === 0 ? -FOUND_W - 15 : 15, y: foundStartY + row * FOUND_PITCH_Y },
      data: { node: n, status: statusOf(n), isCurrent: current?.id === n.id },
      draggable: false,
    });
    if (current?.id === n.id) {
      focusIds = [n.id, foundations[i - 1]?.id, foundations[i + 1]?.id].filter((x): x is string => Boolean(x));
    }
  });

  const foundRows = Math.ceil(foundations.length / 2);
  const junctionY = foundStartY + foundRows * FOUND_PITCH_Y + 34;
  const gateOpen = foundations.length > 0 && foundations.every((n) => statusOf(n) === 'complete');
  nodes.push({ id: 'junction', type: 'junction', position: { x: -6, y: junctionY }, data: { open: gateOpen }, draggable: false, selectable: false });

  for (const n of foundations) {
    const complete = statusOf(n) === 'complete';
    edges.push({
      id: `e-${n.id}-junction`,
      source: n.id,
      sourceHandle: 'out',
      target: 'junction',
      targetHandle: 'in',
      style: complete ? edgeDone : edgeTodo,
    });
  }

  if (pathNodes.length === 0 || !path) {
    if (focusIds.length === 0) focusIds = foundations.slice(-2).map((n) => n.id);
    return { nodes, edges, focusIds };
  }

  // Section 01 — the specialization trunk.
  const trunkLabelY = junctionY + 70;
  const trunkStartY = trunkLabelY + 64;
  nodes.push({ id: 'label-01', type: 'label', position: { x: -MODULE_W / 2, y: trunkLabelY }, data: { index: '01 // specialization', title: path.title }, draggable: false, selectable: false });

  pathNodes.forEach((n, i) => {
    const status = statusOf(n);
    const { done, total } = taskCount(n.id);
    const y = trunkStartY + i * TRUNK_PITCH_Y;
    nodes.push({
      id: n.id,
      type: 'module',
      position: { x: -MODULE_W / 2, y },
      data: { node: n, status, done, total, isCurrent: current?.id === n.id, index: i + 1 },
      draggable: false,
    });
    if (current?.id === n.id) {
      focusIds = ['junction', n.id, pathNodes[i - 1]?.id, pathNodes[i + 1]?.id].filter((x): x is string => Boolean(x));
    }

    // Skill chips fan out on alternating sides (Whimsical-style curved satellites).
    const side: 'l' | 'r' = i % 2 === 0 ? 'r' : 'l';
    const chipX = side === 'r' ? MODULE_W / 2 + 70 : -MODULE_W / 2 - 70 - CHIP_W;
    n.skills.forEach((skill, si) => {
      const chipId = `chip-${n.id}-${si}`;
      nodes.push({
        id: chipId,
        type: 'chip',
        position: { x: chipX, y: y + 44 + (si - (n.skills.length - 1) / 2) * CHIP_PITCH_Y },
        data: { label: skill, status },
        draggable: false,
        selectable: false,
      });
      edges.push({
        id: `e-${chipId}`,
        source: n.id,
        sourceHandle: side === 'r' ? 'skills-r' : 'skills-l',
        target: chipId,
        targetHandle: side === 'r' ? 'in-l' : 'in-r',
        style: chipEdgeStyle(status),
      });
    });
  });

  // Junction gate → first trunk module.
  const first = pathNodes[0];
  const firstStatus = statusOf(first);
  edges.push({
    id: 'e-junction-first',
    source: 'junction',
    sourceHandle: 'out',
    target: first.id,
    targetHandle: 'in',
    animated: !reduceMotion && gateOpen && firstStatus !== 'complete',
    style: firstStatus === 'complete' ? edgeDone : gateOpen ? edgeNext : edgeTodo,
  });

  // Trunk edges follow the real prerequisite DAG within the path.
  const inPath = new Set(pathNodes.map((n) => n.id));
  for (const n of pathNodes) {
    for (const prereq of data.prereqs[n.id] ?? []) {
      if (!inPath.has(prereq)) continue; // foundation prereqs are represented by the junction
      const traversed = statusOf(n) === 'complete';
      const isNext = current?.id === n.id && data.nodeStatus(prereq) === 'complete';
      edges.push({
        id: `e-${prereq}-${n.id}`,
        source: prereq,
        sourceHandle: 'out',
        target: n.id,
        targetHandle: 'in',
        animated: !reduceMotion && isNext,
        style: traversed ? edgeDone : isNext ? edgeNext : edgeTodo,
      });
    }
  }

  if (focusIds.length === 0) focusIds = [...foundations, ...pathNodes].slice(-2).map((n) => n.id);
  return { nodes, edges, focusIds };
}

// ── Canvas ───────────────────────────────────────────────────
function Canvas({ data, pathId }: { data: UserData; pathId: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { nodes, edges, focusIds } = useMemo(() => buildGraph(data, pathId, reduceMotion), [data, pathId, reduceMotion]);

  return (
    <div className="relative h-[72vh] min-h-[540px] w-full border border-outline-variant bg-surface/70">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        // Open framed on where the user actually is (current node + neighbors), zoomed
        // in enough to read — not the whole tree. The ⛶ button fits everything.
        fitViewOptions={
          focusIds.length ? { nodes: focusIds.map((id) => ({ id })), padding: 0.45, maxZoom: 0.85 } : { padding: 0.15, maxZoom: 0.9 }
        }
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        zoomOnDoubleClick={false}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background variant={BackgroundVariant.Lines} gap={48} lineWidth={1} color="rgba(0, 217, 255, 0.07)" />
        <CanvasControls />
        <Panel position="top-left" className="!m-3">
          <p className="border border-outline-variant bg-surface/95 px-2 py-1 font-code text-[9px] uppercase tracking-[0.14em] text-on-surface-variant backdrop-blur">
            drag to pan · scroll to zoom
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function SkillTreeCanvas({ data, pathId }: { data: UserData; pathId: string }) {
  return (
    <ReactFlowProvider>
      <Canvas data={data} pathId={pathId} />
    </ReactFlowProvider>
  );
}
