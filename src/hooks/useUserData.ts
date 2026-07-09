'use client';

/**
 * All user + content state for the Roadmap Tracker.
 * Two backends with identical semantics:
 *  - Supabase mode (env present): content from DB, progress via security-definer
 *    RPCs (start_node / complete_task / rate_resource). XP is server-owned.
 *  - Demo mode (no env): content from src/config/roadmap.ts, progress in
 *    localStorage, XP derived from completed nodes.
 * Node status is always derived: locked | available | in_progress | complete.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabase } from '@/utils/supabase/client';
import {
  NODES as LOCAL_NODES,
  PATHS as LOCAL_PATHS,
  PREREQUISITES as LOCAL_PREREQS,
  RESOURCES as LOCAL_RESOURCES,
  TASKS as LOCAL_TASKS,
} from '@/config/roadmap';
import type {
  NodeRow,
  NodeStatus,
  PathRow,
  ResourceRow,
  TaskRow,
} from '@/lib/database.types';

// ── Local persistence ───────────────────────────────────────
const LS = {
  activePath: 'stacc.v2.activePath',
  completedTasks: 'stacc.v2.completedTasks', // string[]
  completedNodes: 'stacc.v2.completedNodes', // Record<nodeId, isoDate>
  startedNodes: 'stacc.v2.startedNodes', // string[]
  ratings: 'stacc.v2.ratings', // Record<resourceId, rating>
  profile: 'stacc.v2.profile', // { username }
  evidence: 'stacc.v2.evidence', // Record<taskId, url>
};

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

// Gamification is deliberately minimal: completion % and a day-streak.
// XP/rank still accrue server-side (schema unchanged) but are not surfaced.

export interface RoadmapContent {
  paths: PathRow[];
  nodes: NodeRow[];
  resources: ResourceRow[];
  tasks: TaskRow[];
  prereqs: Record<string, string[]>; // nodeId -> prerequisite nodeIds
}

export interface ProgressState {
  completedNodes: Record<string, string>; // nodeId -> completed_at
  startedNodes: string[];
  completedTasks: string[];
  ratings: Record<string, number>; // resourceId -> my rating
  evidence: Record<string, string>; // taskId -> shipped evidence url
}

const EMPTY_PROGRESS: ProgressState = {
  completedNodes: {},
  startedNodes: [],
  completedTasks: [],
  ratings: {},
  evidence: {},
};

// Demo mode grants admin so the founder can preview the admin panel offline.
const GUEST = { id: 'guest', username: 'Guest Dev', avatar_url: '', role: 'admin' as 'member' | 'admin' };

export function useUserData() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const connected = hasSupabaseEnv;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!connected) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [connected, queryClient]);

  // ── Content (paths / nodes / resources / tasks / prereqs) ──
  const content = useQuery<RoadmapContent>({
    queryKey: ['content', connected, !!userId],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!connected) {
        return { paths: LOCAL_PATHS, nodes: LOCAL_NODES, resources: LOCAL_RESOURCES, tasks: LOCAL_TASKS, prereqs: LOCAL_PREREQS };
      }
      const [paths, nodes, prereqs] = await Promise.all([
        supabase.from('paths').select('*').order('order'),
        supabase.from('nodes').select('*').order('order'),
        supabase.from('node_prerequisites').select('*'),
      ]);
      if (paths.error) throw paths.error;
      if (nodes.error) throw nodes.error;
      if (prereqs.error) throw prereqs.error;

      // Resources/tasks are auth-gated (spec §1.9); logged-out visitors get structure only.
      let resources: ResourceRow[] = [];
      let tasks: TaskRow[] = [];
      if (userId) {
        const [r, t] = await Promise.all([
          supabase.from('resources').select('*'),
          supabase.from('tasks').select('*').order('order'),
        ]);
        if (r.error) throw r.error;
        if (t.error) throw t.error;
        resources = r.data as ResourceRow[];
        tasks = t.data as TaskRow[];
      }

      const prereqMap: Record<string, string[]> = {};
      for (const edge of prereqs.data as { node_id: string; prerequisite_id: string }[]) {
        (prereqMap[edge.node_id] ??= []).push(edge.prerequisite_id);
      }
      return { paths: paths.data as PathRow[], nodes: nodes.data as NodeRow[], resources, tasks, prereqs: prereqMap };
    },
  });

  // ── Profile ─────────────────────────────────────────────
  const profile = useQuery({
    queryKey: ['profile', userId],
    enabled: connected ? !!userId : true,
    queryFn: async () => {
      if (connected && userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) throw error;
        return {
          id: data.id as string,
          username: data.username as string,
          avatar_url: data.avatar_url as string,
          role: (data.role ?? 'member') as 'member' | 'admin',
        };
      }
      const local = readLS<{ username: string }>(LS.profile, { username: GUEST.username });
      return { ...GUEST, username: local.username };
    },
  });

  // ── Active path ─────────────────────────────────────────
  const activePathQuery = useQuery<string | null>({
    queryKey: ['activePath', userId],
    queryFn: async () => {
      if (connected && userId) {
        const { data, error } = await supabase
          .from('user_paths').select('path_id').eq('user_id', userId)
          .order('selected_at', { ascending: false }).limit(1);
        if (error) throw error;
        return data.length ? (data[0].path_id as string) : null;
      }
      return readLS<string | null>(LS.activePath, null);
    },
  });

  // ── Progress ────────────────────────────────────────────
  const progress = useQuery<ProgressState>({
    queryKey: ['progress', userId],
    queryFn: async () => {
      if (connected && userId) {
        const [prog, comps, ratings] = await Promise.all([
          supabase.from('user_progress').select('node_id,status,completed_at').eq('user_id', userId),
          supabase.from('task_completions').select('task_id,evidence_url').eq('user_id', userId),
          supabase.from('resource_ratings').select('resource_id,rating').eq('user_id', userId),
        ]);
        if (prog.error) throw prog.error;
        if (comps.error) throw comps.error;
        if (ratings.error) throw ratings.error;
        const completedNodes: Record<string, string> = {};
        const startedNodes: string[] = [];
        for (const row of prog.data) {
          if (row.status === 'complete') completedNodes[row.node_id] = row.completed_at ?? '';
          else startedNodes.push(row.node_id);
        }
        return {
          completedNodes,
          startedNodes,
          completedTasks: comps.data.map((c) => c.task_id as string),
          ratings: Object.fromEntries(ratings.data.map((r) => [r.resource_id, r.rating])),
          evidence: Object.fromEntries(
            comps.data.filter((c) => c.evidence_url).map((c) => [c.task_id, c.evidence_url as string]),
          ),
        };
      }
      if (!connected) {
        return {
          completedNodes: readLS(LS.completedNodes, EMPTY_PROGRESS.completedNodes),
          startedNodes: readLS(LS.startedNodes, EMPTY_PROGRESS.startedNodes),
          completedTasks: readLS(LS.completedTasks, EMPTY_PROGRESS.completedTasks),
          ratings: readLS(LS.ratings, EMPTY_PROGRESS.ratings),
          evidence: readLS(LS.evidence, EMPTY_PROGRESS.evidence),
        };
      }
      return EMPTY_PROGRESS; // connected but logged out
    },
  });

  const data = content.data;
  const prog = progress.data ?? EMPTY_PROGRESS;

  // ── Derived: node status (locked/available/in_progress/complete) ──
  const nodesByPath = useMemo(() => {
    const map: Record<string, NodeRow[]> = {};
    for (const node of data?.nodes ?? []) (map[node.path_id] ??= []).push(node);
    return map;
  }, [data?.nodes]);

  const pathFullyComplete = useCallback(
    (pathId: string) => (nodesByPath[pathId] ?? []).every((n) => prog.completedNodes[n.id]),
    [nodesByPath, prog.completedNodes],
  );

  const pathUnlocked = useCallback(
    (pathId: string) => {
      const path = data?.paths.find((p) => p.id === pathId);
      return (path?.requires_paths ?? []).every(pathFullyComplete);
    },
    [data?.paths, pathFullyComplete],
  );

  const nodeStatus = useCallback(
    (nodeId: string): NodeStatus => {
      if (prog.completedNodes[nodeId]) return 'complete';
      const node = data?.nodes.find((n) => n.id === nodeId);
      if (node && !pathUnlocked(node.path_id)) return 'locked';
      const unmet = (data?.prereqs[nodeId] ?? []).some((p) => !prog.completedNodes[p]);
      if (unmet) return 'locked';
      return prog.startedNodes.includes(nodeId) ? 'in_progress' : 'available';
    },
    [data?.nodes, data?.prereqs, pathUnlocked, prog.completedNodes, prog.startedNodes],
  );

  // Activity by date: modules completed per day (drives heatmap + streak).
  const activity = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const when of Object.values(prog.completedNodes)) {
      if (!when) continue;
      const day = when.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }
    return byDay;
  }, [prog.completedNodes]);

  // Current streak: consecutive active days ending today or yesterday.
  const streak = useMemo(() => {
    let days = 0;
    const cursor = new Date();
    if (!activity[cursor.toISOString().slice(0, 10)]) cursor.setDate(cursor.getDate() - 1);
    while (activity[cursor.toISOString().slice(0, 10)]) {
      days += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return days;
  }, [activity]);

  // ── Mutations ───────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['progress'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  const selectPath = useMutation({
    mutationFn: async (pathId: string) => {
      if (connected && userId) {
        const { error } = await supabase.from('user_paths').upsert({ user_id: userId, path_id: pathId, selected_at: new Date().toISOString() });
        if (error) throw error;
      } else {
        writeLS(LS.activePath, pathId);
      }
      return pathId;
    },
    onSuccess: (pathId) => queryClient.setQueryData(['activePath', userId], pathId),
  }).mutateAsync;

  const startNode = useMutation({
    mutationFn: async (node: NodeRow) => {
      if (nodeStatus(node.id) !== 'available') return;
      if (connected && userId) {
        const { error } = await supabase.rpc('start_node', { p_node_slug: node.slug });
        if (error) throw error;
      } else {
        const started = readLS(LS.startedNodes, EMPTY_PROGRESS.startedNodes);
        if (!started.includes(node.id)) writeLS(LS.startedNodes, [...started, node.id]);
      }
    },
    onSuccess: invalidate,
  }).mutateAsync;

  /**
   * Completes a task; returns 'complete' when it was the node's last task.
   * Build tasks must ship evidence: a public URL (repo / live app / writeup).
   */
  const completeTask = useMutation({
    mutationFn: async ({ task, evidenceUrl }: { task: TaskRow; evidenceUrl?: string }): Promise<'in_progress' | 'complete'> => {
      if (task.type === 'build' && !/^https?:\/\//i.test(evidenceUrl ?? '')) {
        throw new Error('Build tasks require an evidence URL (https://…)');
      }
      if (connected && userId) {
        const { data: status, error } = await supabase.rpc('complete_task', { p_task: task.id, p_evidence: evidenceUrl ?? null });
        if (error) throw error;
        return status as 'in_progress' | 'complete';
      }
      if (evidenceUrl) {
        writeLS(LS.evidence, { ...readLS(LS.evidence, EMPTY_PROGRESS.evidence), [task.id]: evidenceUrl });
      }
      const completedTasks = readLS(LS.completedTasks, EMPTY_PROGRESS.completedTasks);
      if (!completedTasks.includes(task.id)) writeLS(LS.completedTasks, [...completedTasks, task.id]);
      const updated = readLS(LS.completedTasks, EMPTY_PROGRESS.completedTasks);
      const siblings = (data?.tasks ?? []).filter((t) => t.node_id === task.node_id);
      const allDone = siblings.every((t) => updated.includes(t.id));
      if (allDone) {
        const completedNodes = readLS(LS.completedNodes, EMPTY_PROGRESS.completedNodes);
        if (!completedNodes[task.node_id]) {
          completedNodes[task.node_id] = new Date().toISOString();
          writeLS(LS.completedNodes, completedNodes);
        }
        return 'complete';
      }
      const started = readLS(LS.startedNodes, EMPTY_PROGRESS.startedNodes);
      if (!started.includes(task.node_id)) writeLS(LS.startedNodes, [...started, task.node_id]);
      return 'in_progress';
    },
    onSuccess: invalidate,
  }).mutateAsync;

  const rateResource = useMutation({
    mutationFn: async ({ resourceId, rating }: { resourceId: string; rating: number }) => {
      if (connected && userId) {
        const { error } = await supabase.rpc('rate_resource', { p_resource: resourceId, p_rating: rating });
        if (error) throw error;
      } else {
        const ratings = readLS(LS.ratings, EMPTY_PROGRESS.ratings);
        writeLS(LS.ratings, { ...ratings, [resourceId]: rating });
      }
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  }).mutateAsync;

  // ── Auth ────────────────────────────────────────────────
  const signInWithDiscord = async () => {
    if (!connected) return;
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  /** Email/password sign-in (admin accounts). Returns an error message or null. */
  const signInWithPassword = async (email: string, password: string): Promise<string | null> => {
    if (!connected) return 'Supabase is not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signOut = async () => {
    if (connected) await supabase.auth.signOut();
    setSession(null);
    queryClient.invalidateQueries();
  };

  return {
    // mode
    isSupabaseConnected: connected,
    isAuthenticated: connected ? !!session : true,
    isLoading: content.isLoading || progress.isLoading || profile.isLoading,
    // identity
    user: profile.data ?? GUEST,
    // Demo mode is admin (offline preview); connected mode requires a real admin profile.
    isAdmin: connected ? profile.data?.role === 'admin' : true,
    // content
    paths: data?.paths ?? [],
    nodes: data?.nodes ?? [],
    nodesByPath,
    resources: data?.resources ?? [],
    tasks: data?.tasks ?? [],
    prereqs: data?.prereqs ?? {},
    // progress
    progress: prog,
    activity,
    streak,
    nodeStatus,
    pathUnlocked,
    pathFullyComplete,
    activePath: activePathQuery.data ?? null,
    hasSelectedPath: Boolean(activePathQuery.data),
    // actions
    selectPath,
    startNode,
    completeTask,
    rateResource,
    signInWithDiscord,
    signInWithPassword,
    signOut,
  };
}

export type UserData = ReturnType<typeof useUserData>;
