'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled render error:', error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background text-on-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />
      <div className="relative max-w-md border border-outline-variant bg-surface/80 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-error/40 bg-error/10 text-error">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="micro-label mt-5 text-outline">{'// something broke'}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">This page hit an error.</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Nothing was lost — your progress is saved server-side. Try again, or head back to the roadmap.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" /> Try again
          </Button>
          <Button asChild>
            <Link href="/roadmap">Back to roadmap <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
