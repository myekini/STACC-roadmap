'use client';

/**
 * DataCamp-Inspired Interactive Learning Workspace
 *
 * Layout:
 *   ┌─ sticky top bar (breadcrumb + "< Course Outline >" sidebar toggle) ─┐
 *   │  ← collapsible LEFT PANEL (resource list + task checklist)                     │
 *   │  MAIN CANVAS (module header · video/reader · code/quiz cards · milestone)      │
 *   └─ sticky bottom bar (← Prev · segmented progress · Got It! / Next lesson →)    ┘
 *
 * All colours use semantic design tokens so light & dark mode both work.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/components/ui/toast';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  GitBranch,
  ListChecks,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Star,
  Terminal,
} from 'lucide-react';
import type { TaskRow } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState<{ url: string; sha: string } | null>(null);
  const project = data.projectConnections[pathId];
  const connected = project?.connection_status === 'active' && Boolean(project.github_repo_id);

  if (!data.isSupabaseConnected) {
    return (
      <div className="rounded-none border border-outline-variant bg-surface-card p-4 text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface">GitHub verification is available in the live app.</p>
        <p className="mt-1 leading-5">Sign in to connect one repository to this track and verify your milestone commits.</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-none border border-outline-variant bg-surface-card p-4 text-xs">
        <p className="flex items-center gap-2 font-semibold text-on-surface">
          <GithubLogo className="h-4 w-4 text-cyan" />
          Connect your {pathTitle} project repo
        </p>
        <p className="mt-1 leading-5 text-on-surface-variant">
          Choose one GitHub repository. Stacc reads commits from that repo only to verify your work.
        </p>
        <Button asChild size="sm" className={cn('mt-3 rounded-none font-code gap-2 bg-surface-card border border-outline-variant hover:border-cyan text-on-surface', connecting && 'pointer-events-none opacity-60')}>
          <a
            href={`/api/github/install?path=${encodeURIComponent(pathId)}&returnTo=${encodeURIComponent(`/roadmap/${nodeSlug}`)}`}
            onClick={(e) => { if (connecting) { e.preventDefault(); return; } setConnecting(true); }}
          >
            {connecting ? <Spinner /> : <GithubLogo className="h-4 w-4 text-on-surface" />}
            <span>{connecting ? 'Connecting…' : project ? 'Reconnect GitHub' : 'Connect GitHub'}</span>
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-outline-variant bg-surface-card p-4 text-xs">
      <div className="mb-4">
        <p className="font-code text-[11px] font-bold uppercase tracking-wide text-cyan">Milestone brief</p>
        <p className="mt-1 text-sm leading-6 text-on-surface">{task.description.replace(/^Build:\s*/i, '')}</p>
        {task.project_requirements?.requiredPaths?.length ? (
          <div className="mt-3 border border-outline-variant bg-surface-container-low p-3">
            <p className="font-code text-[10px] font-bold uppercase tracking-wide text-on-surface">Automated checks</p>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              Push a new commit after starting this module. Stacc will confirm that commit is new and these artifacts exist:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.project_requirements.requiredPaths.map((path) => (
                <code key={path} className="border border-outline-variant bg-surface px-2 py-1 text-[11px] text-on-surface">{path}</code>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <a
        href={project.repo_url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-2 font-semibold text-on-surface hover:text-cyan hover:underline"
      >
        <GitBranch className="h-4 w-4 shrink-0" />
        <span className="truncate">{project.repo_owner}/{project.repo_name}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={disabled || busy || Boolean(verified)}
          className="rounded-none font-code text-xs"
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
          {busy ? <Spinner /> : verified ? <Check className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
          {busy ? 'Checking…' : verified ? 'Verified' : 'Check my work'}
        </Button>

        {verified && (
          <a href={verified.url} target="_blank" rel="noreferrer" className="font-semibold text-secondary hover:underline">
            Commit {verified.sha.slice(0, 7)}
          </a>
        )}
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="mt-3">
          <AlertTriangle />
          <AlertTitle>We could not verify this project</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main NodeWorkspace component
───────────────────────────────────────────────────────── */
export default function NodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const [showPanel, setShowPanel] = useState(false);
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);
  const [activeQuizTask, setActiveQuizTask] = useState<TaskRow | null>(null);
  const [activeChallengeTask, setActiveChallengeTask] = useState<TaskRow | null>(null);
  const [connectingRepo, setConnectingRepo] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

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
  const activeLessonTask = activeResource
    ? tasks.find((task) => task.resource_id === activeResource.id && (task.type === 'read' || task.type === 'watch')) ?? null
    : null;
  const parsedYouTubeRef = activeResource ? getYouTubeRef(activeResource.url) : null;
  const activeYouTubeRef = parsedYouTubeRef?.kind === 'video' && activeLessonTask
    ? {
        ...parsedYouTubeRef,
        startSeconds: activeLessonTask.start_seconds ?? parsedYouTubeRef.startSeconds,
        endSeconds: activeLessonTask.end_seconds ?? parsedYouTubeRef.endSeconds,
      }
    : parsedYouTubeRef;

  /* ── Prev / Next module navigation ── */
  const pathNodes = data.nodes.filter((n) => n.path_id === node?.path_id).sort((a, b) => a.order - b.order);
  const currentIdx = pathNodes.findIndex((n) => n.slug === slug);
  const prevNode = currentIdx > 0 ? pathNodes[currentIdx - 1] : null;
  const nextNode = currentIdx !== -1 && currentIdx < pathNodes.length - 1 ? pathNodes[currentIdx + 1] : null;

  /* ── Task shortcuts ── */
  const nextPendingTask = tasks.find((t) => !data.progress.completedTasks.includes(t.id));
  const pendingLessonResourceIndex = nextPendingTask?.resource_id
    ? resources.findIndex((resource) => resource.id === nextPendingTask.resource_id)
    : -1;
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

  useEffect(() => {
    setShowPanel(window.matchMedia('(min-width: 768px)').matches);
  }, []);

  const handleCompleteTask = async (task: TaskRow, evidenceUrl?: string) => {
    if (completingTaskId) return false;
    setCompletingTaskId(task.id);
    try {
      await data.completeTask({ task, evidenceUrl });
      return true;
    } catch (err) {
      console.error('Task completion failed:', err);
      toast.error(err instanceof Error ? err.message : 'Could not save your progress — try again.');
      return false;
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleGotIt = async () => {
    if (activeResource && !activeLessonTask && pendingLessonResourceIndex >= 0) {
      setActiveResourceIndex(pendingLessonResourceIndex);
      return;
    }
    if (activeLessonTask && !data.progress.completedTasks.includes(activeLessonTask.id)) {
      if (activeLessonTask.type === 'watch' && activeYouTubeRef?.kind === 'video') return;
      const saved = await handleCompleteTask(activeLessonTask);
      if (saved && activeResourceIndex < resources.length - 1) setActiveResourceIndex((i) => i + 1);
      return;
    }
    if (nextPendingTask) {
      if (nextPendingTask.type === 'watch' || nextPendingTask.type === 'read') {
        const saved = await handleCompleteTask(nextPendingTask);
        if (saved && activeResourceIndex < resources.length - 1) setActiveResourceIndex((i) => i + 1);
      } else if (nextPendingTask.type === 'quiz' && nextPendingTask.quiz) {
        setActiveQuizTask(nextPendingTask);
      } else if (nextPendingTask.type === 'challenge' && nextPendingTask.challenge) {
        setActiveChallengeTask(nextPendingTask);
      } else if (nextPendingTask.type === 'build') {
        document.getElementById('project-milestone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        <Button asChild className="mt-6 rounded-none">
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
    : status === 'locked'
      ? 'Complete prerequisites'
    : completingTaskId
      ? 'Saving progress…'
    : nextPendingTask?.type === 'build'
      ? 'Verify milestone'
    : nextPendingTask?.type === 'practice'
      ? 'Complete practice'
    : nextPendingTask?.type === 'quiz'
      ? 'Take Quiz'
      : nextPendingTask?.type === 'challenge'
        ? 'Open Code Challenge'
        : activeResource && !activeLessonTask && pendingLessonResourceIndex >= 0
          ? 'Return to focused lesson'
        : activeLessonTask?.type === 'watch' && activeYouTubeRef?.kind === 'video'
          ? 'Watch lesson to complete'
          : activeLessonTask?.type === 'read'
            ? 'Mark lesson read'
            : 'Continue';

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-on-surface">

      {/* ──────────────────────────────────────────────────
          TOP BAR
          Left:  ← Back to Roadmap  /  Path  /  Node Name
          Right: [< Course Outline >]  [XP chip]
      ────────────────────────────────────────────────── */}
      <header className="z-30 flex min-h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-outline-variant bg-surface pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:min-h-16 sm:px-6 sm:py-2">
        {/* Back + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Link
            href="/roadmap"
            className="flex shrink-0 items-center gap-1.5 rounded-none border border-outline-variant bg-surface-card px-2.5 py-1.5 font-code font-semibold text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Roadmap</span>
          </Link>

          <span className="hidden text-outline sm:inline">/</span>
          <span className="hidden max-w-[120px] truncate font-medium text-on-surface-variant sm:inline">
            {path?.title ?? 'Course'}
          </span>
          <span className="text-outline hidden sm:inline">/</span>
          <span className="hidden max-w-[160px] truncate font-bold text-on-surface sm:inline">{node.name}</span>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {/* Sidebar toggle — always labelled and visibly "on" when open, so
              it stays obvious as the way back in after closing the panel
              (previously icon-only on mobile with no active state). */}
          <button
            type="button"
            onClick={() => setShowPanel((v) => !v)}
            aria-expanded={showPanel}
            aria-controls="lesson-outline"
            aria-label={showPanel ? 'Hide lesson outline' : 'Show lesson outline'}
            className={cn(
              'flex items-center gap-1.5 rounded-none border px-2.5 py-1.5 font-code text-xs font-semibold transition-colors',
              showPanel
                ? 'border-cyan/50 bg-cyan/10 text-cyan'
                : 'border-outline-variant bg-surface-card text-on-surface-variant hover:border-cyan/50 hover:text-cyan',
            )}
          >
            {showPanel ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
            <span className="hidden min-[480px]:inline">Outline</span>
          </button>

          {/* Connected project repo — persistent across every node in this
              track, EXCEPT the node that already renders the full
              ProjectMilestone card below (buildTask) — showing "Connect
              GitHub" in both places at once read as duplicated. */}
          {path && path.id !== 'foundations' && !buildTask && data.isSupabaseConnected && (
            trackRepoConnected ? (
              <a
                href={trackProject!.repo_url}
                target="_blank"
                rel="noreferrer"
                title="Connected project repo"
                className="hidden items-center gap-1.5 rounded-none border border-outline-variant bg-surface-card px-2.5 py-1.5 font-code text-xs text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan md:flex"
              >
                <GithubLogo className="h-3.5 w-3.5" />
                <span className="max-w-[140px] truncate">{trackProject!.repo_owner}/{trackProject!.repo_name}</span>
              </a>
            ) : (
              <a
                href={`/api/github/install?path=${encodeURIComponent(path.id)}&returnTo=${encodeURIComponent(`/roadmap/${slug}`)}`}
                title="Connect a GitHub repo for this track"
                onClick={(e) => { if (connectingRepo) { e.preventDefault(); return; } setConnectingRepo(true); }}
                className={cn(
                  'hidden items-center gap-1.5 rounded-none border border-dashed border-outline-variant bg-surface-card px-2.5 py-1.5 font-code text-xs text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan md:flex',
                  connectingRepo && 'pointer-events-none opacity-60',
                )}
              >
                {connectingRepo ? <Spinner className="size-3.5" /> : <GithubLogo className="h-3.5 w-3.5" />}
                <span>{connectingRepo ? 'Connecting…' : 'Connect repo'}</span>
              </a>
            )
          )}

        </div>
      </header>

      {/* ──────────────────────────────────────────────────
          BODY  =  Left sidebar  +  Main canvas
      ────────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* ─── LEFT PANEL ──────────────────────────────── */}
        {showPanel && (
          <>
          <button
            type="button"
            aria-label="Close lesson outline"
            onClick={() => setShowPanel(false)}
            className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm md:hidden"
          />
          <aside id="lesson-outline" className="absolute inset-y-0 left-0 z-20 flex w-[min(22rem,calc(100vw-1rem))] shrink-0 flex-col border-r border-outline-variant bg-surface shadow-[12px_0_32px_rgba(2,8,23,0.24)] md:static md:w-72 md:shadow-none">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <span className="font-code text-xs font-bold text-on-surface">Module plan</span>
              <button
                type="button"
                onClick={() => setShowPanel(false)}
                className="flex size-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                title="Hide outline"
                aria-label="Hide lesson outline"
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
                    Learn · {resources.length} selected
                  </p>
                  <ul className="space-y-1.5">
                    {resources.map((res, idx) => {
                      const isActive = idx === activeResourceIndex;
                      const yt = getYouTubeRef(res.url);
                      const lesson = tasks.find((task) => task.resource_id === res.id && (task.type === 'read' || task.type === 'watch'));
                      const lessonDone = lesson ? data.progress.completedTasks.includes(lesson.id) : false;
                      return (
                        <li key={res.id}>
                          <button
                            type="button"
                            onClick={() => setActiveResourceIndex(idx)}
                            aria-pressed={isActive}
                            className={cn(
                              'flex w-full items-start gap-2.5 border p-3 text-left text-[13px] transition-colors',
                              isActive
                                ? 'border-cyan bg-cyan/10 text-on-surface font-semibold'
                                : 'border-transparent bg-surface-card text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                            )}
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-surface-container-high text-cyan">
                              {lessonDone ? <Check className="h-2.5 w-2.5" /> : yt ? <Play className="h-2.5 w-2.5" /> : <BookOpen className="h-2.5 w-2.5" />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium leading-4">{lesson?.lesson_title ?? res.name}</p>
                              <p className="mt-0.5 text-xs text-on-surface-variant">
                                {idx === 0 ? 'Primary lesson' : 'Reference'} · {lesson?.duration_minutes ? `${lesson.duration_minutes} min` : res.platform} · {yt ? 'Video' : res.type}
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
                      <ListChecks className="h-3 w-3 text-cyan" /> Practise · Prove · Ship
                    </span>
                    <span className="font-bold text-on-surface">{doneCount}/{tasks.length}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {tasks.map((task) => {
                      const done = data.progress.completedTasks.includes(task.id);
                      return (
                        <li
                          key={task.id}
                          className="flex items-center gap-2.5 border border-outline-variant/50 bg-surface-card p-3 text-[13px]"
                        >
                          {/* Completion checkbox / icon */}
                          <span className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-none border',
                            done ? 'border-secondary bg-secondary' : 'border-outline-variant bg-surface-container-high',
                          )}>
                            {done && <Check className="h-2.5 w-2.5 text-on-secondary-fixed" />}
                          </span>

                          {/* Description */}
                          <span className={cn('min-w-0 flex-1 leading-5', done ? 'line-through text-outline' : 'text-on-surface')}>
                            <span className="mb-0.5 block font-code text-[10px] font-bold uppercase tracking-wide text-cyan">
                              {task.type === 'practice'
                                ? 'Practise'
                                : task.type === 'build'
                                ? node.path_id === 'foundations' ? 'Practise' : 'Ship'
                                : task.type === 'quiz' || task.type === 'challenge' ? 'Prove' : 'Learn'}
                            </span>
                            {task.description}
                          </span>

                          {/* Type marker — the action itself lives in the main
                              canvas card or the bottom CTA, not duplicated here */}
                          {!done && (task.type === 'quiz' || task.type === 'challenge' || task.type === 'build') && (
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
          </>
        )}

        {/* ─── MAIN CANVAS ─────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain bg-background">
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-8 sm:py-8 lg:px-10">

            {!data.isAuthenticated && data.isSupabaseConnected && (
              <Alert>
                <LockKeyhole />
                <AlertTitle>Sign in to save your progress</AlertTitle>
                <AlertDescription>
                  You can review this lesson now. Sign in with GitHub before completing tasks or verifying project work.
                </AlertDescription>
              </Alert>
            )}

            {status === 'locked' && !(data.isSupabaseConnected && !data.isAuthenticated) && (
              <Alert>
                <LockKeyhole />
                <AlertTitle>This lesson is locked</AlertTitle>
                <AlertDescription>
                  Complete its prerequisites on the roadmap first. Your work here remains available to preview.
                </AlertDescription>
              </Alert>
            )}

            {/* Module meta + title */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-code text-xs text-on-surface-variant">
                <span>Module {node.order}</span>
                <span className="text-outline">·</span>
                <span>{node.est_hours}h</span>
                {status === 'locked' && (
                  <Badge variant="outline" className="ml-2 rounded-none border-warning/40 bg-warning/10 font-code text-[10px] text-on-surface uppercase">
                    Locked
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-on-surface sm:text-4xl">{node.name}</h1>
              {node.subtitle && <p className="text-sm leading-6 text-on-surface-variant">{node.subtitle}</p>}
              <div className="max-w-3xl border-y border-outline-variant py-4">
                <p className="font-code text-[11px] font-bold uppercase tracking-wide text-cyan">Outcome</p>
                <p className="mt-1 text-sm leading-6 text-on-surface">{node.description}</p>
                {node.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Competencies practised in this module">
                    {node.skills.map((skill) => (
                      <span key={skill} className="border border-outline-variant bg-surface-container-low px-2.5 py-1 font-code text-xs text-on-surface-variant">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Resource viewer ── */}
            {activeResource ? (
              <div className="overflow-hidden rounded-none border border-outline-variant bg-surface-card">
                {/* Resource header bar */}
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-on-surface">
                    {activeYouTubeRef ? <Play className="h-3.5 w-3.5 text-cyan" /> : <BookOpen className="h-3.5 w-3.5 text-cyan" />}
                    <span className="truncate max-w-[240px]">{activeResource.name}</span>
                    <span className="hidden text-outline sm:inline">·</span>
                    <span className="hidden text-on-surface-variant font-normal sm:inline">{activeResource.platform}</span>
                  </div>
                  <a
                    href={activeResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 font-code text-[11px] font-semibold text-on-surface hover:text-cyan hover:underline"
                  >
                    Open tab <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Player / reader */}
                <div className="p-3 sm:p-4">
                  {activeLessonTask && (
                    <div className="mb-3 flex flex-col gap-1 border-l-2 border-cyan bg-cyan/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-code text-[10px] font-bold uppercase tracking-wide text-cyan">Focused lesson</p>
                        <p className="mt-0.5 text-sm font-semibold text-on-surface">{activeLessonTask.lesson_title}</p>
                      </div>
                      {activeLessonTask.duration_minutes && (
                        <span className="shrink-0 font-code text-xs text-on-surface-variant">{activeLessonTask.duration_minutes} min</span>
                      )}
                    </div>
                  )}
                  {activeYouTubeRef ? (
                    <YouTubeEmbed
                      source={activeYouTubeRef}
                      title={activeLessonTask?.lesson_title ?? activeResource.name}
                      onWatchThreshold={activeLessonTask?.type === 'watch' && !data.progress.completedTasks.includes(activeLessonTask.id)
                        ? () => { void handleCompleteTask(activeLessonTask); }
                        : undefined}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 border border-outline-variant bg-surface px-4 py-8 text-center sm:py-12">
                      <div className="max-w-md text-center">
                        <p className="font-semibold text-on-surface">Study this selected source</p>
                        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                          {activeLessonTask
                            ? 'Open only the focused section named above. Return here to mark it read, then practise and prove the outcome.'
                            : 'Use this as a reference when the focused lesson or project work leaves a question. It is optional and does not block progress.'}
                        </p>
                      </div>
                      <Button asChild className="gap-2 rounded-none bg-cyan font-bold text-on-primary-fixed hover:bg-cyan/90">
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
                <div className="flex flex-col gap-2 border-t border-outline-variant px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-code text-[11px] font-semibold text-on-surface">Was this resource useful?</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {activeResource.rating_count > 0
                        ? `${activeResource.avg_rating.toFixed(1)} from ${activeResource.rating_count} rating${activeResource.rating_count === 1 ? '' : 's'}`
                        : 'No ratings yet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1" role="group" aria-label={`Rate ${activeResource.name}`}>
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const selected = (data.progress.ratings[activeResource.id] ?? 0) >= rating;
                      return (
                        <button
                          key={rating}
                          type="button"
                          disabled={!canWork}
                          onClick={async () => {
                            try {
                              await data.rateResource({ resourceId: activeResource.id, rating });
                              toast.success('Resource rating saved.');
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : 'Could not save your rating.');
                            }
                          }}
                          className="flex size-9 items-center justify-center text-outline transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                          aria-pressed={(data.progress.ratings[activeResource.id] ?? 0) === rating}
                        >
                          <Star className={cn('size-4', selected && 'fill-secondary text-secondary')} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-none border border-outline-variant bg-surface-card p-10 text-center">
                <p className="text-sm text-on-surface-variant">No resources yet — check back soon, or start the tasks below.</p>
              </div>
            )}

            {/* ── Interactive task cards — a node only ever has a quiz or a
                challenge, never both, so the 2-col layout only kicks in if
                that ever changes. ── */}
            {(challengeTask || quizTask) && (
              <div className={cn('grid grid-cols-1 gap-4', challengeTask && quizTask && 'sm:grid-cols-2')}>
                {challengeTask && challengeTask.challenge && (
                  <div className="flex flex-col justify-between gap-4 border border-cyan/40 bg-cyan/[0.05] p-4 sm:p-5">
                    <div>
                      <Badge variant="outline" className="mb-2 border-cyan/40 bg-cyan/15 font-code text-[10px] uppercase text-on-surface">
                        Code Challenge
                      </Badge>
                      <h3 className="font-display text-sm font-bold text-on-surface">Interactive Kata</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant line-clamp-2">{challengeTask.description}</p>
                    </div>
                    <Button
                      onClick={() => setActiveChallengeTask(challengeTask)}
                      disabled={!canWork}
                      size="sm"
                      className="w-full justify-center gap-2 rounded-none bg-cyan font-code font-bold text-on-primary-fixed hover:bg-cyan/90"
                    >
                      <Terminal className="h-3.5 w-3.5" /> Open Coding Panel
                    </Button>
                  </div>
                )}

                {quizTask && quizTask.quiz && (
                  <div className="flex flex-col justify-between gap-4 border border-secondary/40 bg-secondary/[0.05] p-4 sm:p-5">
                    <div>
                      <Badge variant="outline" className="mb-2 border-secondary/40 bg-secondary/15 font-code text-[10px] uppercase text-on-surface">
                        Knowledge Check
                      </Badge>
                      <h3 className="font-display text-sm font-bold text-on-surface">Checkpoint Quiz</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant line-clamp-2">{quizTask.description}</p>
                    </div>
                    <Button
                      onClick={() => setActiveQuizTask(quizTask)}
                      disabled={!canWork}
                      size="sm"
                      className="w-full justify-center gap-2 rounded-none bg-secondary font-code font-bold text-on-secondary-fixed hover:bg-secondary/90"
                    >
                      <Code2 className="h-3.5 w-3.5" /> Take Quiz
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── GitHub milestone card ── */}
            {buildTask && node.path_id !== 'foundations' && (
              <div id="project-milestone" className="scroll-mt-6 space-y-2">
                <p className="font-code text-[10px] font-bold uppercase tracking-widest text-outline">
                  Ship · Project Milestone
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

            {nextNode && (
              <div className="flex flex-col gap-2 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-code text-[11px] font-bold uppercase tracking-wide text-cyan">What this unlocks</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{nextNode.name}</p>
                  <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">Complete this module’s required work to continue.</p>
                </div>
                <span className="font-code text-xs text-on-surface-variant">Module {nextNode.order}</span>
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
      <footer className="z-30 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-outline-variant bg-surface pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:flex sm:gap-4 sm:px-6 sm:py-3 sm:pb-3">

        {/* Previous lesson button */}
        {prevNode ? (
          <Link
            href={`/roadmap/${prevNode.slug}`}
            className="flex shrink-0 items-center gap-1.5 rounded-none border border-outline-variant bg-surface-card px-3 py-2 font-code text-xs font-semibold text-on-surface-variant transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Link>
        ) : (
          <div className="w-10 shrink-0" />
        )}

        {/* Progress strip */}
        <div className="hidden flex-1 flex-col gap-1 sm:flex">
          <div className="flex items-center justify-between font-code text-[10px] text-on-surface-variant">
            <span>Progress</span>
            <span className="font-bold text-on-surface">{doneCount}/{tasks.length} ({stepPct}%)</span>
          </div>
          <div className="flex h-1.5 w-full items-center gap-1">
            {tasks.length > 0 ? tasks.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'h-full flex-1 rounded-none transition-all duration-500',
                  data.progress.completedTasks.includes(t.id) ? 'bg-secondary' : 'bg-surface-container-high',
                )}
              />
            )) : (
              <div className="h-full w-full rounded-none bg-surface-container-high" />
            )}
          </div>
        </div>

        <div className="min-w-0 text-center sm:hidden" aria-label={`${stepPct}% of this lesson complete`}>
          <span className="block font-code text-[10px] font-bold text-on-surface">{stepPct}%</span>
          <span className="mt-1 block h-1 overflow-hidden bg-surface-container-high">
            <span className="block h-full bg-secondary transition-[width] duration-300" style={{ width: `${stepPct}%` }} />
          </span>
        </div>

        {/* Primary CTA */}
        {allDone && nextNode ? (
          <Link
            href={`/roadmap/${nextNode.slug}`}
            className="flex min-w-0 shrink-0 items-center gap-2 bg-secondary px-3 py-2 font-code text-xs font-bold text-on-secondary-fixed transition-colors hover:bg-secondary/90 sm:ml-auto sm:px-5 sm:text-sm"
          >
            Next Lesson <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Button
            onClick={data.isSupabaseConnected && !data.isAuthenticated ? data.signInWithGithub : handleGotIt}
            disabled={(status === 'locked') || Boolean(completingTaskId) || (allDone && !nextNode)}
            className={cn(
              'min-w-0 shrink-0 gap-2 px-3 py-2 font-code text-[11px] font-bold sm:ml-auto sm:px-5 sm:text-sm',
              allDone
                ? 'border border-secondary bg-surface-card text-secondary cursor-default'
                : 'bg-secondary text-on-secondary-fixed hover:bg-secondary/90',
            )}
          >
            {data.isSupabaseConnected && !data.isAuthenticated ? 'Sign in to continue' : primaryBtnLabel}
            {completingTaskId ? <Spinner /> : !allDone && <ArrowRight className="h-4 w-4" />}
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
            if (await handleCompleteTask(activeQuizTask)) setActiveQuizTask(null);
          }}
        />
      )}

      {/* ── Coding panel full-screen overlay ── */}
      {activeChallengeTask && activeChallengeTask.challenge && (
        <ChallengeBlock
          challenge={activeChallengeTask.challenge}
          disabled={!canWork}
          onClose={() => setActiveChallengeTask(null)}
          onPass={async () => {
            if (await handleCompleteTask(activeChallengeTask)) setActiveChallengeTask(null);
          }}
        />
      )}
    </div>
  );
}
