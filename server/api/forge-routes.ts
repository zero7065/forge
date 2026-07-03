import { Router, Request, Response } from 'express';
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
import { getPlanDetails } from '../billing/plans.js';
import { requireAuth, requireRole, verifyToken } from '../auth/auth-service.js';

const router = Router();
const db = getDatabase();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', version: '1.0.0', name: 'PRIMORDEX', timestamp: new Date().toISOString() });
});

// =====================================================
// AUTH ROUTES
// =====================================================

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { registerUser } = await import('../auth/auth-service.js');
    const result = await registerUser(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { loginUser } = await import('../auth/auth-service.js');
    const result = await loginUser(email, password, req.ip || '0.0.0.0');
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/verify', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  res.json({ user });
});

router.post('/auth/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { changePassword } = await import('../auth/auth-service.js');
    await changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/users/:id/role', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const { changeUserRole } = await import('../auth/auth-service.js');
    await changeUserRole(id, role);
    res.json({ message: 'Role updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/users/:id', requireAuth, requireRole('owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deactivateUser } = await import('../auth/auth-service.js');
    await deactivateUser(id);
    res.json({ message: 'User deactivated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// AUDIT ROUTES
// =====================================================

router.get('/audit', requireAuth, async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0, filter } = req.query;
    const logs = await getAuditLog(Number(limit), Number(offset), filter as string);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/audit/:id/approve', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await approveAction(id, req.user.userId);
    res.json({ message: 'Action approved' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/audit/:id/reject', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await rejectAction(id, req.user.userId, req.body.reason);
    res.json({ message: 'Action rejected' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// CHAT / CONSCIOUSNESS ROUTES
// =====================================================

router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message, chamber = 'forge', personalityMode = 'auto', context = {} } = req.body;
    const userId = req.user.userId;

    // Track usage
    const plan = 'starter'; // TODO: get from user
    const { withinLimit } = await isWithinLimit(userId, 'ai_questions_per_month', plan as any);
    if (!withinLimit) {
      return res.status(429).json({ error: 'Monthly AI limit reached' });
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

    res.json({
      response: shadeResponse.content,
      emotion: shadeResponse.emotion,
      whisper: shadeResponse.whisper,
      mode: shadeResponse.mode,
      timestamp: shadeResponse.timestamp
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
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
    const plan = 'starter'; // TODO: get from user
    const summary = await import('../billing/usage-tracker.js').then(m => m.getUsageSummary(req.user.userId, plan as any));
    res.json({ plan: getPlanDetails(plan), usage: summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as forgeRoutes };