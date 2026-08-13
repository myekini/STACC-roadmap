'use client';

/** Full-screen checkpoint workspace: a short set of harder, interview-style questions per node. */
import { useState } from 'react';
import { Check, CircleHelp, TerminalSquare, X } from 'lucide-react';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';
import type { QuizPayload } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function QuizWorkspace({
  quiz,
  onPass,
  onClose,
  disabled,
}: {
  quiz: QuizPayload;
  onPass: () => Promise<void>;
  onClose: () => void;
  disabled: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const answered = picked !== null;
  const correct = picked === question.correctIndex;
  const isLast = index === total - 1;
  const consoleState = saving ? 'saving' : answered ? (correct ? 'correct' : 'try again') : 'answering';

  const handlePick = (i: number) => {
    if (answered || disabled) return;
    setPicked(i);
  };

  const handleNext = async () => {
    if (!isLast) {
      setIndex((v) => v + 1);
      setPicked(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onPass();
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Could not save your completion.');
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="fixed inset-0 left-0 top-0 z-[80] flex min-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-background p-0 text-on-background shadow-none duration-0 sm:rounded-none [&>button]:hidden" onEscapeKeyDown={(event) => saving && event.preventDefault()}>
        <header className="flex min-h-[calc(3.75rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 border-b border-outline-variant bg-navy px-3 pt-[env(safe-area-inset-top)] sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-secondary/35 bg-secondary/10 text-secondary">
            <CircleHelp className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold text-on-surface">Checkpoint</DialogTitle>
            <p className="truncate font-code text-[10px] text-on-surface-variant">Question {index + 1} of {total} · answer correctly to advance</p>
          </div>
          <span className={cn('hidden items-center gap-1.5 font-code text-[10px] font-semibold uppercase sm:flex', consoleState === 'correct' ? 'text-secondary' : consoleState === 'try again' ? 'text-error' : 'text-on-surface-variant')}>
            <span className={cn('h-1.5 w-1.5', saving ? 'animate-pulse bg-tertiary' : correct && answered ? 'bg-secondary' : answered ? 'bg-error' : 'bg-outline')} />
            {consoleState}
          </span>
          <Button type="button" variant="ghost" size="icon" disabled={saving} onClick={onClose} aria-label="Close checkpoint" className="h-11 w-11 text-on-surface-variant hover:text-on-surface">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex shrink-0 items-center gap-1.5 border-b border-outline-variant bg-surface px-4 py-2.5 sm:px-6">
          {quiz.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < index ? 'bg-secondary' : i === index ? 'bg-cyan' : 'bg-outline-variant',
              )}
            />
          ))}
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#0d1117] px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="flex items-center gap-2 font-code text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary">
              <TerminalSquare className="h-4 w-4" /> {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <h1 className="mt-4 text-balance font-display text-xl font-bold leading-snug text-[#e0e3e5] sm:text-2xl">{question.question}</h1>

            <div className="mt-6 space-y-2.5">
              {question.options.map((option, i) => {
                const isCorrect = i === question.correctIndex;
                const isPicked = i === picked;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered || disabled}
                    onClick={() => handlePick(i)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors',
                      !answered && 'border-[#2a3547] bg-[#101b2c] text-[#e0e3e5] hover:border-cyan/50 hover:bg-cyan/5',
                      answered && isCorrect && 'border-secondary bg-secondary/10 text-secondary',
                      answered && isPicked && !isCorrect && 'border-error bg-error/10 text-error',
                      answered && !isPicked && !isCorrect && 'border-[#2a3547] text-[#8395ac] opacity-60',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-code text-[10px] font-bold text-[#8395ac]">{String.fromCharCode(65 + i)}</span>
                      {option}
                    </span>
                    {answered && isCorrect && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={cn('mt-5 border-l-2 pl-4 font-code text-xs leading-6 text-[#8395ac]', correct ? 'border-secondary' : 'border-error')}>
                {correct ? question.explanation : 'Not quite — think it through and try again.'}
                {!correct && (
                  <Button size="sm" variant="ghost" className="ml-2 h-auto min-h-0 px-2 py-1 text-[#e0e3e5]" onClick={() => setPicked(null)}>
                    retry
                  </Button>
                )}
              </div>
            )}
            {error && <p role="alert" className="mt-4 font-code text-xs leading-5 text-error">{error}</p>}
          </div>
        </main>

        <footer className="flex shrink-0 items-center gap-2 border-t border-outline-variant bg-surface px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-5">
          <div className="flex-1" />
          <Button type="button" disabled={!answered || !correct || disabled || saving} onClick={handleNext} className="h-11 min-w-40 bg-primary px-5 text-on-primary">
            {saving ? <AnimatedStaccMark className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : isLast ? 'Finish checkpoint' : 'Next question'}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
