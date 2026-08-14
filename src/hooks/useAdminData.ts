'use client';

/**
 * Admin panel data: paginated members with progress rollups, cohort labels,
 * last activity, and stuck detection (spec §1.11: no roadmap activity for
 * 14+ days — logins don't count). Supabase mode aggregates server-side via
 * the admin_* RPCs (docs/ARCHITECTURE.md production-readiness table — the
 * previous client-side aggregation pulled the entire profiles/user_progress
 * tables into the browser unpaginated, which silently truncates past
 * PostgREST's 1000-row default and doesn't hold at the 10k-user scale
 * target). Demo mode synthesizes one member from local progress so the
 * panel is previewable offline.
 */
import { useQuery } from '@tanstack/react-query';
import { hasSupabaseEnv, supabase } from '@/utils/supabase/client';
import type { UserData } from '@/hooks/useUserData';
import type { AdminMemberRollupRow } from '@/lib/database.types';

const STUCK_DAYS = 14;
export const MEMBERS_PAGE_SIZE = 50;
const EXPORT_LIMIT = 20_000;

export interface MemberRow {
  id: string;
  username: string;
  avatar_url: string;
  githubUsername?: string | null;
  cohort: string | null;
  joinedAt: string | null;
  lastActiveAt: string | null;
  completedNodes: Record<string, string>;
  inProgressNodes: string[];
  overallPct: number;
  isStuck: boolean;
}

export interface NodeAnalytics {
  nodeId: string;
  starts: number;
  completions: number;
}

