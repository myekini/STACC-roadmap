'use client';

/**
 * DataCamp-Inspired Interactive Learning Workspace:
 * Full-bleed video player / resource reader layout matching DataCamp's course player UI.
 * Features top breadcrumb bar, collapsible transcript & lesson outline sidebar,
 * bottom multi-segment step progress bar, and "Got It!" / "Start Challenge" action button.
 * Supports light & dark modes with native Stacc theme tokens.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getYouTubeRef, YouTubeEmbed } from './bits';
import { ChallengeBlock } from './ChallengeBlock';
import { QuizWorkspace } from './QuizWorkspace';
import { cn } from '@/lib/utils';

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
      <div className="border border-outline-variant bg-surface-card p-4 rounded-xl text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface">GitHub verification is available in the live app.</p>
        <p className="mt-1 leading-5">Sign in to connect one repository to this track and verify your milestone commits.</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-card p-4 text-xs">
        <p className="flex items-center gap-2 font-semibold text-on-surface">
          <GitBranch className="h-4 w-4 text-cyan" />Connect your {pathTitle} project
        </p>
        <p className="mt-1 leading-5 text-on-surface-variant">Choose one GitHub repository. Stacc will read commits from that repository only.</p>
        <Button asChild size="sm" className="mt-3 rounded-lg font-code">
          <a href={`/api/github/install?path=${encodeURIComponent(pathId)}&returnTo=${encodeURIComponent(`/roadmap/${nodeSlug}`)}`}>
            <GitBranch />{project ? 'Reconnect GitHub' : 'Connect GitHub'}
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
              const response = await fetch('/api/github/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id }),
              });
              const result = (await response.json()) as { error?: string; commitUrl?: string; commitSha?: string };
              if (!response.ok || !result.commitUrl || !result.commitSha) {
                throw new Error(result.error ?? 'Could not verify the project.');
              }
              setVerified({ url: result.commitUrl, sha: result.commitSha });
              await data.refresh();
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Could not verify the project.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <AnimatedStaccMark className="h-4 w-4" /> : verified ? <Check /> : <GitBranch />}
          {busy ? 'Checking…' : verified ? 'Verified' : 'Check my work'}
        </Button>
        {verified && (
          <a href={verified.url} target="_blank" rel="noreferrer" className="font-semibold text-secondary hover:underline">
            Commit {verified.sha}
          </a>
        )}
      </div>
      {errorMsg && <p role="alert" className="mt-2 leading-5 text-error">{errorMsg}</p>}
    </div>
  );
}

export default function NodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const router = useRouter();

  const [showSidePanel, setShowSidePanel] = useState(true);
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);

  const [activeQuizTask, setActiveQuizTask] = useState<TaskRow | null>(null);
  const [activeChallengeTask, setActiveChallengeTask] = useState<TaskRow | null>(null);

  const node = data.nodes.find((n) => n.slug === slug) ?? null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const path = node ? data.paths.find((p) => p.id === node.path_id) : null;
  const tasks = useMemo(() => data.tasks.filter((t) => t.node_id === node?.id), [data.tasks, node?.id]);
  const resources = useMemo(() => data.resources.filter((r) => r.node_id === node?.id), [data.resources, node?.id]);

  const doneCount = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  const needsAuth = data.isSupabaseConnected && !data.isAuthenticated;
  const canWork = !needsAuth && (status === 'in_progress' || status === 'available');

  const activeResource = resources[activeResourceIndex] ?? resources[0] ?? null;
  const activeYouTubeRef = activeResource ? getYouTubeRef(activeResource.url) : null;

  useEffect(() => {
    setActiveResourceIndex(0);
  }, [slug]);

  const handleCompleteTask = async (task: TaskRow, evidenceUrl?: string) => {
    try {
      await data.completeTask({ task, evidenceUrl });
    } catch (err) {
      console.error('Task completion failed:', err);
      throw err;
    }
  };

  if (!data.isLoading && !node) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="micro-label text-outline">{'// not found'}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">This module doesn&apos;t exist</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">It may have moved, or the link is off.</p>
        <Button asChild className="mt-6 rounded-lg"><Link href="/roadmap">Back to roadmap</Link></Button>
      </div>
    );
  }

  if (!node) return null;

  const totalSteps = Math.max(1, tasks.length);
  const stepPct = Math.round((doneCount / totalSteps) * 100);

  // Next pending task
  const nextPendingTask = tasks.find((t) => !data.progress.completedTasks.includes(t.id));
  const challengeTask = tasks.find((t) => t.type === 'challenge' && t.challenge);
  const quizTask = tasks.find((t) => t.type === 'quiz' && t.quiz);
  const buildTask = tasks.find((t) => t.type === 'build');

  const handleGotItClick = async () => {
    if (nextPendingTask) {
      if (nextPendingTask.type === 'watch' || nextPendingTask.type === 'read') {
        await handleCompleteTask(nextPendingTask);
        if (activeResourceIndex < resources.length - 1) {
          setActiveResourceIndex((prev) => prev + 1);
        }
      } else if (nextPendingTask.type === 'quiz' && nextPendingTask.quiz) {
        setActiveQuizTask(nextPendingTask);
      } else if (nextPendingTask.type === 'challenge' && nextPendingTask.challenge) {
        setActiveChallengeTask(nextPendingTask);
      } else {
        // 'build' tasks are verified inline via ProjectMilestone — just mark complete
        await handleCompleteTask(nextPendingTask);
      }
    } else if (activeResourceIndex < resources.length - 1) {
      setActiveResourceIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between">
      {/* ── Top Bar Navigation ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/roadmap" className="flex items-center gap-2 text-on-surface-variant hover:text-cyan font-code text-xs font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Learn</span>
          </Link>
          <span className="text-outline">/</span>
          <span className="text-xs text-on-surface-variant font-medium truncate hidden sm:inline">{path?.title ?? 'Course'}</span>
          <span className="text-outline hidden sm:inline">/</span>
          <span className="text-xs font-bold text-on-surface truncate">{node.name}</span>
        </div>

        {/* Outline Drawer & Daily XP Bar */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/roadmap')}
            className="rounded-xl border-outline-variant bg-surface-card text-on-surface hover:bg-surface-container-high text-xs font-code gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Course Outline <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <div className="hidden md:flex items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-1 font-code text-xs text-cyan">
            <Trophy className="h-3.5 w-3.5" />
            <span>Daily XP <strong>+50</strong></span>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body: Split Panel ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Panel (Transcript & Resource Outline) */}
        {showSidePanel && (
          <aside className="w-full md:w-80 border-r border-outline-variant bg-surface flex flex-col shrink-0 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <span className="rounded-lg bg-cyan/20 px-3 py-1 font-code text-xs font-bold text-cyan">
                Lesson Outline
              </span>
              <button
                type="button"
                onClick={() => setShowSidePanel(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
                title="Hide side panel"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* Resources List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Resources ({resources.length})</p>
              {resources.map((res, idx) => {
                const isActive = idx === activeResourceIndex;
                const yt = getYouTubeRef(res.url);

                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setActiveResourceIndex(idx)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5',
                      isActive
                        ? 'border-cyan bg-cyan/15 text-on-surface font-semibold shadow-md'
                        : 'border-outline-variant/60 bg-surface-card text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
                    )}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-cyan">
                      {yt ? <Play className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-4 truncate">{res.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">{res.platform} · {yt ? 'Video Lesson' : res.type}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tasks / Checklist in Sidebar */}
            <div className="border-t border-outline-variant pt-3 space-y-2">
              <div className="flex items-center justify-between font-code text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5 text-cyan" /> Tasks Checklist</span>
                <span className="text-cyan font-bold">{doneCount}/{tasks.length}</span>
              </div>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {tasks.map((task) => {
                  const done = data.progress.completedTasks.includes(task.id);
                  return (
                    <li key={task.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-low text-xs border border-outline-variant/40">
                      <span className={cn('truncate text-[11px]', done ? 'line-through text-outline' : 'text-on-surface')}>
                        {task.description}
                      </span>
                      {done ? (
                        <Check className="h-3.5 w-3.5 text-secondary shrink-0" />
                      ) : task.type === 'quiz' ? (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => setActiveQuizTask(task)}>Quiz</Button>
                      ) : task.type === 'challenge' ? (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => setActiveChallengeTask(task)}>Code</Button>
                      ) : task.type === 'build' ? (
                        <span className="text-[10px] text-cyan font-code">↓ below</span>
                      ) : (
                        <button type="button" onClick={() => handleCompleteTask(task)} className="h-4 w-4 rounded border border-outline shrink-0 hover:bg-cyan/10" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}

        {/* Center Main Viewing Area */}
        <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 bg-background overflow-y-auto">
          <div className="w-full max-w-4xl space-y-6">
            {!showSidePanel && (
              <button
                type="button"
                onClick={() => setShowSidePanel(true)}
                className="inline-flex items-center gap-1.5 text-xs font-code text-cyan bg-surface-card border border-outline-variant px-3 py-1.5 rounded-lg hover:border-cyan"
              >
                <PanelLeftOpen className="h-4 w-4" /> Show Outline Panel
              </button>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-code text-xs text-cyan">
                <span>Module {node.order}</span>
                <span>·</span>
                <span>{node.est_hours}h estimated</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-on-surface">{node.name}</h1>
              <p className="text-sm text-on-surface-variant leading-6">{node.subtitle}</p>
            </div>

            {/* Active Resource Player */}
            {activeResource ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-card p-2 sm:p-4 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant pb-3 px-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    <BookOpen className="h-4 w-4 text-cyan" />
                    <span>{activeResource.name}</span>
                  </div>
                  <a
                    href={activeResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
                  >
                    Open directly <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {activeYouTubeRef ? (
                  <YouTubeEmbed
                    source={activeYouTubeRef}
                    title={activeResource.name}
                  />
                ) : (
                  <div className="p-8 text-center space-y-4 bg-surface rounded-xl border border-outline-variant">
                    <p className="text-sm text-on-surface-variant">Click below to access this official documentation or reading resource:</p>
                    <Button asChild className="gap-2 rounded-xl bg-cyan text-navy font-bold hover:bg-cyan/90">
                      <a href={activeResource.url} target="_blank" rel="noreferrer">
                        Read Material on {activeResource.platform} <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-card rounded-xl border border-outline-variant">
                <p className="text-sm text-on-surface-variant">No external resources listed for this module. Proceed directly to the checklist tasks below.</p>
              </div>
            )}

            {/* Interactive Coding Panel / Quiz Prominent Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {challengeTask && challengeTask.challenge && (
                <div className="rounded-xl border border-cyan/40 bg-cyan/[0.06] p-4 flex flex-col justify-between gap-3">
                  <div>
                    <Badge variant="outline" className="border-cyan/40 bg-cyan/20 text-cyan font-code text-[10px] uppercase">
                      Code Challenge
                    </Badge>
                    <h4 className="font-display text-sm font-bold text-on-surface mt-2">Interactive Code Kata</h4>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{challengeTask.description}</p>
                  </div>
                  <Button
                    onClick={() => setActiveChallengeTask(challengeTask)}
                    size="sm"
                    className="rounded-lg font-code text-xs gap-1.5 bg-cyan text-navy hover:bg-cyan/90 font-bold"
                  >
                    <Terminal className="h-3.5 w-3.5" /> Open Coding Panel
                  </Button>
                </div>
              )}

              {quizTask && quizTask.quiz && (
                <div className="rounded-xl border border-secondary/40 bg-secondary/[0.06] p-4 flex flex-col justify-between gap-3">
                  <div>
                    <Badge variant="outline" className="border-secondary/40 bg-secondary/20 text-secondary font-code text-[10px] uppercase">
                      Checkpoint Quiz
                    </Badge>
                    <h4 className="font-display text-sm font-bold text-on-surface mt-2">Knowledge Checkpoint</h4>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{quizTask.description}</p>
                  </div>
                  <Button
                    onClick={() => setActiveQuizTask(quizTask)}
                    size="sm"
                    className="rounded-lg font-code text-xs gap-1.5 bg-secondary text-white hover:bg-secondary/90 font-bold"
                  >
                    <Code2 className="h-3.5 w-3.5" /> Take Quiz
                  </Button>
                </div>
              )}
            </div>

            {buildTask && (
              <div className="mt-4">
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

            {showSidePanel && (
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidePanel(false)}
                  className="rounded-xl border-outline-variant bg-surface-card text-xs text-on-surface-variant hover:text-on-surface gap-1.5"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" /> Hide Side Panel
                </Button>
              </div>
            )}
          </div>

          <div className="h-16" />
        </main>
      </div>

      {/* ── DataCamp Bottom Action & Navigation Bar ── */}
      <footer className="sticky bottom-0 z-30 flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant bg-surface px-4 py-3 sm:px-8 gap-4">
        <div className="flex-1 w-full max-w-xl space-y-1.5">
          <div className="flex justify-between font-code text-[11px] text-on-surface-variant">
            <span>Module Progress</span>
            <span className="font-bold text-cyan">{doneCount}/{tasks.length} tasks complete ({stepPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5 h-2 w-full">
            {tasks.map((t) => {
              const isDone = data.progress.completedTasks.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={cn(
                    'h-full flex-1 rounded-full transition-all',
                    isDone ? 'bg-secondary' : 'bg-surface-container-high',
                  )}
                />
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleGotItClick}
          size="lg"
          className="w-full sm:w-auto rounded-xl bg-secondary font-code text-sm font-bold text-white hover:bg-secondary/90 shadow-lg px-8 py-3 gap-2"
        >
          <span>
            {nextPendingTask?.type === 'quiz'
              ? 'Take Quiz Checkpoint'
              : nextPendingTask?.type === 'challenge'
                ? 'Start Code Challenge'
                : 'Got It!'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>

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

      {activeChallengeTask && activeChallengeTask.challenge && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
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
