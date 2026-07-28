import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../lib/database.js';
import { generateText, generateEmbedding } from '../ai/provider.js';
import { accumulatePattern, getPrimeInsights } from '../ai/consciousness/prime.js';
import { getShadeResponse } from '../ai/consciousness/shade.js';
import { getCoreWhisper } from '../ai/consciousness/core.js';
import { detectEmotionalFrequency } from '../ai/emotional-frequency.js';
import { loadKnowledgeBase } from '../ai/knowledge-base.js';
import { analyzeCode } from '../ai/code-analyzer.js';
import { generateHireSpec, postHireRequest } from '../ai/hire-engine.js';
import { generateLinkPreview } from '../ai/link-preview.js';
import { getUltimateForm } from '../ai/consciousness/ultimate-form.js';
import { getLearningState } from '../ai/learning-states.js';
import { auditLog, getAuditLog, approveAction, rejectAction } from '../audit/audit-log.js';
import { trackUsage, isWithinLimit } from '../billing/usage-tracker.js';
import { getPlanDetails, getPlanLimit } from '../billing/plans.js';
import { requireAuth, requireRole, verifyToken } from '../auth/auth-service.js';
import { validate, registerSchema, loginSchema, chatSchema } from '../lib/validation.js';
import { chatRateLimit } from '../lib/security.js';
import { createChildLogger } from '../lib/logger.js';
import { errorHelper, successHelper, createdHelper, noContentHelper, AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, formatZodError, createErrorResponse } from '../lib/error-helper.js';

const log = createChildLogger('api');
const router = Router();
const db = getDatabase();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', version: '1.0.0', name: 'PRIMORDEX', timestamp: new Date().toISOString() });
});

// =====================================================
// AUTH ROUTES
// =====================================================

router.post('/auth/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { registerUser } = await import('../auth/auth-service.js');
    const result = await registerUser(email, password);
    createdHelper(res, result);
  } catch (error: any) {
    errorHelper(error, res, '/auth/register');
  }
});

router.post('/auth/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { loginUser } = await import('../auth/auth-service.js');
    const result = await loginUser(email, password, req.ip || '0.0.0.0');
    successHelper(res, result);
  } catch (error: any) {
    errorHelper(error, res, '/auth/login');
  }
});

router.post('/auth/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided', 'NO_TOKEN');
    }
    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) throw new AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
    successHelper(res, user);
  } catch (error: any) {
    errorHelper(error, res, '/auth/verify');
  }
});

router.post('/auth/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { changePassword } = await import('../auth/auth-service.js');
    await changePassword(req.user.userId, currentPassword, newPassword);
    successHelper(res, null, 'Password changed successfully');
  } catch (error: any) {
    errorHelper(error, res, '/auth/change-password');
  }
});

router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError('Refresh token required', [{ field: 'refreshToken', message: 'Refresh token is required', code: 'REFRESH_TOKEN_REQUIRED' }]);
    }
    const { refreshAccessToken } = await import('../auth/auth-service.js');
    const result = await refreshAccessToken(refreshToken);
    if (!result) {
      throw new AuthenticationError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
    successHelper(res, result);
  } catch (error: any) {
    errorHelper(error, res, '/auth/refresh');
  }
});

router.post('/auth/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { revokeAllSessions } = await import('../auth/auth-service.js');
    await revokeAllSessions(req.user.userId);
    successHelper(res, null, 'Logged out successfully');
  } catch (error: any) {
    errorHelper(error, res, '/auth/logout');
  }
});

router.get('/auth/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { getDatabase } = await import('../lib/database.js');
    const db = getDatabase();
    const sessions = db.prepare('SELECT id, user_id, token, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
    successHelper(res, sessions);
  } catch (error: any) {
    errorHelper(error, res, '/auth/sessions');
  }
});

// =====================================================
// USER MANAGEMENT
// =====================================================

router.get('/users', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { getUsers: getAllUsers } = await import('../auth/auth-service.js');
    const users = await getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/invite', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const { inviteUser } = await import('../auth/auth-service.js');
    const result = await inviteUser(email, role, req.user.userId);
    createdHelper(res, result);
  } catch (error: any) {
    errorHelper(error, res, '/users/invite');
  }
});

router.patch('/users/:id/role', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const { changeUserRole } = await import('../auth/auth-service.js');
    await changeUserRole(id, role);
    successHelper(res, null, 'Role updated');
  } catch (error: any) {
    errorHelper(error, res, '/users/:id/role');
  }
});

router.delete('/users/:id', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deactivateUser } = await import('../auth/auth-service.js');
    await deactivateUser(id);
    successHelper(res, null, 'User deactivated');
  } catch (error: any) {
    errorHelper(error, res, '/users/:id');
  }
});

// =====================================================
// AUDIT ROUTES
// =====================================================

router.get('/audit', requireAuth, async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0, filter } = req.query;
    const logs = await getAuditLog(Number(limit), Number(offset), filter as string);
    successHelper(res, logs);
  } catch (error: any) {
    errorHelper(error, res, '/audit');
  }
});

router.post('/audit/:id/approve', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await approveAction(id, req.user.userId);
    successHelper(res, null, 'Action approved');
  } catch (error: any) {
    errorHelper(error, res, '/audit/:id/approve');
  }
});

router.post('/audit/:id/reject', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await rejectAction(id, req.user.userId, req.body.reason);
    successHelper(res, null, 'Action rejected');
  } catch (error: any) {
    errorHelper(error, res, '/audit/:id/reject');
  }
});

