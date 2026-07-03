import { getDatabase } from '../lib/database.js';
import { auditLog } from '../audit/audit-log.js';

function getOctokit(userId: string) {
  const db = getDatabase();
  const token = db.prepare('SELECT access_token FROM github_tokens WHERE user_id = ?').get(userId) as any;
  if (!token) throw new Error('GitHub not connected for this user');
  return { auth: token.access_token };
}

async function ghFetch(userId: string, url: string, options: RequestInit = {}): Promise<any> {
  const { auth } = getOctokit(userId);
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${auth}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) {
    const err = await response.json() as any;
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
}

export async function listRepos(userId: string): Promise<any[]> {
  return ghFetch(userId, 'https://api.github.com/user/repos?sort=updated&per_page=100');
}

export async function getRepoContents(userId: string, repo: string, path: string = ''): Promise<any> {
  try {
    return await ghFetch(userId, `https://api.github.com/repos/${repo}/contents/${path}`);
  } catch (error: any) {
    if (error.message.includes('Not Found')) return [];
    throw error;
  }
}

export async function readFile(userId: string, repo: string, path: string, branch: string = 'main'): Promise<string> {
  const data = await ghFetch(userId, `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`);
  if (Array.isArray(data) || data.type !== 'file') throw new Error('Path is not a file');
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function writeFile(userId: string, repo: string, path: string, content: string, message: string, branch: string = 'main', sha?: string): Promise<any> {
  const { auth } = getOctokit(userId);
  const [owner, repoName] = repo.split('/');
  const body: any = { message, content: Buffer.from(content).toString('base64'), branch };
  if (sha) body.sha = sha;

  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${auth}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json() as any;

  await auditLog({ actor: userId, action: 'github_write_file', input: { repo, path, branch }, output: { commit: result.commit?.sha }, risk_score: 0.1 });
  return result;
}

export async function deleteFile(userId: string, repo: string, path: string, message: string, branch: string = 'main', sha: string): Promise<any> {
  const { auth } = getOctokit(userId);
  const [owner, repoName] = repo.split('/');

  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch })
  });
  const result = await response.json() as any;

  await auditLog({ actor: userId, action: 'github_delete_file', input: { repo, path, branch }, output: { commit: result.commit?.sha }, risk_score: 0.15 });
  return result;
}

export async function getBranches(userId: string, repo: string): Promise<any[]> {
  return ghFetch(userId, `https://api.github.com/repos/${repo}/branches`);
}

export async function getCommitHistory(userId: string, repo: string, branch: string = 'main', perPage: number = 30): Promise<any[]> {
  return ghFetch(userId, `https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=${perPage}`);
}

export async function createPullRequest(userId: string, repo: string, title: string, body: string, head: string, base: string = 'main'): Promise<any> {
  return ghFetch(userId, `https://api.github.com/repos/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, body, head, base })
  });
}

export const github = { listRepos, getRepoContents, readFile, writeFile, deleteFile, getBranches, getCommitHistory, createPullRequest };
