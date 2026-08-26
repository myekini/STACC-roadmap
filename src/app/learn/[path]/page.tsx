import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, Hourglass, LockKeyhole } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { StaccMark } from '@/components/brand/StaccMark';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { NODES, PATHS, PAUSED_PATH_IDS } from '@/config/roadmap';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return PATHS.map((path) => ({ path: path.id }));
}

export function generateMetadata({ params }: { params: { path: string } }): Metadata {
  const path = PATHS.find((candidate) => candidate.id === params.path);
  if (!path) return { robots: { index: false, follow: false } };
  if (PAUSED_PATH_IDS.has(path.id)) return { title: `${path.title} — Coming Soon`, description: path.description, robots: { index: false, follow: true } };

  const title = `${path.title} Learning Roadmap`;
  const description = `${path.description} See every module in the free Stacc ${path.title} roadmap, in prerequisite order.`;
  const canonical = `/learn/${path.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
  };
}

export default function PublicPathPage({ params }: { params: { path: string } }) {
  const path = PATHS.find((candidate) => candidate.id === params.path);
  if (!path) notFound();

  if (PAUSED_PATH_IDS.has(path.id)) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-on-background">
        <section className="w-full max-w-2xl rounded-2xl border border-dashed border-cyan/35 bg-surface p-7 sm:p-10">
          <Link href="/tree" className="font-code text-xs text-on-surface-variant hover:text-cyan">← All roadmaps</Link>
          <div className="mt-10 flex size-12 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><Hourglass className="size-6" /></div>
          <h1 className="mt-6 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">AI Engineering is coming soon.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-on-surface-variant">Its curriculum is preserved, but we are deliberately shipping the complete data and MLOps ecosystem first. When this opens, it will build on that production foundation—not compete with it.</p>
          <Button asChild className="mt-7 rounded-xl"><Link href="/learn/mlops">Explore MLOps first <ArrowRight /></Link></Button>
        </section>
      </main>
    );
  }

  const nodes = NODES.filter((node) => node.path_id === path.id).sort((a, b) => a.order - b.order);
  const totalHours = nodes.reduce((sum, node) => sum + node.est_hours, 0);
  const prerequisiteNames = path.requires_paths
    .map((id) => PATHS.find((candidate) => candidate.id === id)?.title)
    .filter(Boolean);
  const pageUrl = absoluteUrl(`/learn/${path.id}`);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Stacc', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Career roadmaps', item: absoluteUrl('/tree') },
        { '@type': 'ListItem', position: 3, name: path.title, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `${path.title} Learning Roadmap`,
      description: path.description,
      url: pageUrl,
      isAccessibleForFree: true,
      educationalLevel: path.id === 'foundations' ? 'Beginner' : 'Intermediate',
      teaches: path.tags,
      timeRequired: `PT${totalHours}H`,
      provider: { '@type': 'Organization', name: 'Stacc', url: SITE_URL },
      hasPart: nodes.map((node, index) => ({
        '@type': 'LearningResource',
        position: index + 1,
        name: node.name,
        description: node.description,
        timeRequired: `PT${node.est_hours}H`,
        teaches: node.skills,
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-on-background">
      <JsonLd data={structuredData} />
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-code text-xs text-on-surface-variant">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-cyan"><StaccMark className="size-6" /> Stacc</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tree" className="hover:text-cyan">Roadmaps</Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface">{path.title}</span>
        </nav>

        <header className="mt-10 border-b border-outline-variant pb-8">
          <div className="flex size-12 items-center justify-center border border-cyan/40 bg-cyan/10 text-cyan">
            <AppIcon name={path.icon} className="size-6" />
          </div>
          <h1 className="mt-5 text-balance font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
            {path.title} learning roadmap
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">{path.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-code text-xs text-on-surface-variant">
            <span>{nodes.length} modules</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-cyan" /> About {totalHours} hours</span>
            <span>Free curated resources</span>
          </div>
          {prerequisiteNames.length > 0 ? (
            <p className="mt-4 inline-flex items-center gap-2 border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
              <LockKeyhole className="size-3.5 text-cyan" /> Complete {prerequisiteNames.join(' + ')} first
            </p>
          ) : null}
        </header>

        <section aria-labelledby="modules-heading" className="py-8">
          <h2 id="modules-heading" className="font-display text-xl font-bold text-on-surface">What you will learn</h2>
          <ol className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
            {nodes.map((node, index) => (
              <li key={node.id} className="grid gap-2 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                <span className="font-code text-xs font-bold text-outline">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-semibold text-on-surface">{node.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{node.description}</p>
                  <p className="mt-2 font-code text-[11px] text-outline">{node.skills.join(' · ')}</p>
                </div>
                <span className="font-code text-xs text-on-surface-variant">{node.est_hours}h</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border border-cyan/30 bg-cyan/[0.05] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">Turn this map into shipped work.</h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">Track every lesson and build one cumulative portfolio project.</p>
          </div>
          <Button asChild className="mt-5 shrink-0 sm:mt-0">
            <Link href={`/paths?track=${path.id}`}>Start this path <ArrowRight /></Link>
          </Button>
        </footer>
      </div>
    </main>
  );
}
