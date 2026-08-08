'use client';

/** In-browser Python kata: Monaco editor + Pyodide, run against hidden asserts. */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, Loader2, Play, TerminalSquare, X } from 'lucide-react';
import type { ChallengePayload } from '@/lib/database.types';
import { usePyodide } from '@/hooks/usePyodide';
import { Button } from '@/components/ui/button';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center border border-outline-variant bg-surface-container-low font-code text-[11px] text-outline">
      loading editor…
    </div>
  ),
});

export function ChallengeBlock({ challenge, onPass, disabled }: { challenge: ChallengePayload; onPass: () => void; disabled: boolean }) {
  const [code, setCode] = useState(challenge.starterCode);
  const [result, setResult] = useState<{ passed: boolean; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { run } = usePyodide();

  const handleRun = async () => {
    setBusy(true);
    setResult(null);
    const outcome = await run(code, challenge.testCode);
    setBusy(false);
    if (outcome.passed) {
      setResult({ passed: true });
      onPass();
    } else {
      setResult({ passed: false, error: outcome.error });
    }
  };

  return (
    <div className="mt-3 border border-outline-variant bg-surface-container-low p-4">
      <p className="flex items-center gap-2 font-code text-[10px] font-semibold uppercase tracking-[0.14em] text-tertiary">
        <TerminalSquare className="h-3.5 w-3.5" /> challenge
      </p>
      <p className="mt-2 text-sm leading-6 text-on-surface">{challenge.prompt}</p>

      <div className="mt-3 overflow-hidden border border-outline-variant">
        <Editor
          height="220px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'var(--font-geist-mono), monospace',
            scrollBeyondLastLine: false,
            readOnly: disabled || busy,
            tabSize: 4,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button size="sm" disabled={disabled || busy} onClick={handleRun}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {busy ? 'running…' : 'run tests ▸'}
        </Button>
        {result?.passed && (
          <span className="flex items-center gap-1.5 font-code text-[11px] font-semibold text-secondary">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> all tests passed
          </span>
        )}
      </div>

      {result && !result.passed && (
        <div className="mt-3 border-l-2 border-error bg-error/5 p-3">
          <p className="flex items-center gap-1.5 font-code text-[10px] font-semibold uppercase tracking-[0.12em] text-error">
            <X className="h-3 w-3" /> not yet
          </p>
          <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap font-code text-[10px] leading-5 text-on-surface-variant">{result.error}</pre>
        </div>
      )}

      <p className="mt-3 font-code text-[9px] text-outline">
        {'// runs a real Python interpreter in your browser — first run loads it (~10-15s), reruns are instant'}
      </p>
    </div>
  );
}
