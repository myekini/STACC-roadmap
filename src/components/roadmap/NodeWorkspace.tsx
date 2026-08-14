'use client';

/**
 * DataCamp-Inspired Interactive Learning Workspace
 *
 * Layout:
 *   ┌─ sticky top bar (breadcrumb + "< Course Outline >" sidebar toggle + XP chip) ─┐
 *   │  ← collapsible LEFT PANEL (resource list + task checklist)                     │
 *   │  MAIN CANVAS (module header · video/reader · code/quiz cards · milestone)      │
 *   └─ sticky bottom bar (← Prev · segmented progress · Got It! / Next lesson →)    ┘
 *
 * All colours use semantic design tokens so light & dark mode both work.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  GitBranch,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Terminal,
  Trophy,
} from 'lucide-react';
import type { TaskRow } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';
import { GithubLogo } from '@/components/icons/GithubLogo';
import { getYouTubeRef, YouTubeEmbed } from './bits';
import { ChallengeBlock } from './ChallengeBlock';
import { QuizWorkspace } from './QuizWorkspace';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   ProjectMilestone — GitHub commit verifier (inline)
───────────────────────────────────────────────────────── */
function ProjectMilestone({
  task,
  data,
  pathId,
  pathTitle,
  nodeSlug,
  disabled,
}: {
  task: TaskRow;
  data: UserData;
  pathId: string;
  pathTitle: string;
  nodeSlug: string;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState<{ url: string; sha: string } | null>(null);
  const project = data.projectConnections[pathId];
  const connected = project?.connection_status === 'active' && Boolean(project.github_repo_id);

  if (!data.isSupabaseConnected) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-card p-4 text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface">GitHub verification is available in the live app.</p>
        <p className="mt-1 leading-5">Sign in to connect one repository to this track and verify your milestone commits.</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-card p-4 text-xs">
        <p className="flex items-center gap-2 font-semibold text-on-surface">
          <GithubLogo className="h-4 w-4 text-cyan" />
          Connect your {pathTitle} project repo
        </p>
        <p className="mt-1 leading-5 text-on-surface-variant">
          Choose one GitHub repository. Stacc reads commits from that repo only to verify your work.
        </p>
        <Button asChild size="sm" className="mt-3 rounded-xl font-code gap-2 bg-surface-card border border-outline-variant hover:border-cyan text-on-surface">
          <a href={`/api/github/install?path=${encodeURIComponent(pathId)}&returnTo=${encodeURIComponent(`/roadmap/${nodeSlug}`)}`}>
            <GithubLogo className="h-4 w-4 text-on-surface" />
            <span>{project ? 'Reconnect GitHub' : 'Connect GitHub'}</span>
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-card p-4 text-xs">
      <a
        href={project.repo_url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-2 font-semibold text-cyan hover:underline"
      >
        <GitBranch className="h-4 w-4 shrink-0" />
        <span className="truncate">{project.repo_owner}/{project.repo_name}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={disabled || busy || Boolean(verified)}
          className="rounded-lg font-code text-xs"
          onClick={async () => {
            setBusy(true);
            setErrorMsg(null);
            try {
              const res = await fetch('/api/github/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id }),
              });
              const json = (await res.json()) as { error?: string; commitUrl?: string; commitSha?: string };
              if (!res.ok || !json.commitUrl || !json.commitSha) {
                throw new Error(json.error ?? 'Could not verify the project.');
              }
              setVerified({ url: json.commitUrl, sha: json.commitSha });
              await data.refresh();
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Could not verify the project.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <AnimatedStaccMark className="h-4 w-4" /> : verified ? <Check className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
          {busy ? 'Checking…' : verified ? 'Verified' : 'Check my work'}
        </Button>

        {verified && (
          <a href={verified.url} target="_blank" rel="noreferrer" className="font-semibold text-secondary hover:underline">
            Commit {verified.sha.slice(0, 7)}
          </a>
        )}
      </div>

      {errorMsg && <p role="alert" className="mt-2 leading-5 text-red-500">{errorMsg}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main NodeWorkspace component
───────────────────────────────────────────────────────── */
export default function NodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const [showPanel, setShowPanel] = useState(true);
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);
  const [activeQuizTask, setActiveQuizTask] = useState<TaskRow | null>(null);
  const [activeChallengeTask, setActiveChallengeTask] = useState<TaskRow | null>(null);

  /* ── Data derived from slug ── */
  const node = data.nodes.find((n) => n.slug === slug) ?? null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const path = node ? data.paths.find((p) => p.id === node.path_id) : null;
  const tasks = useMemo(() => data.tasks.filter((t) => t.node_id === node?.id), [data.tasks, node?.id]);
  const resources = useMemo(() => data.resources.filter((r) => r.node_id === node?.id), [data.resources, node?.id]);

  /* ── Progress ── */
  const doneCount = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  const canWork = !(data.isSupabaseConnected && !data.isAuthenticated) &&
    (status === 'in_progress' || status === 'available');

  /* ── Active resource ── */
  const activeResource = resources[activeResourceIndex] ?? null;
  const activeYouTubeRef = activeResource ? getYouTubeRef(activeResource.url) : null;

  /* ── Prev / Next module navigation ── */
  const pathNodes = data.nodes.filter((n) => n.path_id === node?.path_id).sort((a, b) => a.order - b.order);
  const currentIdx = pathNodes.findIndex((n) => n.slug === slug);
  const prevNode = currentIdx > 0 ? pathNodes[currentIdx - 1] : null;
  const nextNode = currentIdx !== -1 && currentIdx < pathNodes.length - 1 ? pathNodes[currentIdx + 1] : null;

  /* ── Task shortcuts ── */
  const nextPendingTask = tasks.find((t) => !data.progress.completedTasks.includes(t.id));
  const challengeTask = tasks.find((t) => t.type === 'challenge' && t.challenge);
  const quizTask = tasks.find((t) => t.type === 'quiz' && t.quiz);
  const buildTask = tasks.find((t) => t.type === 'build');

  /* ── Connected project repo — visible on every node in the track, not
     just wherever the build task card happens to be ── */
  const trackProject = path && path.id !== 'foundations' ? data.projectConnections[path.id] : undefined;
  const trackRepoConnected = trackProject?.connection_status === 'active' && Boolean(trackProject.github_repo_id);

  useEffect(() => {
    setActiveResourceIndex(0);
  }, [slug]);

  const handleCompleteTask = async (task: TaskRow, evidenceUrl?: string) => {
    try {
      await data.completeTask({ task, evidenceUrl });
    } catch (err) {
      console.error('Task completion failed:', err);
    }
  };

  const handleGotIt = async () => {
    if (nextPendingTask) {
      if (nextPendingTask.type === 'watch' || nextPendingTask.type === 'read') {
        await handleCompleteTask(nextPendingTask);
        if (activeResourceIndex < resources.length - 1) setActiveResourceIndex((i) => i + 1);
      } else if (nextPendingTask.type === 'quiz' && nextPendingTask.quiz) {
        setActiveQuizTask(nextPendingTask);
      } else if (nextPendingTask.type === 'challenge' && nextPendingTask.challenge) {
        setActiveChallengeTask(nextPendingTask);
      } else {
        await handleCompleteTask(nextPendingTask);
      }
    } else if (activeResourceIndex < resources.length - 1) {
      setActiveResourceIndex((i) => i + 1);
    }
  };

  /* ── 404 state ── */
  if (!data.isLoading && !node) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="font-code text-xs text-outline">{'// not found'}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">Module not found</h1>
        <p className="mt-2 text-sm text-on-surface-variant">It may have moved, or the link is incorrect.</p>
        <Button asChild className="mt-6 rounded-lg">
          <Link href="/roadmap"><ArrowLeft className="h-4 w-4" /> Back to Roadmap</Link>
        </Button>
      </div>
    );
  }

  if (!node) return null;

  const stepPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const primaryBtnLabel = allDone
    ? nextNode ? 'Next Lesson' : 'Complete!'
    : nextPendingTask?.type === 'quiz'
      ? 'Take Quiz'
      : nextPendingTask?.type === 'challenge'
        ? 'Open Code Challenge'
        : 'Got It!';

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-on-surface">

      {/* ──────────────────────────────────────────────────
          TOP BAR
          Left:  ← Back to Roadmap  /  Path  /  Node Name
          Right: [< Course Outline >]  [XP chip]
      ────────────────────────────────────────────────── */}
      <header className="z-30 flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-4 py-2.5 sm:px-6">
        {/* Back + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Link
            href="/roadmap"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-card px-2.5 py-1.5 font-code font-semibold text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Roadmap</span>
          </Link>

          <span className="text-outline">/</span>
          <span className="hidden max-w-[120px] truncate font-medium text-on-surface-variant sm:inline">
            {path?.title ?? 'Course'}
          </span>
          <span className="text-outline hidden sm:inline">/</span>
          <span className="max-w-[160px] truncate font-bold text-on-surface">{node.name}</span>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Sidebar toggle — labelled exactly like DataCamp */}
          <button
            type="button"
            onClick={() => setShowPanel((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-card px-2.5 py-1.5 font-code text-xs font-semibold text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            {showPanel ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
            <ChevronLeft className="h-3 w-3 -mr-1 opacity-60" />
            <span className="hidden sm:inline">Course Outline</span>
            <ChevronRight className="h-3 w-3 -ml-1 opacity-60" />
          </button>

          {/* Connected project repo — persistent across every node in this track */}
          {path && path.id !== 'foundations' && data.isSupabaseConnected && (
            trackRepoConnected ? (
              <a
                href={trackProject!.repo_url}
                target="_blank"
                rel="noreferrer"
                title="Connected project repo"
                className="hidden items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-card px-2.5 py-1.5 font-code text-xs text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan md:flex"
              >
                <GithubLogo className="h-3.5 w-3.5" />
                <span className="max-w-[140px] truncate">{trackProject!.repo_owner}/{trackProject!.repo_name}</span>
              </a>
            ) : (
              <a
                href={`/api/github/install?path=${encodeURIComponent(path.id)}&returnTo=${encodeURIComponent(`/roadmap/${slug}`)}`}
                title="Connect a GitHub repo for this track"
                className="hidden items-center gap-1.5 rounded-lg border border-dashed border-outline-variant bg-surface-card px-2.5 py-1.5 font-code text-xs text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan md:flex"
              >
                <GithubLogo className="h-3.5 w-3.5" />
                <span>Connect repo</span>
              </a>
            )
          )}

          {/* XP chip */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-code text-xs text-cyan md:flex">
            <Trophy className="h-3.5 w-3.5" />
            <span>XP <strong>+50</strong></span>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────
          BODY  =  Left sidebar  +  Main canvas
      ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT PANEL ──────────────────────────────── */}
        {showPanel && (
          <aside className="flex w-72 shrink-0 flex-col border-r border-outline-variant bg-surface">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <span className="font-code text-xs font-bold text-on-surface">Lesson Outline</span>
              <button
                type="button"
                onClick={() => setShowPanel(false)}
                className="rounded-md p-1 text-on-surface-variant hover:text-on-surface"
                title="Hide outline"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">

              {/* Resource list */}
              {resources.length > 0 && (
                <section>
                  <p className="mb-2 font-code text-[10px] font-bold uppercase tracking-widest text-outline">
                    Resources · {resources.length}
                  </p>
                  <ul className="space-y-1.5">
                    {resources.map((res, idx) => {
                      const isActive = idx === activeResourceIndex;
                      const yt = getYouTubeRef(res.url);
                      return (
                        <li key={res.id}>
                          <button
                            type="button"
                            onClick={() => setActiveResourceIndex(idx)}
                            className={cn(
                              'flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all',
                              isActive
                                ? 'border-cyan bg-cyan/10 text-on-surface font-semibold'
                                : 'border-transparent bg-surface-card text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                            )}
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-cyan">
                              {yt ? <Play className="h-2.5 w-2.5" /> : <BookOpen className="h-2.5 w-2.5" />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium leading-4">{res.name}</p>
                              <p className="mt-0.5 text-[10px] text-on-surface-variant">
                                {res.platform} · {yt ? 'Video' : res.type}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Task checklist */}
              {tasks.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between font-code text-[10px]">
                    <span className="font-bold uppercase tracking-widest text-outline flex items-center gap-1">
                      <ListChecks className="h-3 w-3 text-cyan" /> Tasks
                    </span>
                    <span className="font-bold text-cyan">{doneCount}/{tasks.length}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.map((task) => {
                      const done = data.progress.completedTasks.includes(task.id);
                      return (
                        <li
                          key={task.id}
                          className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-card p-2.5 text-[11px]"
                        >
                          {/* Completion checkbox / icon */}
                          <span className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                            done ? 'border-secondary bg-secondary' : 'border-outline-variant bg-surface-container-high',
                          )}>
                            {done && <Check className="h-2.5 w-2.5 text-white" />}
                          </span>

                          {/* Description */}
                          <span className={cn('flex-1 truncate leading-4', done ? 'line-through text-outline' : 'text-on-surface')}>
                            {task.description}
                          </span>

                          {/* Action shortcut (not-done only) */}
                          {!done && task.type === 'quiz' && (
                            <button type="button" onClick={() => setActiveQuizTask(task)} className="shrink-0 rounded-md border border-outline-variant px-1.5 py-0.5 text-[10px] font-code font-semibold text-on-surface-variant hover:border-cyan hover:text-cyan">
                              Quiz
                            </button>
                          )}
                          {!done && task.type === 'challenge' && (
                            <button type="button" onClick={() => setActiveChallengeTask(task)} className="shrink-0 rounded-md border border-outline-variant px-1.5 py-0.5 text-[10px] font-code font-semibold text-on-surface-variant hover:border-cyan hover:text-cyan">
                              Code
                            </button>
                          )}
                          {!done && task.type === 'build' && (
                            <span className="shrink-0 font-code text-[10px] text-cyan">↓</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

            </div>
          </aside>
        )}

        {/* ─── MAIN CANVAS ─────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">

            {/* Module meta + title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-code text-xs text-cyan">
                <span>Module {node.order}</span>
                <span className="text-outline">·</span>
                <span>{node.est_hours}h</span>
                {status === 'locked' && (
                  <Badge variant="outline" className="ml-2 rounded-md border-warning/40 bg-warning/10 font-code text-[10px] text-warning uppercase">
                    Locked
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-on-surface sm:text-4xl">{node.name}</h1>
              {node.subtitle && <p className="text-sm leading-6 text-on-surface-variant">{node.subtitle}</p>}
            </div>

            {/* ── Resource viewer ── */}
            {activeResource ? (
              <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-card shadow-lg">
                {/* Resource header bar */}
                <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    {activeYouTubeRef ? <Play className="h-3.5 w-3.5 text-cyan" /> : <BookOpen className="h-3.5 w-3.5 text-cyan" />}
                    <span className="truncate max-w-[240px]">{activeResource.name}</span>
                    <span className="text-outline">·</span>
                    <span className="text-on-surface-variant font-normal">{activeResource.platform}</span>
                  </div>
                  <a
                    href={activeResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-code text-[11px] text-cyan hover:underline"
                  >
                    Open tab <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Player / reader */}
                <div className="p-3 sm:p-4">
                  {activeYouTubeRef ? (
                    <YouTubeEmbed source={activeYouTubeRef} title={activeResource.name} />
                  ) : (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface py-12 text-center">
                      <p className="text-sm text-on-surface-variant">External reading resource — opens in a new tab.</p>
                      <Button asChild className="gap-2 rounded-xl bg-cyan font-bold text-navy hover:bg-cyan/90">
                        <a href={activeResource.url} target="_blank" rel="noreferrer">
                          Read on {activeResource.platform} <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Resource prev/next strip (when there are multiple) */}
                {resources.length > 1 && (
                  <div className="flex items-center justify-between border-t border-outline-variant px-4 py-2">
                    <button
                      type="button"
                      disabled={activeResourceIndex === 0}
                      onClick={() => setActiveResourceIndex((i) => i - 1)}
                      className="flex items-center gap-1 font-code text-xs text-on-surface-variant transition-colors hover:text-cyan disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    <span className="font-code text-[10px] text-outline">
                      {activeResourceIndex + 1} / {resources.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeResourceIndex === resources.length - 1}
                      onClick={() => setActiveResourceIndex((i) => i + 1)}
                      className="flex items-center gap-1 font-code text-xs text-on-surface-variant transition-colors hover:text-cyan disabled:opacity-30"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant bg-surface-card p-10 text-center">
                <p className="text-sm text-on-surface-variant">No resources yet — check back soon, or start the tasks below.</p>
              </div>
            )}

            {/* ── Interactive task cards ── */}
            {(challengeTask || quizTask) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {challengeTask && challengeTask.challenge && (
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-cyan/40 bg-cyan/[0.05] p-5">
                    <div>
                      <Badge variant="outline" className="mb-2 border-cyan/40 bg-cyan/15 font-code text-[10px] uppercase text-cyan">
                        Code Challenge
                      </Badge>
                      <h3 className="font-display text-sm font-bold text-on-surface">Interactive Kata</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant line-clamp-2">{challengeTask.description}</p>
                    </div>
                    <Button
                      onClick={() => setActiveChallengeTask(challengeTask)}
                      size="sm"
                      className="w-full justify-center gap-2 rounded-xl bg-cyan font-code font-bold text-navy hover:bg-cyan/90"
                    >
                      <Terminal className="h-3.5 w-3.5" /> Open Coding Panel
                    </Button>
                  </div>
                )}

                {quizTask && quizTask.quiz && (
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-secondary/40 bg-secondary/[0.05] p-5">
                    <div>
                      <Badge variant="outline" className="mb-2 border-secondary/40 bg-secondary/15 font-code text-[10px] uppercase text-secondary">
                        Knowledge Check
                      </Badge>
                      <h3 className="font-display text-sm font-bold text-on-surface">Checkpoint Quiz</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant line-clamp-2">{quizTask.description}</p>
                    </div>
                    <Button
                      onClick={() => setActiveQuizTask(quizTask)}
                      size="sm"
                      className="w-full justify-center gap-2 rounded-xl bg-secondary font-code font-bold text-white hover:bg-secondary/90"
                    >
                      <Code2 className="h-3.5 w-3.5" /> Take Quiz
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── GitHub milestone card ── */}
            {buildTask && (
              <div className="space-y-2">
                <p className="font-code text-[10px] font-bold uppercase tracking-widest text-outline">
                  Project Milestone · GitHub Verification
                </p>
                <ProjectMilestone
                  task={buildTask}
                  data={data}
                  pathId={node.path_id}
                  pathTitle={path?.title ?? ''}
                  nodeSlug={node.slug}
                  disabled={!canWork}
                />
              </div>
            )}

            {/* Bottom spacer so content isn't hidden under the sticky footer */}
            <div className="h-4" />
          </div>
        </main>
      </div>

      {/* ──────────────────────────────────────────────────
          BOTTOM ACTION BAR
          Left:  ← Prev lesson
          Center: segmented progress bar
          Right:  Got It! / Next lesson →
      ────────────────────────────────────────────────── */}
      <footer className="z-30 flex shrink-0 items-center gap-4 border-t border-outline-variant bg-surface px-4 py-3 sm:px-6">

        {/* Previous lesson button */}
        {prevNode ? (
          <Link
            href={`/roadmap/${prevNode.slug}`}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-card px-3 py-2 font-code text-xs font-semibold text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Link>
        ) : (
          <div className="w-10 shrink-0" />
        )}

        {/* Progress strip */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between font-code text-[10px] text-on-surface-variant">
            <span>Progress</span>
            <span className="font-bold text-cyan">{doneCount}/{tasks.length} ({stepPct}%)</span>
          </div>
          <div className="flex h-1.5 w-full items-center gap-1">
            {tasks.length > 0 ? tasks.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'h-full flex-1 rounded-full transition-all duration-500',
                  data.progress.completedTasks.includes(t.id) ? 'bg-secondary' : 'bg-surface-container-high',
                )}
              />
            )) : (
              <div className="h-full w-full rounded-full bg-surface-container-high" />
            )}
          </div>
        </div>

        {/* Primary CTA */}
        {allDone && nextNode ? (
          <Link
            href={`/roadmap/${nextNode.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-5 py-2 font-code text-sm font-bold text-white shadow-lg transition-all hover:bg-secondary/90"
          >
            Next Lesson <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Button
            onClick={handleGotIt}
            disabled={allDone && !nextNode}
            className={cn(
              'shrink-0 gap-2 rounded-xl px-5 py-2 font-code text-sm font-bold shadow-lg',
              allDone
                ? 'border border-secondary bg-surface-card text-secondary cursor-default'
                : 'bg-secondary text-white hover:bg-secondary/90',
            )}
          >
            {primaryBtnLabel}
            {!allDone && <ArrowRight className="h-4 w-4" />}
          </Button>
        )}
      </footer>

      {/* ── Quiz overlay ── */}
      {activeQuizTask && activeQuizTask.quiz && (
        <QuizWorkspace
          quiz={activeQuizTask.quiz}
          disabled={!canWork}
          onClose={() => setActiveQuizTask(null)}
          onPass={async () => {
            await handleCompleteTask(activeQuizTask);
            setActiveQuizTask(null);
          }}
        />
      )}

      {/* ── Coding panel full-screen overlay ── */}
      {activeChallengeTask && activeChallengeTask.challenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl">
            <ChallengeBlock
              challenge={activeChallengeTask.challenge}
              disabled={!canWork}
              onClose={() => setActiveChallengeTask(null)}
              onPass={async () => {
                await handleCompleteTask(activeChallengeTask);
                setActiveChallengeTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
