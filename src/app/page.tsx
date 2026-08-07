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
  Sun,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';

function AuthErrorBanner() {
  const authError = useSearchParams().get('authError');
  if (!authError) return null;
  return (
    <div className="mt-4 flex items-start gap-2.5 border border-orange/40 bg-orange/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
      <p className="text-xs leading-5 text-on-surface-variant">
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
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-navy/90 px-4 py-3.5 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-on-surface">
            <StaccMark className="h-7 w-7" />
            <span>Stacc</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-xs font-medium">
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

            <Button onClick={handleStart} size="sm" className="gap-1.5 text-xs font-semibold">
              {hasSelectedPath ? 'Continue Roadmap' : 'Start Roadmap'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b border-outline-variant py-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-30" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[30rem] w-[30rem] rounded-full bg-cyan/[0.08] blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-12 lg:items-center md:px-8">
          {/* Hero Left Copy */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan text-xs font-semibold px-3 py-1">
              Data & AI Career Paths
            </Badge>

            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-on-surface sm:text-6xl">
              Master Data & AI Engineering
            </h1>

            <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
              An outcome-first roadmap for data careers. Master Python, SQL, Data Engineering, AI Engineering, and MLOps through curated resources and real projects.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" onClick={handleStart} className="gap-2 shadow-lg font-semibold">
                {hasSelectedPath ? 'Continue Your Roadmap' : 'Start Learning Free'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/paths">Explore All Paths</Link>
              </Button>
            </div>

            {/* Clean Metrics Strip */}
            <div className="flex items-center gap-4 pt-4 text-xs text-on-surface-variant border-t border-outline-variant/60 max-w-lg">
              <span><strong>38</strong> skill modules</span>
              <span>·</span>
              <span><strong>5</strong> career tracks</span>
              <span>·</span>
              <span>Free & open access</span>
            </div>
          </motion.div>

          {/* Hero Right Auth Box */}
          <motion.div
            className="lg:col-span-5"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="border border-cyan/30 bg-surface/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="text-center space-y-1">
                <h2 className="font-display text-xl font-bold text-on-surface">Start Free Account</h2>
                <p className="text-xs text-on-surface-variant">Pick a career track & start shipping projects.</p>
              </div>

              <div className="mt-6 space-y-3">
                <Button size="lg" onClick={handleStart} className="w-full justify-center gap-2 font-semibold">
                  <Rocket className="h-4 w-4" /> Continue as Guest
                </Button>

                {isSupabaseConnected && (
                  <Button size="lg" variant="outline" onClick={signInWithDiscord} className="w-full justify-center gap-2">
                    <LogIn className="h-4 w-4 text-cyan" /> Sign in with Discord
                  </Button>
                )}
              </div>

              <Suspense fallback={null}>
                <AuthErrorBanner />
              </Suspense>

              <div className="mt-6 border-t border-outline-variant/60 pt-4 text-center text-xs text-on-surface-variant space-y-1">
                <p>Instant access · No credit card required</p>
                <p>
                  <Link href="/tree" className="text-cyan underline-offset-2 hover:underline">
                    Browse full skill tree →
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Technology Bar ── */}
      <section className="border-b border-outline-variant bg-surface-container-low/60 py-5">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-center text-xs font-semibold text-outline uppercase tracking-wider mb-3">Technologies Covered</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 border border-outline-variant/70 bg-surface px-3 py-1.5 text-xs text-on-surface font-medium"
              >
                <Code2 className="h-3.5 w-3.5 text-cyan" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Path Showcase Grid ── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
              A path for every goal
            </h2>
            <p className="text-base leading-7 text-on-surface-variant">
              Every track features curated lessons, hands-on tasks, and a final portfolio project.
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
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="text-xs font-medium"
              >
                {tab.label}
              </Button>
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
                    <span className="text-xs font-semibold text-cyan">{path.requires_paths.length === 0 ? 'Core Track' : 'Specialization'}</span>
                    <Badge variant="outline" className="border-cyan/30 bg-cyan/10 text-xs text-cyan">
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

                <div className="mt-6 pt-4 border-t border-outline-variant space-y-3">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                    <span className="flex items-center gap-1"><Hourglass className="h-3.5 w-3.5 text-cyan" /> ~40h estimated</span>
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-secondary" /> {nodes.filter((n) => n.path_id === path.id).length} modules</span>
                  </div>

                  <Button asChild variant="outline" className="w-full justify-between group-hover:border-cyan font-medium">
                    <Link href="/paths">
                      <span>Explore Path</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="border-t border-outline-variant bg-surface-container-low/40 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-4xl">
              Designed for momentum and real proof
            </h2>
            <p className="text-base text-on-surface-variant">
              No endless video loops or fake completion badges. Learn and ship real work.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: 'No Course Hopping',
                desc: 'One canonical visual map connecting official documentation, battle-tested tutorials, and core concepts without fluff.',
              },
              {
                icon: Rocket,
                title: 'Proof Beats Promises',
                desc: 'Build tasks require shipping real evidence links (GitHub repos, deployed apps, writeups) showcased on your profile.',
              },
              {
                icon: Route,
                title: 'Structured Tree Unlock',
                desc: 'Prerequisites unlock step-by-step as you complete modules, so you always know your next high-impact learning move.',
              },
            ].map((feat) => (
              <div key={feat.title} className="border border-outline-variant bg-surface p-6 sm:p-8 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center border border-cyan/40 bg-cyan/10 text-cyan">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-on-surface">{feat.title}</h3>
                <p className="text-sm leading-6 text-on-surface-variant">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Callout ── */}
      <section className="border-t border-cyan/25 bg-gradient-to-br from-cyan/[0.08] via-surface to-surface py-16 text-center">
        <div className="mx-auto max-w-4xl px-5 md:px-8 space-y-6">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-5xl">
            Ready to start shipping?
          </h2>
          <p className="mx-auto max-w-xl text-base leading-7 text-on-surface-variant">
            Start from Foundations or jump into Data Engineering, Data Science, AI Engineering, or MLOps today.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" onClick={handleStart} className="gap-2 shadow-xl font-semibold">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Public Footer ── */}
      <footer className="border-t border-outline-variant bg-navy py-12 text-on-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-base font-bold uppercase tracking-wider">
                <StaccMark className="h-6 w-6" />
                <span>Stacc</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-on-surface-variant">
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
              <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">Tracks</h4>
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
                <li><span className="text-cyan">100% Free & Open Access</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-outline-variant/60 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-on-surface-variant">
            <p>© 2026 Stacc Inc. All Rights Reserved.</p>
            <div className="flex items-center gap-3">
              <span>Theme:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-7 gap-1.5 text-xs border-outline-variant"
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
