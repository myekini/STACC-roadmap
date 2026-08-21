// Supabase database types for the Stacc Roadmap Tracker schema
// (supabase/migrations/0001_init.sql). Hand-authored until CLI type
// generation is wired up; keep in sync with the migrations.

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'complete';
export type StoredNodeStatus = 'in_progress' | 'complete';
export type ResourceType = 'article' | 'video' | 'course' | 'project' | 'documentation';
export type TaskType = 'read' | 'watch' | 'practice' | 'build' | 'quiz' | 'challenge';
export type Role = 'member' | 'admin';
export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizPayload {
  questions: QuizQuestion[];
}

/**
 * In-browser Python kata: starterCode loads into the editor, testCode runs
 * after it in the same Pyodide interpreter and must complete without raising
 * (plain `assert` statements) for the task to pass. No network/package
 * installs — stdlib only, so it stays a client-only, zero-infra runtime.
 */
export interface PythonChallengePayload {
  language: 'python';
  prompt: string;
  starterCode: string;
  testCode: string;
}

/**
 * In-browser SQL kata: setupSql seeds a fresh in-memory SQLite db (sql.js,
 * WASM), starterCode loads into the editor as the query to write, and
 * passing means the query's result rows exactly match expectedRows in order.
 */
export interface SqlChallengePayload {
  language: 'sql';
  prompt: string;
  starterCode: string;
  setupSql: string;
  expectedRows: Record<string, unknown>[];
}

export type ChallengePayload = PythonChallengePayload | SqlChallengePayload;

export interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  rank: Rank;
  role: Role;
  cohort_label: string | null;
  github_username: string | null;
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
  created_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string;
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
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string;
}

export interface NodePrerequisiteRow {
  node_id: string;
  prerequisite_id: string;
}

export interface TopicRow {
  id: string;
  node_id: string;
  title: string;
  order: number;
  created_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string;
}

export interface ResourceRow {
  id: string;
  node_id: string;
  topic_id: string;
  order: number;
  name: string;
  type: ResourceType;
  platform: string;
  url: string;
  cost: 'free' | 'paid';
  avg_rating: number;
  rating_count: number;
  created_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string;
}

export interface TaskRow {
  id: string;
  node_id: string;
  description: string;
  type: TaskType;
  order: number;
  quiz: QuizPayload | null;
  challenge: ChallengePayload | null;
  resource_id?: string | null;
  lesson_title?: string | null;
  duration_minutes?: number | null;
  start_seconds?: number | null;
  end_seconds?: number | null;
  project_requirements?: {
    requiredPaths?: string[];
    requiredHeadings?: Record<string, string[]>;
    submissionMode?: 'commit' | 'pull_request';
  } | null;
  created_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string;
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
  evidence_url: string | null;
}

/** Shape returned by the get_public_profile RPC (migration 0002) */
export interface PublicProfilePayload {
  profile: { username: string; avatar_url: string; joined_at: string };
  shipped: {
    slug: string;
    name: string;
    subtitle: string;
    icon: string;
    path_id: string;
    path_title: string;
    est_hours: number;
    completed_at: string | null;
    evidence: { description: string; url: string }[];
  }[];
  /** path_id -> project repo url (migration 0004), for rendering shipped work as a build log */
  projects: Record<string, string>;
  activity: Record<string, number>;
}

export interface ResourceRatingRow {
  id: string;
  user_id: string;
  resource_id: string;
  rating: number;
  created_at: string;
}

