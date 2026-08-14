import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fileContent, installationToken, latestCommit, repositoryTree } from '@/lib/github-app';
import type { ProjectRow, TaskRow } from '@/lib/database.types';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// Per-user, per-task guardrail against click-spamming "Check my work":
// a short cooldown between attempts plus a hard cap within a rolling
// window, both enforced in Postgres so it holds across serverless
// instances (an in-memory counter would not). See
// docs/ARCHITECTURE.md "Operational guardrails".
const VERIFY_COOLDOWN_MS = 20_000;
const VERIFY_WINDOW_MS = 60 * 60 * 1000;
const VERIFY_MAX_PER_WINDOW = 10;

const verifyBodySchema = z.object({ taskId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to verify project work.' }, { status: 401 });

  const parsed = verifyBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Missing or invalid task.' }, { status: 400 });
  const body = parsed.data;

  const admin = createAdminClient();

  const now = new Date();
  const { data: attempt } = await admin.from('verification_attempts').select('*').eq('user_id', user.id).eq('task_id', body.taskId).maybeSingle();
  if (attempt) {
    const sinceLast = now.getTime() - new Date(attempt.attempted_at as string).getTime();
    if (sinceLast < VERIFY_COOLDOWN_MS) {
      const retryAfter = Math.ceil((VERIFY_COOLDOWN_MS - sinceLast) / 1000);
      return NextResponse.json({ error: 'Give it a moment before checking again.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });
    }
    const windowExpired = now.getTime() - new Date(attempt.window_started_at as string).getTime() > VERIFY_WINDOW_MS;
    if (!windowExpired && (attempt.attempts_in_window as number) >= VERIFY_MAX_PER_WINDOW) {
      return NextResponse.json({ error: 'Too many verification attempts. Try again in an hour.' }, { status: 429 });
    }
    await admin.from('verification_attempts').update({
      attempted_at: now.toISOString(),
      window_started_at: windowExpired ? now.toISOString() : attempt.window_started_at,
      attempts_in_window: windowExpired ? 1 : (attempt.attempts_in_window as number) + 1,
    }).eq('user_id', user.id).eq('task_id', body.taskId);
  } else {
    await admin.from('verification_attempts').insert({ user_id: user.id, task_id: body.taskId, attempted_at: now.toISOString(), window_started_at: now.toISOString(), attempts_in_window: 1 });
  }

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
    const requiredHeadings = task.project_requirements?.requiredHeadings ?? {};
    const headingPaths = Object.keys(requiredHeadings);
    const needsTree = requiredPaths.length > 0 || headingPaths.length > 0;
    const files = needsTree ? await repositoryTree(token, project.repo_owner, project.repo_name, commit.sha) : new Set<string>();

    const missingPaths = Array.from(new Set([...requiredPaths, ...headingPaths])).filter((path) => !files.has(path));
    if (missingPaths.length) return NextResponse.json({ error: `Missing required project files: ${missingPaths.join(', ')}` }, { status: 422 });

    // Path presence alone doesn't confirm the file has real content — an
    // empty placeholder would pass requiredPaths. requiredHeadings checks
    // for required substrings (keywords, section headers, config keys)
    // inside a path that's already confirmed to exist.
    const contentIssues: string[] = [];
    for (const path of headingPaths) {
      const content = await fileContent(token, project.repo_owner, project.repo_name, path, commit.sha);
      const lowerContent = content.toLowerCase();
      const missingPatterns = requiredHeadings[path].filter((pattern) => !lowerContent.includes(pattern.toLowerCase()));
      if (missingPatterns.length) contentIssues.push(`${path} is missing: ${missingPatterns.join(', ')}`);
    }
    if (contentIssues.length) return NextResponse.json({ error: contentIssues.join('; ') }, { status: 422 });

    const checks = { newCommit: true, requiredPaths: missingPaths.length === 0, requiredContent: contentIssues.length === 0 };
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
