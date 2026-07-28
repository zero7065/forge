import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../lib/database.js';
import { requireAuth } from '../auth/auth-service.js';
import { createChildLogger } from '../lib/logger.js';

const log = createChildLogger('chambers');
const router = Router();
const db = getDatabase();

// =====================================================
// DREAM STATE (Chamber II)
// =====================================================

router.get('/dream/entries', requireAuth, async (req: Request, res: Response) => {
  try {
    const entries = db.prepare('SELECT * FROM dream_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
      .all((req as any).user.userId);
    res.json({ entries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dream/capture', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

    const id = randomUUID();
    const emotion = detectEmotion(content);
    const tags = extractTags(content);

    db.prepare('INSERT INTO dream_entries (id, user_id, content, emotion, tags) VALUES (?, ?, ?, ?, ?)')
      .run(id, (req as any).user.userId, content, emotion, JSON.stringify(tags));

    res.json({ id, emotion, tags });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/dream/entries/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM dream_entries WHERE id = ? AND user_id = ?')
      .run(req.params.id, (req as any).user.userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ALCHEMIST LAB (Chamber III)
// =====================================================

router.get('/alchemist/fragments', requireAuth, async (req: Request, res: Response) => {
  try {
    const fragments = db.prepare('SELECT * FROM fragments WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
      .all((req as any).user.userId);
    res.json({ fragments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/alchemist/synthesize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fragmentIds } = req.body;
    if (!fragmentIds?.length || fragmentIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 fragments required' });
    }

    const placeholders = fragmentIds.map(() => '?').join(',');
    const fragments = db.prepare(`SELECT * FROM fragments WHERE id IN (${placeholders}) AND user_id = ?`)
      .all(...fragmentIds, (req as any).user.userId) as any[];

    const combinedContent = fragments.map((f: any) => f.content).join('\n---\n');
    const result = `**Synthesis of ${fragments.length} fragments:**\n\n${combinedContent}\n\n---\n\n*The alchemist transmutes fragments into insight. Patterns emerge where chaos once lived.*`;
    const imaginationMind = [
      `What if these fragments are connected by a thread you haven't named yet?`,
      `Consider: the gaps between these ideas hold as much meaning as the ideas themselves.`,
      `This synthesis echoes a pattern from your earlier work — the universe repeats until you listen.`
    ];

    const id = randomUUID();
    db.prepare('INSERT INTO syntheses (id, user_id, fragment_ids, result, imagination_mind) VALUES (?, ?, ?, ?, ?)')
      .run(id, (req as any).user.userId, JSON.stringify(fragmentIds), result, JSON.stringify(imaginationMind));

    res.json({ id, result, imaginationMind });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// SAGE TABLE (Chamber IV)
// =====================================================

router.get('/sage/writings', requireAuth, async (req: Request, res: Response) => {
  try {
    const writings = db.prepare('SELECT * FROM writings WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
      .all((req as any).user.userId);
    res.json({ writings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sage/writings', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, content, mode, analysis } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

    const id = randomUUID();
    db.prepare(`INSERT INTO writings (id, user_id, title, content, mode, tone, authenticity_score, clarity_level, emotional_frequency, analysis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, (req as any).user.userId, title || content.slice(0, 50), content, mode || 'raw',
        analysis?.tone || null, analysis?.authenticity || 0, analysis?.clarity || 0,
        analysis?.frequency || 'neutral', analysis ? JSON.stringify(analysis) : null);

    const writing = db.prepare('SELECT * FROM writings WHERE id = ?').get(id);
    res.json(writing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sage/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content, mode } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    const avgWordLength = content.split(/\s+/).reduce((sum: number, w: string) => sum + w.length, 0) / wordCount;

    const tone = analyzeTone(content, mode);
    const authenticity = Math.min(100, Math.round(50 + (wordCount > 50 ? 20 : 0) + (mode === 'raw' ? 15 : 10)));
    const clarity = Math.min(100, Math.round(60 + (sentenceCount < 10 ? 20 : 0) + (avgWordLength < 6 ? 10 : 0)));
    const frequency = detectEmotion(content);

    res.json({ tone, authenticity, clarity, frequency });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ZEN GARDEN (Chamber V)
// =====================================================

router.get('/garden/reflections', requireAuth, async (req: Request, res: Response) => {
  try {
    const reflections = db.prepare('SELECT * FROM reflections WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
      .all((req as any).user.userId);
    res.json({ reflections });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/garden/reflect', requireAuth, async (req: Request, res: Response) => {
  try {
    const { content, type } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

    const id = randomUUID();
    const emotionalState = detectEmotion(content);
    const insight = content.length > 100 ? 'Depth detected — this reflection carries weight.' : null;

    db.prepare('INSERT INTO reflections (id, user_id, content, type, emotional_state, insight) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, (req as any).user.userId, content, type || 'free', emotionalState, insight);

    res.json({ id, emotionalState, insight });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// WAR ROOM (Chamber VI)
// =====================================================

router.get('/war/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all((req as any).user.userId);
    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/war/hire-specs', requireAuth, async (req: Request, res: Response) => {
  try {
    const specs = db.prepare(`
      SELECT hs.*, p.name as project_name 
      FROM hire_specs hs 
      JOIN projects p ON hs.project_id = p.id 
      WHERE p.user_id = ? 
      ORDER BY hs.created_at DESC
    `).all((req as any).user.userId);
    res.json({ specs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/war/hire/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(projectId, (req as any).user.userId) as any;
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const techStack = JSON.parse(project.tech_stack || '[]');
    const specId = randomUUID();
    const spec = {
      id: specId,
      projectId,
      role: `Senior ${techStack[0] || 'Full Stack'} Developer`,
      requiredSkills: techStack.slice(0, 4).map((t: string) => ({ skill: t, level: 'intermediate' })),
      responsibilities: ['Build features', 'Code review', 'Mentor junior devs'],
      niceToHave: ['DevOps experience', 'Testing expertise'],
      rateRange: '$50-100/hr',
      interviewQuestions: ['Describe your architecture approach', 'How do you handle technical debt?'],
      aboutProject: project.description || project.name,
      status: 'draft',
      applicants: 0
    };

    db.prepare(`INSERT INTO hire_specs (id, project_id, role, required_skills, responsibilities, nice_to_have, rate_range, interview_questions, about_project, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(specId, projectId, spec.role, JSON.stringify(spec.requiredSkills),
        JSON.stringify(spec.responsibilities), JSON.stringify(spec.niceToHave),
        spec.rateRange, JSON.stringify(spec.interviewQuestions), spec.aboutProject, 'draft');

    res.json(spec);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/war/hire/post', requireAuth, async (req: Request, res: Response) => {
  try {
    const { specId } = req.body;
    db.prepare('UPDATE hire_specs SET status = ? WHERE id = ?').run('posted', specId);
    res.json({ success: true, message: 'Hire spec posted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// THE MIRROR (Chamber VII)
// =====================================================

router.get('/mirror/insights', requireAuth, async (req: Request, res: Response) => {
  try {
    const insights = db.prepare('SELECT * FROM mirror_insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
      .all((req as any).user.userId);
    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mirror/soul-data', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const patterns = db.prepare('SELECT COUNT(*) as count FROM prime_patterns WHERE user_id = ?').get(userId) as any;
    const memories = db.prepare('SELECT COUNT(*) as count FROM core_memory WHERE user_id = ?').get(userId) as any;
    const reflections = db.prepare('SELECT COUNT(*) as count FROM reflections WHERE user_id = ?').get(userId) as any;
    const writings = db.prepare('SELECT COUNT(*) as count FROM writings WHERE user_id = ?').get(userId) as any;
    const dreams = db.prepare('SELECT COUNT(*) as count FROM dream_entries WHERE user_id = ?').get(userId) as any;

    res.json({
      soulData: {
        patternsAccumulated: patterns?.count || 0,
        coreMemories: memories?.count || 0,
        reflections: reflections?.count || 0,
        writings: writings?.count || 0,
        dreams: dreams?.count || 0,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ERROR LOGGING
// =====================================================

router.post('/error/log', async (req: Request, res: Response) => {
  try {
    const { message, stack, componentStack, url, userAgent, userId } = req.body;
    const id = randomUUID();
    db.prepare('INSERT INTO error_logs (id, message, stack, component_stack, url, user_agent, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, message, stack, componentStack, url, userAgent, userId || null);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// HELPERS
// =====================================================

function detectEmotion(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(happy|joy|excited|grateful|blessed|love)\b/.test(lower)) return 'joy';
  if (/\b(sad|depressed|lonely|empty|lost|hopeless)\b/.test(lower)) return 'melancholy';
  if (/\b(angry|furious|frustrated|annoyed|rage)\b/.test(lower)) return 'frustration';
  if (/\b(anxious|worried|nervous|scared|fear)\b/.test(lower)) return 'anxiety';
  if (/\b(calm|peace|serene|quiet|still)\b/.test(lower)) return 'serenity';
  if (/\b(confused|lost|uncertain|doubt)\b/.test(lower)) return 'uncertainty';
  if (/\b(determined|strong|focused|ready|will)\b/.test(lower)) return 'determination';
  return 'neutral';
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const patterns = [/\b(dream|nightmare|sleep)\b/i, /\b(work|project|code)\b/i, /\b(love|relationship|heart)\b/i,
    /\b(idea|insight|revelation)\b/i, /\b(fear|anxiety|worry)\b/i, /\b(art|music|write)\b/i];
  patterns.forEach(p => { const m = text.match(p); if (m) tags.push(m[1].toLowerCase()); });
  return tags;
}

function analyzeTone(text: string, mode: string): string {
  const lower = text.toLowerCase();
  if (mode === 'flirt') return /\b(playful|tease|wink|smile)\b/i.test(lower) ? 'Playful magnetic' : 'Building tension';
  if (mode === 'persuade') return /\b(need|must|should|imagine)\b/i.test(lower) ? 'Anchoring' : 'Frame-setting';
  if (mode === 'dark') return /\b(hide|shadow|secret|mask)\b/i.test(lower) ? 'Shadow work' : 'Reverse psychology';
  if (mode === 'clarity') return lower.split('.').length > 3 ? 'Precision layered' : 'Direct truth';
  return /\b(honest|raw|real|vulnerable)\b/i.test(lower) ? 'Raw authentic' : 'Introspective';
}

export { router as chamberRoutes };
