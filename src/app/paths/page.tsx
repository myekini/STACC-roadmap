'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Lock,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PathRow } from '@/lib/database.types';

const PATH_META: Record<
  string,
  {
    outcome: string;
    level: 'Basic' | 'Intermediate' | 'Advanced';
    project: string;
    instructor: string;
    role: string;
    accent: string;
    tags: string[];
  }
> = {
  da: {
    outcome: 'Turn raw data into business intelligence and clear executive dashboards',
    level: 'Basic',
    project: 'Business Insights Dashboard',
    instructor: 'Alex Kuntz',
    role: 'Head of Analytics',
    accent: 'border-cyan/40 bg-cyan/10 text-cyan',
    tags: ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel'],
  },
  de: {
    outcome: 'Design scalable data pipelines, automated ETL workflows, and lakehouses',
    level: 'Intermediate',
    project: 'Production Data Pipeline',
    instructor: 'Kevin James',
    role: 'Lead Data Architect',
    accent: 'border-secondary/40 bg-secondary/10 text-secondary',
    tags: ['Python', 'SQL', 'dbt', 'Kafka', 'Airflow', 'Azure'],
  },
  ds: {
    outcome: 'Build statistical models, conduct hypothesis tests, and interpret predictions',
    level: 'Intermediate',
    project: 'Predictive ML Research',
    instructor: 'Florin Angelescu',
    role: 'Principal Data Scientist',
    accent: 'border-tertiary/40 bg-tertiary/10 text-tertiary',
    tags: ['Python', 'R', 'PyTorch', 'ChatGPT', 'Claude'],
  },
  'ai-engineering': {
    outcome: 'Engineer production RAG apps, fine-tune LLMs, and deploy AI services',
    level: 'Advanced',
    project: 'RAG Assistant System',
    instructor: 'Dr. Maya Lin',
    role: 'AI Systems Architect',
    accent: 'border-primary/40 bg-primary/10 text-primary-neon',
    tags: ['Python', 'OpenAI', 'Claude', 'PyTorch', 'FastAPI'],
  },
  mlops: {
    outcome: 'Automate model training, monitor drift, and manage ML infrastructure',
    level: 'Advanced',
    project: 'Automated ML Ops Platform',
    instructor: 'David Vance',
    role: 'ML Platform Lead',
    accent: 'border-outline-variant bg-surface-container-high text-on-surface-variant',
    tags: ['Python', 'Git', 'Databricks', 'AWS', 'Google Cloud'],
  },
};

