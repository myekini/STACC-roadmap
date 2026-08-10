'use client';

/**
 * Admin panel (spec §1.3/§1.11). Built from free shadcn dashboard primitives,
 * restyled to Stacc and wired to real roadmap data via useAdminData.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, GitBranch, LogIn } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { exportMembersCsv, useAdminData, type MemberRow } from '@/hooks/useAdminData';
import { AdminShell, type AdminSection } from '@/components/admin/AdminShell';
import { StatCards } from '@/components/admin/StatCards';
import { ModuleChart } from '@/components/admin/ModuleChart';
import { MembersTable } from '@/components/admin/MembersTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { StatusMarker } from '@/components/roadmap/bits';
import { StaccMark } from '@/components/brand/StaccMark';
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
                className="inline-flex items-center gap-1.5 border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-code text-[10px] font-bold uppercase text-cyan hover:bg-cyan/20"
              >
                <GitBranch className="h-3 w-3" /> GitHub
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
  const admin = useAdminData(userData);
  const [cohort, setCohort] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>('overview');
  const [memberFilter, setMemberFilter] = useState<'all' | 'attention'>('all');
  const [selected, setSelected] = useState<MemberRow | null>(null);

  const { paths, nodes, isAdmin, isLoading, isAuthenticated, isSupabaseConnected, user, signOut } = userData;

  const members = useMemo(() => {
    const all = admin.data?.members ?? [];
    return cohort ? all.filter((m) => m.cohort === cohort) : all;
  }, [admin.data?.members, cohort]);

  const visibleMembers = useMemo(
    () => memberFilter === 'attention' ? members.filter((member) => member.isStuck) : members,
    [memberFilter, members],
  );

  if (isSupabaseConnected && !isAuthenticated) {
    return <AdminLogin signIn={userData.signInWithPassword} />;
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin" /></div>;
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
  const stuckCount = admin.data?.stuck.length ?? 0;
  const cohorts = admin.data?.cohorts ?? [];

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
      {admin.isLoading ? (
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
              <StatCards members={admin.data?.members ?? []} />
              <div className="grid gap-px overflow-hidden border border-outline-variant bg-outline-variant md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { setCohort(null); setMemberFilter(stuckCount > 0 ? 'attention' : 'all'); setSection('members'); }}
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
                    <button type="button" onClick={() => setMemberFilter('all')} className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', memberFilter === 'all' ? 'border-primary/50 bg-primary/10 text-primary-neon' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}>all members</button>
                    <button type="button" onClick={() => setMemberFilter('attention')} className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', memberFilter === 'attention' ? 'border-error/50 bg-error/10 text-error' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}>needs attention</button>
                  </div>
                  {CohortFilter}
                </div>
                <Button variant="outline" onClick={() => exportMembersCsv(visibleMembers, pathTitles, nodePathById)} className="w-full sm:ml-auto sm:w-auto">
                  <Download /> export csv
                </Button>
              </div>
              <MembersTable members={visibleMembers} emptyLabel={memberFilter === 'attention' ? 'nobody needs attention' : 'no members yet'} onSelect={setSelected} />
            </div>
          )}

          {section === 'curriculum' && (
            <div className="space-y-4">
              <ModuleChart analytics={admin.data?.nodeAnalytics ?? []} nodeById={nodeById} />
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
                    {(admin.data?.nodeAnalytics ?? [])
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
                    {(admin.data?.nodeAnalytics ?? []).filter((a) => a.starts > 0).length === 0 && (
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
