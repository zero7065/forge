import { Router, Request, Response } from 'express';
import { getDatabase } from '../lib/database.js';
import { requireAuth } from '../auth/auth-service.js';

const router = Router();
const db = getDatabase();

// =====================================================
// PRIMORDEX PROJECTS
// =====================================================

router.get('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, techStack, githubUrl } = req.body;
    const id = Date.now().toString();
    db.prepare(`
      INSERT INTO projects (id, user_id, name, description, tech_stack, github_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(id, userId, name, description || '', JSON.stringify(techStack || []), githubUrl || '');
    res.json({ id, name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// HIRE SPECS
// =====================================================

router.get('/hire/specs', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const specs = db.prepare(`
      SELECT hs.*, p.name as project_name 
      FROM hire_specs hs 
      JOIN projects p ON hs.project_id = p.id 
      WHERE p.user_id = ? 
      ORDER BY hs.created_at DESC
    `).all(userId);
    res.json(specs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as primordexRoutes };
