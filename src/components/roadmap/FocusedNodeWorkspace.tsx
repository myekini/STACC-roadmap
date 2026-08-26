'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Code2,
  ExternalLink,
  ListChecks,
  LockKeyhole,
  Menu,
  PanelLeftClose,
} from 'lucide-react';
import type { TaskRow } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from '@/components/ui/toast';
import { ChallengeBlock } from './ChallengeBlock';
import { QuizWorkspace } from './QuizWorkspace';
import { ProjectMilestone, ResourceCard } from './NodeWorkspace';

function stageFor(task: TaskRow, foundation: boolean) {
  if (task.resource_id || task.type === 'read' || task.type === 'watch') return 'Learn';
  if (task.type === 'build') return foundation ? 'Practise' : 'Build';
  if (task.type === 'practice') return 'Practise';
  return foundation ? 'Pass' : 'Verify';
}

function stepTitle(task: TaskRow) {
  if (task.lesson_title) return task.lesson_title;
  return task.description.replace(/^(Learn|Read|Watch|Practise|Practice|Build(?: milestone \d+)?|Checkpoint(?: challenge| quiz)?|Capstone):\s*/i, '');
}

function ProgressDial({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center" aria-label={`${done} of ${total} required steps complete`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-container-high" />
        <circle
          cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="4"
          strokeLinecap="round" pathLength="100" strokeDasharray="100"
          strokeDashoffset={100 - pct}
          className={cn('transition-[stroke-dashoffset] duration-500', pct === 100 ? 'text-secondary' : 'text-cyan')}
        />
      </svg>
      <span className="text-center font-code text-xs font-bold tabular-nums text-on-surface">
        {done}<span className="text-outline">/{total}</span>
      </span>
    </div>
  );
}

