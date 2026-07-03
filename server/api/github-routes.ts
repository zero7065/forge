import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth-service.js';
import { github } from '../github/repo-manager.js';

const router = Router();

router.get('/repos', requireAuth, async (req: Request, res: Response) => {
  try {
    const repos = await github.listRepos(req.user!.userId);
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repos/:repo/contents', requireAuth, async (req: Request, res: Response) => {
  try {
    const contents = await github.getRepoContents(req.user!.userId, req.params.repo, (req.query.path as string) || '');
    res.json(contents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repos/:repo/file', requireAuth, async (req: Request, res: Response) => {
  try {
    const content = await github.readFile(req.user!.userId, req.params.repo, req.query.path as string, (req.query.branch as string) || 'main');
    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/repos/:repo/file', requireAuth, async (req: Request, res: Response) => {
  try {
    const { path, content, message, branch, sha } = req.body;
    const result = await github.writeFile(req.user!.userId, req.params.repo, path, content, message, branch || 'main', sha);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/repos/:repo/file', requireAuth, async (req: Request, res: Response) => {
  try {
    const { path, message, branch, sha } = req.body;
    const result = await github.deleteFile(req.user!.userId, req.params.repo, path, message, branch || 'main', sha);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repos/:repo/branches', requireAuth, async (req: Request, res: Response) => {
  try {
    const branches = await github.getBranches(req.user!.userId, req.params.repo);
    res.json(branches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repos/:repo/commits', requireAuth, async (req: Request, res: Response) => {
  try {
    const perPage = req.query.per_page ? parseInt(req.query.per_page as string) : 30;
    const commits = await github.getCommitHistory(req.user!.userId, req.params.repo, (req.query.branch as string) || 'main', perPage);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/repos/:repo/pull', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, body, head, base } = req.body;
    const pr = await github.createPullRequest(req.user!.userId, req.params.repo, title, body, head, base || 'main');
    res.json(pr);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as githubRoutes };
