import 'server-only';

import { createSign } from 'node:crypto';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  owner: { login: string };
}

function base64url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function appJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!appId || !privateKey) throw new Error('GitHub App credentials are not configured.');

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }));
  const unsigned = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(privateKey, 'base64url');
  return `${unsigned}.${signature}`;
}

async function githubFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub returned ${response.status}: ${detail.slice(0, 240)}`);
  }
  return response.json() as Promise<T>;
}

export async function installationToken(installationId: number) {
  const result = await githubFetch<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    appJwt(),
    { method: 'POST' },
  );
  return result.token;
}

export async function installationRepositories(installationId: number) {
  const token = await installationToken(installationId);
  const result = await githubFetch<{ repositories: GitHubRepository[] }>('/installation/repositories?per_page=100', token);
  return { token, repositories: result.repositories };
}

export async function latestCommit(token: string, owner: string, repo: string, branch: string) {
  return githubFetch<{
    sha: string;
    html_url: string;
    commit: { author: { date: string }; message: string };
  }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`, token);
}

export async function repositoryTree(token: string, owner: string, repo: string, sha: string) {
  const result = await githubFetch<{ tree: { path: string; type: 'blob' | 'tree' }[]; truncated: boolean }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${sha}?recursive=1`,
    token,
  );
  if (result.truncated) throw new Error('The repository is too large to verify automatically.');
  return new Set(result.tree.filter((item) => item.type === 'blob').map((item) => item.path));
}