export default function FocusedNodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const node = data.nodes.find((item) => item.slug === slug) ?? null;
  const path = node ? data.paths.find((item) => item.id === node.path_id) ?? null : null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const foundation = node?.path_id === 'foundations';
  const tasks = useMemo(
    () => data.tasks.filter((task) => task.node_id === node?.id).sort((a, b) => a.order - b.order),
    [data.tasks, node?.id],
  );
  const topics = useMemo(
    () => data.topics.filter((topic) => topic.node_id === node?.id).sort((a, b) => a.order - b.order),
    [data.topics, node?.id],
  );
  const completed = data.progress.completedTasks;
  const firstPending = tasks.find((task) => !completed.includes(task.id)) ?? tasks.at(-1) ?? null;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [challengeTask, setChallengeTask] = useState<TaskRow | null>(null);
  const [quizTask, setQuizTask] = useState<TaskRow | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setOutlineOpen(window.matchMedia('(min-width: 1024px)').matches);
  }, []);

  useEffect(() => {
    if (!activeTaskId || tasks.every((task) => task.id !== activeTaskId)) setActiveTaskId(firstPending?.id ?? null);
  }, [activeTaskId, firstPending?.id, tasks]);

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? firstPending;
  const activeIndex = activeTask ? tasks.findIndex((task) => task.id === activeTask.id) : -1;
  const activeResource = activeTask?.resource_id
    ? data.resources.find((resource) => resource.id === activeTask.resource_id) ?? null
    : null;
  const activeTopic = activeResource
    ? topics.find((topic) => topic.id === activeResource.topic_id) ?? null
    : null;
  const references = activeTopic
    ? data.resources.filter((resource) => resource.topic_id === activeTopic.id && resource.id !== activeResource?.id)
    : [];
  const doneCount = tasks.filter((task) => completed.includes(task.id)).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const canWork = !(data.isSupabaseConnected && !data.isAuthenticated)
    && (status === 'available' || status === 'in_progress');
  const pathNodes = data.nodes.filter((item) => item.path_id === node?.path_id).sort((a, b) => a.order - b.order);
  const nodeIndex = pathNodes.findIndex((item) => item.slug === slug);
  const nextNode = nodeIndex >= 0 && nodeIndex < pathNodes.length - 1 ? pathNodes[nodeIndex + 1] : null;

  const completeTask = async (task: TaskRow) => {
    if (savingId) return false;
    setSavingId(task.id);
    try {
      await data.completeTask({ task });
      const next = tasks.find((candidate, index) => index > tasks.indexOf(task) && !completed.includes(candidate.id));
      if (next) setActiveTaskId(next.id);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save your progress — try again.');
      return false;
    } finally {
      setSavingId(null);
    }
  };

  if (!data.isLoading && !node) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-on-surface">Module not found</h1>
        <p className="mt-2 text-sm text-on-surface-variant">It may have moved, or the link is incorrect.</p>
        <Button asChild className="mt-6"><Link href="/roadmap"><ArrowLeft className="size-4" /> Back to roadmap</Link></Button>
      </div>
    );
  }
  if (!node) return null;

  const activeDone = activeTask ? completed.includes(activeTask.id) : false;
  const taskStage = activeTask ? stageFor(activeTask, foundation) : 'Complete';

  const runAction = async () => {
    if (!activeTask || activeDone) {
      const next = tasks[activeIndex + 1];
      if (next) setActiveTaskId(next.id);
      return;
    }
    if (activeTask.type === 'challenge' && activeTask.challenge) return setChallengeTask(activeTask);
    if (activeTask.type === 'quiz' && activeTask.quiz) return setQuizTask(activeTask);
    if (activeTask.type === 'build' && !foundation) {
      document.getElementById('milestone-verification')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (activeTask.type === 'watch') {
      document.getElementById(`resource-${activeResource?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    await completeTask(activeTask);
  };

  const actionLabel = activeDone
    ? activeIndex < tasks.length - 1 ? 'Continue' : 'Review complete'
    : activeTask?.type === 'challenge' ? 'Open coding challenge'
    : activeTask?.type === 'quiz' ? 'Take checkpoint'
    : activeTask?.type === 'build' && !foundation ? 'Verify in build panel'
    : activeTask?.type === 'watch' ? 'Watch to complete'
    : activeTask?.type === 'practice' ? 'Complete practice'
    : 'Mark complete';

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-on-surface lg:h-[100dvh] lg:overflow-hidden">
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/roadmap" className="grid size-11 shrink-0 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-cyan" aria-label="Back to roadmap">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">{node.name}</p>
            <p className="truncate text-xs text-on-surface-variant">{path?.title} · Module {node.order}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button" onClick={() => setOutlineOpen((open) => !open)}
            aria-expanded={outlineOpen} aria-controls="learning-steps"
            className="flex min-h-11 items-center gap-2 rounded-xl border border-outline-variant bg-surface-card px-3 text-xs font-semibold text-on-surface-variant hover:border-cyan/40 hover:text-cyan lg:hidden"
          >
            <Menu className="size-4" /> Steps <span className="font-code tabular-nums">{doneCount}/{tasks.length}</span>
          </button>
        </div>
      </header>

      <nav aria-label="Workspace navigation" className="flex shrink-0 border-b border-outline-variant bg-surface lg:hidden">
        {[['Roadmap', '/roadmap'], ['Progress', '/dashboard'], ['Paths', '/paths'], ['Portfolio', `/u/${encodeURIComponent(data.user.username)}`]].map(([label, href]) => (
          <Link key={href} href={href} className="flex min-h-11 flex-1 items-center justify-center px-2 text-xs font-medium text-on-surface-variant hover:text-cyan">{label}</Link>
        ))}
      </nav>

      <div className="relative flex min-h-0 flex-1 gap-0 bg-background p-0 lg:overflow-hidden lg:p-3">
        {outlineOpen && <button type="button" aria-label="Close steps" onClick={() => setOutlineOpen(false)} className="fixed inset-0 z-30 bg-background/70 lg:hidden" />}

        <aside
          id="learning-steps"
          className={cn(
            'z-40 flex w-[min(22rem,calc(100vw-1rem))] shrink-0 flex-col bg-surface transition-transform lg:static lg:z-auto lg:rounded-l-2xl lg:border lg:border-outline-variant',
            'fixed inset-y-0 left-0 shadow-[12px_0_32px_rgba(2,8,23,.28)] lg:shadow-none',
            outlineOpen ? 'translate-x-0' : '-translate-x-full lg:hidden',
          )}
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <div>
              <h2 className="font-semibold text-on-surface">Your steps</h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">Resume exactly where you stopped.</p>
            </div>
            <button type="button" onClick={() => setOutlineOpen(false)} className="grid size-10 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" aria-label="Collapse steps">
              <PanelLeftClose className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ol className="space-y-1">
              {tasks.map((task, index) => {
                const done = completed.includes(task.id);
                const active = task.id === activeTask?.id;
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => { setActiveTaskId(task.id); if (window.innerWidth < 1024) setOutlineOpen(false); }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                        active ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                      )}
                    >
                      <span className={cn(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border text-[11px] font-bold',
                        done ? 'border-secondary/40 bg-secondary/15 text-secondary' : active ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-outline-variant',
                      )}>
                        {done ? <Check className="size-3" /> : index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-code text-[11px] font-semibold uppercase tracking-[0.06em] text-cyan">{stageFor(task, foundation)}</span>
                        <span className="mt-1 block line-clamp-2 text-xs leading-5">{stepTitle(task)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {!outlineOpen && (
          <button
            type="button" onClick={() => setOutlineOpen(true)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-2 rounded-r-xl border border-l-0 border-outline-variant bg-surface px-2 py-4 text-cyan shadow-[0_8px_24px_rgba(2,8,23,.22)] lg:flex"
            aria-label="Open learning steps"
          >
            <ChevronRight className="size-4" />
            <span className="font-code text-[11px] font-bold [writing-mode:vertical-rl]">{doneCount}/{tasks.length}</span>
          </button>
        )}

        <main className={cn(
          'min-w-0 flex-1 overflow-y-auto bg-surface-container-low lg:border-y lg:border-r lg:border-outline-variant',
          outlineOpen ? 'lg:rounded-r-2xl' : 'lg:rounded-2xl lg:border-l',
        )}>
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
            <section className="flex flex-col gap-5 border-b border-outline-variant pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span>{node.est_hours} hours</span><span>·</span><span>{tasks.length} required steps</span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.025em] text-on-surface sm:text-4xl">{node.name}</h1>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">{node.description}</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <CircleDot className="size-4 text-cyan" />
                  {allDone ? 'Module complete' : `Next: ${firstPending ? stepTitle(firstPending) : 'Review your work'}`}
                </p>
              </div>
              <ProgressDial done={doneCount} total={tasks.length} />
            </section>

            {!data.isAuthenticated && data.isSupabaseConnected && (
              <Alert className="mt-6 rounded-xl"><LockKeyhole /><AlertTitle>Sign in to save progress</AlertTitle><AlertDescription>You can preview this lesson, but completion and project verification require GitHub sign-in.</AlertDescription></Alert>
            )}
            {status === 'locked' && (
              <Alert className="mt-6 rounded-xl"><LockKeyhole /><AlertTitle>This module is locked</AlertTitle><AlertDescription>Complete its prerequisites on the roadmap first. You may still preview the material.</AlertDescription></Alert>
            )}

            <section className="mt-6 overflow-hidden rounded-2xl border border-outline-variant bg-surface">
              <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="font-code text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan">{taskStage} · Step {Math.max(1, activeIndex + 1)} of {tasks.length}</p>
                  <h2 className="mt-2 text-lg font-bold text-on-surface sm:text-xl">{activeTask ? stepTitle(activeTask) : 'No required work yet'}</h2>
                  {activeTask?.duration_minutes ? <p className="mt-1 text-xs text-on-surface-variant">About {activeTask.duration_minutes} minutes</p> : null}
                </div>
                {activeDone && <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary/10 px-2.5 py-1.5 text-xs font-semibold text-secondary"><Check className="size-3.5" /> Complete</span>}
              </div>

              <div className="p-4 sm:p-6">
                {activeTask && activeResource ? (
                  <>
                    <ResourceCard resource={activeResource} lessonTask={activeTask} completed={activeDone} onCompleteLesson={(task) => { void completeTask(task); }} showCompletionAction={false} />
                    {references.length > 0 && (
                      <details className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-on-surface">Additional references · {references.length}</summary>
                        <div className="space-y-2 border-t border-outline-variant p-3">
                          {references.map((reference) => (
                            <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
                              <span className="min-w-0 truncate">{reference.name}</span><ExternalLink className="size-3.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </details>
                    )}
                  </>
                ) : activeTask?.type === 'challenge' && activeTask.challenge ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <Code2 className="size-8 text-cyan" />
                    <h3 className="mt-4 text-lg font-bold">Solidify the skill in code</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">Work in a focused editor, run the tests, and pass every case. Your lesson stays exactly where you left it.</p>
                    <Button onClick={() => setChallengeTask(activeTask)} disabled={!canWork} className="mt-5 rounded-xl"><Code2 className="size-4" /> Open coding challenge</Button>
                  </div>
                ) : activeTask?.type === 'quiz' && activeTask.quiz ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <ListChecks className="size-8 text-cyan" />
                    <h3 className="mt-4 text-lg font-bold">Prove your understanding</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">Complete the checkpoint to finish this module and unlock what follows.</p>
                    <Button onClick={() => setQuizTask(activeTask)} disabled={!canWork} className="mt-5 rounded-xl">Take checkpoint</Button>
                  </div>
                ) : activeTask?.type === 'build' && !foundation ? (
                  <div id="milestone-verification">
                    <ProjectMilestone task={activeTask} data={data} pathId={node.path_id} pathTitle={path?.title ?? ''} nodeSlug={node.slug} disabled={!canWork} />
                  </div>
                ) : activeTask ? (
                  <div className="rounded-xl bg-surface-container-low p-5 sm:p-6">
                    <p className="max-w-3xl text-sm leading-7 text-on-surface">{activeTask.description}</p>
                    {!activeDone && <Button onClick={() => { void completeTask(activeTask); }} disabled={!canWork || Boolean(savingId)} className="mt-5 rounded-xl">{savingId ? <Spinner /> : <Check className="size-4" />} Complete this step</Button>}
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-on-surface-variant">No required work has been added yet.</p>
                )}
              </div>
            </section>

            {allDone && nextNode && (
              <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-secondary/30 bg-secondary/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-bold text-on-surface">{node.name} complete</h2><p className="mt-1 text-sm text-on-surface-variant">Your next module is {nextNode.name}.</p></div>
                <Button asChild className="rounded-xl"><Link href={`/roadmap/${nextNode.slug}`}>Continue to {nextNode.name}<ArrowRight className="size-4" /></Link></Button>
              </section>
            )}
          </div>
        </main>
      </div>

      <footer className="z-20 flex shrink-0 items-center gap-3 border-t border-outline-variant bg-surface px-3 py-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-3">
        <Button variant="outline" size="icon" className="shrink-0 rounded-xl" disabled={activeIndex <= 0} onClick={() => setActiveTaskId(tasks[activeIndex - 1]?.id ?? null)} aria-label="Previous step"><ChevronLeft className="size-4" /></Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-on-surface">{activeTask ? stepTitle(activeTask) : 'Module complete'}</p>
          <p className="mt-0.5 font-code text-[11px] text-on-surface-variant">{taskStage} · {doneCount}/{tasks.length} complete</p>
        </div>
        {allDone && nextNode ? (
          <Button asChild className="shrink-0 rounded-xl"><Link href={`/roadmap/${nextNode.slug}`}>Next module <ArrowRight className="size-4" /></Link></Button>
        ) : (
          <Button onClick={data.isSupabaseConnected && !data.isAuthenticated ? data.signInWithGithub : runAction} disabled={status === 'locked' || Boolean(savingId) || !activeTask} className="shrink-0 rounded-xl">
            {savingId ? <Spinner /> : null}<span>{data.isSupabaseConnected && !data.isAuthenticated ? 'Sign in to continue' : actionLabel}</span><ArrowRight className="size-4" />
          </Button>
        )}
      </footer>

      {quizTask?.quiz && <QuizWorkspace quiz={quizTask.quiz} disabled={!canWork} onClose={() => setQuizTask(null)} onPass={async () => { if (await completeTask(quizTask)) setQuizTask(null); }} />}
      {challengeTask?.challenge && <ChallengeBlock challenge={challengeTask.challenge} disabled={!canWork} onClose={() => setChallengeTask(null)} onPass={async () => { if (await completeTask(challengeTask)) setChallengeTask(null); }} />}
    </div>
  );
}
