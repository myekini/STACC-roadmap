'use client';

/**
 * CurriculumManager — Full Admin Curriculum Control Center
 *
 * 3-panel layout:
 *   LEFT  — Track selector sidebar (vertical tabs)
 *   CENTER — Module list with native HTML5 drag-and-drop reordering
 *   RIGHT  — Module editor: metadata, resources CRUD, tasks CRUD
 *
 * All edits are local-state until "Export Seed JSON" is clicked.
 * The JSON can then be applied to the DB / config by a developer.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Download,
  Edit3,
  FileCode,
  GripVertical,
  Layers,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';
import type { NodeRow, ResourceRow } from '@/lib/database.types';
import { cn } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────── */

type DraftResource = ResourceRow & { _draft?: boolean };
type DraftNode = NodeRow & {
  _resources: DraftResource[];
  _taskCount: number;
  _dirty?: boolean;
};

/* ─── Helpers ────────────────────────────────────────────── */

function blankResource(nodeId: string): DraftResource {
  return {
    id: `draft-res-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    node_id: nodeId,
    name: '',
    type: 'video',
    platform: '',
    url: '',
    cost: 'free',
    avg_rating: 0,
    rating_count: 0,
    created_at: new Date().toISOString(),
    _draft: true,
  };
}

/* ─── Sub-components ─────────────────────────────────────── */

function ResourceRow_({
  res,
  onUpdate,
  onDelete,
}: {
  res: DraftResource;
  onUpdate: (patch: Partial<DraftResource>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(res._draft ?? false);
  const [pending, setPending] = useState<Partial<DraftResource>>({});

  const save = () => {
    onUpdate(pending);
    setEditing(false);
    setPending({});
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-cyan/40 bg-cyan/[0.04] p-3 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Resource name"
            defaultValue={res.name}
            onChange={(e) => setPending((p) => ({ ...p, name: e.target.value }))}
            className="h-7 text-xs"
          />
          <Input
            placeholder="Platform (e.g. YouTube)"
            defaultValue={res.platform}
            onChange={(e) => setPending((p) => ({ ...p, platform: e.target.value }))}
            className="h-7 text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="URL (https://...)"
            defaultValue={res.url}
            onChange={(e) => setPending((p) => ({ ...p, url: e.target.value }))}
            className="col-span-2 h-7 text-xs"
          />
          <select
            defaultValue={res.type}
            onChange={(e) => setPending((p) => ({ ...p, type: e.target.value as ResourceRow['type'] }))}
            className="rounded-xl border border-outline-variant bg-surface-card px-2 py-1 text-xs text-on-surface focus:outline-none"
          >
            <option value="video">Video</option>
            <option value="documentation">Documentation</option>
            <option value="article">Article</option>
            <option value="course">Course</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={save}
            disabled={!((pending.name ?? res.name) && (pending.url ?? res.url))}
            className="h-7 px-3 font-code text-xs gap-1 bg-cyan text-navy hover:bg-cyan/90"
          >
            <Check className="h-3 w-3" /> Save
          </Button>
          <button
            type="button"
            onClick={() => { setEditing(false); setPending({}); }}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/60 bg-surface/50 px-3 py-2 text-xs group">
      <div className="flex items-center gap-2.5 min-w-0">
        {res.type === 'video'
          ? <Video className="h-3.5 w-3.5 text-cyan shrink-0" />
          : <FileCode className="h-3.5 w-3.5 text-secondary shrink-0" />}
        <div className="min-w-0">
          <p className="font-semibold text-on-surface truncate">{res.name || <em className="text-outline">Unnamed</em>}</p>
          <p className="text-[10px] text-on-surface-variant truncate">{res.platform} · {res.url || '—'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-cyan hover:text-cyan"
          title="Edit resource"
        >
          <Edit3 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-red-400 hover:text-red-400"
          title="Remove resource"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export function CurriculumManager() {
  const { paths, nodesByPath, tasks, resources } = useUserData();

  // ── Draft state ──────────────────────────────────────────
  const [selectedPathId, setSelectedPathId] = useState<string>(paths[0]?.id ?? 'foundations');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Per-path module orders (draft)
  const [pathNodeOrders, setPathNodeOrders] = useState<Record<string, string[]>>({});

  // Per-node resource drafts
  const [nodeResources, setNodeResources] = useState<Record<string, DraftResource[]>>({});

  // Per-node metadata edits
  const [nodeMeta, setNodeMeta] = useState<Record<string, Partial<NodeRow>>>({});

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'resource'; nodeId: string; resId: string } | null>(null);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  // ── Derived ───────────────────────────────────────────────
  const activePath = paths.find((p) => p.id === selectedPathId) ?? paths[0];
  const seedNodes = useMemo(
    () => (nodesByPath[selectedPathId] ?? []).slice().sort((a, b) => a.order - b.order),
    [nodesByPath, selectedPathId]
  );

  const orderedIds = pathNodeOrders[selectedPathId] ?? seedNodes.map((n) => n.id);

  const orderedNodes: DraftNode[] = useMemo(
    () =>
      orderedIds
        .map((id) => seedNodes.find((n) => n.id === id))
        .filter((n): n is NodeRow => Boolean(n))
        .map((n) => ({
          ...n,
          ...(nodeMeta[n.id] ?? {}),
          _resources: nodeResources[n.id] ?? resources.filter((r) => r.node_id === n.id),
          _taskCount: tasks.filter((t) => t.node_id === n.id).length,
          _dirty: Boolean(nodeMeta[n.id]),
        })),
    [orderedIds, seedNodes, nodeMeta, nodeResources, resources, tasks]
  );

  const activeNode = orderedNodes.find((n) => n.id === selectedNodeId) ?? orderedNodes[0] ?? null;

  // ── Drag-and-drop handlers ────────────────────────────────
  const handleDragStart = useCallback((idx: number) => {
    dragItem.current = idx;
  }, []);

  const handleDragEnter = useCallback((idx: number) => {
    dragOver.current = idx;
  }, []);

  const handleDragEnd = useCallback(() => {
    const from = dragItem.current;
    const to = dragOver.current;
    if (from === null || to === null || from === to) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }
    const newOrder = [...orderedIds];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setPathNodeOrders((prev) => ({ ...prev, [selectedPathId]: newOrder }));
    dragItem.current = null;
    dragOver.current = null;
  }, [orderedIds, selectedPathId]);

  // ── Resource handlers ─────────────────────────────────────
  const getResources = useCallback(
    (nodeId: string): DraftResource[] =>
      nodeResources[nodeId] ?? resources.filter((r) => r.node_id === nodeId),
    [nodeResources, resources]
  );

  const addResource = useCallback((nodeId: string) => {
    setNodeResources((prev) => ({
      ...prev,
      [nodeId]: [...getResources(nodeId), blankResource(nodeId)],
    }));
  }, [getResources]);

  const updateResource = useCallback(
    (nodeId: string, resId: string, patch: Partial<DraftResource>) => {
      setNodeResources((prev) => ({
        ...prev,
        [nodeId]: getResources(nodeId).map((r) =>
          r.id === resId ? { ...r, ...patch, _draft: false } : r
        ),
      }));
    },
    [getResources]
  );

  const deleteResource = useCallback((nodeId: string, resId: string) => {
    setNodeResources((prev) => ({
      ...prev,
      [nodeId]: getResources(nodeId).filter((r) => r.id !== resId),
    }));
    setConfirmDelete(null);
  }, [getResources]);

  // ── Metadata handlers ─────────────────────────────────────
  const updateNodeMeta = useCallback((nodeId: string, patch: Partial<NodeRow>) => {
    setNodeMeta((prev) => ({ ...prev, [nodeId]: { ...(prev[nodeId] ?? {}), ...patch } }));
  }, []);

  // ── Export ────────────────────────────────────────────────
  const handleExportJson = () => {
    const fullSeed = {
      paths,
      nodes: orderedNodes.map((n, i) => ({
        ...n,
        order: i + 1,
        _resources: undefined,
        _taskCount: undefined,
        _dirty: undefined,
      })),
      resources: orderedNodes.flatMap((n) => getResources(n.id)),
      tasks: tasks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullSeed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stacc_curriculum_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dirtyCount = Object.keys(nodeMeta).length +
    Object.values(nodeResources).reduce((s, arr) => s + arr.filter((r) => r._draft === false).length, 0);

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-0 h-full">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-5 py-3.5">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface">Curriculum Control</h2>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Drag modules to reorder · Edit resources inline · Export full seed JSON
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {dirtyCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/10 px-3 py-1.5 font-code text-[11px] font-bold text-cyan">
              <AlertTriangle className="h-3 w-3" />
              {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJson}
            className="font-code text-xs gap-1.5 border-outline-variant rounded-xl"
          >
            <Download className="h-3.5 w-3.5" /> Export Seed JSON
          </Button>
        </div>
      </div>

      {/* ── 3-panel body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── PANEL 1: Track selector sidebar ── */}
        <aside className="flex w-48 shrink-0 flex-col border-r border-outline-variant bg-surface">
          <p className="px-4 pt-4 pb-2 font-code text-[10px] font-bold uppercase tracking-widest text-outline">
            Tracks
          </p>
          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {paths.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPathId(p.id);
                  setSelectedNodeId(null);
                }}
                className={cn(
                  'w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all flex items-center justify-between gap-1',
                  selectedPathId === p.id
                    ? 'bg-cyan/15 text-cyan border border-cyan/40'
                    : 'text-on-surface-variant hover:bg-surface-card hover:text-on-surface',
                )}
              >
                <span className="truncate">{p.title}</span>
                {selectedPathId === p.id && <ChevronRight className="h-3 w-3 shrink-0" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── PANEL 2: Module list (drag-and-drop) ── */}
        <div className="flex w-64 shrink-0 flex-col border-r border-outline-variant bg-surface">
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <span className="font-code text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan" />
              {activePath?.title} <span className="text-outline">({orderedNodes.length})</span>
            </span>
          </div>

          <ul className="flex-1 overflow-y-auto p-2 space-y-1.5" onDragOver={(e) => e.preventDefault()}>
            {orderedNodes.map((node, idx) => {
              const isSelected = activeNode?.id === node.id;
              return (
                <li
                  key={node.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-start gap-2 rounded-xl border p-2.5 cursor-pointer select-none transition-all text-xs',
                    isSelected
                      ? 'border-cyan bg-cyan/10 text-on-surface shadow-md'
                      : 'border-outline-variant/40 bg-surface-card text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
                  )}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 mt-0.5 text-outline cursor-grab active:cursor-grabbing" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate text-on-surface leading-4">
                      <span className="text-outline font-normal mr-1">{idx + 1}.</span>
                      {node.name}
                      {node._dirty && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-cyan inline-block align-middle" title="Unsaved changes" />}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">{node.subtitle}</p>
                  </div>
                  <span className="shrink-0 font-code text-[10px] text-outline mt-0.5">{node.est_hours}h</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── PANEL 3: Module editor ── */}
        <div className="flex-1 overflow-y-auto bg-background">
          {activeNode ? (
            <ModuleEditor
              node={activeNode}
              onMetaChange={(patch) => updateNodeMeta(activeNode.id, patch)}
              onAddResource={() => addResource(activeNode.id)}
              onUpdateResource={(resId, patch) => updateResource(activeNode.id, resId, patch)}
              onDeleteResource={(resId) => setConfirmDelete({ type: 'resource', nodeId: activeNode.id, resId })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center p-12">
              <div>
                <AnimatedStaccMark className="h-10 w-10 mx-auto opacity-30" />
                <p className="mt-4 text-sm text-on-surface-variant">Select a module to view and edit its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog open={Boolean(confirmDelete)} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the resource from the module&apos;s curriculum. You can restore it from the seed JSON if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) deleteResource(confirmDelete.nodeId, confirmDelete.resId);
              }}
              className="bg-red-500 text-white hover:bg-red-600 font-code text-xs rounded-xl"
            >
              Remove Resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Module Editor panel ────────────────────────────────── */

function ModuleEditor({
  node,
  onMetaChange,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: {
  node: DraftNode;
  onMetaChange: (patch: Partial<NodeRow>) => void;
  onAddResource: () => void;
  onUpdateResource: (resId: string, patch: Partial<DraftResource>) => void;
  onDeleteResource: (resId: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
      {/* Module metadata header */}
      <div className="space-y-3 border-b border-outline-variant pb-5">
        <div className="flex items-center gap-2 font-code text-xs text-cyan">
          <span>Module {node.order}</span>
          <span className="text-outline">·</span>
          <span>{node.path_id}</span>
          {node._dirty && (
            <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan text-[10px] font-code uppercase">
              Edited
            </Badge>
          )}
        </div>

        {/* Editable name */}
        <input
          className="w-full bg-transparent font-display text-2xl font-bold text-on-surface focus:outline-none border-b border-transparent focus:border-cyan/40 pb-0.5 transition-colors"
          defaultValue={node.name}
          placeholder="Module name…"
          onBlur={(e) => {
            if (e.target.value !== node.name) onMetaChange({ name: e.target.value });
          }}
        />

        {/* Editable subtitle + est hours */}
        <div className="flex items-center gap-3">
          <input
            className="flex-1 bg-transparent text-sm text-on-surface-variant focus:outline-none border-b border-transparent focus:border-outline-variant/60 pb-0.5 transition-colors"
            defaultValue={node.subtitle}
            placeholder="One-line subtitle…"
            onBlur={(e) => {
              if (e.target.value !== node.subtitle) onMetaChange({ subtitle: e.target.value });
            }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="font-code text-[11px] text-outline">Est. hours</label>
            <input
              type="number"
              min="1"
              max="100"
              className="w-14 rounded-lg border border-outline-variant bg-surface-card px-2 py-1 font-code text-xs text-on-surface focus:outline-none focus:border-cyan"
              defaultValue={node.est_hours}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v !== node.est_hours) onMetaChange({ est_hours: v });
              }}
            />
          </div>
        </div>
      </div>

      {/* Skills tags */}
      {node.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {node.skills.map((s) => (
            <span key={s} className="rounded-md border border-outline-variant/60 bg-surface-card px-2 py-0.5 font-code text-[10px] text-on-surface-variant">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Resources section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan" />
            Learning Resources
            <span className="font-code text-xs text-outline font-normal">({node._resources.length})</span>
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddResource}
            className="h-7 gap-1.5 px-3 font-code text-xs rounded-xl border-outline-variant hover:border-cyan"
          >
            <Plus className="h-3 w-3" /> Add Resource
          </Button>
        </div>

        <div className="space-y-2">
          {node._resources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/60 py-6 text-center">
              <p className="text-xs text-on-surface-variant">No resources yet — click <strong>Add Resource</strong> to get started.</p>
            </div>
          ) : (
            node._resources.map((res) => (
              <ResourceRow_
                key={res.id}
                res={res}
                onUpdate={(patch) => onUpdateResource(res.id, patch)}
                onDelete={() => onDeleteResource(res.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Tasks section */}
      <section className="space-y-3 border-t border-outline-variant/60 pt-5">
        <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
          <Code2 className="h-4 w-4 text-cyan" />
          Module Tasks
          <span className="font-code text-xs text-outline font-normal">({node._taskCount})</span>
        </h4>

        {node._taskCount === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/60 py-6 text-center">
            <p className="text-xs text-on-surface-variant">Tasks are defined in the seed config (roadmap.ts).</p>
            <p className="text-[11px] text-outline mt-1">Export seed JSON to edit and re-import tasks.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/60 bg-surface-card px-3 py-2 font-code text-xs text-on-surface-variant">
            {node._taskCount} task{node._taskCount !== 1 ? 's' : ''} defined · managed via seed JSON
          </div>
        )}
      </section>
    </div>
  );
}
