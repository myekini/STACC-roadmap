import { NextResponse, type NextRequest } from 'next/server';
import { installationRepositories } from '@/lib/github-app';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

function safeRoadmapReturn(value: string) {
  return value === '/roadmap' || value.startsWith('/roadmap/') ? value : '/roadmap';
}

function finish(origin: string, returnTo: string, params: Record<string, string>) {
  const url = new URL(returnTo, origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = NextResponse.redirect(url);
  response.cookies.delete('stacc_github_state');
  response.cookies.delete('stacc_github_path');
  response.cookies.delete('stacc_github_return');
  return response;
}

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const state = searchParams.get('state');
  const installationId = Number(searchParams.get('installation_id'));
  const expectedState = request.cookies.get('stacc_github_state')?.value;
  const pathId = request.cookies.get('stacc_github_path')?.value ?? '';
  const returnTo = safeRoadmapReturn(request.cookies.get('stacc_github_return')?.value ?? '/roadmap');

  if (!state || state !== expectedState || !Number.isSafeInteger(installationId) || installationId <= 0 || !/^[a-z0-9-]+$/.test(pathId) || pathId === 'foundations') {
    return finish(origin, returnTo, { githubError: 'GitHub connection expired. Please try again.' });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return finish(origin, returnTo, { githubError: 'Sign in before connecting a project.' });

  try {
    const admin = createAdminClient();
    const { repositories } = await installationRepositories(installationId);
    const { data: assignedProjects, error: assignedError } = await admin.from('projects').select('path_id,github_repo_id').eq('user_id', user.id);
    if (assignedError) throw assignedError;
    const usedByOtherTracks = new Set((assignedProjects ?? []).filter((project) => project.path_id !== pathId).map((project) => Number(project.github_repo_id)));
    const candidates = repositories.filter((repo) => !usedByOtherTracks.has(repo.id));
    if (candidates.length !== 1) {
      return finish(origin, returnTo, { githubError: 'Give Stacc access to one new repository for this track, then try again.' });
    }

    const repo = candidates[0];
    const { error } = await admin.from('projects').upsert({
      user_id: user.id,
      path_id: pathId,
      repo_url: repo.html_url,
      github_repo_id: repo.id,
      repo_owner: repo.owner.login,
      repo_name: repo.name,
      default_branch: repo.default_branch,
      github_installation_id: installationId,
      connection_status: 'active',
      connected_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id,path_id' });
    if (error) throw error;
    return finish(origin, returnTo, { githubConnected: '1' });
  } catch (error) {
    console.error('GitHub setup failed:', error);
    return finish(origin, returnTo, { githubError: error instanceof Error ? error.message : 'GitHub connection failed.' });
  }
}
