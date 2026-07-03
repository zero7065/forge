import { generateText } from './provider.js';
import axios from 'axios';

export async function analyzeCode(repoUrl: string, userId: string) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo');
  
  const [, owner, repo] = match;
  
  try {
    const [repoData, languages, commits] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 5000
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 5000
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        timeout: 5000
      })
    ]);

    const analysis = await generateText({
      systemPrompt: `You are a senior software engineer and project analyst.
Analyze this GitHub repository and provide a JSON response with:
{
  "name": "project name",
  "description": "one paragraph summary",
  "techStack": ["language1", "framework1", ...],
  "codeQuality": "assessment of structure, patterns, best practices",
  "status": "active|in_progress|stalled|needs_help|completed",
  "lastCommit": "ISO date of last commit",
  "commitFrequency": "high|medium|low",
  "openIssues": number,
  "stars": number,
  "previewUrl": "https://owner.github.io/repo",
  "nextMilestone": "suggested next step",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`,
      userPrompt: JSON.stringify({
        name: repoData.data.name,
        description: repoData.data.description,
        languages: Object.keys(languages.data),
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count,
        openIssues: repoData.data.open_issues_count,
        lastCommit: commits.data[0]?.commit?.committer?.date,
        commitCount: commits.data.length,
        recentCommits: commits.data.slice(0, 5).map((c: any) => c.commit.message)
      }),
      temperature: 0.5,
      maxTokens: 1500,
      model: 'deep',
      json: true
    });
    
    const parsed = JSON.parse(analysis);
    return {
      ...parsed,
      repoUrl,
      owner,
      repo,
      previewUrl: `https://${owner}.github.io/${repo}`,
      status: parsed.status || determineStatus(commits.data, repoData.data),
      canHire: parsed.status === 'needs_help' || parsed.status === 'in_progress'
    };
  } catch (error) {
    console.error('GitHub analysis failed:', error);
    return {
      error: 'Failed to analyze repository. Ensure it\'s public or add GH_TOKEN.',
      repoUrl,
      status: 'unknown',
      canHire: false
    };
  }
}

function determineStatus(commits: any[], repoData: any): string {
  if (commits.length === 0) return 'stalled';
  const lastCommitDate = new Date(commits[0]?.commit?.committer?.date || Date.now());
  const daysSince = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince > 90) return 'stalled';
  if (daysSince > 30 && repoData.open_issues_count > 5) return 'needs_help';
  if (commits.length >= 50 && daysSince < 7) return 'active';
  if (repoData.open_issues_count === 0 && daysSince < 30) return 'completed';
  return 'in_progress';
}