'use client';

/** Focused in-browser kata workspace: Monaco + Pyodide (Python) or sql.js (SQL). */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { BeforeMount } from '@monaco-editor/react';
import { Check, Code2, FileCode2, Play, RotateCcw, TerminalSquare, X } from 'lucide-react';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';
import type { ChallengePayload } from '@/lib/database.types';
import { usePyodide } from '@/hooks/usePyodide';
import { useSqlJs } from '@/hooks/useSqlJs';
import { useUiStore } from '@/store/useUiStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center gap-3 bg-background font-code text-xs text-on-surface-variant">
      <AnimatedStaccMark className="h-8 w-8" />
      preparing editor
    </div>
  ),
});

/** Mirrors the `--surface`/`--fg` design tokens (globals.css) into Monaco's own theme API,
 * which only accepts literal hex — CSS custom properties can't reach it. Keep these two pairs
 * in sync with globals.css if those tokens ever change. */
const defineStaccMonacoThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('stacc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#0d1117', 'editor.foreground': '#e0e3e5' },
  });
  monaco.editor.defineTheme('stacc-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#f8fafc', 'editor.foreground': '#0f172a' },
  });
};

type WorkspaceTab = 'problem' | 'code' | 'results';
type RunResult = { passed: boolean; error?: string } | null;

const RUNTIME_LABEL: Record<ChallengePayload['language'], string> = {
  python: 'Python 3 · first run loads the browser runtime, then reruns are instant',
  sql: 'SQLite · first run loads the browser runtime, then reruns are instant',
};

const FILE_LABEL: Record<ChallengePayload['language'], string> = {
  python: 'solution.py',
  sql: 'query.sql',
};

