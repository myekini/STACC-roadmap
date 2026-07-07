import Link from 'next/link';
import { ArrowRight, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background text-on-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />
      <div className="relative max-w-md border border-outline-variant bg-surface/80 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-outline-variant bg-surface-container-low text-outline">
          <Route className="h-5 w-5" />
        </div>
        <p className="micro-label mt-5 text-outline">{'// 404 — node not found'}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">This module doesn&apos;t exist.</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">The page you&apos;re looking for isn&apos;t on the tree. Head back to the rail and keep moving.</p>
        <Button asChild className="mt-6"><Link href="/roadmap">Back to roadmap <ArrowRight /></Link></Button>
      </div>
    </main>
  );
}