const ALL_FILTER_TAGS = [
  'All',
  'Python',
  'SQL',
  'dbt',
  'Power BI',
  'Tableau',
  'Excel',
  'R',
  'PyTorch',
  'AWS',
  'Azure',
  'Google Cloud',
  'Claude',
  'ChatGPT',
  'OpenAI',
  'Git',
];

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
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const { paths, nodesByPath, progress, activePath, hasSelectedPath } = data;

  const specializations = paths.filter((p) => p.id !== 'foundations');

  const filteredPaths = useMemo(() => {
    return specializations.filter((p) => {
      const meta = PATH_META[p.id] ?? PATH_META.da;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meta.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === 'All' || meta.tags.includes(selectedTag);

      const matchesLevel =
        selectedLevel === 'all' || meta.level === selectedLevel;

      return matchesSearch && matchesTag && matchesLevel;
    });
  }, [specializations, searchQuery, selectedTag, selectedLevel]);

  const handlePathSelect = async (pathId: string) => {
    await data.selectPath(pathId);
    router.push('/roadmap');
  };

  return (
    <div className="py-6 md:py-10 max-w-7xl mx-auto px-4 space-y-8">
      <Suspense fallback={null}>
        <TrackFocus paths={paths} onFound={setSearchQuery} />
      </Suspense>
      {/* ── DataCamp Style Dark Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl border border-outline-variant/80 bg-gradient-to-r from-navy via-slate-900 to-navy-2 p-6 md:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-orange/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-secondary/20 px-3 py-1 font-code text-xs font-bold text-secondary uppercase tracking-wider">
                Tracks & Courses
              </span>
              <span className="rounded-md bg-cyan/15 px-3 py-1 font-code text-xs font-semibold text-cyan">
                Hands-on Learning
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Career & Skill Tracks
            </h1>

            <p className="text-sm leading-6 text-slate-300 sm:text-base">
              It’s time to roll up your sleeves — we learn best by doing. Every track is interactive, combining guided material with real project deliverables.
            </p>
          </div>

          {/* DataCamp Step Cycle Graphic Illustration */}
          <div className="hidden lg:flex shrink-0 items-center justify-center relative w-44 h-44 rounded-full border border-cyan/30 bg-slate-900/80 p-4 shadow-inner">
            <div className="text-center">
              <p className="font-code text-[11px] font-bold text-cyan tracking-widest uppercase">LEARN</p>
              <p className="font-code text-[9px] text-slate-400 mt-1">BUILD & SHIP</p>
            </div>
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan/40 animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan text-navy font-bold text-xs">1</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white font-bold text-xs">2</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-orange text-white font-bold text-xs">3</div>
          </div>
        </div>
      </section>

      {/* ── DataCamp Filter Strip ── */}
      <section className="space-y-4">
        {/* Filter Pills Tag List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ALL_FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 font-code text-xs font-semibold transition-all border',
                selectedTag === tag
                  ? 'border-cyan bg-cyan text-navy font-bold shadow-md'
                  : 'border-outline-variant/60 bg-surface-card text-on-surface-variant hover:border-cyan/50 hover:text-on-surface',
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search & Topic Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search career tracks, topics, or skills..."
              className="w-full rounded-xl border border-outline-variant bg-surface-card pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-outline-variant bg-surface-card px-4 py-2.5 font-code text-xs text-on-surface focus:border-cyan focus:outline-none"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <Button variant="outline" size="sm" className="rounded-xl border-outline-variant gap-1.5 font-code text-xs">
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>
          </div>
        </div>
      </section>

      {/* ── Quick Start Recommendation Callout ── */}
      {!hasSelectedPath && (
        <div className="rounded-xl border border-cyan/40 bg-cyan/[0.06] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/20 text-cyan">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-on-surface">Recommended Starter Path</p>
              <p className="text-xs text-on-surface-variant">Data Analysis offers the fastest feedback loop to start building real projects.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => handlePathSelect('da')} className="gap-1.5 shrink-0 rounded-lg">
            Start Data Analyst <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* ── Track Grid (DataCamp Course Card Style) ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.map((path, index) => {
          const isActive = hasSelectedPath && activePath === path.id;
          const meta = PATH_META[path.id] ?? PATH_META.da;
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
                'group relative flex flex-col justify-between rounded-xl border bg-surface-card p-6 transition-all hover:shadow-2xl',
                isActive
                  ? 'border-cyan ring-2 ring-cyan/40 shadow-[0_0_25px_rgba(0,217,255,0.1)]'
                  : 'border-outline-variant/80',
                locked ? 'opacity-80' : 'hover:-translate-y-1 hover:border-cyan/60',
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
                      <Badge variant="success" className="gap-1 rounded-md px-2 py-0.5 font-code text-[10px] uppercase">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                    {locked && (
                      <Badge variant="outline" className="gap-1 rounded-md border-warning/40 bg-warning/10 text-warning px-2 py-0.5 font-code text-[10px] uppercase">
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
                  <span className={cn('h-2 w-2 rounded-full', meta.level === 'Basic' ? 'bg-secondary' : meta.level === 'Intermediate' ? 'bg-cyan' : 'bg-orange')} />
                  <span className="font-code text-xs font-semibold text-on-surface-variant">
                    {meta.level}
                  </span>
                </div>

                {/* Outcome description */}
                <p className="mt-3 text-xs leading-5 text-on-surface-variant line-clamp-3">
                  {path.description}
                </p>

                {/* Instructor Avatar & Metadata Bar (DataCamp Style) */}
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-bold text-cyan text-xs border border-cyan/30">
                    {meta.instructor.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{meta.instructor}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{meta.role}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2 py-0.5 font-code text-[9px] font-semibold text-outline uppercase tracking-wider">
                    <Users className="h-3 w-3" /> COLLABORATION
                  </span>
                </div>
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
                      className="h-1.5 rounded-full bg-surface-container-high [&>div]:bg-cyan"
                    />
                  </div>
                )}

                <Button
                  onClick={() => handlePathSelect(path.id)}
                  disabled={locked}
                  className={cn(
                    'w-full justify-center font-code text-xs font-bold uppercase tracking-wider rounded-xl py-2.5 transition-all',
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
                    <span>Requires {gateTitles}</span>
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
