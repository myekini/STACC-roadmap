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

const GITHUB_TIMEOUT_MS = 10_000;

async function githubFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...init?.headers,
      },
      cache: 'no-store',
      // Bounds how long a serverless invocation can be held open by a slow
      // GitHub response — without this, a hung upstream call burns function
      // concurrency under load instead of failing fast.
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('GitHub took too long to respond. Try again in a moment.');
    }
    throw error;
  }
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

// Only called for paths already confirmed present in the tree — the
// Contents API 404s on a missing path, and callers use repositoryTree()
// as the existence check first.
export async function fileContent(token: string, owner: string, repo: string, path: string, sha: string): Promise<string> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const result = await githubFetch<{ content: string; encoding: string }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(sha)}`,
    token,
  );
  if (result.encoding !== 'base64') throw new Error(`Unexpected encoding reading ${path}.`);
  return Buffer.from(result.content, 'base64').toString('utf-8');
}
