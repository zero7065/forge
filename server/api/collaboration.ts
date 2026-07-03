import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth-service.js';
import { getDatabase } from '../lib/database.js';
import { auditLog } from '../audit/audit-log.js';

const router = Router();
const db = getDatabase();

router.post('/projects/:projectId/invite', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email, permission } = req.body;

    const project = db.prepare('SELECT user_id FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) throw new Error('Project not found');
    if (project.user_id !== req.user!.userId && req.user!.role !== 'owner') {
      throw new Error('Only the project owner can invite collaborators');
    }

    const collaborator = db.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1').get(email) as any;
    if (!collaborator) throw new Error('User not found or inactive');

    const existing = db.prepare('SELECT * FROM project_collaborators WHERE project_id = ? AND user_id = ?').get(projectId, collaborator.id);
    if (existing) throw new Error('User already has access to this project');

    const id = `collab_${Date.now()}`;
    db.prepare('INSERT INTO project_collaborators (id, project_id, user_id, permission, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, projectId, collaborator.id, permission || 'viewer', req.user!.userId, new Date().toISOString());

    await auditLog({ actor: req.user!.userId, action: 'project_invite_collaborator', input: { projectId, email, permission }, output: { collaboratorId: collaborator.id }, risk_score: 0 });

    res.json({ message: `Invitation sent to ${email}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/projects/:projectId/collaborators', requireAuth, async (req: Request, res: Response) => {
  try {
    const collaborators = db.prepare(`
      SELECT pc.*, u.email, u.role as user_role
      FROM project_collaborators pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ?
    `).all(req.params.projectId);
    res.json(collaborators);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/projects/:projectId/collaborators/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.params;

    const project = db.prepare('SELECT user_id FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) throw new Error('Project not found');
    if (project.user_id !== req.user!.userId && req.user!.role !== 'owner') {
      throw new Error('Only the project owner can remove collaborators');
    }

    db.prepare('DELETE FROM project_collaborators WHERE project_id = ? AND user_id = ?').run(projectId, userId);

    await auditLog({ actor: req.user!.userId, action: 'project_remove_collaborator', input: { projectId, userId }, output: {}, risk_score: 0 });

    res.json({ message: 'Collaborator removed' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export { router as collaborationRouter };
