import { generateText } from './provider.js';
import { getDatabase } from '../lib/database.js';

const db = getDatabase();

export async function generateHireSpec(projectId: string, budget: number, timeline: string, skills: string[]) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) throw new Error('Project not found');
  
  const spec = await generateText({
    systemPrompt: `You are a technical recruiter and project manager.
Generate a detailed job specification for hiring a collaborator.
Return JSON with:
{
  "role": "Full Stack Developer",
  "requiredSkills": [{"skill": "React", "level": "expert"}, ...],
  "responsibilities": ["resp1", "resp2", "resp3"],
  "niceToHave": ["skill1", "skill2"],
  "rateRange": "₦200k-400k/month",
  "interviewQuestions": ["q1", "q2", "q3"],
  "about": "project description for candidates"
}`,
    userPrompt: JSON.stringify({
      projectName: project.name,
      description: project.description,
      techStack: JSON.parse(project.tech_stack || '[]'),
      budget,
      timeline,
      requestedSkills: skills
    }),
    temperature: 0.7,
    maxTokens: 1500,
    model: 'deep',
    json: true
  });
  
  const parsed = JSON.parse(spec);
  const id = Date.now().toString();
  
  db.prepare(`
    INSERT INTO hire_specs (id, project_id, role, required_skills, responsibilities, nice_to_have, rate_range, interview_questions, about_project, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id, projectId, parsed.role,
    JSON.stringify(parsed.requiredSkills),
    JSON.stringify(parsed.responsibilities),
    JSON.stringify(parsed.niceToHave),
    parsed.rateRange,
    JSON.stringify(parsed.interviewQuestions),
    parsed.about,
    'draft'
  );
  
  return { id, ...parsed, projectId };
}

export async function postHireRequest(specId: string, jobDescription: string) {
  const spec = db.prepare('SELECT * FROM hire_specs WHERE id = ?').get(specId) as any;
  if (!spec) throw new Error('Spec not found');
  
  db.prepare('UPDATE hire_specs SET status = ?, description = ? WHERE id = ?')
    .run('posted', jobDescription, specId);
  
  console.log(`Hire request posted: ${spec.role} for project ${spec.project_id}`);
  
  return { success: true, message: 'Hire request posted to The Table', specId };
}