function daysSince(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

function demoMember(userData: UserData): MemberRow {
  const { progress, nodes } = userData;
  const completed = progress.completedNodes;
  const dates = Object.values(completed).sort();
  const lastActiveAt = dates[dates.length - 1] ?? null;
  return {
    id: 'guest',
    username: 'Guest Dev (you)',
    avatar_url: '',
    githubUsername: null,
    cohort: 'S1',
    joinedAt: null,
    lastActiveAt,
    completedNodes: completed,
    inProgressNodes: progress.startedNodes,
    overallPct: nodes.length ? Math.round((Object.keys(completed).length / nodes.length) * 100) : 0,
    isStuck: Object.keys(completed).length > 0 && daysSince(lastActiveAt) > STUCK_DAYS,
  };
}

/* ── Paginated, filtered member list ── */
export interface MemberFilters {
  search?: string;
  cohort?: string | null;
  stuckOnly?: boolean;
  page: number;
  pageSize?: number;
}

export function useAdminMembers(userData: UserData, filters: MemberFilters) {
  const { isAdmin, nodes } = userData;
  const totalNodes = nodes.length;
  const pageSize = filters.pageSize ?? MEMBERS_PAGE_SIZE;

  return useQuery<{ members: MemberRow[]; totalCount: number }>({
    queryKey: ['admin-members', hasSupabaseEnv, totalNodes, filters.search, filters.cohort, filters.stuckOnly, filters.page, pageSize],
    enabled: isAdmin && totalNodes > 0,
    queryFn: async () => {
      if (!hasSupabaseEnv) {
        const member = demoMember(userData);
        const members = filters.stuckOnly ? (member.isStuck ? [member] : []) : [member];
        return { members, totalCount: members.length };
      }

      const { data, error } = await supabase.rpc('admin_member_rollup', {
        p_total_nodes: totalNodes,
        p_search: filters.search?.trim() || null,
        p_cohort: filters.cohort || null,
        p_stuck_only: Boolean(filters.stuckOnly),
        p_limit: pageSize,
        p_offset: filters.page * pageSize,
      });
      if (error) throw error;

      const rows = (data ?? []) as AdminMemberRollupRow[];
      const members: MemberRow[] = rows.map((r) => ({
        id: r.id,
        username: r.username,
        avatar_url: r.avatar_url ?? '',
        githubUsername: r.github_username,
        cohort: r.cohort,
        joinedAt: r.joined_at,
        lastActiveAt: r.last_active_at,
        completedNodes: r.completed_nodes ?? {},
        inProgressNodes: r.in_progress_nodes ?? [],
        overallPct: r.overall_pct,
        isStuck: r.is_stuck,
      }));
      return { members, totalCount: rows[0]?.total_count ?? 0 };
    },
  });
}

/* ── Overview stat cards ── */
export interface OverviewStats {
  totalMembers: number;
  activeThisWeek: number;
  avgCompletionPct: number;
  stuckCount: number;
}

export function useAdminOverview(userData: UserData) {
  const { isAdmin, nodes } = userData;
  const totalNodes = nodes.length;

  return useQuery<OverviewStats>({
    queryKey: ['admin-overview', hasSupabaseEnv, totalNodes],
    enabled: isAdmin && totalNodes > 0,
    queryFn: async () => {
      if (!hasSupabaseEnv) {
        const member = demoMember(userData);
        return {
          totalMembers: 1,
          activeThisWeek: daysSince(member.lastActiveAt) <= 7 ? 1 : 0,
          avgCompletionPct: member.overallPct,
          stuckCount: member.isStuck ? 1 : 0,
        };
      }
      const { data, error } = await supabase.rpc('admin_overview_stats', { p_total_nodes: totalNodes });
      if (error) throw error;
      const row = data?.[0];
      return {
        totalMembers: row?.total_members ?? 0,
        activeThisWeek: row?.active_this_week ?? 0,
        avgCompletionPct: row?.avg_completion_pct ?? 0,
        stuckCount: row?.stuck_count ?? 0,
      };
    },
  });
}

/* ── Cohort list ── */
export function useAdminCohorts(userData: UserData) {
  const { isAdmin, nodes } = userData;
  return useQuery<string[]>({
    queryKey: ['admin-cohorts', hasSupabaseEnv, nodes.length],
    enabled: isAdmin && nodes.length > 0,
    queryFn: async () => {
      if (!hasSupabaseEnv) return ['S1'];
      const { data, error } = await supabase.rpc('admin_cohorts');
      if (error) throw error;
      return ((data ?? []) as { cohort: string }[]).map((r) => r.cohort);
    },
  });
}

/* ── Node-level analytics ── */
export function useAdminNodeAnalytics(userData: UserData) {
  const { isAdmin, nodes, progress } = userData;
  return useQuery<NodeAnalytics[]>({
    queryKey: ['admin-node-analytics', hasSupabaseEnv, nodes.length],
    enabled: isAdmin && nodes.length > 0,
    queryFn: async () => {
      if (!hasSupabaseEnv) {
        const completed = progress.completedNodes;
        return nodes.map((n) => ({
          nodeId: n.id,
          starts: progress.startedNodes.includes(n.id) || completed[n.id] ? 1 : 0,
          completions: completed[n.id] ? 1 : 0,
        }));
      }
      const { data, error } = await supabase.rpc('admin_node_analytics');
      if (error) throw error;
      return ((data ?? []) as { node_id: string; starts: number; completions: number }[])
        .map((r) => ({ nodeId: r.node_id, starts: Number(r.starts), completions: Number(r.completions) }));
    },
  });
}

/* ── CSV export — a bounded one-off fetch of up to EXPORT_LIMIT members,
   independent of whatever page is currently on screen. ── */
export async function exportAllMembersCsv(
  userData: UserData,
  pathTitles: Record<string, string>,
  nodePathById: Record<string, string>,
  filters: { search?: string; cohort?: string | null; stuckOnly?: boolean },
) {
  const totalNodes = userData.nodes.length;
  let members: MemberRow[];

  if (!hasSupabaseEnv) {
    members = [demoMember(userData)];
  } else {
    const { data, error } = await supabase.rpc('admin_member_rollup', {
      p_total_nodes: totalNodes,
      p_search: filters.search?.trim() || null,
      p_cohort: filters.cohort || null,
      p_stuck_only: Boolean(filters.stuckOnly),
      p_limit: EXPORT_LIMIT,
      p_offset: 0,
    });
    if (error) throw error;
    members = ((data ?? []) as AdminMemberRollupRow[]).map((r) => ({
      id: r.id, username: r.username, avatar_url: r.avatar_url ?? '', githubUsername: r.github_username,
      cohort: r.cohort, joinedAt: r.joined_at, lastActiveAt: r.last_active_at,
      completedNodes: r.completed_nodes ?? {}, inProgressNodes: r.in_progress_nodes ?? [],
      overallPct: r.overall_pct, isStuck: r.is_stuck,
    }));
  }

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
