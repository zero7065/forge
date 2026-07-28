import { Router, Request, Response } from 'express';
import { getDatabase } from '../lib/database.js';
import { verifyToken } from '../auth/auth-service.js';
import { auditLog } from '../audit/audit-log.js';

const router = Router();

const portalAuth = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  (req as any).user = { userId: (user as any).id, email: (user as any).email, role: (user as any).role };
  next();
};

router.get('/me', portalAuth, async (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

router.get('/shares', portalAuth, async (req: Request, res: Response) => {
  res.json([]);
});

export { router as portalRoutes };
