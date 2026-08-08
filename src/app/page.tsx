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
  LogIn,
  Moon,
  Rocket,
  Route,
  Sparkles,
  Sun,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';

function AuthErrorBanner() {
  const authError = useSearchParams().get('authError');
  if (!authError) return null;
  return (
    <div className="mt-4 flex items-start gap-2.5 border border-orange/40 bg-orange/10 px-4 py-3 font-code text-xs">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
      <p className="leading-5 text-on-surface-variant">
        <span className="font-semibold text-orange">Sign-in failed —</span> {authError}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, signInWithDiscord, isSupabaseConnected, hasSelectedPath, paths, nodes } = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { theme, toggleTheme } = useUiStore();
  const [activeTab, setActiveTab] = useState<'all' | 'foundations' | 'specializations' | 'advanced'>('all');

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
      <header className="sticky top-0 z-40 border-b border-cyan/15 bg-navy/90 px-4 py-3.5 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-on-surface">
            <StaccMark className="h-7 w-7" />
            <span>Stacc</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-xs font-code font-semibold uppercase tracking-[0.1em]">
            <Link href="/paths" className="text-on-surface-variant hover:text-cyan transition-colors">
              Explore Paths
            </Link>
            <Link href="/tree" className="text-on-surface-variant hover:text-cyan transition-colors">
              Skill Tree
            </Link>
            <Link href="/roadmap" className="text-on-surface-variant hover:text-cyan transition-colors">
              Roadmap
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="h-8 w-8 rounded-none border-outline-variant bg-surface text-on-surface-variant hover:text-cyan"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-cyan" />}
            </Button>

            <Button onClick={handleStart} size="sm" className="gap-1.5 text-xs font-code uppercase font-bold tracking-wider">
              {hasSelectedPath ? 'Continue Roadmap' : 'Start Roadmap'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

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
            <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan text-xs font-code tracking-[0.14em] uppercase px-3.5 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" /> Data & AI Career Engine
            </Badge>
          </motion.div>

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
            An outcome-first skill tree for technical careers. Master Python, SQL, Data Engineering, AI Engineering, and MLOps by shipping real code.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Button size="lg" onClick={handleStart} className="gap-2 shadow-xl font-code uppercase font-bold tracking-wider px-6 py-3 text-xs">
              <Rocket className="h-4 w-4" />
              {hasSelectedPath ? 'Continue Your Roadmap' : 'Start Learning Free'}
            </Button>

            <Button size="lg" variant="outline" asChild className="font-code uppercase text-xs font-semibold px-6 py-3 border-cyan/40 hover:border-cyan">
              <Link href="/paths">
                Explore All Tracks <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Link>
            </Button>

            {isSupabaseConnected && (
              <Button size="lg" variant="ghost" onClick={signInWithDiscord} className="gap-2 font-code text-xs text-on-surface-variant hover:text-cyan">
                <LogIn className="h-4 w-4 text-cyan" /> Sign in with Discord
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

      {/* ── Technology Strip ── */}
      <section className="border-b border-outline-variant bg-surface-container-low/60 py-4">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 font-code text-xs text-on-surface-variant">
            <Code2 className="h-3.5 w-3.5 shrink-0 text-cyan" />
            {techStack.map((tech, i) => (
              <span key={tech}>
                {tech}
                {i < techStack.length - 1 && <span className="text-outline"> ·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Feature Grid ── */}
      <section className="border-b border-outline-variant py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Engineered for Real Engineering Momentum
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
              No endless 50-hour video loops or fake badges. Learn through structured DAG prerequisites and real project deliverables.
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
              <div key={feat.title} className="group relative flex flex-col justify-between border border-outline-variant bg-surface p-6 transition-all hover:-translate-y-1 hover:border-cyan/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center border border-cyan/40 bg-cyan/10 text-cyan">
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

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'foundations', label: 'Foundations' },
              { id: 'specializations', label: 'Specializations' },
              { id: 'advanced', label: 'Advanced AI & Ops' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'px-3.5 py-1.5 font-code text-xs font-semibold uppercase tracking-[0.1em] border transition-all',
                  activeTab === tab.id
                    ? 'border-cyan bg-cyan/15 text-cyan shadow-sm'
                    : 'border-outline-variant/60 bg-surface/60 text-on-surface-variant hover:border-cyan/40 hover:text-on-surface',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPaths.map((path) => (
              <article
                key={path.id}
                className="group flex flex-col justify-between border border-outline-variant bg-surface p-6 transition-all hover:-translate-y-1 hover:border-cyan/40 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-code text-[10px] font-semibold uppercase tracking-wider text-cyan">
                      {path.requires_paths.length === 0 ? 'Core Track' : 'Specialization'}
                    </span>
                    <Badge variant="outline" className="border-cyan/30 bg-cyan/10 font-code text-[10px] text-cyan">
                      {path.tags[0] ?? 'Data'}
                    </Badge>
                  </div>

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

                  <Button asChild variant="outline" className="w-full justify-between group-hover:border-cyan font-code text-xs uppercase tracking-wider">
                    <Link href="/paths">
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

      {/* ── Bottom Callout ── */}
      <section className="border-t border-cyan/25 bg-gradient-to-br from-cyan/[0.08] via-surface to-surface py-16 text-center">
        <div className="mx-auto max-w-4xl px-5 md:px-8 space-y-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">
            Ready to Start Building Your Career?
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-on-surface-variant sm:text-base">
            Start from Foundations or jump directly into Data Engineering, Data Science, AI Engineering, or MLOps today.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={handleStart} className="gap-2 shadow-xl font-code uppercase font-bold tracking-wider text-xs px-6 py-3">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Public Footer ── */}
      <footer className="border-t border-outline-variant bg-navy py-12 text-on-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 font-code">
            <div>
              <div className="flex items-center gap-2 text-base font-bold uppercase tracking-wider">
                <StaccMark className="h-6 w-6" />
                <span>Stacc</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-on-surface-variant font-sans">
                The outcome-first data & AI career roadmap tracker.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
                <li><Link href="/paths" className="hover:text-cyan">Explore Paths</Link></li>
                <li><Link href="/tree" className="hover:text-cyan">Skill Tree</Link></li>
                <li><Link href="/roadmap" className="hover:text-cyan">Roadmap Tracker</Link></li>
                <li><Link href="/settings" className="hover:text-cyan">Member Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3 font-code">Tracks</h4>
              <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
                <li><Link href="/paths" className="hover:text-cyan">Foundations</Link></li>
                <li><Link href="/paths" className="hover:text-cyan">Data Analysis</Link></li>
                <li><Link href="/paths" className="hover:text-cyan">Data Engineering</Link></li>
                <li><Link href="/paths" className="hover:text-cyan">AI Engineering</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
                <li><span>{isSupabaseConnected ? 'Cloud Auth Enabled' : 'Local Demo Mode'}</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-outline-variant/60 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row font-code text-xs text-on-surface-variant">
            <p>© 2026 Stacc Inc. All Rights Reserved.</p>
            <div className="flex items-center gap-3">
              <span>Theme:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-7 gap-1.5 text-xs border-outline-variant rounded-none"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-warning" /> : <Moon className="h-3.5 w-3.5 text-cyan" />}
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

