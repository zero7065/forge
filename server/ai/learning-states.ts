import { getDatabase } from '../lib/database.js';

const db = getDatabase();

const STATES = [
  { id: 'chaos', name: 'Chaos', description: 'Raw, unprocessed input. Everything is possible.', color: '#8B0000' },
  { id: 'clarity', name: 'Clarity', description: 'Understanding emerges. Patterns become visible.', color: '#C9A84C' },
  { id: 'shadow', name: 'Shadow', description: 'Confronting the disowned. Integration in progress.', color: '#2C1810' },
  { id: 'integration', name: 'Integration', description: 'Light and dark merge. Wholeness.', color: '#4A6A7A' },
  { id: 'stillness', name: 'Stillness', description: 'Nothing to do, nowhere to be.', color: '#6A7A6A' },
  { id: 'flux', name: 'Flux', description: 'Movement between states. Transformative phase.', color: '#8B6A4A' },
  { id: 'unity', name: 'Unity', description: 'All states simultaneously. Transcendence.', color: '#C9A84C' }
];

export async function getLearningState(userId: string) {
  const recentActivity = db.prepare(`
    SELECT action, created_at, input, output
    FROM audit_log 
    WHERE actor = ? 
    ORDER BY created_at DESC 
    LIMIT 100
  `).all(userId);
  
  if (recentActivity.length === 0) {
    return { state: STATES[0], confidence: 0.5, message: 'The journey begins in chaos.', nextState: STATES[1].name };
  }
  
  const scores = STATES.map(state => calculateStateScore(state.id, recentActivity));
  const bestState = scores.reduce((a, b) => a.score > b.score ? a : b);
  const stateConfig = STATES.find(s => s.id === bestState.id)!;
  
  return {
    state: stateConfig,
    confidence: bestState.score,
    message: generateStateDescription(stateConfig, recentActivity),
    nextState: getNextState(bestState.id),
    progression: recentActivity.length > 100 ? 'advanced' : 'beginning'
  };
}

function calculateStateScore(stateId: string, activity: any[]): { id: string, score: number } {
  let score = 0.3;
  
  if (stateId === 'chaos') {
    const variety = activity.filter(a => a.action === 'chat_message').length;
    score += Math.min(variety / 20, 0.3);
    if (activity.some(a => a.input && a.input.length < 30)) score += 0.2;
  }
  
  if (stateId === 'clarity') {
    const longMessages = activity.filter(a => a.input && a.input.length > 200).length;
    score += Math.min(longMessages / 10, 0.3);
    if (activity.some(a => a.input && a.input.toLowerCase().includes('philosoph'))) score += 0.2;
  }
  
  if (stateId === 'shadow') {
    const darkKeywords = ['dark', 'shadow', 'fear', 'pain', 'anger', 'struggle', 'avoid'];
    const darkMatches = activity.filter(a => a.input && darkKeywords.some(k => a.input.toLowerCase().includes(k))).length;
    score += Math.min(darkMatches / 5, 0.4);
  }
  
  if (stateId === 'integration') {
    const resolution = activity.filter(a => a.output && a.output.toLowerCase().includes('resolve')).length;
    score += Math.min(resolution / 5, 0.3);
    score += 0.15;
  }
  
  if (stateId === 'stillness') {
    const gaps = activity.length < 20 ? 0.3 : 0;
    score += gaps;
    if (activity.some(a => a.action === 'garden')) score += 0.2;
  }
  
  if (stateId === 'flux') {
    const chambers = new Set(activity.map(a => a.chamber || 'forge'));
    score += Math.min(chambers.size / 7, 0.3);
  }
  
  if (stateId === 'unity') {
    const diversity = new Set(activity.map(a => a.action)).size;
    score += Math.min(diversity / 8, 0.3);
    if (activity.length > 200) score += 0.2;
  }
  
  return { id: stateId, score: Math.min(score, 1.0) };
}

function generateStateDescription(state: any, activity: any[]): string {
  const descriptions = {
    chaos: 'You\'re in the raw. Everything is possible, nothing is shaped. This is where creation begins.',
    clarity: 'Patterns are emerging. You\'re seeing connections that were invisible before.',
    shadow: 'You\'re meeting what you\'ve avoided. This is the work that matters most.',
    integration: 'Light and dark are merging. Wholeness is not perfection — it\'s inclusion.',
    stillness: 'There\'s nothing to do. No need to push. Just be here.',
    flux: 'You\'re between forms. This is where transformation happens.',
    unity: 'All states are accessible. You\'ve become the space they exist in.'
  };
  return descriptions[state.id as keyof typeof descriptions] || 'You are on the path.';
}

function getNextState(currentId: string): string {
  const index = STATES.findIndex(s => s.id === currentId);
  if (index === STATES.length - 1) return STATES[0].name;
  return STATES[index + 1].name;
}