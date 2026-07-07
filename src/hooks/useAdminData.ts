'use client';

/**
 * Admin panel data: every member with progress rollups, cohort labels, last
 * activity, and stuck detection (spec §1.11: no roadmap activity for 14+ days —
 * logins don't count). Supabase mode reads all members via the admin RLS
 * policies; demo mode synthesizes one member from local progress so the panel
 * is previewable offline.
 */
import { useQuery } from '@tanstack/react-query';
import { hasSupabaseEnv, supabase } from '@/utils/supabase/client';
import type { UserData } from '@/hooks/useUserData';

const STUCK_DAYS = 14;

export interface MemberRow {
  id: string;
  username: string;
  avatar_url: string;
  cohort: string | null;
  joinedAt: string | null;
  /** last roadmap activity (module completion / start) — logins don't count */
  lastActiveAt: string | null;
  completedNodes: Record<string, string>; // nodeId -> completed_at
  inProgressNodes: string[];
  overallPct: number;
  isStuck: boolean;
}

export interface NodeAnalytics {
  nodeId: string;
  starts: number;
  completions: number;
}

export interface AdminData {
  members: MemberRow[];
  cohorts: string[];
  stuck: MemberRow[];
  nodeAnalytics: NodeAnalytics[];
}

function daysSince(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

export function useAdminData(userData: UserData) {
  const { isAdmin, nodes, progress } = userData;
  const totalNodes = nodes.length;

  return useQuery<AdminData>({
    queryKey: ['admin', hasSupabaseEnv, totalNodes],
    enabled: isAdmin && totalNodes > 0,
    queryFn: async () => {
      if (!hasSupabaseEnv) {
        // Demo: the guest is the only member.
        const completed = progress.completedNodes;
        const dates = Object.values(completed).sort();
        const lastActiveAt = dates[dates.length - 1] ?? null;
        const member: MemberRow = {
          id: 'guest',
          username: 'Guest Dev (you)',
          avatar_url: '',
          cohort: 'S1',
          joinedAt: null,
          lastActiveAt,
          completedNodes: completed,
          inProgressNodes: progress.startedNodes,
          overallPct: totalNodes ? Math.round((Object.keys(completed).length / totalNodes) * 100) : 0,
          isStuck: Object.keys(completed).length > 0 && daysSince(lastActiveAt) > STUCK_DAYS,
        };
        return {
          members: [member],
          cohorts: ['S1'],
          stuck: member.isStuck ? [member] : [],
          nodeAnalytics: nodes.map((n) => ({
            nodeId: n.id,
            starts: progress.startedNodes.includes(n.id) || completed[n.id] ? 1 : 0,
            completions: completed[n.id] ? 1 : 0,
          })),
        };
      }

      const [profiles, allProgress] = await Promise.all([
        supabase.from('profiles').select('id,username,avatar_url,cohort_label,created_at'),
        supabase.from('user_progress').select('user_id,node_id,status,started_at,completed_at'),
      ]);
      if (profiles.error) throw profiles.error;
      if (allProgress.error) throw allProgress.error;

      const byUser: Record<string, { completed: Record<string, string>; inProgress: string[]; last: string | null }> = {};
      const analytics: Record<string, NodeAnalytics> = {};
      for (const row of allProgress.data) {
        const bucket = (byUser[row.user_id] ??= { completed: {}, inProgress: [], last: null });
        const stamp = (row.completed_at ?? row.started_at) as string | null;
        if (stamp && (!bucket.last || stamp > bucket.last)) bucket.last = stamp;
        const stat = (analytics[row.node_id] ??= { nodeId: row.node_id, starts: 0, completions: 0 });
        stat.starts += 1;
        if (row.status === 'complete') {
          bucket.completed[row.node_id] = row.completed_at ?? '';
          stat.completions += 1;
        } else {
          bucket.inProgress.push(row.node_id);
        }
      }

      const members: MemberRow[] = profiles.data.map((p) => {
        const bucket = byUser[p.id] ?? { completed: {}, inProgress: [], last: null };
        const hasActivity = Object.keys(bucket.completed).length > 0 || bucket.inProgress.length > 0;
        const idleFor = daysSince(bucket.last ?? (p.created_at as string));
        return {
          id: p.id,
          username: p.username,
          avatar_url: p.avatar_url ?? '',
          cohort: p.cohort_label ?? null,
          joinedAt: p.created_at ?? null,
          lastActiveAt: bucket.last,
          completedNodes: bucket.completed,
          inProgressNodes: bucket.inProgress,
          overallPct: totalNodes ? Math.round((Object.keys(bucket.completed).length / totalNodes) * 100) : 0,
          // Stuck: joined/worked before, but no roadmap activity in 14+ days.
          isStuck: idleFor > STUCK_DAYS && (hasActivity || daysSince(p.created_at as string) > STUCK_DAYS),
        };
      });

      members.sort((a, b) => b.overallPct - a.overallPct);
      const cohorts = Array.from(new Set(members.map((m) => m.cohort).filter((c): c is string => !!c))).sort();

      return {
        members,
        cohorts,
        stuck: members.filter((m) => m.isStuck),
        nodeAnalytics: Object.values(analytics),
      };
    },
  });
}

/** Client-side CSV download of the (filtered) member list. */
export function exportMembersCsv(members: MemberRow[], pathTitles: Record<string, string>, nodePathById: Record<string, string>) {
  const paths = Object.keys(pathTitles);
  const header = ['username', 'cohort', 'overall_pct', ...paths.map((p) => `${pathTitles[p]} modules`), 'last_active', 'stuck'];
  const lines = members.map((m) => {
    const perPath = paths.map((p) => Object.keys(m.completedNodes).filter((n) => nodePathById[n] === p).length);
    return [
      `"${m.username.replaceAll('"', '""')}"`,
      m.cohort ?? '',
      m.overallPct,
      ...perPath,
      m.lastActiveAt ? m.lastActiveAt.slice(0, 10) : 'never',
      m.isStuck ? 'yes' : 'no',
    ].join(',');
  });
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stacc-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
