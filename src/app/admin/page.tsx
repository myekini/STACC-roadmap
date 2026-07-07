'use client';

/**
 * Admin panel (spec §1.3/§1.11): member list with cohort filter, node-level
 * drill-down per member, stuck alerts (14+ idle days), CSV export, and
 * module start-vs-completion analytics. UI is role-gated here; the data is
 * gated server-side by RLS either way.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Download, ShieldCheck, Users } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { exportMembersCsv, useAdminData, type MemberRow } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { StatusMarker } from '@/components/roadmap/bits';
import { cn } from '@/lib/utils';

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : 'never';
}

function MemberDrilldown({ member, onClose }: { member: MemberRow | null; onClose: () => void }) {
  const { paths, nodesByPath } = useUserData();
  if (!member) return null;
  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto no-scrollbar">
        <div className="border-b border-outline-variant bg-navy/60 p-6 pb-5">
          <p className="micro-label text-cyan">{`// member · ${member.cohort ?? 'no cohort'}`}</p>
          <SheetTitle className="mt-2 font-display text-2xl font-bold">{member.username}</SheetTitle>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-code text-[10px] lowercase text-on-surface-variant">
            <span>overall {member.overallPct}%</span>
            <span>last active {fmtDate(member.lastActiveAt).toLowerCase()}</span>
            <span>joined {fmtDate(member.joinedAt).toLowerCase()}</span>
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
  const router = useRouter();
  const admin = useAdminData(userData);
  const [cohort, setCohort] = useState<string | null>(null);
  const [view, setView] = useState<'members' | 'stuck' | 'analytics'>('members');
  const [selected, setSelected] = useState<MemberRow | null>(null);

  const { paths, nodes, isAdmin, isLoading } = userData;

  const members = useMemo(() => {
    const all = admin.data?.members ?? [];
    return cohort ? all.filter((m) => m.cohort === cohort) : all;
  }, [admin.data?.members, cohort]);

  if (!isLoading && !isAdmin) {
    router.replace('/roadmap');
    return null;
  }

  const pathTitles = Object.fromEntries(paths.filter((p) => p.id !== 'foundations').map((p) => [p.id, p.title] as const));
  const nodePathById = Object.fromEntries(nodes.map((n) => [n.id, n.path_id] as const));
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n] as const));
  const stuckCount = admin.data?.stuck.length ?? 0;

  const tabs = [
    { id: 'members' as const, label: `members · ${members.length}`, icon: Users },
    { id: 'stuck' as const, label: `stuck · ${stuckCount}`, icon: AlertTriangle },
    { id: 'analytics' as const, label: 'modules', icon: ShieldCheck },
  ];

  const list = view === 'stuck' ? members.filter((m) => m.isStuck) : members;

  return (
    <div className="space-y-6 py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="micro-label text-primary-neon">{'// admin · cohort health'}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-4xl">Member progress</h1>
        </div>
        <Button variant="outline" onClick={() => exportMembersCsv(list, pathTitles, nodePathById)}>
          <Download /> export csv
        </Button>
      </div>

      {/* Tabs + cohort filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-outline-variant bg-surface/80 p-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                'flex items-center gap-2 border px-3 py-2 font-code text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                view === tab.id ? 'border-cyan/50 bg-cyan/10 text-cyan' : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
                tab.id === 'stuck' && stuckCount > 0 && view !== 'stuck' && 'text-error',
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        {(admin.data?.cohorts.length ?? 0) > 0 && view !== 'analytics' && (
          <div className="flex items-center gap-1">
            <span className="micro-label mr-1 text-outline">cohort</span>
            <button
              type="button"
              onClick={() => setCohort(null)}
              className={cn('border px-2.5 py-1.5 font-code text-[10px] font-semibold uppercase', !cohort ? 'border-primary/50 bg-primary/10 text-primary-neon' : 'border-transparent text-on-surface-variant hover:border-outline-variant')}
            >
              all
            </button>
            {admin.data?.cohorts.map((c) => (
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
        )}
      </div>

      {/* Content */}
      {admin.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse border border-outline-variant/40 bg-surface/50" />)}
        </div>
      ) : view === 'analytics' ? (
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
      ) : (
        <div className="overflow-x-auto border border-outline-variant bg-surface">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                {['member', 'cohort', 'overall', 'in progress', 'last active', ''].map((h, i) => (
                  <th key={i} className="micro-label px-4 py-3 text-outline">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {list.map((m) => (
                <tr key={m.id} className={cn('cursor-pointer transition-colors hover:bg-surface-container-low/60', m.isStuck && 'bg-error/[0.04]')} onClick={() => setSelected(m)}>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-low font-code text-[10px] font-bold uppercase text-on-surface-variant">
                        {m.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          m.username.slice(0, 2)
                        )}
                      </span>
                      <span className="text-xs font-semibold text-on-surface">{m.username}</span>
                      {m.isStuck && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-code text-[10px] uppercase text-on-surface-variant">{m.cohort ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-1 w-20 bg-surface-container-high">
                        <span className="block h-full bg-cyan" style={{ width: `${m.overallPct}%` }} />
                      </span>
                      <span className="font-code text-[10px] font-semibold text-on-surface-variant">{m.overallPct}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-code text-xs text-on-surface-variant">{m.inProgressNodes.length || '—'}</td>
                  <td className={cn('px-4 py-3 font-code text-[11px]', m.isStuck ? 'font-semibold text-error' : 'text-on-surface-variant')}>{fmtDate(m.lastActiveAt)}</td>
                  <td className="px-4 py-3 text-right font-code text-[10px] uppercase text-outline">view →</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-code text-xs lowercase text-outline">{view === 'stuck' ? '// nobody is stuck — good sign' : '// no members yet'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <MemberDrilldown member={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
