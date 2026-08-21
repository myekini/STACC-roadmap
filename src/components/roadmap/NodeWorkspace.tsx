'use client';

/**
 * Topic-structured node workspace.
 *
 * Layout:
 *   ┌─ sticky top bar (breadcrumb + "< Course Outline >" sidebar toggle) ─┐
 *   │  ← collapsible LEFT PANEL (topic outline + practise/prove/ship)               │
 *   │  MAIN CANVAS (module header · topic sections, each with its own                │
 *   │               primary + secondary resources · quiz/challenge · milestone)     │
 *   └─ sticky bottom bar (← Prev · segmented progress · Got It! / Next lesson →)    ┘
 *
 * A node breaks into topics (supabase/migrations/0030_node_topics.sql); each topic
 * carries its own resources, each resource optionally driving a read/watch lesson
 * task. All colours use semantic design tokens so light & dark mode both work.
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
  Code2,
  ExternalLink,
  GitBranch,
  ListChecks,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Terminal,
} from 'lucide-react';
import type { ResourceRow, TaskRow } from '@/lib/database.types';
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

/** GitHub commit URLs look like `.../commit/<sha>` — pull a short sha back out for display
 * when all we have is the persisted evidence URL (no in-memory verify response). */
function shortShaFromCommitUrl(url: string): string {
  const match = url.match(/\/commit\/([0-9a-f]{7,40})/i);
  return match ? match[1].slice(0, 7) : '';
}

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

  // The task is completed the moment /api/github/verify succeeds server-side —
  // that's the durable source of truth. `verified` above only covers *this*
  // click, so on remount (nav away/back, refresh) it resets to null and a
  // genuinely shipped milestone would otherwise flash back to "Check my
  // work" as if it had never been verified. Fall back to the persisted
  // evidence URL (the commit link `complete_task` stored) once the task
  // shows up in completedTasks.
  const persistedEvidenceUrl = data.progress.evidence[task.id];
  const isCompleted = data.progress.completedTasks.includes(task.id);
  const verifiedState = verified ?? (isCompleted && persistedEvidenceUrl
    ? { url: persistedEvidenceUrl, sha: shortShaFromCommitUrl(persistedEvidenceUrl) }
    : null);

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
            <p className="font-code text-xs font-bold uppercase tracking-[0.08em] text-on-surface">Automated checks</p>
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
          disabled={disabled || busy || Boolean(verifiedState)}
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
          {busy ? <Spinner /> : verifiedState ? <Check className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
          {busy ? 'Checking…' : verifiedState ? 'Verified' : 'Check my work'}
        </Button>

        {verifiedState && (
          <a href={verifiedState.url} target="_blank" rel="noreferrer" className="font-semibold text-secondary hover:underline">
            Commit {verifiedState.sha.slice(0, 7)}
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
   ResourceCard — one resource inside a topic section. Generic: renders as a
   video embed / "study this source" card when a read/watch lesson task
   drives it, or a plain reference link when it doesn't. Every resource in
   every topic goes through this exact same path — nothing is hardcoded by
   position ("primary"/"secondary" is just which slot the admin put it in).
───────────────────────────────────────────────────────── */
function ResourceCard({
  resource,
  lessonTask,
  completed,
  onCompleteLesson,
}: {
  resource: ResourceRow;
  lessonTask: TaskRow | null;
  completed: boolean;
  onCompleteLesson: (task: TaskRow) => void;
}) {
  const parsedYouTubeRef = getYouTubeRef(resource.url);
  const youTubeRef = parsedYouTubeRef?.kind === 'video' && lessonTask
    ? {
        ...parsedYouTubeRef,
        startSeconds: lessonTask.start_seconds ?? parsedYouTubeRef.startSeconds,
        endSeconds: lessonTask.end_seconds ?? parsedYouTubeRef.endSeconds,
      }
    : parsedYouTubeRef;

  return (
    <div id={`resource-${resource.id}`} className="scroll-mt-6 overflow-hidden rounded-none border border-outline-variant bg-surface-card">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-on-surface">
          {completed ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-secondary" />
          ) : youTubeRef ? (
            <Play className="h-3.5 w-3.5 shrink-0 text-cyan" />
          ) : (
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-cyan" />
          )}
          <span className="truncate max-w-[240px]">{lessonTask?.lesson_title ?? resource.name}</span>
          <span className="hidden text-outline sm:inline">·</span>
          <span className="hidden text-on-surface-variant font-normal sm:inline">{resource.platform}</span>
          {lessonTask?.duration_minutes && (
            <span className="hidden font-normal text-on-surface-variant sm:inline">· {lessonTask.duration_minutes} min</span>
          )}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 font-code text-[11px] font-semibold text-on-surface hover:text-cyan hover:underline"
        >
          Open tab <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-3 sm:p-4">
        {youTubeRef ? (
          <YouTubeEmbed
            source={youTubeRef}
            title={lessonTask?.lesson_title ?? resource.name}
            onWatchThreshold={lessonTask?.type === 'watch' && !completed ? () => onCompleteLesson(lessonTask) : undefined}
          />
        ) : lessonTask ? (
          <div className="flex flex-col items-center gap-4 border border-outline-variant bg-surface px-4 py-8 text-center sm:py-12">
            <div className="max-w-md text-center">
              <p className="font-semibold text-on-surface">Study this selected source</p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Open it in a new tab, then return here to mark it read.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild className="gap-2 rounded-none bg-cyan font-bold text-on-primary-fixed hover:bg-cyan/90">
                <a href={resource.url} target="_blank" rel="noreferrer">
                  Read on {resource.platform} <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              {!completed && (
                <Button variant="outline" className="rounded-none" onClick={() => onCompleteLesson(lessonTask)}>
                  Mark read
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 border border-outline-variant bg-surface px-4 py-6 text-center">
            <p className="text-sm leading-6 text-on-surface-variant">
              Reference material — use it when this topic leaves a question. It doesn&apos;t block progress.
            </p>
            <Button asChild variant="outline" className="gap-2 rounded-none">
              <a href={resource.url} target="_blank" rel="noreferrer">
                Open on {resource.platform} <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

type PrimaryAction =
  | 'locked'
  | 'saving'
  | 'verifyMilestone'
  | 'completePractice'
  | 'takeQuiz'
  | 'openChallenge'
  | 'watchToComplete'
  | 'completeLessonTask'
  | 'continue';

const PRIMARY_ACTION_LABEL: Record<PrimaryAction, string> = {
  locked: 'Complete prerequisites',
  saving: 'Saving progress…',
  verifyMilestone: 'Verify milestone',
  completePractice: 'Complete practice',
  takeQuiz: 'Take Quiz',
  openChallenge: 'Open Code Challenge',
  watchToComplete: 'Watch lesson to complete',
  completeLessonTask: 'Mark lesson read',
  continue: 'Continue',
};

/* ─────────────────────────────────────────────────────────
   Main NodeWorkspace component
───────────────────────────────────────────────────────── */
export default function NodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const [showPanel, setShowPanel] = useState(false);
  const [activeQuizTask, setActiveQuizTask] = useState<TaskRow | null>(null);
  const [activeChallengeTask, setActiveChallengeTask] = useState<TaskRow | null>(null);
  const [connectingRepo, setConnectingRepo] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  /* ── Data derived from slug ── */
  const node = data.nodes.find((n) => n.slug === slug) ?? null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const path = node ? data.paths.find((p) => p.id === node.path_id) : null;
  const tasks = useMemo(() => data.tasks.filter((t) => t.node_id === node?.id), [data.tasks, node?.id]);
  const topics = useMemo(
    () => data.topics.filter((t) => t.node_id === node?.id).sort((a, b) => a.order - b.order),
    [data.topics, node?.id],
  );
  const resourcesByTopic = useMemo(() => {
    const map = new Map<string, ResourceRow[]>();
    for (const topic of topics) {
      map.set(topic.id, data.resources.filter((r) => r.topic_id === topic.id).sort((a, b) => a.order - b.order));
    }
    return map;
  }, [topics, data.resources]);
  const taskForResource = useMemo(() => {
    const map = new Map<string, TaskRow>();
    for (const task of tasks) {
      if (task.resource_id && (task.type === 'read' || task.type === 'watch')) map.set(task.resource_id, task);
    }
    return map;
  }, [tasks]);
  // Tasks not tied to a specific resource — practice/build/quiz/challenge — assess
  // the whole module, not one topic, so they live in their own trailing section.
  const untiedTasks = useMemo(() => tasks.filter((t) => !t.resource_id), [tasks]);

  /* ── Progress ── */
  const doneCount = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  const canWork = !(data.isSupabaseConnected && !data.isAuthenticated) &&
    (status === 'in_progress' || status === 'available');

  /* ── Prev / Next module navigation ── */
  const pathNodes = data.nodes.filter((n) => n.path_id === node?.path_id).sort((a, b) => a.order - b.order);
  const currentIdx = pathNodes.findIndex((n) => n.slug === slug);
  const prevNode = currentIdx > 0 ? pathNodes[currentIdx - 1] : null;
  const nextNode = currentIdx !== -1 && currentIdx < pathNodes.length - 1 ? pathNodes[currentIdx + 1] : null;

  /* ── Task shortcuts ── */
  const nextPendingTask = tasks.find((t) => !data.progress.completedTasks.includes(t.id));
  const nextPendingResource = nextPendingTask?.resource_id
    ? data.resources.find((r) => r.id === nextPendingTask.resource_id) ?? null
    : null;
  const nextPendingIsVideoWatch = Boolean(
    nextPendingTask?.type === 'watch' && nextPendingResource && getYouTubeRef(nextPendingResource.url)?.kind === 'video',
  );
  const challengeTask = tasks.find((t) => t.type === 'challenge' && t.challenge);
  const quizTask = tasks.find((t) => t.type === 'quiz' && t.quiz);
  const buildTask = tasks.find((t) => t.type === 'build');

  /* ── Connected project repo — visible on every node in the track, not
     just wherever the build task card happens to be ── */
  const trackProject = path && path.id !== 'foundations' ? data.projectConnections[path.id] : undefined;
  const trackRepoConnected = trackProject?.connection_status === 'active' && Boolean(trackProject.github_repo_id);

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

  /* ── Primary CTA — single decision tree shared by the label and the click
     handler, so they can't drift out of sync with each other. Everything is
     visible at once now (no more paging between resources), so this just
     picks the next pending task and, where useful, scrolls its card into
     view instead of swapping which resource is "active." ── */
  const primaryAction: PrimaryAction =
    status === 'locked' ? 'locked'
    : completingTaskId ? 'saving'
    : nextPendingTask?.type === 'build' ? 'verifyMilestone'
    : nextPendingTask?.type === 'practice' ? 'completePractice'
    : nextPendingTask?.type === 'quiz' ? 'takeQuiz'
    : nextPendingTask?.type === 'challenge' ? 'openChallenge'
    : nextPendingTask && nextPendingIsVideoWatch ? 'watchToComplete'
    : nextPendingTask ? 'completeLessonTask'
    : 'continue';

  const scrollToResource = (resourceId: string) => {
    document.getElementById(`resource-${resourceId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const runPrimaryAction = async () => {
    switch (primaryAction) {
      case 'locked':
      case 'saving':
        return;
      case 'watchToComplete':
        if (nextPendingResource) scrollToResource(nextPendingResource.id);
        return; // watch progress is driven by the video's onWatchThreshold, not a click
      case 'verifyMilestone':
        document.getElementById('project-milestone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      case 'takeQuiz':
        if (nextPendingTask?.quiz) setActiveQuizTask(nextPendingTask);
        return;
      case 'openChallenge':
        if (nextPendingTask?.challenge) setActiveChallengeTask(nextPendingTask);
        return;
      case 'completePractice':
        if (nextPendingTask) await handleCompleteTask(nextPendingTask);
        return;
      case 'completeLessonTask':
        if (!nextPendingTask) return;
        if (nextPendingResource) scrollToResource(nextPendingResource.id);
        await handleCompleteTask(nextPendingTask);
        return;
      case 'continue':
        return;
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

  const primaryBtnLabel = allDone ? 'Complete!' : PRIMARY_ACTION_LABEL[primaryAction];

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background text-on-surface">

      {/* ──────────────────────────────────────────────────
          TOP BAR
          Left:  ← Back to Roadmap  /  Path  /  Node Name
          Right: [< Course Outline >]
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

              {/* Topic outline */}
              {topics.map((topic) => {
                const topicResources = resourcesByTopic.get(topic.id) ?? [];
                if (topicResources.length === 0) return null;
                return (
                  <section key={topic.id}>
                    <p className="mb-2 font-code text-xs font-bold uppercase tracking-[0.08em] text-outline">
                      {topic.title}
                    </p>
                    <ul className="space-y-1.5">
                      {topicResources.map((res) => {
                        const lesson = taskForResource.get(res.id) ?? null;
                        const done = lesson ? data.progress.completedTasks.includes(lesson.id) : false;
                        const yt = getYouTubeRef(res.url);
                        return (
                          <li key={res.id}>
                            <a
                              href={`#resource-${res.id}`}
                              className="flex w-full items-start gap-2.5 border border-transparent bg-surface-card p-3 text-left text-[13px] text-on-surface-variant transition-colors hover:border-outline-variant hover:text-on-surface"
                            >
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-surface-container-high text-cyan">
                                {done ? <Check className="h-2.5 w-2.5" /> : yt ? <Play className="h-2.5 w-2.5" /> : <BookOpen className="h-2.5 w-2.5" />}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium leading-4">{lesson?.lesson_title ?? res.name}</p>
                                <p className="mt-0.5 text-xs text-on-surface-variant">
                                  {lesson?.duration_minutes ? `${lesson.duration_minutes} min` : res.platform} · {yt ? 'Video' : res.type}
                                </p>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}

              {/* Practise · Prove · Ship — tasks that assess the whole module, not one topic */}
              {untiedTasks.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between font-code text-xs">
                    <span className="font-bold uppercase tracking-widest text-outline flex items-center gap-1">
                      <ListChecks className="h-3 w-3 text-cyan" /> Practise · Prove · Ship
                    </span>
                    <span className="font-bold text-on-surface">
                      {untiedTasks.filter((t) => data.progress.completedTasks.includes(t.id)).length}/{untiedTasks.length}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {untiedTasks.map((task) => {
                      const done = data.progress.completedTasks.includes(task.id);
                      return (
                        <li
                          key={task.id}
                          className="flex items-center gap-2.5 border border-outline-variant/50 bg-surface-card p-3 text-[13px]"
                        >
                          <span className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-none border',
                            done ? 'border-secondary bg-secondary' : 'border-outline-variant bg-surface-container-high',
                          )}>
                            {done && <Check className="h-2.5 w-2.5 text-on-secondary-fixed" />}
                          </span>
                          <span className={cn('min-w-0 flex-1 leading-5', done ? 'line-through text-outline' : 'text-on-surface')}>
                            <span className="mb-0.5 block font-code text-xs font-bold uppercase tracking-[0.08em] text-cyan">
                              {task.type === 'practice'
                                ? 'Practise'
                                : task.type === 'build'
                                ? node.path_id === 'foundations' ? 'Practise' : 'Ship'
                                : 'Prove'}
                            </span>
                            {task.description}
                          </span>
                          {!done && (
                            <span className="shrink-0 font-code text-xs text-cyan">↓</span>
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
          <div className="mx-auto max-w-4xl space-y-6 px-4 py-5 sm:space-y-8 sm:px-8 sm:py-8 lg:px-10">

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
                  <Badge variant="outline" className="ml-2 border-warning/40 bg-warning/10 text-on-surface">
                    Locked
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-on-surface sm:text-4xl">{node.name}</h1>
              {node.subtitle && <p className="text-sm leading-6 text-on-surface-variant">{node.subtitle}</p>}
              <div className="max-w-3xl border-y border-outline-variant py-4">
                <p className="font-code text-[11px] font-bold uppercase tracking-wide text-cyan">Outcome</p>
                <p className="mt-1 text-sm leading-6 text-on-surface">{node.description}</p>
              </div>
            </div>

            {/* ── Topic breakdown ── */}
            {topics.length > 0 ? (
              <div className="space-y-8">
                {topics.map((topic) => {
                  const topicResources = resourcesByTopic.get(topic.id) ?? [];
                  return (
                    <section key={topic.id} className="space-y-3">
                      <h2 className="font-display text-lg font-bold text-on-surface">{topic.title}</h2>
                      {topicResources.length === 0 ? (
                        <div className="rounded-none border border-dashed border-outline-variant bg-surface-card p-6 text-center">
                          <p className="text-sm text-on-surface-variant">No resources yet for this topic.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {topicResources.map((res) => {
                            const lesson = taskForResource.get(res.id) ?? null;
                            const done = lesson ? data.progress.completedTasks.includes(lesson.id) : false;
                            return (
                              <ResourceCard
                                key={res.id}
                                resource={res}
                                lessonTask={lesson}
                                completed={done}
                                onCompleteLesson={(task) => { void handleCompleteTask(task); }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-none border border-outline-variant bg-surface-card p-10 text-center">
                <p className="text-sm text-on-surface-variant">No topics yet — check back soon, or start the tasks below.</p>
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
                      <Badge variant="outline" className="mb-2 border-cyan/40 bg-cyan/15 text-on-surface">
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
                      <Badge variant="outline" className="mb-2 border-secondary/40 bg-secondary/15 text-on-surface">
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
                <p className="font-code text-xs font-bold uppercase tracking-[0.08em] text-outline">
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
          <div className="flex items-center justify-between font-code text-xs text-on-surface-variant">
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
          <span className="block font-code text-xs font-bold text-on-surface">{stepPct}%</span>
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
            onClick={data.isSupabaseConnected && !data.isAuthenticated ? data.signInWithGithub : runPrimaryAction}
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