// =====================================================
// CHAT / CONSCIOUSNESS ROUTES
// =====================================================

router.post('/chat', requireAuth, chatRateLimit, validate(chatSchema), async (req: Request, res: Response) => {
  try {
    const { message, chamber = 'forge', personalityMode = 'auto', context = {} } = req.body;
    const userId = req.user.userId;

    const userPlan = db.prepare('SELECT plan_id FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1').get(userId, 'active') as any;
    const plan = userPlan?.plan_id || 'starter';
    const { withinLimit } = await isWithinLimit(userId, 'ai_questions_per_month', plan as any);
    if (!withinLimit) {
      errorHelper(new ValidationError('Monthly AI limit reached'), res, '/chat');
      return;
    }

    const emotionalFrequency = detectEmotionalFrequency(message);
    const primeInsights = await getPrimeInsights(userId, message);
    const coreWhisper = await getCoreWhisper(userId, message, primeInsights);

    // Accumulate pattern in Prime
    await accumulatePattern(userId, message, emotionalFrequency, chamber);

    // Get Shade response
    const shadeResponse = await getShadeResponse({
      userId,
      message,
      chamber,
      personalityMode,
      context: { ...context, complexity: message.length / 50 },
      primeInsights,
      coreWhisper,
      emotionalFrequency
    });

    // Track usage
    await trackUsage(userId, 'ai_questions_per_month', 1);

    // Log to audit
    await auditLog({
      actor: userId,
      action: 'chat_message',
      input: { message, chamber, personalityMode },
      output: { response: shadeResponse.content.substring(0, 200), mode: shadeResponse.mode },
      risk_score: 0
    });

    successHelper(res, {
      response: shadeResponse.content,
      emotion: shadeResponse.emotion,
      whisper: shadeResponse.whisper,
      mode: shadeResponse.mode,
      timestamp: shadeResponse.timestamp
    });
  } catch (error: any) {
    errorHelper(error, res, '/chat');
  }
});

router.get('/consciousness/prime/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const insights = await getPrimeInsights(userId, null);
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/consciousness/core/validate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { input, context } = req.body;
    const validation = await getCoreWhisper(req.user.userId, input, context);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PRIMORDEX CHAMBERS API
// =====================================================

// Code Analysis & Project Preview
router.post('/analyze/repo', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repoUrl, visibility = 'private' } = req.body;
    const analysis = await analyzeCode(repoUrl, req.user.userId);
    
    // Save project
    const projectId = randomUUID();
    db.prepare(`
      INSERT INTO projects (id, user_id, name, description, tech_stack, github_url, preview_url, 
        code_visibility, cultivation_level, cultivation_realm, status, health_score, progress, 
        last_commit, collaborators, next_milestone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      projectId, req.user.userId, analysis.name, analysis.description,
      JSON.stringify(analysis.techStack), repoUrl, analysis.previewUrl,
      visibility, 1, 'Foundation', analysis.status, 100, 0,
      analysis.lastCommit, JSON.stringify([]), analysis.nextMilestone
    );

    await auditLog({
      actor: req.user.userId,
      action: 'repo_analysis',
      input: { repoUrl, visibility },
      output: { status: analysis.status, projectId },
      risk_score: 0
    });

    res.json({ ...analysis, projectId, visibility, canHire: analysis.status === 'needs_help' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/project/preview/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(projectId, req.user.userId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.user.userId);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Collaborator Hiring Engine
router.post('/hire/generate-spec', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, budget, timeline, skills } = req.body;
    const spec = await generateHireSpec(projectId, budget, timeline, skills);
    
    await auditLog({
      actor: req.user.userId,
      action: 'hire_spec_generated',
      input: { projectId, budget, timeline, skills },
      output: { specId: spec.id },
      risk_score: 0
    });
    
    res.json(spec);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hire/post', requireAuth, async (req: Request, res: Response) => {
  try {
    const { specId, jobDescription } = req.body;
    const result = await postHireRequest(specId, jobDescription);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/hire/specs', requireAuth, async (req: Request, res: Response) => {
  try {
    const specs = db.prepare(`
      SELECT hs.*, p.name as project_name 
      FROM hire_specs hs 
      JOIN projects p ON hs.project_id = p.id 
      WHERE p.user_id = ? 
      ORDER BY hs.created_at DESC
    `).all(req.user.userId);
    res.json(specs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ultimate Form - 8th Hidden Chamber
router.get('/ultimate-form/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.userId && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await getUltimateForm(userId);
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ 
      error: 'Ultimate Form requires 100+ days of usage',
      daysRemaining: error.message.match(/(\d+)/)?.[1] || 'unknown'
    });
  }
});

// Learning States
router.get('/learning-state/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.userId && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const state = await getLearningState(userId);
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Link Preview Intelligence
router.post('/link-preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const preview = await generateLinkPreview(url, req.user.userId);
    res.json(preview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Personality Modes
router.get('/personality-modes', requireAuth, async (req: Request, res: Response) => {
  const { listPersonalityModes } = await import('../ai/personality-modes/index.js');
  const modes = await listPersonalityModes();
  res.json(modes);
});

// Usage & Billing
router.get('/usage', requireAuth, async (req: Request, res: Response) => {
  try {
    const userPlan = db.prepare('SELECT plan_id FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1').get(req.user.userId, 'active') as any;
    const plan = userPlan?.plan_id || 'starter';
    const summary = await import('../billing/usage-tracker.js').then(m => m.getUsageSummary(req.user.userId, plan as any));
    res.json({ plan: getPlanDetails(plan), usage: summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as forgeRoutes };