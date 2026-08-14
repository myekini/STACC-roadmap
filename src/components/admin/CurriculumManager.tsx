'use client';

/**
 * CurriculumManager — Full Admin Curriculum Control Center
 *
 * 3-panel layout:
 *   LEFT   — Track (path) selector + create/rename/delete
 *   CENTER — Module (node) list: create/delete, native HTML5 drag reorder
 *   RIGHT  — Module editor: metadata, skills, prerequisites, resources, tasks
 *
 * Every mutation calls a security-definer admin RPC via useCurriculumAdmin —
 * there is no local-only draft state left. In localStorage demo mode
 * (`connected === false`) curriculum content is compiled into the app bundle
 * and there is no runtime target to write to, so the panel renders read-only.
 */

import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Code2,
  Edit3,
  FileCode,
  GripVertical,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useCurriculumAdmin } from '@/hooks/useCurriculumAdmin';
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
import type { ChallengePayload, NodeRow, PathRow, QuizPayload, ResourceRow, TaskRow, TaskType } from '@/lib/database.types';
import { cn } from '@/lib/utils';

/* ─── Shared field styles ────────────────────────────────── */

const fieldCls = 'rounded-xl border border-outline-variant bg-surface-card px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-cyan disabled:opacity-50';

function toCsv(list: string[] | undefined) {
  return (list ?? []).join(', ');
}
function fromCsv(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

/* ─── Resource row ───────────────────────────────────────── */

function ResourceRow({
  res,
  onSave,
  onDelete,
  disabled,
}: {
  res: ResourceRow;
  onSave: (patch: Partial<ResourceRow>) => Promise<void>;
  onDelete: () => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<Partial<ResourceRow>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(pending);
      setEditing(false);
      setPending({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save resource.');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-cyan/40 bg-cyan/[0.04] p-3 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Resource name" defaultValue={res.name} onChange={(e) => setPending((p) => ({ ...p, name: e.target.value }))} className="h-7 text-xs" />
          <Input placeholder="Platform (e.g. YouTube)" defaultValue={res.platform} onChange={(e) => setPending((p) => ({ ...p, platform: e.target.value }))} className="h-7 text-xs" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="URL (https://...)" defaultValue={res.url} onChange={(e) => setPending((p) => ({ ...p, url: e.target.value }))} className="col-span-2 h-7 text-xs" />
          <select defaultValue={res.type} onChange={(e) => setPending((p) => ({ ...p, type: e.target.value as ResourceRow['type'] }))} className={fieldCls}>
            <option value="video">Video</option>
            <option value="documentation">Documentation</option>
            <option value="article">Article</option>
            <option value="course">Course</option>
            <option value="project">Project</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={saving || !((pending.name ?? res.name) && (pending.url ?? res.url))} className="h-7 px-3 font-code text-xs gap-1 bg-cyan text-navy hover:bg-cyan/90">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Save
          </Button>
          <button type="button" onClick={() => { setEditing(false); setPending({}); }} className="text-on-surface-variant hover:text-on-surface">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/60 bg-surface/50 px-3 py-2 text-xs group">
      <div className="flex items-center gap-2.5 min-w-0">
        {res.type === 'video' ? <Video className="h-3.5 w-3.5 text-cyan shrink-0" /> : <FileCode className="h-3.5 w-3.5 text-secondary shrink-0" />}
        <div className="min-w-0">
          <p className="font-semibold text-on-surface truncate">{res.name || <em className="text-outline">Unnamed</em>}</p>
          <p className="text-[10px] text-on-surface-variant truncate">{res.platform} · {res.url || '—'}</p>
        </div>
      </div>
      {!disabled && (
        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-cyan hover:text-cyan" title="Edit resource">
            <Edit3 className="h-3 w-3" />
          </button>
          <button type="button" onClick={onDelete} className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-red-400 hover:text-red-400" title="Remove resource">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Task editor ────────────────────────────────────────── */

function blankQuiz(): QuizPayload {
  return { questions: [{ question: '', options: ['', ''], correctIndex: 0, explanation: '' }] };
}
function blankChallenge(language: 'python' | 'sql'): ChallengePayload {
  return language === 'python'
    ? { language: 'python', prompt: '', starterCode: '', testCode: '' }
    : { language: 'sql', prompt: '', starterCode: '', setupSql: '', expectedRows: [] };
}

function TaskEditor({
  task,
  onSave,
  onCancel,
  disabled,
}: {
  task: Partial<TaskRow> & { node_id: string };
  onSave: (task: Partial<TaskRow> & { node_id: string }) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<Partial<TaskRow> & { node_id: string }>(task);
  const [saving, setSaving] = useState(false);
  const type: TaskType = draft.type ?? 'read';

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save task.');
    } finally {
      setSaving(false);
    }
  };

  const quiz = draft.quiz;
  const updateQuiz = (patch: Partial<QuizPayload>) => setDraft((d) => ({ ...d, quiz: { ...(d.quiz ?? blankQuiz()), ...patch } }));

  return (
    <div className="rounded-xl border border-cyan/40 bg-cyan/[0.04] p-3 space-y-3 text-xs">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={type}
          disabled={disabled}
          onChange={(e) => {
            const t = e.target.value as TaskType;
            setDraft((d) => ({
              ...d,
              type: t,
              quiz: t === 'quiz' ? (d.quiz ?? blankQuiz()) : null,
              challenge: t === 'challenge' ? (d.challenge ?? blankChallenge('python')) : null,
            }));
          }}
          className={cn(fieldCls, 'col-span-1')}
        >
          <option value="read">Read</option>
          <option value="watch">Watch</option>
          <option value="build">Build (project milestone)</option>
          <option value="quiz">Quiz</option>
          <option value="challenge">Code challenge</option>
        </select>
        <Input
          placeholder="Order"
          type="number"
          defaultValue={draft.order ?? 1}
          onChange={(e) => setDraft((d) => ({ ...d, order: parseInt(e.target.value, 10) || 1 }))}
          className="h-8 text-xs"
        />
      </div>
      <textarea
        placeholder="Task description shown to the learner…"
        defaultValue={draft.description ?? ''}
        disabled={disabled}
        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        className={cn(fieldCls, 'w-full min-h-[60px] resize-y')}
      />

      {type === 'quiz' && quiz && (
        <div className="space-y-2 border-t border-outline-variant/60 pt-2">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-outline-variant/60 p-2 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Question"
                  defaultValue={q.question}
                  onChange={(e) => {
                    const questions = [...quiz.questions];
                    questions[qi] = { ...q, question: e.target.value };
                    updateQuiz({ questions });
                  }}
                  className="h-7 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => updateQuiz({ questions: quiz.questions.filter((_, i) => i !== qi) })}
                  className="text-on-surface-variant hover:text-red-400 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-1.5 pl-3">
                  <input
                    type="radio"
                    checked={q.correctIndex === oi}
                    onChange={() => {
                      const questions = [...quiz.questions];
                      questions[qi] = { ...q, correctIndex: oi };
                      updateQuiz({ questions });
                    }}
                  />
                  <Input
                    placeholder={`Option ${oi + 1}`}
                    defaultValue={opt}
                    onChange={(e) => {
                      const questions = [...quiz.questions];
                      const options = [...q.options];
                      options[oi] = e.target.value;
                      questions[qi] = { ...q, options };
                      updateQuiz({ questions });
                    }}
                    className="h-6 text-xs flex-1"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const questions = [...quiz.questions];
                  questions[qi] = { ...q, options: [...q.options, ''] };
                  updateQuiz({ questions });
                }}
                className="pl-3 text-[10px] text-cyan hover:underline"
              >
                + option
              </button>
              <Input
                placeholder="Explanation (shown after answering)"
                defaultValue={q.explanation}
                onChange={(e) => {
                  const questions = [...quiz.questions];
                  questions[qi] = { ...q, explanation: e.target.value };
                  updateQuiz({ questions });
                }}
                className="h-6 text-xs"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateQuiz({ questions: [...quiz.questions, { question: '', options: ['', ''], correctIndex: 0, explanation: '' }] })}
            className="text-[11px] text-cyan hover:underline"
          >
            + add question
          </button>
        </div>
      )}

      {type === 'challenge' && draft.challenge && (
        <div className="space-y-2 border-t border-outline-variant/60 pt-2">
          <select
            value={draft.challenge.language}
            onChange={(e) => setDraft((d) => ({ ...d, challenge: blankChallenge(e.target.value as 'python' | 'sql') }))}
            className={fieldCls}
          >
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
          <textarea
            placeholder="Prompt"
            defaultValue={draft.challenge.prompt}
            onChange={(e) => setDraft((d) => (d.challenge ? { ...d, challenge: { ...d.challenge, prompt: e.target.value } } : d))}
            className={cn(fieldCls, 'w-full min-h-[50px] resize-y')}
          />
          <textarea
            placeholder="Starter code"
            defaultValue={draft.challenge.starterCode}
            onChange={(e) => setDraft((d) => (d.challenge ? { ...d, challenge: { ...d.challenge, starterCode: e.target.value } } : d))}
            className={cn(fieldCls, 'w-full min-h-[70px] resize-y font-mono')}
          />
          {draft.challenge.language === 'python' ? (
            <textarea
              placeholder="Test code (plain assert statements)"
              defaultValue={draft.challenge.testCode}
              onChange={(e) => setDraft((d) => (d.challenge?.language === 'python' ? { ...d, challenge: { ...d.challenge, testCode: e.target.value } } : d))}
              className={cn(fieldCls, 'w-full min-h-[70px] resize-y font-mono')}
            />
          ) : (
            <>
              <textarea
                placeholder="Setup SQL (seeds the in-memory SQLite db)"
                defaultValue={draft.challenge.setupSql}
                onChange={(e) => setDraft((d) => (d.challenge?.language === 'sql' ? { ...d, challenge: { ...d.challenge, setupSql: e.target.value } } : d))}
                className={cn(fieldCls, 'w-full min-h-[60px] resize-y font-mono')}
              />
              <textarea
                placeholder='Expected rows — JSON array, e.g. [{"id":1}]'
                defaultValue={JSON.stringify(draft.challenge.expectedRows ?? [])}
                onBlur={(e) => {
                  try {
                    const expectedRows = JSON.parse(e.target.value);
                    setDraft((d) => (d.challenge?.language === 'sql' ? { ...d, challenge: { ...d.challenge, expectedRows } } : d));
                  } catch {
                    alert('Expected rows must be valid JSON.');
                  }
                }}
                className={cn(fieldCls, 'w-full min-h-[50px] resize-y font-mono')}
              />
            </>
          )}
        </div>
      )}

      {type === 'build' && (
        <div className="space-y-2 border-t border-outline-variant/60 pt-2">
          <p className="font-code text-[10px] uppercase text-outline">Project requirements (optional)</p>
          <Input
            placeholder="Required file paths, comma-separated"
            defaultValue={toCsv(draft.project_requirements?.requiredPaths)}
            onChange={(e) => setDraft((d) => ({ ...d, project_requirements: { ...(d.project_requirements ?? {}), requiredPaths: fromCsv(e.target.value) } }))}
            className="h-7 text-xs"
          />
          <select
            defaultValue={draft.project_requirements?.submissionMode ?? 'commit'}
            onChange={(e) => setDraft((d) => ({ ...d, project_requirements: { ...(d.project_requirements ?? {}), submissionMode: e.target.value as 'commit' | 'pull_request' } }))}
            className={fieldCls}
          >
            <option value="commit">Verify latest commit</option>
            <option value="pull_request">Require a pull request</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={save} disabled={disabled || saving || !draft.description} className="h-7 px-3 font-code text-xs gap-1 bg-cyan text-navy hover:bg-cyan/90">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Save task
        </Button>
        <button type="button" onClick={onCancel} className="text-on-surface-variant hover:text-on-surface">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

type DeleteTarget =
  | { type: 'resource'; id: string; nodeId: string; label: string }
  | { type: 'task'; id: string; label: string }
  | { type: 'node'; id: string; label: string }
  | { type: 'path'; id: string; label: string };

export function CurriculumManager() {
  const { paths, nodesByPath, tasks, resources, prereqs } = useUserData();
  const admin = useCurriculumAdmin();
  const disabled = !admin.connected;

  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<PathRow | 'new' | null>(null);
  const [addingNode, setAddingNode] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingPrereqs, setEditingPrereqs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const activePathId = selectedPathId ?? paths[0]?.id ?? null;
  const activePath = paths.find((p) => p.id === activePathId) ?? null;
  const orderedNodes = useMemo(
    () => (activePathId ? (nodesByPath[activePathId] ?? []).slice().sort((a, b) => a.order - b.order) : []),
    [nodesByPath, activePathId],
  );
  const activeNode = orderedNodes.find((n) => n.id === selectedNodeId) ?? orderedNodes[0] ?? null;
  const nodeResources = activeNode ? resources.filter((r) => r.node_id === activeNode.id) : [];
  const nodeTasks = activeNode ? tasks.filter((t) => t.node_id === activeNode.id).sort((a, b) => a.order - b.order) : [];

  const runMutation = async (fn: () => Promise<unknown>) => {
    setErrorMsg(null);
    try {
      await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setErrorMsg(message);
      throw err;
    }
  };

  const handleDragEnd = async () => {
    const from = dragItem.current;
    const to = dragOver.current;
    dragItem.current = null;
    dragOver.current = null;
    if (from === null || to === null || from === to || !activePathId) return;
    const newOrder = [...orderedNodes];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    await runMutation(() => admin.reorderNodes({ pathId: activePathId, orderedIds: newOrder.map((n) => n.id) })).catch(() => {});
  };

  const confirmAndDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'resource') await runMutation(() => admin.deleteResource(confirmDelete.id));
      if (confirmDelete.type === 'task') await runMutation(() => admin.deleteTask(confirmDelete.id));
      if (confirmDelete.type === 'node') {
        await runMutation(() => admin.deleteNode(confirmDelete.id));
        setSelectedNodeId(null);
      }
      if (confirmDelete.type === 'path') {
        await runMutation(() => admin.deletePath(confirmDelete.id));
        setSelectedPathId(null);
        setSelectedNodeId(null);
      }
    } catch {
      // error surfaced via errorMsg banner
    } finally {
      setConfirmDelete(null);
    }
  };

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
            Every edit here writes straight to the live curriculum — changes are visible to members immediately.
          </p>
        </div>
        {admin.isMutating && (
          <span className="flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/10 px-3 py-1.5 font-code text-[11px] font-bold text-cyan">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        )}
      </div>

      {disabled && (
        <div className="flex items-center gap-2 border-b border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Read-only preview — curriculum content lives in the app bundle in local demo mode. Connect a Supabase project to edit it.
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center justify-between gap-2 border-b border-red-500/40 bg-red-500/10 px-5 py-2.5 text-xs text-red-500">
          <span className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── 3-panel body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── PANEL 1: Track selector sidebar ── */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-outline-variant bg-surface">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="font-code text-[10px] font-bold uppercase tracking-widest text-outline">Tracks</p>
            {!disabled && (
              <button type="button" onClick={() => setEditingPath('new')} className="text-cyan hover:text-cyan/80" title="New track">
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {paths.map((p) => (
              <div key={p.id} className="group relative">
                <button
                  type="button"
                  onClick={() => { setSelectedPathId(p.id); setSelectedNodeId(null); }}
                  className={cn(
                    'w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all flex items-center justify-between gap-1 pr-12',
                    activePathId === p.id ? 'bg-cyan/15 text-cyan border border-cyan/40' : 'text-on-surface-variant hover:bg-surface-card hover:text-on-surface',
                  )}
                >
                  <span className="truncate">{p.title}</span>
                  {activePathId === p.id && <ChevronRight className="h-3 w-3 shrink-0" />}
                </button>
                {!disabled && (
                  <span className="absolute right-1.5 top-1.5 hidden gap-0.5 group-hover:flex">
                    <button type="button" onClick={() => setEditingPath(p)} className="rounded-md p-1 text-on-surface-variant hover:text-cyan" title="Edit track">
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ type: 'path', id: p.id, label: p.title })}
                      className="rounded-md p-1 text-on-surface-variant hover:text-red-400"
                      title="Delete track"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── PANEL 2: Module list ── */}
        <div className="flex w-64 shrink-0 flex-col border-r border-outline-variant bg-surface">
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <span className="font-code text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan" />
              {activePath?.title} <span className="text-outline">({orderedNodes.length})</span>
            </span>
            {!disabled && activePath && (
              <button type="button" onClick={() => setAddingNode(true)} className="text-cyan hover:text-cyan/80" title="New module">
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <ul className="flex-1 overflow-y-auto p-2 space-y-1.5" onDragOver={(e) => e.preventDefault()}>
            {addingNode && activePath && (
              <NewNodeForm
                pathId={activePath.id}
                nextOrder={orderedNodes.length + 1}
                onCancel={() => setAddingNode(false)}
                onCreate={async (draft) => {
                  await runMutation(async () => {
                    const created = await admin.upsertNode(draft);
                    setSelectedNodeId(created.id);
                  });
                  setAddingNode(false);
                }}
              />
            )}
            {orderedNodes.map((node, idx) => {
              const isSelected = activeNode?.id === node.id;
              return (
                <li
                  key={node.id}
                  draggable={!disabled}
                  onDragStart={() => { dragItem.current = idx; }}
                  onDragEnter={() => { dragOver.current = idx; }}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'group flex items-start gap-2 rounded-xl border p-2.5 cursor-pointer select-none transition-all text-xs',
                    isSelected ? 'border-cyan bg-cyan/10 text-on-surface shadow-md' : 'border-outline-variant/40 bg-surface-card text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
                  )}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {!disabled && <GripVertical className="h-3.5 w-3.5 shrink-0 mt-0.5 text-outline cursor-grab active:cursor-grabbing" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate text-on-surface leading-4">
                      <span className="text-outline font-normal mr-1">{idx + 1}.</span>
                      {node.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">{node.subtitle}</p>
                  </div>
                  <span className="shrink-0 font-code text-[10px] text-outline mt-0.5">{node.est_hours}h</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'node', id: node.id, label: node.name }); }}
                      className="hidden shrink-0 text-on-surface-variant hover:text-red-400 group-hover:block"
                      title="Delete module"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
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
              allNodes={paths.flatMap((p) => (nodesByPath[p.id] ?? []).map((n) => ({ ...n, pathTitle: p.title })))}
              nodePrereqs={prereqs[activeNode.id] ?? []}
              resources={nodeResources}
              tasks={nodeTasks}
              disabled={disabled}
              addingTask={addingTask}
              editingTaskId={editingTaskId}
              editingPrereqs={editingPrereqs}
              onStartAddTask={() => setAddingTask(true)}
              onStartEditTask={(id) => setEditingTaskId(id)}
              onStopEditTask={() => { setAddingTask(false); setEditingTaskId(null); }}
              onStartEditPrereqs={() => setEditingPrereqs(true)}
              onStopEditPrereqs={() => setEditingPrereqs(false)}
              onSaveMeta={(patch) => runMutation(() => admin.upsertNode({
                id: activeNode.id, path_id: activeNode.path_id, slug: activeNode.slug,
                name: activeNode.name, subtitle: activeNode.subtitle, description: activeNode.description,
                icon: activeNode.icon, order: activeNode.order, est_hours: activeNode.est_hours,
                xp_reward: activeNode.xp_reward, skills: activeNode.skills, ...patch,
              }))}
              onSavePrereqs={(ids) => runMutation(() => admin.setNodePrerequisites({ nodeId: activeNode.id, prerequisiteIds: ids })).then(() => setEditingPrereqs(false))}
              onAddResource={() => runMutation(() => admin.upsertResource({ id: null, node_id: activeNode.id, name: 'New resource', type: 'article', platform: '', url: '', cost: 'free' }))}
              onSaveResource={(id, patch) => runMutation(async () => {
                const current = nodeResources.find((r) => r.id === id);
                if (!current) return;
                await admin.upsertResource({ id, node_id: activeNode.id, name: current.name, type: current.type, platform: current.platform, url: current.url, cost: current.cost, ...patch });
              })}
              onDeleteResource={(id, label) => setConfirmDelete({ type: 'resource', id, nodeId: activeNode.id, label })}
              onSaveTask={(task) => runMutation(async () => {
                await admin.upsertTask({
                  id: task.id ?? null,
                  node_id: activeNode.id,
                  description: task.description ?? '',
                  type: task.type ?? 'read',
                  order: task.order ?? nodeTasks.length + 1,
                  quiz: task.quiz ?? null,
                  challenge: task.challenge ?? null,
                  project_requirements: task.project_requirements ?? null,
                });
                setAddingTask(false);
                setEditingTaskId(null);
              })}
              onDeleteTask={(id, label) => setConfirmDelete({ type: 'task', id, label })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center p-12">
              <div>
                <AnimatedStaccMark className="h-10 w-10 mx-auto opacity-30" />
                <p className="mt-4 text-sm text-on-surface-variant">
                  {activePath ? 'Select a module to view and edit its content' : 'Create a track to get started'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Path create/edit dialog ── */}
      {editingPath && (
        <PathFormDialog
          path={editingPath === 'new' ? null : editingPath}
          existingIds={paths.map((p) => p.id)}
          onClose={() => setEditingPath(null)}
          onSave={async (draft) => {
            await runMutation(async () => {
              const saved = await admin.upsertPath(draft);
              setSelectedPathId(saved.id);
            });
            setEditingPath(null);
          }}
        />
      )}

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog open={Boolean(confirmDelete)} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{confirmDelete?.label}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.type === 'path'
                ? 'A track can only be deleted once every module in it is removed.'
                : 'This removes it from the live curriculum immediately — members currently viewing it will no longer see it.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndDelete} className="bg-red-500 text-white hover:bg-red-600 font-code text-xs rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── New module (node) inline form ──────────────────────── */

function NewNodeForm({
  pathId,
  nextOrder,
  onCreate,
  onCancel,
}: {
  pathId: string;
  nextOrder: number;
  onCreate: (draft: Parameters<ReturnType<typeof useCurriculumAdmin>['upsertNode']>[0]) => Promise<void>;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      await onCreate({
        id: null, path_id: pathId, slug: slug.trim(), name: name.trim(), subtitle: '', description: '',
        icon: 'database', order: nextOrder, est_hours: 8, xp_reward: 100, skills: [],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-cyan/40 bg-cyan/[0.04] p-2.5 space-y-1.5 text-xs">
      <Input placeholder="Module slug (e.g. de-etl)" value={slug} onChange={(e) => setSlug(e.target.value)} className="h-7 text-xs" />
      <Input placeholder="Module name" value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs" />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={create} disabled={saving || !slug.trim() || !name.trim()} className="h-6 px-2.5 font-code text-[11px] gap-1 bg-cyan text-navy hover:bg-cyan/90">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Create
        </Button>
        <button type="button" onClick={onCancel} className="text-on-surface-variant hover:text-on-surface"><X className="h-3.5 w-3.5" /></button>
      </div>
    </li>
  );
}

/* ─── Path create/edit dialog ────────────────────────────── */

function PathFormDialog({
  path,
  existingIds,
  onSave,
  onClose,
}: {
  path: PathRow | null;
  existingIds: string[];
  onSave: (draft: Parameters<ReturnType<typeof useCurriculumAdmin>['upsertPath']>[0]) => Promise<void>;
  onClose: () => void;
}) {
  const [id, setId] = useState(path?.id ?? '');
  const [title, setTitle] = useState(path?.title ?? '');
  const [description, setDescription] = useState(path?.description ?? '');
  const [requiresPaths, setRequiresPaths] = useState(toCsv(path?.requires_paths));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!path && existingIds.includes(id.trim())) {
      setError('A track with that id already exists.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        id: id.trim(), title: title.trim(), description, icon: path?.icon ?? 'route',
        tags: path?.tags ?? [], order: path?.order ?? existingIds.length + 1, requires_paths: fromCsv(requiresPaths),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save track.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{path ? 'Edit track' : 'New track'}</AlertDialogTitle>
          <AlertDialogDescription>Tracks group modules into a specialization path (e.g. Data Engineering).</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 text-xs">
          <label className="block space-y-1">
            <span className="font-code text-[10px] uppercase text-outline">Track id (slug)</span>
            <Input value={id} onChange={(e) => setId(e.target.value)} disabled={Boolean(path)} placeholder="e.g. data-engineering" />
          </label>
          <label className="block space-y-1">
            <span className="font-code text-[10px] uppercase text-outline">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Engineering" />
          </label>
          <label className="block space-y-1">
            <span className="font-code text-[10px] uppercase text-outline">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={cn(fieldCls, 'w-full min-h-[60px] resize-y')} />
          </label>
          <label className="block space-y-1">
            <span className="font-code text-[10px] uppercase text-outline">Requires tracks (comma-separated ids)</span>
            <Input value={requiresPaths} onChange={(e) => setRequiresPaths(e.target.value)} placeholder="e.g. de, ds" />
          </label>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={save} disabled={saving || !id.trim() || !title.trim()} className="font-code text-xs rounded-xl bg-cyan text-navy hover:bg-cyan/90">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save track
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ─── Module Editor panel ────────────────────────────────── */

function ModuleEditor({
  node,
  allNodes,
  nodePrereqs,
  resources,
  tasks,
  disabled,
  addingTask,
  editingTaskId,
  editingPrereqs,
  onStartAddTask,
  onStartEditTask,
  onStopEditTask,
  onStartEditPrereqs,
  onStopEditPrereqs,
  onSaveMeta,
  onSavePrereqs,
  onAddResource,
  onSaveResource,
  onDeleteResource,
  onSaveTask,
  onDeleteTask,
}: {
  node: NodeRow;
  allNodes: (NodeRow & { pathTitle: string })[];
  nodePrereqs: string[];
  resources: ResourceRow[];
  tasks: TaskRow[];
  disabled: boolean;
  addingTask: boolean;
  editingTaskId: string | null;
  editingPrereqs: boolean;
  onStartAddTask: () => void;
  onStartEditTask: (id: string) => void;
  onStopEditTask: () => void;
  onStartEditPrereqs: () => void;
  onStopEditPrereqs: () => void;
  onSaveMeta: (patch: Partial<NodeRow>) => Promise<unknown>;
  onSavePrereqs: (ids: string[]) => Promise<unknown>;
  onAddResource: () => Promise<unknown>;
  onSaveResource: (id: string, patch: Partial<ResourceRow>) => Promise<unknown>;
  onDeleteResource: (id: string, label: string) => void;
  onSaveTask: (task: Partial<TaskRow> & { node_id: string }) => Promise<unknown>;
  onDeleteTask: (id: string, label: string) => void;
}) {
  const [prereqDraft, setPrereqDraft] = useState<string[]>(nodePrereqs);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
      {/* Module metadata header */}
      <div className="space-y-3 border-b border-outline-variant pb-5">
        <div className="flex items-center gap-2 font-code text-xs text-cyan">
          <span>Module {node.order}</span>
          <span className="text-outline">·</span>
          <span>{node.path_id}</span>
          <span className="text-outline">·</span>
          <span className="text-outline">{node.slug}</span>
        </div>

        <input
          key={node.id}
          className="w-full bg-transparent font-display text-2xl font-bold text-on-surface focus:outline-none border-b border-transparent focus:border-cyan/40 pb-0.5 transition-colors disabled:opacity-60"
          defaultValue={node.name}
          disabled={disabled}
          placeholder="Module name…"
          onBlur={(e) => { if (e.target.value !== node.name && e.target.value.trim()) onSaveMeta({ name: e.target.value }); }}
        />

        <div className="flex items-center gap-3">
          <input
            key={`${node.id}-sub`}
            className="flex-1 bg-transparent text-sm text-on-surface-variant focus:outline-none border-b border-transparent focus:border-outline-variant/60 pb-0.5 transition-colors disabled:opacity-60"
            defaultValue={node.subtitle}
            disabled={disabled}
            placeholder="One-line subtitle…"
            onBlur={(e) => { if (e.target.value !== node.subtitle) onSaveMeta({ subtitle: e.target.value }); }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="font-code text-[11px] text-outline">Est. hours</label>
            <input
              key={`${node.id}-hrs`}
              type="number" min="1" max="100" disabled={disabled}
              className="w-14 rounded-lg border border-outline-variant bg-surface-card px-2 py-1 font-code text-xs text-on-surface focus:outline-none focus:border-cyan disabled:opacity-60"
              defaultValue={node.est_hours}
              onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v !== node.est_hours) onSaveMeta({ est_hours: v }); }}
            />
          </div>
        </div>

        <textarea
          key={`${node.id}-desc`}
          defaultValue={node.description}
          disabled={disabled}
          placeholder="Full module description…"
          onBlur={(e) => { if (e.target.value !== node.description) onSaveMeta({ description: e.target.value }); }}
          className={cn(fieldCls, 'w-full min-h-[50px] resize-y')}
        />

        <label className="block space-y-1">
          <span className="font-code text-[10px] uppercase text-outline">Skills (comma-separated — editorial rule: exactly 3)</span>
          <Input
            key={`${node.id}-skills`}
            defaultValue={toCsv(node.skills)}
            disabled={disabled}
            onBlur={(e) => {
              const skills = fromCsv(e.target.value);
              if (skills.join(',') !== node.skills.join(',')) onSaveMeta({ skills });
            }}
            className="h-7 text-xs"
          />
        </label>
      </div>

      {/* Prerequisites */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-on-surface">Prerequisites</h4>
          {!disabled && !editingPrereqs && (
            <button type="button" onClick={onStartEditPrereqs} className="font-code text-[11px] text-cyan hover:underline">edit</button>
          )}
        </div>
        {editingPrereqs ? (
          <div className="space-y-2 rounded-xl border border-cyan/40 bg-cyan/[0.04] p-3">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {allNodes.filter((n) => n.id !== node.id).map((n) => (
                <label key={n.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={prereqDraft.includes(n.id)}
                    onChange={(e) => setPrereqDraft((prev) => (e.target.checked ? [...prev, n.id] : prev.filter((id) => id !== n.id)))}
                  />
                  <span className="text-on-surface-variant">{n.pathTitle} — {n.name}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onSavePrereqs(prereqDraft)} className="h-7 px-3 font-code text-xs bg-cyan text-navy hover:bg-cyan/90">Save</Button>
              <button type="button" onClick={() => { setPrereqDraft(nodePrereqs); onStopEditPrereqs(); }} className="text-on-surface-variant hover:text-on-surface"><X className="h-4 w-4" /></button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {nodePrereqs.length === 0 ? (
              <p className="text-xs text-on-surface-variant">None — available as soon as its track unlocks.</p>
            ) : (
              nodePrereqs.map((id) => {
                const n = allNodes.find((x) => x.id === id);
                return <Badge key={id} variant="outline" className="text-[10px] font-code">{n?.name ?? id}</Badge>;
              })
            )}
          </div>
        )}
      </section>

      {/* Resources */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan" /> Learning Resources
            <span className="font-code text-xs text-outline font-normal">({resources.length}/2)</span>
          </h4>
          {!disabled && (
            <Button size="sm" variant="outline" onClick={onAddResource} disabled={resources.length >= 2} className="h-7 gap-1.5 px-3 font-code text-xs rounded-xl border-outline-variant hover:border-cyan">
              <Plus className="h-3 w-3" /> Add Resource
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {resources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/60 py-6 text-center">
              <p className="text-xs text-on-surface-variant">No resources yet.</p>
            </div>
          ) : (
            resources.map((res) => (
              <ResourceRow key={res.id} res={res} disabled={disabled} onSave={(patch) => onSaveResource(res.id, patch).then(() => {})} onDelete={() => onDeleteResource(res.id, res.name)} />
            ))
          )}
        </div>
      </section>

      {/* Tasks */}
      <section className="space-y-3 border-t border-outline-variant/60 pt-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan" /> Module Tasks
            <span className="font-code text-xs text-outline font-normal">({tasks.length})</span>
          </h4>
          {!disabled && !addingTask && (
            <Button size="sm" variant="outline" onClick={onStartAddTask} className="h-7 gap-1.5 px-3 font-code text-xs rounded-xl border-outline-variant hover:border-cyan">
              <Plus className="h-3 w-3" /> Add Task
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {tasks.length === 0 && !addingTask && (
            <div className="rounded-xl border border-dashed border-outline-variant/60 py-6 text-center">
              <p className="text-xs text-on-surface-variant">No tasks yet.</p>
            </div>
          )}
          {tasks.map((task) =>
            editingTaskId === task.id ? (
              <TaskEditor key={task.id} task={task} disabled={disabled} onCancel={onStopEditTask} onSave={(t) => onSaveTask(t).then(() => {})} />
            ) : (
              <div key={task.id} className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/60 bg-surface/50 px-3 py-2 text-xs group">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface truncate">
                    <Badge variant="outline" className="mr-1.5 text-[9px] font-code uppercase">{task.type}</Badge>
                    {task.description || <em className="text-outline">No description</em>}
                  </p>
                </div>
                {!disabled && (
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => onStartEditTask(task.id)} className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-cyan hover:text-cyan"><Edit3 className="h-3 w-3" /></button>
                    <button type="button" onClick={() => onDeleteTask(task.id, task.description)} className="rounded-md border border-outline-variant p-1 text-on-surface-variant hover:border-red-400 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            ),
          )}
          {addingTask && (
            <TaskEditor task={{ node_id: node.id, type: 'read', order: tasks.length + 1 }} disabled={disabled} onCancel={onStopEditTask} onSave={(t) => onSaveTask(t).then(() => {})} />
          )}
        </div>
      </section>
    </div>
  );
}
