'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Code2,
  Compass,
  Hourglass,
  Layers,
  Menu,
  Rocket,
  Route,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaccMark } from '@/components/brand/StaccMark';
import { GithubLogo } from '@/components/icons/GithubLogo';
import { DiscordLogo } from '@/components/icons/DiscordLogo';
import { XLogo } from '@/components/icons/XLogo';
import { LinkedInLogo } from '@/components/icons/LinkedInLogo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = [
  { href: '/paths', label: 'Explore Paths' },
  { href: '/tree', label: 'Skill Tree' },
  { href: '/roadmap', label: 'Roadmap' },
];

function AuthErrorBanner() {
  const authError = useSearchParams().get('authError');
  if (!authError) return null;
  return (
    <div className="mt-4 flex items-start gap-2.5 border border-orange/40 bg-orange/10 px-4 py-3 font-code text-xs rounded-none">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
      <p className="leading-5 text-on-surface-variant">
        <span className="font-semibold text-orange">Sign-in failed —</span> {authError}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, signInWithGithub, isSupabaseConnected, hasSelectedPath, paths, nodes } = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'all' | 'foundations' | 'specializations' | 'advanced'>('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isSupabaseConnected && isAuthenticated) {
      router.push(hasSelectedPath ? '/dashboard' : '/paths');
    }
  }, [hasSelectedPath, isAuthenticated, isSupabaseConnected, router]);

  const handleStart = () => {
    router.push(hasSelectedPath ? '/dashboard' : '/paths');
  };

  const techStack = [
    'Python',
    'SQL',
    'Git & GitHub',
    'dbt',
    'PyTorch',
    'Airflow',
    'Kafka',
    'FastAPI',
    'Power BI',
  ];

  const pathFilter = (id: string) => {
    if (activeTab === 'foundations') return id === 'foundations';
    if (activeTab === 'specializations') return ['da', 'de', 'ds'].includes(id);
    if (activeTab === 'advanced') return ['ai-engineering', 'mlops'].includes(id);
    return true;
  };

  const featuredPaths = paths.filter((p) => pathFilter(p.id));

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* ── Header Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-cyan/15 bg-navy/90 px-4 pb-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))] backdrop-blur-xl md:px-8 md:py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-on-surface">
            <StaccMark className="h-7 w-7" />
            <span>Stacc</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-xs font-code font-semibold uppercase tracking-[0.1em]">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-on-surface-variant hover:text-cyan transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isSupabaseConnected && !isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={signInWithGithub}
                className="hidden gap-2 font-code text-xs rounded-none border-outline-variant bg-surface-card hover:bg-surface-container-high sm:inline-flex"
              >
                <GithubLogo className="h-4 w-4" />
                <span>Sign in</span>
              </Button>
            )}

            <Button onClick={handleStart} size="sm" className="gap-1.5 text-xs font-code uppercase font-bold tracking-wider rounded-none bg-cyan text-on-primary-fixed hover:bg-cyan/90">
              {hasSelectedPath ? 'Continue Roadmap' : 'Start Roadmap'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              title="Open menu"
              className="h-9 w-9 rounded-none border-outline-variant bg-surface text-on-surface-variant hover:text-cyan md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav drawer ── */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-64">
          <SheetTitle className="font-display text-lg font-bold uppercase tracking-wider">Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-1 font-code text-sm font-semibold uppercase tracking-wider">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-none px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-card hover:text-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isSupabaseConnected && !isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => { setMobileNavOpen(false); signInWithGithub(); }}
              className="mt-6 w-full gap-2 font-code text-xs rounded-none border-outline-variant bg-surface-card"
            >
              <GithubLogo className="h-4 w-4" />
              <span>Sign in with GitHub</span>
            </Button>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Modern Centered Hero Section ── */}
      <section className="relative overflow-hidden border-b border-outline-variant/60 py-16 md:py-28">
        <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan/[0.08] blur-[150px]" />

        <div className="relative mx-auto max-w-4xl px-5 text-center space-y-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan text-xs font-code tracking-[0.14em] uppercase px-3.5 py-1 rounded-none">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" /> Data & AI Career Engine
            </Badge>
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.02 }}
            className="font-code text-xs font-bold uppercase tracking-[0.2em] text-cyan"
          >
            {'// not learning. just shipping.'}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-display text-4xl font-bold tracking-tight text-on-surface sm:text-6xl lg:text-7xl leading-[1.08]"
          >
            Master Data & AI Engineering
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg"
          >
            A prerequisite-gated skill tree for data and AI careers — built to prove you can ship, not that you watched.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Button size="lg" onClick={handleStart} className="gap-2 shadow-xl font-code uppercase font-bold tracking-wider px-6 py-3.5 text-xs rounded-none bg-secondary text-white hover:bg-secondary/90">
              <Rocket className="h-4 w-4" />
              {hasSelectedPath ? 'Continue Your Roadmap' : 'Start Learning Free'}
            </Button>

            {isSupabaseConnected && !isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                onClick={signInWithGithub}
                className="gap-2.5 font-code text-xs font-bold tracking-wider px-6 py-3.5 rounded-none border-cyan/40 hover:border-cyan bg-surface-card"
              >
                <GithubLogo className="h-4 w-4 text-on-surface" />
                <span>Sign in with GitHub</span>
              </Button>
            ) : (
              <Button size="lg" variant="outline" asChild className="font-code uppercase text-xs font-semibold px-6 py-3.5 rounded-none border-cyan/40 hover:border-cyan">
                <Link href="/paths">
                  Explore All Tracks <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                </Link>
              </Button>
            )}
          </motion.div>

          <Suspense fallback={null}>
            <AuthErrorBanner />
          </Suspense>

          {/* Metric Pill Strip */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 font-code text-xs text-on-surface-variant border-t border-outline-variant/60 max-w-xl mx-auto"
          >
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan" /> <strong>38</strong> Skill Modules</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan" /> <strong>5</strong> Career Tracks</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-cyan" /> 100% Free Access</span>
          </motion.div>
        </div>
      </section>

      {/* ── Curriculum toolkit ── */}
      <section className="border-b border-outline-variant bg-surface-container-low/60 py-5">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto flex max-w-4xl items-start gap-3 text-left sm:items-center sm:text-center">
            <Code2 className="mt-0.5 size-4 shrink-0 text-cyan sm:mt-0" aria-hidden="true" />
            <p className="text-sm leading-6 text-on-surface-variant">
              <span className="font-semibold text-on-surface">Tools you will use:</span>{' '}
              {techStack.join(', ')}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bento Feature Grid ── */}
      <section className="border-b border-outline-variant py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Momentum, Not Video Hours
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
              No 50-hour video loops or fake badges — structured prerequisites and real deliverables instead.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Route,
                title: 'Structured Skill Tree DAG',
                desc: 'Prerequisites unlock step-by-step as you complete modules, giving you a clear, unambiguous learning sequence.',
              },
              {
                icon: Rocket,
                title: 'Proof-Driven Portfolio',
                desc: 'Tasks require submitting real GitHub repositories, deployed web apps, and system writeups to verify your skills.',
              },
              {
                icon: Compass,
                title: 'Zero-Fluff Curriculum',
                desc: 'One canonical visual map connecting official documentation, battle-tested tutorials, and core architectural concepts.',
              },
            ].map((feat) => (
              <div key={feat.title} className="group relative flex flex-col justify-between border border-outline-variant bg-surface-card rounded-none p-6 transition-all hover:-translate-y-1 hover:border-cyan/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-none border border-cyan/40 bg-cyan/10 text-cyan">
                    <feat.icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-cyan transition-colors">{feat.title}</h3>
                  <p className="text-xs leading-6 text-on-surface-variant">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Path Showcase Grid ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">
              Career Track Showcase
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
              Choose your target role. Every track includes curated curriculum, practical tasks, and a capstone portfolio project.
            </p>
          </div>

          {/* Category navigation */}
          <div
            role="tablist"
            aria-label="Filter career tracks"
            className="no-scrollbar mx-auto mt-8 flex max-w-max overflow-x-auto border-b border-outline-variant px-1"
          >
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'foundations', label: 'Foundations' },
              { id: 'specializations', label: 'Specializations' },
              { id: 'advanced', label: 'Advanced AI & Ops' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`track-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="career-track-results"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  '-mb-px min-h-11 shrink-0 border-b-2 px-4 py-2 font-code text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
                  activeTab === tab.id
                    ? 'border-cyan text-cyan'
                    : 'border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div
            id="career-track-results"
            role="tabpanel"
            aria-labelledby={`track-tab-${activeTab}`}
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {featuredPaths.map((path) => (
              <article
                key={path.id}
                className="group flex flex-col justify-between border border-outline-variant bg-surface-card rounded-none p-6 transition-all hover:-translate-y-1 hover:border-cyan/40 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <p className="font-code text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    <span className="text-cyan">
                      {path.id === 'foundations' ? 'Prerequisite' : path.requires_paths.length > 0 ? 'Advanced' : 'Specialization'}
                    </span>
                    <span className="mx-2 text-outline" aria-hidden="true">/</span>
                    {path.tags[0] ?? 'Data'}
                  </p>

                  <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-cyan transition-colors">
                    {path.title}
                  </h3>

                  <p className="text-xs leading-5 text-on-surface-variant line-clamp-3">
                    {path.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant space-y-3 font-code">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                    <span className="flex items-center gap-1"><Hourglass className="h-3.5 w-3.5 text-cyan" /> ~40h est</span>
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-secondary" /> {nodes.filter((n) => n.path_id === path.id).length} modules</span>
                  </div>

                  <Button asChild variant="outline" className="w-full justify-between group-hover:border-cyan font-code text-xs uppercase tracking-wider rounded-none">
                    <Link href={`/paths?track=${path.id}`}>
                      <span>Explore Track</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Public Footer ── */}
      <footer className="border-t border-outline-variant bg-navy py-12 text-on-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-10 font-code sm:flex-row">
            <div>
              <div className="flex items-center gap-2 text-base font-bold uppercase tracking-wider">
                <StaccMark className="h-6 w-6" />
                <span>Stacc</span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-5 text-on-surface-variant font-sans">
                {'// not learning. just shipping.'}
              </p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-on-surface-variant font-sans">
                The outcome-first data & AI career roadmap tracker.
              </p>

              {/* Social links — placeholders until real URLs are provided */}
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  title="Discord"
                  className="flex h-8 w-8 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-cyan hover:text-cyan"
                >
                  <DiscordLogo className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  title="X / Twitter"
                  className="flex h-8 w-8 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-cyan hover:text-cyan"
                >
                  <XLogo className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-cyan hover:text-cyan"
                >
                  <LinkedInLogo className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-16">
              <div>
                <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Product</h4>
                <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
                  <li><Link href="/paths" className="hover:text-cyan">Explore Paths</Link></li>
                  <li><Link href="/tree" className="hover:text-cyan">Skill Tree</Link></li>
                  <li><Link href="/roadmap" className="hover:text-cyan">Roadmap Tracker</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Community</h4>
                <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
                  <li><a href="#" target="_blank" rel="noreferrer" className="hover:text-cyan">Discord</a></li>
                  <li><a href="#" target="_blank" rel="noreferrer" className="hover:text-cyan">X / Twitter</a></li>
                  <li><a href="#" target="_blank" rel="noreferrer" className="hover:text-cyan">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-outline-variant/60 pt-6 font-code text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Stacc Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