/** One project repo per (user, path) — build-task evidence on that path accumulates into it. */
export interface ProjectRow {
  id: string;
  user_id: string;
  path_id: string;
  repo_url: string;
  github_repo_id: number | null;
  repo_owner: string | null;
  repo_name: string | null;
  default_branch: string;
  github_installation_id: number | null;
  connection_status: 'manual' | 'active' | 'suspended' | 'error';
  connected_at: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface ProjectSubmissionRow {
  id: string;
  project_id: string;
  user_id: string;
  task_id: string;
  commit_sha: string;
  commit_url: string;
  branch: string;
  status: 'pending' | 'verified' | 'needs_review' | 'rejected';
  checks: Record<string, boolean | string>;
  submitted_at: string;
  verified_at: string | null;
}

/** Per-(user, task) cooldown/window state for "Check my work" abuse guarding (migration 0011). */
export interface VerificationAttemptRow {
  user_id: string;
  task_id: string;
  attempted_at: string;
  window_started_at: string;
  attempts_in_window: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string }; Update: Partial<ProfileRow> };
      paths: { Row: PathRow; Insert: PathRow; Update: Partial<PathRow> };
      nodes: { Row: NodeRow; Insert: Partial<NodeRow>; Update: Partial<NodeRow> };
      node_prerequisites: { Row: NodePrerequisiteRow; Insert: NodePrerequisiteRow; Update: Partial<NodePrerequisiteRow> };
      topics: { Row: TopicRow; Insert: Partial<TopicRow>; Update: Partial<TopicRow> };
      resources: { Row: ResourceRow; Insert: Partial<ResourceRow>; Update: Partial<ResourceRow> };
      tasks: { Row: TaskRow; Insert: Partial<TaskRow>; Update: Partial<TaskRow> };
      user_paths: { Row: UserPathRow; Insert: UserPathRow; Update: Partial<UserPathRow> };
      user_progress: { Row: UserProgressRow; Insert: Partial<UserProgressRow>; Update: Partial<UserProgressRow> };
      task_completions: { Row: TaskCompletionRow; Insert: Partial<TaskCompletionRow>; Update: Partial<TaskCompletionRow> };
      resource_ratings: { Row: ResourceRatingRow; Insert: Partial<ResourceRatingRow>; Update: Partial<ResourceRatingRow> };
      projects: { Row: ProjectRow; Insert: Partial<ProjectRow>; Update: Partial<ProjectRow> };
      project_submissions: { Row: ProjectSubmissionRow; Insert: Partial<ProjectSubmissionRow>; Update: Partial<ProjectSubmissionRow> };
      verification_attempts: { Row: VerificationAttemptRow; Insert: Partial<VerificationAttemptRow>; Update: Partial<VerificationAttemptRow> };
    };
    Functions: {
      start_node: { Args: { p_node_slug: string }; Returns: undefined };
      complete_task: { Args: { p_task: string; p_evidence?: string | null }; Returns: StoredNodeStatus };
      get_public_profile: { Args: { p_handle: string }; Returns: PublicProfilePayload | null };
      rate_resource: { Args: { p_resource: string; p_rating: number }; Returns: undefined };
      set_project: { Args: { p_path: string; p_repo_url: string }; Returns: undefined };
      node_is_unlocked: { Args: { p_user: string; p_node: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      calc_rank: { Args: { xp: number }; Returns: Rank };
      admin_upsert_path: {
        Args: { p_id: string; p_title: string; p_description: string; p_icon: string; p_tags: string[]; p_order: number; p_requires_paths: string[] };
        Returns: PathRow;
      };
      admin_delete_path: { Args: { p_id: string }; Returns: undefined };
      admin_reorder_paths: { Args: { p_ordered_ids: string[] }; Returns: undefined };
      admin_upsert_node: {
        Args: { p_id: string | null; p_path_id: string; p_slug: string; p_name: string; p_subtitle: string; p_description: string; p_icon: string; p_order: number; p_est_hours: number; p_xp_reward: number; p_skills: string[] };
        Returns: NodeRow;
      };
      admin_delete_node: { Args: { p_id: string }; Returns: undefined };
      admin_reorder_nodes: { Args: { p_path_id: string; p_ordered_ids: string[] }; Returns: undefined };
      admin_set_node_prerequisites: { Args: { p_node_id: string; p_prerequisite_ids: string[] }; Returns: undefined };
      admin_upsert_topic: {
        Args: { p_id: string | null; p_node_id: string; p_title: string; p_order: number };
        Returns: TopicRow;
      };
      admin_delete_topic: { Args: { p_id: string }; Returns: undefined };
      admin_reorder_topics: { Args: { p_node_id: string; p_ordered_ids: string[] }; Returns: undefined };
      admin_upsert_resource: {
        Args: { p_id: string | null; p_topic_id: string; p_order: number; p_name: string; p_type: ResourceType; p_platform: string; p_url: string; p_cost: 'free' | 'paid' };
        Returns: ResourceRow;
      };
      admin_delete_resource: { Args: { p_id: string }; Returns: undefined };
      admin_upsert_task: {
        Args: { p_id: string | null; p_node_id: string; p_description: string; p_type: TaskType; p_order: number; p_quiz: QuizPayload | null; p_challenge: ChallengePayload | null; p_project_requirements: TaskRow['project_requirements']; p_resource_id: string | null; p_lesson_title: string | null; p_duration_minutes: number | null; p_start_seconds: number | null; p_end_seconds: number | null };
        Returns: TaskRow;
      };
      admin_delete_task: { Args: { p_id: string }; Returns: undefined };
      admin_member_rollup: {
        Args: {
          p_total_nodes: number;
          p_search: string | null;
          p_cohort: string | null;
          p_stuck_only: boolean;
          p_limit: number;
          p_offset: number;
        };
        Returns: AdminMemberRollupRow[];
      };
      admin_node_analytics: { Args: Record<string, never>; Returns: { node_id: string; starts: number; completions: number }[] };
      admin_cohorts: { Args: Record<string, never>; Returns: { cohort: string }[] };
      admin_overview_stats: {
        Args: { p_total_nodes: number };
        Returns: { total_members: number; active_this_week: number; avg_completion_pct: number; stuck_count: number }[];
      };
      admin_shipment_stats: {
        Args: Record<string, never>;
        Returns: { total_verified_shipments: number; members_shipped: number }[];
      };
      admin_path_analytics: {
        Args: Record<string, never>;
        Returns: { path_id: string; total_nodes: number; members_started: number; members_completed: number }[];
      };
    };
  };
}

export interface AdminMemberRollupRow {
  id: string;
  username: string;
  avatar_url: string;
  github_username: string | null;
  cohort: string | null;
  joined_at: string;
  last_active_at: string | null;
  completed_nodes: Record<string, string>;
  in_progress_nodes: string[];
  overall_pct: number;
  is_stuck: boolean;
  total_count: number;
}
