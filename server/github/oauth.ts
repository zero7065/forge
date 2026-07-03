import { Router, Request, Response } from 'express';
import { getDatabase } from '../lib/database.js';
import { requireAuth } from '../auth/auth-service.js';

const router = Router();
const db = getDatabase();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/github/oauth/callback';

router.get('/auth', requireAuth, (req: Request, res: Response) => {
  const state = req.user!.userId + '_' + Date.now();
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&state=${state}&scope=repo,workflow,user:email`;
  res.json({ url: redirectUrl });
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI
      })
    });
    const tokenData = await tokenResponse.json() as any;
    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const githubUser = await userResponse.json() as any;

    const userId = state ? (state as string).split('_')[0] : null;
    if (userId) {
      db.prepare(`
        INSERT OR REPLACE INTO github_tokens (user_id, access_token, username, avatar_url, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, accessToken, githubUser.login, githubUser.avatar_url, new Date().toISOString());
    }

    res.redirect(`${process.env.APP_URL || 'http://localhost:5173'}/dashboard?github=connected`);
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
});

router.get('/status', requireAuth, (req: Request, res: Response) => {
  const token = db.prepare('SELECT * FROM github_tokens WHERE user_id = ?').get(req.user!.userId) as any;
  if (!token) return res.json({ connected: false });
  res.json({ connected: true, username: token.username, avatar: token.avatar_url, updatedAt: token.updated_at });
});

router.post('/disconnect', requireAuth, (req: Request, res: Response) => {
  db.prepare('DELETE FROM github_tokens WHERE user_id = ?').run(req.user!.userId);
  res.json({ message: 'Disconnected from GitHub' });
});

export { router as githubOAuthRouter };