export function ChallengeBlock({
  challenge,
  onPass,
  onClose,
  disabled,
}: {
  challenge: ChallengePayload;
  onPass: () => Promise<void>;
  onClose: () => void;
  disabled: boolean;
}) {
  const [code, setCode] = useState(challenge.starterCode);
  const [result, setResult] = useState<RunResult>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>('problem');
  const { run: runPython } = usePyodide();
  const { run: runSql } = useSqlJs();
  const { theme } = useUiStore();

  const handleRun = async () => {
    setBusy(true);
    setResult(null);
    setTab('results');
    const outcome = challenge.language === 'sql' ? await runSql(challenge, code) : await runPython(code, challenge.testCode);
    setBusy(false);
    if (outcome.passed) {
      setResult({ passed: true });
      setSaving(true);
      try {
        await onPass();
        setSaving(false);
        onClose();
      } catch (error) {
        setSaving(false);
        setResult({
          passed: false,
          error: `Your code passed, but Stacc could not save the completion. Check your connection and run the tests again.\n\n${error instanceof Error ? error.message : String(error)}`,
        });
      }
    } else {
      setResult({ passed: false, error: outcome.error });
    }
  };

  const handleReset = () => {
    setCode(challenge.starterCode);
    setResult(null);
    setTab('code');
  };

  const consoleState = busy ? 'running' : saving ? 'saving' : result?.passed ? 'passed' : result ? 'failed' : 'ready';

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && !saving && onClose()}>
    <DialogContent className="fixed inset-0 left-0 top-0 z-[80] flex min-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-background p-0 text-on-background shadow-none duration-0 sm:rounded-none [&>button]:hidden" onEscapeKeyDown={(event) => (busy || saving) && event.preventDefault()}>
      <header className="flex min-h-[calc(3.75rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 border-b border-outline-variant bg-navy px-3 pt-[env(safe-area-inset-top)] sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyan/35 bg-cyan/10 text-cyan">
          <Code2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="truncate text-sm font-semibold text-on-surface">Challenge workspace</DialogTitle>
          <p className="truncate font-code text-[10px] text-on-surface-variant">{RUNTIME_LABEL[challenge.language]}</p>
        </div>
        <span className={cn('hidden items-center gap-1.5 font-code text-[10px] font-semibold uppercase sm:flex', consoleState === 'passed' ? 'text-secondary' : consoleState === 'failed' ? 'text-error' : 'text-on-surface-variant')}>
          <span className={cn('h-1.5 w-1.5', busy ? 'animate-pulse bg-tertiary' : result?.passed ? 'bg-secondary' : result ? 'bg-error' : 'bg-outline')} />
          {consoleState}
        </span>
        <Button type="button" variant="ghost" size="icon" disabled={busy || saving} onClick={onClose} aria-label="Close challenge" className="h-11 w-11 text-on-surface-variant hover:text-on-surface">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <nav className="grid shrink-0 grid-cols-3 border-b border-outline-variant bg-surface lg:hidden" aria-label="Challenge workspace views">
        {(['problem', 'code', 'results'] as WorkspaceTab[]).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
            className={cn('min-h-12 border-r border-outline-variant px-2 font-code text-[10px] font-semibold uppercase last:border-r-0', tab === item ? 'bg-cyan/10 text-cyan' : 'text-on-surface-variant')}
          >
            {item}
          </button>
        ))}
      </nav>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(300px,36%)_minmax(0,1fr)]">
        <section className={cn('min-h-0 overflow-y-auto border-r border-outline-variant bg-surface p-5 sm:p-7 lg:block', tab !== 'problem' && 'hidden')}>
          <p className="flex items-center gap-2 font-code text-[10px] font-semibold uppercase tracking-[0.12em] text-tertiary">
            <TerminalSquare className="h-4 w-4" /> Problem
          </p>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-on-surface">Make the tests pass</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{challenge.prompt}</p>

          <div className="mt-8 border-t border-outline-variant pt-5">
            <p className="font-code text-[10px] font-semibold uppercase text-outline">How this works</p>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-on-surface-variant">
              <li className="flex gap-3"><span className="font-code text-cyan">01</span><span>Write your solution in the editor.</span></li>
              <li className="flex gap-3"><span className="font-code text-cyan">02</span><span>Run the tests whenever you need feedback.</span></li>
              <li className="flex gap-3"><span className="font-code text-cyan">03</span><span>Passing all checks completes this task automatically.</span></li>
            </ol>
          </div>

          <div className="mt-8 border border-outline-variant bg-surface-container-low p-4">
            <p className="font-code text-[10px] font-semibold uppercase text-outline">Environment</p>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">Everything runs privately in this browser. Your code is not sent to a Stacc server.</p>
          </div>
        </section>

        <section className={cn('min-h-0 flex-col bg-background', tab === 'code' ? 'flex' : 'hidden lg:flex')}>
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-4">
            <span className="flex items-center gap-2 font-code text-[11px] text-on-surface"><FileCode2 className="h-3.5 w-3.5 text-cyan" />{FILE_LABEL[challenge.language]}</span>
            <span className="font-code text-[9px] uppercase text-on-surface-variant">{challenge.language}</span>
          </div>
          <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            defaultLanguage={challenge.language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
            theme={theme === 'dark' ? 'stacc-dark' : 'stacc-light'}
            beforeMount={defineStaccMonacoThemes}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'var(--font-geist-mono), monospace',
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: disabled || busy,
              tabSize: challenge.language === 'python' ? 4 : 2,
            }}
          />
          </div>
        </section>

        <section className={cn('min-h-0 overflow-y-auto bg-background p-4 text-on-surface lg:col-start-2 lg:row-start-1 lg:hidden', tab !== 'results' && 'hidden')} aria-live="polite">
          <ConsolePanel busy={busy} saving={saving} result={result} />
        </section>
      </main>

      <div className="hidden max-h-48 shrink-0 overflow-y-auto border-t border-outline-variant bg-background p-4 text-on-surface lg:block" aria-live="polite">
        <ConsolePanel busy={busy} saving={saving} result={result} />
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-outline-variant bg-surface px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-5">
        <Button type="button" variant="outline" onClick={handleReset} disabled={busy || saving} className="h-11 px-3 sm:px-4">
          <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span>
        </Button>
        <div className="flex-1" />
        <Button type="button" disabled={disabled || busy || saving || result?.passed} onClick={handleRun} className="h-11 min-w-36 bg-primary px-5 text-on-primary">
          {busy || saving ? <AnimatedStaccMark className="h-4 w-4" /> : result?.passed ? <Check className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {busy ? 'Running tests…' : saving ? 'Saving…' : result?.passed ? 'Passed' : 'Run tests'}
        </Button>
      </footer>
    </DialogContent>
    </Dialog>
  );
}

function ConsolePanel({ busy, saving, result }: { busy: boolean; saving: boolean; result: RunResult }) {
  if (busy) {
    return <p className="flex items-center gap-2 font-code text-xs text-tertiary"><AnimatedStaccMark className="h-4 w-4" />Running your solution against the test suite…</p>;
  }
  if (saving) {
    return <p className="flex items-center gap-2 font-code text-xs text-secondary"><AnimatedStaccMark className="h-4 w-4" />All tests passed. Saving your completion…</p>;
  }
  if (result?.passed) {
    return (
      <div>
        <p className="flex items-center gap-2 font-code text-xs font-semibold text-secondary"><Check className="h-4 w-4" />All tests passed</p>
        <p className="mt-2 font-code text-[11px] leading-5 text-on-surface-variant">Challenge complete. Returning to your module…</p>
      </div>
    );
  }
  if (result) {
    return (
      <div>
        <p className="flex items-center gap-2 font-code text-xs font-semibold text-error"><X className="h-4 w-4" />Tests failed</p>
        <pre className="mt-2 whitespace-pre-wrap font-code text-[11px] leading-5 text-on-surface-variant">{result.error}</pre>
      </div>
    );
  }
  return (
    <p className="flex items-center gap-2 font-code text-[11px] text-on-surface-variant">
      <span className="text-cyan">$</span> run your solution to see test results here
    </p>
  );
}
