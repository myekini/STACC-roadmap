'use client';

/**
 * Node workspace: full-bleed page (not a sheet) for reading/watching resources
 * and working tasks — this is where members spend real time, not a quick peek.
 * Content is the primary column; a concise completion checklist sits alongside it.
 * Video tasks are only called "watch" when the node has a real video resource.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, BookOpen, Check, ExternalLink, GitBranch, Hourglass, ListChecks, Loader2, Play, Rocket } from 'lucide-react';
import type { TaskRow } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { getYouTubeRef, StatusChip, TaskTypeBadge, YouTubeEmbed } from './bits';
import { ChallengeBlock } from './ChallengeBlock';
import { QuizWorkspace } from './QuizWorkspace';
import { cn } from '@/lib/utils';

function ProjectMilestone({ task, data, pathId, pathTitle, nodeSlug, disabled }: { task: TaskRow; data: UserData; pathId: string; pathTitle: string; nodeSlug: string; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState<{ url: string; sha: string } | null>(null);
  const project = data.projectConnections[pathId];
  const connected = project?.connection_status === 'active' && Boolean(project.github_repo_id);

  if (!data.isSupabaseConnected) {
    return (
      <div className="border border-outline-variant bg-surface-container-low p-4">
        <p className="font-semibold text-on-surface">GitHub verification is available in the live app.</p>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">Sign in to connect one repository to this track and verify its milestone commits.</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-lg bg-background p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-on-surface"><GitBranch className="h-4 w-4" />Connect your {pathTitle} project</p>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">Choose one GitHub repository. Stacc will read commits from that repository only.</p>
        <Button asChild size="sm" className="mt-3"><a href={`/api/github/install?path=${encodeURIComponent(pathId)}&returnTo=${encodeURIComponent(`/roadmap/${nodeSlug}`)}`}><GitBranch />{project ? 'Reconnect GitHub' : 'Connect GitHub'}</a></Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-background p-4">
      <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-xs font-semibold text-cyan hover:underline"><GitBranch className="h-4 w-4 shrink-0" /><span className="truncate">{project.repo_owner}/{project.repo_name}</span><ExternalLink className="h-3 w-3 shrink-0" /></a>
      {task.project_requirements?.requiredPaths?.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-on-surface">Required files</p>
          <ul className="mt-1 space-y-1 font-code text-[10px] text-on-surface-variant">{task.project_requirements.requiredPaths.map((path) => <li key={path}>{path}</li>)}</ul>
        </div>
      ) : <p className="mt-2 text-xs leading-5 text-on-surface-variant">Push a new commit for this milestone, then let Stacc verify it.</p>}
      {task.project_requirements?.manualReview?.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-on-surface">Before you push</p>
          <ul className="mt-1 space-y-1 text-xs leading-5 text-on-surface-variant">{task.project_requirements.manualReview.map((item) => <li key={item}>• {item}</li>)}</ul>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={disabled || busy || Boolean(verified)}
          onClick={async () => {
            setBusy(true);
            setErrorMsg(null);
            try {
              const response = await fetch('/api/github/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: task.id }) });
              const result = await response.json() as { error?: string; commitUrl?: string; commitSha?: string };
              if (!response.ok || !result.commitUrl || !result.commitSha) throw new Error(result.error ?? 'Could not verify the project.');
              setVerified({ url: result.commitUrl, sha: result.commitSha });
              await data.refresh();
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Could not verify the project.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 className="animate-spin" /> : verified ? <Check /> : <GitBranch />}
          {busy ? 'Checking…' : verified ? 'Verified' : 'Check my work'}
        </Button>
        {verified && <a href={verified.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-secondary hover:underline">Commit {verified.sha}</a>}
      </div>
      {errorMsg && <p role="alert" className="mt-2 text-xs leading-5 text-error">{errorMsg}</p>}
    </div>
  );
}

function TaskRowItem({
  task,
  data,
  canWork,
  watchGateOpen,
  hasVideoResource,
  pathId,
  pathTitle,
  nodeSlug,
  onComplete,
}: {
  task: TaskRow;
  data: UserData;
  canWork: boolean;
  watchGateOpen: boolean;
  hasVideoResource: boolean;
  pathId: string;
  pathTitle: string;
  nodeSlug: string;
  onComplete: (task: TaskRow, evidenceUrl?: string) => Promise<void>;
}) {
  const done = data.progress.completedTasks.includes(task.id);
  const [quizOpen, setQuizOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const isQuiz = task.type === 'quiz' && task.quiz;
  const isChallenge = task.type === 'challenge' && task.challenge;
  const isBuild = task.type === 'build';
  const isWatch = task.type === 'watch';
  const watchLocked = isWatch && !watchGateOpen;
  const needsEvidence = isBuild && pathId !== 'foundations';
  const blocked = Boolean(isQuiz) || Boolean(isChallenge) || needsEvidence || watchLocked;
  const evidence = data.progress.evidence[task.id];
  const taskLabel = isWatch && !hasVideoResource ? 'review' : task.type;
  const taskDescription = isWatch && !hasVideoResource
    ? task.description.replace(/^watch\b/i, 'Review')
    : task.description;

  return (
    <li className={cn('border-b border-outline-variant/60 py-3 last:border-b-0', done && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={done || !canWork || blocked}
          onClick={() => (blocked ? undefined : onComplete(task))}
          aria-label={done ? 'Task complete' : `Mark "${task.description}" complete`}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center border transition-colors',
            done ? 'border-secondary bg-secondary text-on-secondary' : canWork && !blocked ? 'border-outline hover:border-cyan hover:bg-cyan/10' : 'border-outline-variant',
          )}
        >
          {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <TaskTypeBadge type={task.type} label={taskLabel} />
          <p className={cn('mt-0.5 text-sm leading-5', done ? 'text-on-surface-variant line-through decoration-secondary/50' : 'text-on-surface')}>
            {taskDescription}
          </p>
        </div>
        {isQuiz && !done && (
          <Button size="sm" variant="outline" disabled={!canWork} onClick={() => setQuizOpen((v) => !v)}>
            {quizOpen ? 'hide' : 'take quiz'}
          </Button>
        )}
        {isChallenge && !done && (
          <Button size="sm" variant="outline" disabled={!canWork} onClick={() => setChallengeOpen((v) => !v)}>
            {challengeOpen ? 'hide' : 'open challenge'}
          </Button>
        )}
      </div>
      {watchLocked && !done && canWork && (
        <p className="ml-9 mt-2 text-xs text-on-surface-variant">Play a video lesson to complete this step.</p>
      )}
      {isQuiz && quizOpen && !done && task.quiz && (
        <QuizWorkspace quiz={task.quiz} disabled={!canWork} onClose={() => setQuizOpen(false)} onPass={() => onComplete(task)} />
      )}
      {isChallenge && challengeOpen && !done && task.challenge && (
        <div className="ml-9 mt-3">
          <ChallengeBlock challenge={task.challenge} disabled={!canWork} onClose={() => setChallengeOpen(false)} onPass={() => onComplete(task)} />
        </div>
      )}
      {needsEvidence && !done && canWork && (
        <div className="ml-9 mt-3">
          <ProjectMilestone task={task} data={data} pathId={pathId} pathTitle={pathTitle} nodeSlug={nodeSlug} disabled={!canWork} />
        </div>
      )}
      {needsEvidence && done && evidence && (
        <div className="ml-9 mt-3">
          <a
            href={evidence}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex max-w-full items-center gap-1.5 border border-secondary/30 bg-secondary/[0.06] px-2 py-1 font-code text-[10px] text-secondary"
          >
            <Rocket className="h-3 w-3 shrink-0" />
            <span className="truncate">{evidence.replace(/^https?:\/\//i, '')}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
          </a>
        </div>
      )}
    </li>
  );
}

export default function NodeWorkspace({ data, slug }: { data: UserData; slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [justCompleted, setJustCompleted] = useState(false);
  const [watchedAny, setWatchedAny] = useState(false);

  const node = data.nodes.find((n) => n.slug === slug) ?? null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const path = node ? data.paths.find((p) => p.id === node.path_id) : null;
  const tasks = useMemo(() => data.tasks.filter((t) => t.node_id === node?.id), [data.tasks, node?.id]);
  const resources = useMemo(() => data.resources.filter((r) => r.node_id === node?.id), [data.resources, node?.id]);
  const doneCount = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  const needsAuth = data.isSupabaseConnected && !data.isAuthenticated;
  const canWork = !needsAuth && (status === 'in_progress' || status === 'available');
  const hasVideoResource = useMemo(() => resources.some((r) => getYouTubeRef(r.url)), [resources]);
  const watchGateOpen = !hasVideoResource || watchedAny;

  useEffect(() => {
    setJustCompleted(false);
    setWatchedAny(false);
  }, [slug]);

  const handleComplete = async (task: TaskRow, evidenceUrl?: string) => {
    try {
      const result = await data.completeTask({ task, evidenceUrl });
      if (result === 'complete') {
        setJustCompleted(true);
      }
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
        <Button asChild className="mt-6"><Link href="/roadmap">Back to roadmap</Link></Button>
      </div>
    );
  }

  if (!node) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 md:pt-8">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-2 font-code text-xs text-on-surface-variant">
        <button type="button" onClick={() => router.push('/roadmap')} className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan">
          <ArrowLeft className="h-3.5 w-3.5" /> roadmap
        </button>
        {path && (
          <>
            <span className="text-outline">/</span>
            <span className="truncate">{path.title}</span>
          </>
        )}
      </div>

      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-5 max-w-3xl pb-6"
      >
        <p className="text-xs font-semibold text-cyan">Module {node.order}</p>
        <h1 className="mt-2 text-balance font-display text-3xl font-bold leading-tight text-on-surface sm:text-4xl">{node.name}</h1>
        <p className="mt-2 text-base leading-7 text-on-surface-variant">{node.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusChip status={status} />
          <span className="inline-flex items-center gap-1.5 border border-outline-variant px-2 py-0.5 font-code text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
            <Hourglass className="h-3 w-3" />{node.est_hours}h est
          </span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-10 border-t border-outline-variant pt-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content column */}
        <div className="min-w-0 space-y-9">
          {searchParams.get('githubConnected') === '1' && (
            <div className="bg-secondary/10 p-4 text-sm text-on-surface"><span className="font-semibold text-secondary">Project connected.</span> Push your milestone commit, then choose Check my work.</div>
          )}
          {searchParams.get('githubError') && (
            <div role="alert" className="bg-error/10 p-4 text-sm text-error">{searchParams.get('githubError')}</div>
          )}
          {(justCompleted || status === 'complete') && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/10 p-4"
            >
              <p className="flex items-center gap-2 font-code text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                <Check className="h-4 w-4" strokeWidth={3} /> module complete
              </p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                {justCompleted ? 'The next module on your rail is now unlocked.' : 'Completed — revisit the material anytime.'}
              </p>
            </motion.div>
          )}

          {needsAuth && (
            <div className="border border-cyan/30 bg-cyan/5 p-4">
              <p className="font-code text-xs font-semibold uppercase tracking-[0.12em] text-cyan">members only</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">Sign in to see the curated resources, work the tasks, and track your progress.</p>
              <Button size="sm" className="mt-3" onClick={data.signInWithGithub}><GitBranch />Sign in with GitHub</Button>
            </div>
          )}

          <section>
            <h2 className="text-lg font-bold text-on-surface">What you’ll learn</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant">{node.description}</p>
          </section>

          {node.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-on-surface-variant">Skills covered</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {node.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {status === 'locked' && !needsAuth && (
            <div className="border border-outline-variant bg-surface-container-low p-4">
              <p className="font-code text-xs font-semibold uppercase tracking-[0.12em] text-outline">locked</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">Complete the prerequisite modules on your rail to unlock this one.</p>
            </div>
          )}

          {!needsAuth && resources.length > 0 && status !== 'locked' && (
            <section>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan" />
                <h2 className="text-lg font-bold text-on-surface">Learning material</h2>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">Work through these in order, then complete the module checklist.</p>
              <ol className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
                {resources.map((resource) => {
                  const youtubeRef = getYouTubeRef(resource.url);

                  return (
                    <li key={resource.id} className="group py-5 first:pt-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container-low text-xs font-bold text-on-surface-variant">
                            {youtubeRef ? <Play className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-on-surface transition-colors group-hover:text-cyan">{resource.name}</h3>
                            <p className="mt-1 text-xs text-on-surface-variant">{resource.platform} · {youtubeRef ? 'Video' : resource.type}</p>
                          </div>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
                            youtubeRef ? 'text-cyan hover:bg-cyan/10' : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
                          )}
                        >
                          {youtubeRef ? 'YouTube' : 'Open material'} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      {youtubeRef && <YouTubeEmbed source={youtubeRef} title={resource.name} onPlay={() => setWatchedAny(true)} />}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        {/* Task rail */}
        {!needsAuth && status !== 'locked' && (
          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            {status === 'available' && (
              <Button className="w-full" size="lg" onClick={() => node && data.startNode(node)}>
                <Play /> start module
              </Button>
            )}

            {tasks.length > 0 && (
              <section className="rounded-xl bg-surface-container-low p-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-bold text-on-surface"><ListChecks className="h-4 w-4 text-cyan" />Module checklist</p>
                  <span className="text-xs font-semibold text-on-surface-variant">{doneCount}/{tasks.length}</span>
                </div>
                <div className="mt-2 h-1 w-full bg-surface-container-high">
                  <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
                </div>
                <ul className="mt-3">
                  {tasks.map((task) => (
                    <TaskRowItem
                      key={task.id}
                      task={task}
                      data={data}
                      canWork={canWork}
                      watchGateOpen={watchGateOpen}
                      hasVideoResource={hasVideoResource}
                      pathId={node.path_id}
                      pathTitle={path?.title ?? ''}
                      nodeSlug={node.slug}
                      onComplete={handleComplete}
                    />
                  ))}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
