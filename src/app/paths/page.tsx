'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Search,
  Sparkles,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PathRow } from '@/lib/database.types';

/** Reads ?track=<pathId> from the landing page's per-card CTA and narrows
 * the existing search filter to that track — isolated + Suspense-wrapped so
 * useSearchParams doesn't force this whole client page out of static
 * rendering (same pattern as the homepage's AuthErrorBanner). */
function TrackFocus({ paths, onFound }: { paths: PathRow[]; onFound: (title: string) => void }) {
  const track = useSearchParams().get('track');
  useEffect(() => {
    if (!track || paths.length === 0) return;
    const match = paths.find((p) => p.id === track);
    if (match) onFound(match.title);
  }, [track, paths, onFound]);
  return null;
}

export default function PathSelectionPage() {
  const data = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'specialization' | 'advanced'>('all');
  const { paths, nodesByPath, progress, activePath, hasSelectedPath, isAuthenticated, isSupabaseConnected, signInWithGithub } = data;

  const specializations = useMemo(() => paths.filter((p) => p.id !== 'foundations'), [paths]);

  // Real curated tags from each track's own content (roadmap.ts / seed.sql),
  // not a hand-authored marketing taxonomy — so filtering here always
  // matches what's actually in the curriculum.
  const allTags = useMemo(
    () => ['All', ...Array.from(new Set(specializations.flatMap((p) => p.tags))).sort()],
    [specializations],
  );

  const filteredPaths = useMemo(() => {
    return specializations.filter((p) => {
      const level = p.requires_paths.length > 0 ? 'advanced' : 'specialization';
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'All' || p.tags.includes(selectedTag);
      const matchesLevel = selectedLevel === 'all' || level === selectedLevel;

      return matchesSearch && matchesTag && matchesLevel;
    });
  }, [specializations, searchQuery, selectedTag, selectedLevel]);

  const handlePathSelect = async (pathId: string) => {
    // A logged-out visitor on the live (Supabase-connected) app has no
    // account to persist a selection to — sending them through GitHub OAuth
    // first (rather than silently writing to localStorage and stranding the
    // selection there) means the choice actually survives once they're back.
    if (isSupabaseConnected && !isAuthenticated) {
      await signInWithGithub();
      return;
    }
    await data.selectPath(pathId);
    router.push('/roadmap');
  };

  return (
    <div className="py-6 md:py-10 max-w-7xl mx-auto px-4 space-y-8">
      <Suspense fallback={null}>
        <TrackFocus paths={paths} onFound={setSearchQuery} />
      </Suspense>
      {/* ── Track hero ── */}
      <section className="relative overflow-hidden border border-cyan/25 bg-gradient-to-r from-surface-card via-surface-container-low to-surface-container-high p-6 md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-orange/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-secondary/40 bg-secondary/20 px-3 py-1 font-code text-xs font-bold text-secondary uppercase tracking-wider">
                Tracks & Courses
              </span>
              <span className="border border-cyan/30 bg-cyan/15 px-3 py-1 font-code text-xs font-semibold text-cyan">
                Hands-on Learning
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-5xl">
              Career & Skill Tracks
            </h1>

            <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
              It’s time to roll up your sleeves — we learn best by doing. Every track is interactive, combining guided material with real project deliverables.
            </p>
          </div>

          {/* Step sequence — replaces the previous decorative spinning badge */}
          <div className="hidden lg:flex shrink-0 flex-col gap-2 border border-cyan/30 bg-surface-container-low/80 p-4 font-code text-xs">
            {['Learn', 'Build', 'Ship'].map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-cyan/50 text-[10px] font-bold text-cyan">{i + 1}</span>
                <span className="font-semibold uppercase tracking-widest text-on-surface-variant">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter Strip ── */}
      <section className="space-y-4">
        {/* Filter Pills Tag List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'shrink-0 px-4 py-2 font-code text-xs font-semibold transition-all border',
                selectedTag === tag
                  ? 'border-cyan bg-cyan text-navy font-bold'
                  : 'border-outline-variant/60 bg-surface-card text-on-surface-variant hover:border-cyan/50 hover:text-on-surface',
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search & Level Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search career tracks, topics, or skills..."
              className="w-full border border-outline-variant bg-surface-card pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as typeof selectedLevel)}
            className="w-full sm:w-auto border border-outline-variant bg-surface-card px-4 py-2.5 font-code text-xs text-on-surface focus:border-cyan focus:outline-none"
          >
            <option value="all">All Tracks</option>
            <option value="specialization">Specialization</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </section>

      {/* ── Quick Start Recommendation Callout ── */}
      {!hasSelectedPath && (
        <div className="border border-cyan/40 bg-cyan/[0.06] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan/40 bg-cyan/20 text-cyan">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-on-surface">Recommended Starter Path</p>
              <p className="text-xs text-on-surface-variant">Data Analysis offers the fastest feedback loop to start building real projects.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => handlePathSelect('da')} className="gap-1.5 shrink-0">
            Start Data Analyst <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── Track Grid ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.map((path, index) => {
          const isActive = hasSelectedPath && activePath === path.id;
          const level = path.requires_paths.length > 0 ? 'Advanced' : 'Specialization';
          const pathNodes = nodesByPath[path.id] ?? [];
          const done = pathNodes.filter((n) => progress.completedNodes[n.id]).length;
          const estHours = pathNodes.reduce((sum, n) => sum + n.est_hours, 0);
          const locked = !data.pathUnlocked(path.id);
          const gateTitles = path.requires_paths
            .map((id) => paths.find((p) => p.id === id)?.title)
            .filter(Boolean)
            .join(' + ');

          return (
            <motion.article
              key={path.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(0.15, index * 0.05) }}
              className={cn(
                'group relative flex flex-col justify-between border bg-surface-card p-6 transition-all',
                isActive ? 'border-cyan ring-2 ring-cyan/40' : 'border-outline-variant/80',
                locked ? 'opacity-80' : 'hover:border-cyan/60',
              )}
            >
              <div>
                {/* Header metadata line */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-code text-[10px] font-bold uppercase tracking-widest text-cyan">
                    CAREER TRACK
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <Badge variant="success" className="gap-1 px-2 py-0.5 font-code text-[10px] uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                    {locked && (
                      <Badge variant="outline" className="gap-1 border-warning/40 bg-warning/10 text-warning px-2 py-0.5 font-code text-[10px] uppercase">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Course Title */}
                <h2 className="mt-3 font-display text-xl font-bold text-on-surface group-hover:text-cyan transition-colors">
                  {path.title}
                </h2>

                {/* Level pill */}
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn('h-2 w-2', level === 'Specialization' ? 'bg-cyan' : 'bg-orange')} />
                  <span className="font-code text-xs font-semibold text-on-surface-variant">
                    {level}
                  </span>
                </div>

                {/* Outcome description */}
                <p className="mt-3 text-xs leading-5 text-on-surface-variant line-clamp-3">
                  {path.description}
                </p>

                {/* Real curated tags for this track — replaces the fabricated
                    "instructor" identity bar that used to sit here. */}
                {path.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-outline-variant/60 pt-4">
                    {path.tags.map((tag) => (
                      <span key={tag} className="border border-outline-variant/60 bg-surface-container-high px-2 py-0.5 font-code text-[10px] text-on-surface-variant">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Section */}
              <div className="mt-6 pt-4 border-t border-outline-variant/60 space-y-4">
                <div className="flex items-center justify-between font-code text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1.5 font-bold text-on-surface">
                    <Clock className="h-3.5 w-3.5 text-cyan" /> {estHours} hr
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-outline" /> {pathNodes.length} modules
                  </span>
                </div>

                {done > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between font-code text-[10px] text-on-surface-variant">
                      <span>Progress</span>
                      <span className="font-bold text-cyan">{done}/{pathNodes.length}</span>
                    </div>
                    <Progress
                      value={pathNodes.length ? (done / pathNodes.length) * 100 : 0}
                      className="h-1.5 bg-surface-container-high [&>div]:bg-cyan"
                    />
                  </div>
                )}

                <Button
                  onClick={() => handlePathSelect(path.id)}
                  disabled={locked}
                  className={cn(
                    'w-full justify-center font-code text-xs font-bold uppercase tracking-wider py-2.5 transition-all',
                    isActive
                      ? 'bg-cyan text-navy hover:bg-cyan/90'
                      : locked
                        ? 'border border-outline-variant/60 bg-surface text-outline cursor-not-allowed'
                        : 'bg-surface-card border border-cyan/40 text-cyan hover:bg-cyan hover:text-navy',
                  )}
                >
                  {isActive ? (
                    <span className="flex items-center gap-1.5">Continue Roadmap <ArrowRight className="h-4 w-4" /></span>
                  ) : locked ? (
                    <span>Complete {gateTitles} first</span>
                  ) : (
                    <span className="flex items-center gap-1.5">Start Track <ArrowRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
