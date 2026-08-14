'use client';

/**
 * Admin-only curriculum authoring — separate from useUserData (member state)
 * because these mutations touch shared content, not per-user data. Requires
 * a connected Supabase project: curriculum content is compiled into the app
 * bundle in localStorage demo mode (src/config/roadmap.ts), so there is no
 * runtime target to write to when `connected` is false. Callers should show
 * a read-only notice instead of the editors in that case.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasSupabaseEnv, supabase } from '@/utils/supabase/client';
import type {
  ChallengePayload,
  NodeRow,
  PathRow,
  QuizPayload,
  ResourceRow,
  ResourceType,
  TaskRow,
  TaskType,
} from '@/lib/database.types';

function invalidateContent(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['content'] });
}

export function useCurriculumAdmin() {
  const queryClient = useQueryClient();
  const connected = hasSupabaseEnv;

  const upsertPath = useMutation({
    mutationFn: async (path: Pick<PathRow, 'id' | 'title' | 'description' | 'icon' | 'tags' | 'order' | 'requires_paths'>) => {
      const { data, error } = await supabase.rpc('admin_upsert_path', {
        p_id: path.id,
        p_title: path.title,
        p_description: path.description,
        p_icon: path.icon,
        p_tags: path.tags,
        p_order: path.order,
        p_requires_paths: path.requires_paths,
      });
      if (error) throw error;
      return data as PathRow;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const deletePath = useMutation({
    mutationFn: async (pathId: string) => {
      const { error } = await supabase.rpc('admin_delete_path', { p_id: pathId });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const reorderPaths = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const { error } = await supabase.rpc('admin_reorder_paths', { p_ordered_ids: orderedIds });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const upsertNode = useMutation({
    mutationFn: async (node: {
      id: string | null;
      path_id: string;
      slug: string;
      name: string;
      subtitle: string;
      description: string;
      icon: string;
      order: number;
      est_hours: number;
      xp_reward: number;
      skills: string[];
    }) => {
      const { data, error } = await supabase.rpc('admin_upsert_node', {
        p_id: node.id,
        p_path_id: node.path_id,
        p_slug: node.slug,
        p_name: node.name,
        p_subtitle: node.subtitle,
        p_description: node.description,
        p_icon: node.icon,
        p_order: node.order,
        p_est_hours: node.est_hours,
        p_xp_reward: node.xp_reward,
        p_skills: node.skills,
      });
      if (error) throw error;
      return data as NodeRow;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const deleteNode = useMutation({
    mutationFn: async (nodeId: string) => {
      const { error } = await supabase.rpc('admin_delete_node', { p_id: nodeId });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const reorderNodes = useMutation({
    mutationFn: async ({ pathId, orderedIds }: { pathId: string; orderedIds: string[] }) => {
      const { error } = await supabase.rpc('admin_reorder_nodes', { p_path_id: pathId, p_ordered_ids: orderedIds });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const setNodePrerequisites = useMutation({
    mutationFn: async ({ nodeId, prerequisiteIds }: { nodeId: string; prerequisiteIds: string[] }) => {
      const { error } = await supabase.rpc('admin_set_node_prerequisites', { p_node_id: nodeId, p_prerequisite_ids: prerequisiteIds });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const upsertResource = useMutation({
    mutationFn: async (resource: {
      id: string | null;
      node_id: string;
      name: string;
      type: ResourceType;
      platform: string;
      url: string;
      cost: 'free' | 'paid';
    }) => {
      const { data, error } = await supabase.rpc('admin_upsert_resource', {
        p_id: resource.id,
        p_node_id: resource.node_id,
        p_name: resource.name,
        p_type: resource.type,
        p_platform: resource.platform,
        p_url: resource.url,
        p_cost: resource.cost,
      });
      if (error) throw error;
      return data as ResourceRow;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const deleteResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase.rpc('admin_delete_resource', { p_id: resourceId });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const upsertTask = useMutation({
    mutationFn: async (task: {
      id: string | null;
      node_id: string;
      description: string;
      type: TaskType;
      order: number;
      quiz: QuizPayload | null;
      challenge: ChallengePayload | null;
      project_requirements: TaskRow['project_requirements'];
    }) => {
      const { data, error } = await supabase.rpc('admin_upsert_task', {
        p_id: task.id,
        p_node_id: task.node_id,
        p_description: task.description,
        p_type: task.type,
        p_order: task.order,
        p_quiz: task.quiz,
        p_challenge: task.challenge,
        p_project_requirements: task.project_requirements,
      });
      if (error) throw error;
      return data as TaskRow;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.rpc('admin_delete_task', { p_id: taskId });
      if (error) throw error;
    },
    onSuccess: () => invalidateContent(queryClient),
  });

  return {
    connected,
    upsertPath: upsertPath.mutateAsync,
    deletePath: deletePath.mutateAsync,
    reorderPaths: reorderPaths.mutateAsync,
    upsertNode: upsertNode.mutateAsync,
    deleteNode: deleteNode.mutateAsync,
    reorderNodes: reorderNodes.mutateAsync,
    setNodePrerequisites: setNodePrerequisites.mutateAsync,
    upsertResource: upsertResource.mutateAsync,
    deleteResource: deleteResource.mutateAsync,
    upsertTask: upsertTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    isMutating:
      upsertPath.isPending || deletePath.isPending || reorderPaths.isPending ||
      upsertNode.isPending || deleteNode.isPending || reorderNodes.isPending ||
      setNodePrerequisites.isPending || upsertResource.isPending || deleteResource.isPending ||
      upsertTask.isPending || deleteTask.isPending,
  };
}
