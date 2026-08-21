import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { NODES, PATHS, PAUSED_PATH_IDS } from '@/config/roadmap';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { StaccMark } from '@/components/brand/StaccMark';
import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/seo';

/**
 * Public, server-rendered skill tree (spec §1.9): structure only — module
 * names, order, and hours. Resources, tasks, and progress live behind auth.
 * This page exists for SEO and conversion; it is statically generated.
 */
export const metadata: Metadata = {
  title: 'The Data Career Skill Tree',
  description:
    'The full Stacc roadmap: Foundations, Data Engineering, Data Analysis, Data Science, AI Engineering, and MLOps — every module in learning order, free.',
  alternates: { canonical: '/tree' },
};

export default function PublicTreePage() {
  const publicPaths = PATHS.filter((path) => !PAUSED_PATH_IDS.has(path.id));
  const publicPathIds = new Set(publicPaths.map((path) => path.id));
  const publicNodes = NODES.filter((node) => publicPathIds.has(node.path_id));
  const totalHours = publicNodes.reduce((sum, node) => sum + node.est_hours, 0);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Stacc data career learning roadmaps',
    description: 'Free, prerequisite-ordered learning roadmaps for data careers.',
    itemListElement: publicPaths.map((path, index) => ({
      '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/learn/${path.id}`), name: `${path.title} Learning Roadmap`,
    })),
  };

  return (
    <main className="relative min-h-screen bg-background text-on-background">
      <JsonLd data={structuredData} />
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <header className="mb-12">
          <Link href="/" className="mb-10 inline-flex items-center gap-3">
            <StaccMark className="h-9 w-9" />
            <span className="font-code text-lg font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</span>
          </Link>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
            Every module. In order. Free.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
            {publicNodes.length} modules across {publicPaths.length - 1} specialization paths, roughly {totalHours} hours of curated,
            free material. Sign in to open the resources, work the tasks, and track your progress.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Start tracking your progress <ArrowRight /></Link>
          </Button>
        </header>

        <div className="space-y-10">
          {publicPaths.map((path) => {
            const pathNodes = NODES.filter((n) => n.path_id === path.id);
            const gated = path.requires_paths.length > 0;
            const gateTitles = path.requires_paths
              .map((id) => PATHS.find((p) => p.id === id)?.title)
              .filter(Boolean)
              .join(' + ');
            return (
              <section key={path.id} aria-labelledby={`path-${path.id}`}>
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-outline-variant pb-3">
                  <div>
                    <h2 id={`path-${path.id}`} className="font-display text-xl font-bold uppercase tracking-wide text-on-surface">
                      <Link href={`/learn/${path.id}`} className="flex items-center gap-2.5 hover:text-cyan">
                        <AppIcon name={path.icon} className="h-5 w-5 text-cyan" />
                        {path.title}
                      </Link>
                    </h2>
                  </div>
                  {gated && (
                    <span className="inline-flex items-center gap-1.5 border border-outline-variant bg-surface-container-low px-2 py-1 font-code text-xs uppercase tracking-[0.08em] text-outline">
                      <Lock className="h-3 w-3" /> unlocks after {gateTitles}
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">{path.description}</p>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {pathNodes.map((node, i) => (
                    <li key={node.id} className="flex items-center gap-3 border border-outline-variant/70 bg-surface/70 px-3.5 py-2.5">
                      <span className="font-code text-[11px] font-bold text-outline">{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-on-surface">{node.name}</h3>
                        <p className="truncate text-xs text-on-surface-variant">{node.subtitle}</p>
                      </div>
                      <span className="shrink-0 font-code text-xs text-outline">{node.est_hours}h</span>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        <footer className="mt-14 border border-cyan/25 bg-cyan/[0.05] p-6 text-center">
          <p className="font-display text-lg font-bold text-on-surface">Reading the map is free. So is walking it.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
            Sign in to unlock curated resources and tasks for every module, and pick up exactly where you left off.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">Open the roadmap <ArrowRight /></Link>
          </Button>
        </footer>
      </div>
    </main>
  );
}
