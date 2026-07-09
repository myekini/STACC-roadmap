'use client';

/**
 * Node learning workspace: slide-in sheet with tasks (incl. inline checkpoint
 * quiz) and curated resources with community ratings. Completing the last
 * task fires the celebration and unlocks the next module.
 */
import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, CircleHelp, Hourglass, LogIn, Play, Rocket } from 'lucide-react';
import type { QuizPayload, TaskRow } from '@/lib/database.types';
import type { UserData } from '@/hooks/useUserData';
import { useUiStore } from '@/store/useUiStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Stars, StatusChip, TaskTypeBadge } from './bits';
import { cn } from '@/lib/utils';

function QuizBlock({ quiz, onPass, disabled }: { quiz: QuizPayload; onPass: () => void; disabled: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.correctIndex;

  return (
    <div className="mt-3 border border-outline-variant bg-surface-container-low p-4">
      <p className="flex items-center gap-2 font-code text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
        <CircleHelp className="h-3.5 w-3.5" /> checkpoint
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-on-surface">{quiz.question}</p>
      <div className="mt-3 space-y-2">
        {quiz.options.map((option, i) => {
          const isCorrect = i === quiz.correctIndex;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              type="button"
              disabled={answered || disabled}
              onClick={() => {
                setPicked(i);
                if (i === quiz.correctIndex) onPass();
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 border px-3 py-2.5 text-left text-xs transition-colors',
                !answered && 'border-outline-variant hover:border-cyan/40 hover:bg-cyan/5',
                answered && isCorrect && 'border-secondary bg-secondary/10 text-secondary',
                answered && isPicked && !isCorrect && 'border-error bg-error/10 text-error',
                answered && !isPicked && !isCorrect && 'border-outline-variant opacity-50',
              )}
            >
              <span className="flex items-center gap-2.5">
                <span className="font-code text-[10px] font-bold text-outline">{String.fromCharCode(65 + i)}</span>
                {option}
              </span>
              {answered && isCorrect && <Check className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={cn('mt-3 border-l-2 pl-3 text-xs leading-5', correct ? 'border-secondary text-on-surface-variant' : 'border-error text-on-surface-variant')}>
          {correct ? quiz.explanation : 'Not quite — think it through and try again.'}
          {!correct && (
            <Button size="sm" variant="ghost" className="ml-2 h-auto min-h-0 px-2 py-1" onClick={() => setPicked(null)}>
              retry
            </Button>
          )}
        </p>
      )}
    </div>
  );
}

/** Build tasks ship evidence: a public URL that becomes part of the member's portfolio. */
function ShipForm({ onShip, disabled }: { onShip: (url: string) => Promise<void>; disabled: boolean }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = /^https?:\/\/\S+\.\S+/i.test(url.trim());

  return (
    <div className="mt-1 border border-primary/25 bg-primary/[0.04] p-3">
      <p className="flex items-center gap-2 font-code text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-neon">
        <Rocket className="h-3.5 w-3.5" /> ship it
      </p>
      <p className="mt-1 text-[11px] leading-5 text-on-surface-variant">
        Paste a public link to what you built — GitHub repo, live app, or writeup. It goes on your public profile.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled || busy}
          placeholder="https://github.com/you/project"
          className="h-9 min-w-0 flex-1 border border-outline-variant bg-surface px-2.5 font-code text-[11px] text-on-surface placeholder:text-outline focus:border-cyan/50 focus:outline-none"
        />
        <Button
          size="sm"
          disabled={disabled || busy || !valid}
          onClick={async () => {
            setBusy(true);
            try {
              await onShip(url.trim());
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'shipping…' : 'ship ▸'}
        </Button>
      </div>
    </div>
  );
}

function TaskRowItem({ task, data, canWork, onComplete }: { task: TaskRow; data: UserData; canWork: boolean; onComplete: (task: TaskRow, evidenceUrl?: string) => Promise<void> }) {
  const done = data.progress.completedTasks.includes(task.id);
  const [quizOpen, setQuizOpen] = useState(false);
  const isQuiz = task.type === 'quiz' && task.quiz;
  const isBuild = task.type === 'build';
  const evidence = data.progress.evidence[task.id];

  return (
    <li className={cn('border border-outline-variant/70 bg-surface/60 transition-colors', done && 'border-secondary/30')}>
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          disabled={done || !canWork || Boolean(isQuiz) || isBuild}
          onClick={() => (isQuiz || isBuild ? undefined : onComplete(task))}
          aria-label={done ? 'Task complete' : `Mark "${task.description}" complete`}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center border transition-colors',
            done ? 'border-secondary bg-secondary text-on-secondary' : canWork && !isQuiz && !isBuild ? 'border-outline hover:border-cyan hover:bg-cyan/10' : 'border-outline-variant',
          )}
        >
          {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
        <TaskTypeBadge type={task.type} />
        <span className={cn('flex-1 text-xs leading-5', done ? 'text-on-surface-variant line-through decoration-secondary/50' : 'text-on-surface')}>
          {task.description}
        </span>
        {isQuiz && !done && (
          <Button size="sm" variant="outline" disabled={!canWork} onClick={() => setQuizOpen((v) => !v)}>
            {quizOpen ? 'hide' : 'take quiz'}
          </Button>
        )}
      </div>
      {isQuiz && quizOpen && !done && task.quiz && (
        <div className="px-3 pb-3">
          <QuizBlock quiz={task.quiz} disabled={!canWork} onPass={() => onComplete(task)} />
        </div>
      )}
      {isBuild && !done && canWork && (
        <div className="px-3 pb-3">
          <ShipForm disabled={!canWork} onShip={(url) => onComplete(task, url)} />
        </div>
      )}
      {isBuild && done && evidence && (
        <div className="px-3 pb-3">
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

export default function NodeSheet({ data }: { data: UserData }) {
  const { activeNodeId, setActiveNodeId } = useUiStore();
  const reduceMotion = useReducedMotion();
  const [justCompleted, setJustCompleted] = useState(false);

  const node = data.nodes.find((n) => n.id === activeNodeId) ?? null;
  const status = node ? data.nodeStatus(node.id) : 'locked';
  const path = node ? data.paths.find((p) => p.id === node.path_id) : null;
  const tasks = useMemo(() => data.tasks.filter((t) => t.node_id === node?.id), [data.tasks, node?.id]);
  const resources = useMemo(() => data.resources.filter((r) => r.node_id === node?.id), [data.resources, node?.id]);
  const doneCount = tasks.filter((t) => data.progress.completedTasks.includes(t.id)).length;
  const needsAuth = data.isSupabaseConnected && !data.isAuthenticated;
  const canWork = !needsAuth && (status === 'in_progress' || status === 'available');

  useEffect(() => setJustCompleted(false), [activeNodeId]);

  const handleComplete = async (task: TaskRow, evidenceUrl?: string) => {
    if (node && status === 'available') await data.startNode(node);
    const result = await data.completeTask({ task, evidenceUrl });
    if (result === 'complete') {
      setJustCompleted(true);
      if (!reduceMotion) {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors: ['#00d9ff', '#d9622e', '#10b981', '#e0e3e5'] });
      }
    }
  };

  if (!node) return null;

  return (
    <Sheet open={!!activeNodeId} onOpenChange={(open) => !open && setActiveNodeId(null)}>
      <SheetContent className="overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="border-b border-outline-variant bg-navy/60 p-6 pb-5">
          <p className="micro-label text-cyan">{`// module ${String(node.order).padStart(2, '0')} · ${path?.title ?? ''}`}</p>
          <div className="mt-2 flex items-start justify-between gap-3 pr-10">
            <SheetTitle className="font-display text-2xl font-bold leading-tight">{node.name}</SheetTitle>
          </div>
          <p className="mt-1 font-code text-[11px] lowercase text-on-surface-variant">{`// ${node.subtitle}`}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusChip status={status} />
            <span className="inline-flex items-center gap-1.5 border border-outline-variant px-2 py-0.5 font-code text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
              <Hourglass className="h-3 w-3" />{node.est_hours}h est
            </span>
          </div>
        </div>

        <div className="space-y-7 p-6">
          {/* Completion banner */}
          {(justCompleted || status === 'complete') && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-secondary/40 bg-secondary/10 p-4"
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
              <Button size="sm" className="mt-3" onClick={data.signInWithDiscord}><LogIn />Sign in with Discord</Button>
            </div>
          )}

          <p className="text-sm leading-6 text-on-surface-variant">{node.description}</p>

          {node.skills.length > 0 && (
            <div>
              <p className="micro-label text-outline">skills covered</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {node.skills.map((skill) => (
                  <span key={skill} className="border border-outline-variant bg-surface-container-low px-2 py-0.5 font-code text-[10px] text-on-surface-variant">
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

          {/* Start CTA */}
          {status === 'available' && !needsAuth && (
            <Button className="w-full" size="lg" onClick={() => node && data.startNode(node)}>
              <Play /> start module
            </Button>
          )}

          {/* Tasks */}
          {!needsAuth && tasks.length > 0 && status !== 'locked' && (
            <section>
              <div className="flex items-center justify-between">
                <p className="micro-label text-outline">tasks</p>
                <span className="font-code text-[10px] font-semibold text-on-surface-variant">{doneCount}/{tasks.length}</span>
              </div>
              <div className="mt-1 h-1 w-full bg-surface-container-high">
                <div className="h-full bg-cyan transition-all duration-500" style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
              </div>
              <ul className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <TaskRowItem key={task.id} task={task} data={data} canWork={canWork} onComplete={handleComplete} />
                ))}
              </ul>
            </section>
          )}

          {/* Resources */}
          {!needsAuth && resources.length > 0 && status !== 'locked' && (
            <section>
              <p className="micro-label text-outline">curated resources</p>
              <ul className="mt-3 space-y-2">
                {resources.map((resource) => {
                  const myRating = data.progress.ratings[resource.id] ?? 0;
                  return (
                    <li key={resource.id} className="border border-outline-variant/70 bg-surface/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <a href={resource.url} target="_blank" rel="noreferrer" className="group min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-on-surface group-hover:text-cyan">
                            <span className="truncate">{resource.name}</span>
                            <ArrowUpRight className="h-3 w-3 shrink-0 text-outline group-hover:text-cyan" />
                          </p>
                          <p className="mt-0.5 font-code text-[10px] lowercase text-on-surface-variant">
                            {`// ${resource.type} · ${resource.platform}`}{resource.cost === 'free' ? ' · free' : ' · paid'}
                          </p>
                        </a>
                        <div className="shrink-0 text-right">
                          <Stars value={resource.avg_rating} />
                          <p className="mt-0.5 font-code text-[9px] text-outline">
                            {resource.rating_count > 0 ? `${resource.avg_rating.toFixed(1)} (${resource.rating_count})` : 'unrated'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 border-t border-outline-variant/50 pt-2">
                        <span className="font-code text-[9px] uppercase tracking-[0.12em] text-outline">rate it</span>
                        <Stars value={myRating} onRate={(rating) => data.rateResource({ resourceId: resource.id, rating })} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
