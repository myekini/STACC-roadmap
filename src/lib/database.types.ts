// Supabase database types for the Stacc Roadmap Tracker schema
// (supabase/migrations/0001_init.sql). Hand-authored until CLI type
// generation is wired up; keep in sync with the migrations.

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'complete';
export type StoredNodeStatus = 'in_progress' | 'complete';
export type ResourceType = 'article' | 'video' | 'course' | 'project' | 'documentation';
export type TaskType = 'read' | 'watch' | 'build' | 'quiz';
export type Role = 'member' | 'admin';
export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface QuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  rank: Rank;
  role: Role;
  cohort_label: string | null;
  created_at: string;
  last_active_at: string;
}

export interface PathRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  order: number;
  requires_paths: string[];
}

export interface NodeRow {
  id: string;
  slug: string;
  path_id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  order: number;
  est_hours: number;
  xp_reward: number;
  skills: string[];
  created_at: string;
}

export interface NodePrerequisiteRow {
  node_id: string;
  prerequisite_id: string;
}

export interface ResourceRow {
  id: string;
  node_id: string;
  name: string;
  type: ResourceType;
  platform: string;
  url: string;
  cost: 'free' | 'paid';
  avg_rating: number;
  rating_count: number;
  created_at: string;
}

export interface TaskRow {
  id: string;
  node_id: string;
  description: string;
  type: TaskType;
  order: number;
  quiz: QuizPayload | null;
}

export interface UserPathRow {
  user_id: string;
  path_id: string;
  selected_at: string;
}

export interface UserProgressRow {
  id: string;
  user_id: string;
  node_id: string;
  status: StoredNodeStatus;
  started_at: string;
  completed_at: string | null;
}

export interface TaskCompletionRow {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
}

export interface ResourceRatingRow {
  id: string;
  user_id: string;
  resource_id: string;
  rating: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string }; Update: Partial<ProfileRow> };
      paths: { Row: PathRow; Insert: PathRow; Update: Partial<PathRow> };
      nodes: { Row: NodeRow; Insert: Partial<NodeRow>; Update: Partial<NodeRow> };
      node_prerequisites: { Row: NodePrerequisiteRow; Insert: NodePrerequisiteRow; Update: Partial<NodePrerequisiteRow> };
      resources: { Row: ResourceRow; Insert: Partial<ResourceRow>; Update: Partial<ResourceRow> };
      tasks: { Row: TaskRow; Insert: Partial<TaskRow>; Update: Partial<TaskRow> };
      user_paths: { Row: UserPathRow; Insert: UserPathRow; Update: Partial<UserPathRow> };
      user_progress: { Row: UserProgressRow; Insert: Partial<UserProgressRow>; Update: Partial<UserProgressRow> };
      task_completions: { Row: TaskCompletionRow; Insert: Partial<TaskCompletionRow>; Update: Partial<TaskCompletionRow> };
      resource_ratings: { Row: ResourceRatingRow; Insert: Partial<ResourceRatingRow>; Update: Partial<ResourceRatingRow> };
    };
    Functions: {
      start_node: { Args: { p_node_slug: string }; Returns: undefined };
      complete_task: { Args: { p_task: string }; Returns: StoredNodeStatus };
      rate_resource: { Args: { p_resource: string; p_rating: number }; Returns: undefined };
      node_is_unlocked: { Args: { p_user: string; p_node: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      calc_rank: { Args: { xp: number }; Returns: Rank };
    };
  };
}
