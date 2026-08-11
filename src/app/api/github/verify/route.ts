import { NextResponse } from 'next/server';
import { installationToken, latestCommit, repositoryTree } from '@/lib/github-app';
import type { ProjectRow, TaskRow } from '@/lib/database.types';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to verify project work.' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { taskId?: string };
  if (!body.taskId) return NextResponse.json({ error: 'Missing task.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: taskData, error: taskError } = await admin.from('tasks').select('*,nodes!inner(path_id)').eq('id', body.taskId).single();
  if (taskError || !taskData) return NextResponse.json({ error: 'Project task not found.' }, { status: 404 });
  const task = taskData as TaskRow & { nodes: { path_id: string } };
  if (task.type !== 'build' || task.nodes.path_id === 'foundations') {
    return NextResponse.json({ error: 'This task is not a specialization milestone.' }, { status: 400 });
  }

  const { data: projectData, error: projectError } = await admin.from('projects').select('*').eq('user_id', user.id).eq('path_id', task.nodes.path_id).single();
  if (projectError || !projectData) return NextResponse.json({ error: 'Connect the track project first.' }, { status: 409 });
  const project = projectData as ProjectRow;
  if (project.connection_status !== 'active' || !project.github_installation_id || !project.repo_owner || !project.repo_name) {
    return NextResponse.json({ error: 'Reconnect this project before checking work.' }, { status: 409 });
  }

  try {
    const token = await installationToken(project.github_installation_id);
    const commit = await latestCommit(token, project.repo_owner, project.repo_name, project.default_branch);

    const { data: reused } = await admin.from('project_submissions').select('task_id').eq('project_id', project.id).eq('commit_sha', commit.sha).neq('task_id', task.id).maybeSingle();
    if (reused) return NextResponse.json({ error: 'Push a new commit for this milestone; that commit already completed another task.' }, { status: 409 });

    const { data: progress } = await admin.from('user_progress').select('started_at').eq('user_id', user.id).eq('node_id', task.node_id).maybeSingle();
    if (progress?.started_at && new Date(commit.commit.author.date) < new Date(progress.started_at as string)) {
      return NextResponse.json({ error: 'Push a new commit after starting this module, then check again.' }, { status: 409 });
    }

    const requiredPaths = task.project_requirements?.requiredPaths ?? [];
    const files = requiredPaths.length ? await repositoryTree(token, project.repo_owner, project.repo_name, commit.sha) : new Set<string>();
    const missing = requiredPaths.filter((path) => !files.has(path));
    if (missing.length) return NextResponse.json({ error: `Missing required project files: ${missing.join(', ')}` }, { status: 422 });

    const checks = { newCommit: true, requiredPaths: missing.length === 0 };
    const { error: submissionError } = await admin.from('project_submissions').upsert({
      project_id: project.id,
      user_id: user.id,
      task_id: task.id,
      commit_sha: commit.sha,
      commit_url: commit.html_url,
      branch: project.default_branch,
      status: 'verified',
      checks,
      verified_at: new Date().toISOString(),
    }, { onConflict: 'user_id,task_id' });
    if (submissionError) throw submissionError;

    const { data: nodeStatus, error: completionError } = await supabase.rpc('complete_task', { p_task: task.id, p_evidence: commit.html_url });
    if (completionError) throw completionError;

    await admin.from('projects').update({ last_synced_at: new Date().toISOString() }).eq('id', project.id);
    return NextResponse.json({ commitUrl: commit.html_url, commitSha: commit.sha.slice(0, 7), nodeStatus });
  } catch (error) {
    console.error('GitHub verification failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not verify this commit.' }, { status: 502 });
  }
}
