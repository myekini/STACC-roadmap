'use client';

/**
 * Admin panel (spec §1.3/§1.11). Built from free shadcn dashboard primitives,
 * restyled to Stacc and wired to real roadmap data via useAdminData.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Download, LogIn } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import {
  exportAllMembersCsv,
  MEMBERS_PAGE_SIZE,
  useAdminCohorts,
  useAdminMembers,
  useAdminNodeAnalytics,
  useAdminOverview,
  type MemberRow,
} from '@/hooks/useAdminData';
import { AdminShell, type AdminSection } from '@/components/admin/AdminShell';
import { StatCards } from '@/components/admin/StatCards';
import { ModuleChart } from '@/components/admin/ModuleChart';
import { MembersTable } from '@/components/admin/MembersTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { StatusMarker } from '@/components/roadmap/bits';
import { StaccMark } from '@/components/brand/StaccMark';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';
import { GithubLogo } from '@/components/icons/GithubLogo';
import { CurriculumManager } from '@/components/admin/CurriculumManager';
import { cn } from '@/lib/utils';

function AdminLogin({ signIn }: { signIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-outline-variant bg-surface/80 p-7">
        <StaccMark className="h-9 w-9" />
        <p className="micro-label mt-4 text-primary-neon">{'// restricted'}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">Admin sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">Use the email and password assigned to your admin account.</p>
        <label className="mt-6 block">
          <span className="micro-label text-outline">email</span>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 rounded-none border-outline-variant bg-surface-container-low font-code text-sm focus-visible:ring-0 focus-visible:border-cyan"
          />
        </label>
        <label className="mt-4 block">
          <span className="micro-label text-outline">password</span>
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 rounded-none border-outline-variant bg-surface-container-low font-code text-sm focus-visible:ring-0 focus-visible:border-cyan"
          />
        </label>
        {error && <p className="mt-3 border-l-2 border-error pl-3 font-code text-[11px] text-error">{error}</p>}
        <Button type="submit" disabled={busy} className="mt-6 w-full">
          <LogIn /> {busy ? 'signing in…' : 'sign in'}
        </Button>
      </form>
    </div>
  );
}

function MemberDrilldown({ member, onClose }: { member: MemberRow | null; onClose: () => void }) {
  const { paths, nodesByPath } = useUserData();
  if (!member) return null;
  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto no-scrollbar">
        <div className="border-b border-outline-variant bg-navy/60 p-6 pb-5">
          <p className="micro-label text-cyan">{`// member · ${member.cohort ?? 'no cohort'}`}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <SheetTitle className="font-display text-2xl font-bold">{member.username}</SheetTitle>
            {member.githubUsername && (
              <a
                href={`https://github.com/${member.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-code text-[10px] font-bold uppercase text-cyan hover:bg-cyan/20"
              >
                <GithubLogo className="h-3 w-3" /> GitHub
              </a>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-code text-[10px] lowercase text-on-surface-variant">
            <span>overall {member.overallPct}%</span>
            <span>last active {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase() : 'never'}</span>
            {member.isStuck && <span className="font-bold text-error">⚠ stuck</span>}
          </div>
        </div>
        <div className="space-y-6 p-6">
          {paths.map((path) => {
            const pathNodes = nodesByPath[path.id] ?? [];
            if (!pathNodes.length) return null;
            const done = pathNodes.filter((n) => member.completedNodes[n.id]).length;
            return (
              <section key={path.id}>
                <div className="flex items-center justify-between">
                  <p className="micro-label text-outline">{path.title}</p>
                  <span className="font-code text-[10px] font-semibold text-on-surface-variant">{done}/{pathNodes.length}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {pathNodes.map((node) => {
                    const status = member.completedNodes[node.id]
                      ? 'complete'
                      : member.inProgressNodes.includes(node.id)
                        ? 'in_progress'
                        : 'locked';
                    return (
                      <li key={node.id} className="flex items-center gap-2.5 border border-outline-variant/50 bg-surface/60 px-2.5 py-1.5">
                        <StatusMarker status={status} size="sm" />
                        <span className={cn('flex-1 truncate text-xs', status === 'complete' ? 'text-on-surface' : 'text-on-surface-variant')}>{node.name}</span>
                        {status === 'complete' && (
                          <span className="font-code text-[9px] text-outline">{member.completedNodes[node.id]?.slice(0, 10)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminPage() {
  const userData = useUserData();
  const [cohort, setCohort] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>('overview');
  const [memberFilter, setMemberFilter] = useState<'all' | 'attention'>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(0);
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const { paths, nodes, isAdmin, isLoading, isAuthenticated, isSupabaseConnected, user, signOut } = userData;

  const overview = useAdminOverview(userData);
  const cohortsQuery = useAdminCohorts(userData);
  const nodeAnalytics = useAdminNodeAnalytics(userData);
  const membersQuery = useAdminMembers(userData, {
    search: memberSearch,
    cohort,
    stuckOnly: memberFilter === 'attention',
    page: memberPage,
  });
  const members = membersQuery.data?.members ?? [];
  const totalMembers = membersQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalMembers / MEMBERS_PAGE_SIZE));

  if (isSupabaseConnected && !isAuthenticated) {
    return <AdminLogin signIn={userData.signInWithPassword} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AnimatedStaccMark className="h-14 w-14" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm border border-outline-variant bg-surface/80 p-7 text-center">
          <p className="micro-label text-error">{'// forbidden'}</p>
          <h1 className="mt-2 font-display text-xl font-bold text-on-surface">Admin access only</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Your account doesn&apos;t have admin permissions.</p>
          <Button asChild className="mt-5"><a href="/roadmap">Back to app</a></Button>
        </div>
      </div>
    );
  }

  const pathTitles = Object.fromEntries(paths.filter((p) => p.id !== 'foundations').map((p) => [p.id, p.title] as const));
  const nodePathById = Object.fromEntries(nodes.map((n) => [n.id, n.path_id] as const));
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n] as const));
  const stuckCount = overview.data?.stuckCount ?? 0;
  const cohorts = cohortsQuery.data ?? [];

  const CohortFilter = cohorts.length > 0 && (
    <div className="flex max-w-full flex-wrap items-center gap-1">
      <span className="micro-label mr-1 text-outline">cohort</span>
      <button
        type="button"
        onClick={() => setCohort(null)}
        className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', !cohort ? 'border-primary/50 bg-primary/10 text-primary-neon' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}
      >
        all
      </button>
      {cohorts.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCohort(c)}
          className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', cohort === c ? 'border-primary/50 bg-primary/10 text-primary-neon' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}
        >
          {c}
        </button>
      ))}
    </div>
  );

  return (
    <AdminShell section={section} onSectionChange={setSection} stuckCount={stuckCount} username={user.username} onSignOut={signOut}>
      {overview.isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse border border-outline-variant/40 bg-surface/50" />)}
          </div>
          <div className="h-14 animate-pulse border border-outline-variant/40 bg-surface/50" />
        </div>
      ) : (
        <>
          {section === 'overview' && (
            <div className="space-y-6">
              <StatCards stats={overview.data ?? { totalMembers: 0, activeThisWeek: 0, avgCompletionPct: 0, stuckCount: 0 }} />
              <div className="grid gap-px overflow-hidden border border-outline-variant bg-outline-variant md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { setCohort(null); setMemberFilter(stuckCount > 0 ? 'attention' : 'all'); setMemberPage(0); setSection('members'); }}
                  className="group bg-surface p-5 text-left transition-colors hover:bg-surface-container-low"
                >
                  <span className="text-sm font-semibold text-on-surface">{stuckCount > 0 ? `${stuckCount} ${stuckCount === 1 ? 'member needs' : 'members need'} attention` : 'Everyone is on track'}</span>
                  <span className="mt-1 block text-xs text-on-surface-variant">{stuckCount > 0 ? 'Review members with no roadmap activity in 14 days.' : 'No members are currently flagged as inactive.'}</span>
                  <span className="mt-5 flex items-center gap-1 font-code text-[10px] font-semibold uppercase text-cyan">View members <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
                </button>
                <Link href="/roadmap" className="group bg-surface p-5 transition-colors hover:bg-surface-container-low">
                  <span className="text-sm font-semibold text-on-surface">View as a member</span>
                  <span className="mt-1 block text-xs text-on-surface-variant">Open every course and module without prerequisite locks.</span>
                  <span className="mt-5 flex items-center gap-1 font-code text-[10px] font-semibold uppercase text-cyan">Browse all courses <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              </div>
            </div>
          )}

          {section === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1" aria-label="Member status filter">
                    <button type="button" onClick={() => { setMemberFilter('all'); setMemberPage(0); }} className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', memberFilter === 'all' ? 'border-primary/50 bg-primary/10 text-primary-neon' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}>all members</button>
                    <button type="button" onClick={() => { setMemberFilter('attention'); setMemberPage(0); }} className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', memberFilter === 'attention' ? 'border-error/50 bg-error/10 text-error' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}>needs attention</button>
                  </div>
                  {CohortFilter}
                  <Input
                    placeholder="Search username…"
                    value={memberSearch}
                    onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(0); }}
                    className="h-8 w-40 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={exporting}
                  onClick={async () => {
                    setExporting(true);
                    try {
                      await exportAllMembersCsv(userData, pathTitles, nodePathById, { search: memberSearch, cohort, stuckOnly: memberFilter === 'attention' });
                    } finally {
                      setExporting(false);
                    }
                  }}
                  className="w-full sm:ml-auto sm:w-auto"
                >
                  <Download /> {exporting ? 'exporting…' : 'export csv'}
                </Button>
              </div>
              <MembersTable members={members} emptyLabel={memberFilter === 'attention' ? 'nobody needs attention' : 'no members yet'} onSelect={setSelected} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between font-code text-[11px] text-on-surface-variant">
                  <span>page {memberPage + 1} of {totalPages} · {totalMembers} members</span>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={memberPage === 0} onClick={() => setMemberPage((p) => Math.max(0, p - 1))} className="flex items-center gap-1 border border-outline-variant px-2 py-1 disabled:opacity-40">
                      <ChevronLeft className="h-3 w-3" /> prev
                    </button>
                    <button type="button" disabled={memberPage + 1 >= totalPages} onClick={() => setMemberPage((p) => Math.min(totalPages - 1, p + 1))} className="flex items-center gap-1 border border-outline-variant px-2 py-1 disabled:opacity-40">
                      next <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'curriculum' && (
            <div className="space-y-8">
              {/* 3-panel CurriculumManager — needs a fixed height to enable internal scroll */}
              <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface" style={{ height: '70vh', minHeight: 520 }}>
                <CurriculumManager />
              </div>
              <div className="pt-2 border-t border-outline-variant/60">
                <h3 className="font-display text-lg font-bold text-on-surface mb-4">Module Completion Analytics</h3>
                <ModuleChart analytics={nodeAnalytics.data ?? []} nodeById={nodeById} />
              </div>
              <div className="overflow-x-auto border border-outline-variant bg-surface">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      {['module', 'path', 'started', 'completed', 'completion rate'].map((h) => (
                        <th key={h} className="micro-label px-4 py-3 text-outline">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {(nodeAnalytics.data ?? [])
                      .filter((a) => a.starts > 0)
                      .sort((a, b) => b.starts - a.starts)
                      .map((a) => {
                        const node = nodeById[a.nodeId];
                        const rate = a.starts ? Math.round((a.completions / a.starts) * 100) : 0;
                        return (
                          <tr key={a.nodeId} className="hover:bg-surface-container-low/50">
                            <td className="px-4 py-3 text-xs font-semibold text-on-surface">{node?.name ?? a.nodeId}</td>
                            <td className="px-4 py-3 font-code text-[10px] uppercase text-on-surface-variant">{pathTitles[node?.path_id ?? ''] ?? node?.path_id}</td>
                            <td className="px-4 py-3 font-code text-xs text-on-surface-variant">{a.starts}</td>
                            <td className="px-4 py-3 font-code text-xs text-on-surface-variant">{a.completions}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-2">
                                <span className="inline-block h-1 w-20 bg-surface-container-high">
                                  <span className={cn('block h-full', rate >= 60 ? 'bg-secondary' : rate >= 30 ? 'bg-tertiary' : 'bg-error')} style={{ width: `${rate}%` }} />
                                </span>
                                <span className="font-code text-[10px] font-semibold text-on-surface-variant">{rate}%</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    {(nodeAnalytics.data ?? []).filter((a) => a.starts > 0).length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center font-code text-xs lowercase text-outline">{'// no module activity yet'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <MemberDrilldown member={selected} onClose={() => setSelected(null)} />
    </AdminShell>
  );
}
