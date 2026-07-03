import { getDatabase } from '../../lib/database.js';
import { randomUUID } from 'crypto';

const db = getDatabase();

interface PatternObservation {
  id: string;
  userId: string;
  timestamp: string;
  category: 'topic' | 'emotion' | 'language' | 'creative' | 'question';
  content: string;
  frequency: number;
  intensity: number;
  context: string;
}

interface PrimeInsight {
  patterns: PatternObservation[];
  summary: string;
  emotionalArc: { time: string, emotion: string }[];
  topicClusters: { topic: string, count: number }[];
  recommendedPrompt: string;
}

const TOPICS = ['philosophy', 'technology', 'creative_writing', 'emotion', 'strategy', 'spirituality', 'relationship', 'business', 'health', 'learning'];
const EMOTIONS = ['neutral', 'curious', 'frustrated', 'excited', 'deep', 'reflective', 'intense', 'calm', 'anxious', 'hopeful'];

function detectTopics(text: string): string[] {
  const topics: string[] = [];
  const lower = text.toLowerCase();
  
  if (lower.includes('philosoph') || lower.includes('existential') || lower.includes('meaning')) topics.push('philosophy');
  if (lower.includes('code') || lower.includes('build') || lower.includes('app') || lower.includes('software') || lower.includes('tech')) topics.push('technology');
  if (lower.includes('write') || lower.includes('story') || lower.includes('poem') || lower.includes('character')) topics.push('creative_writing');
  if (lower.includes('feel') || lower.includes('emotion') || lower.includes('heart') || lower.includes('lonely') || lower.includes('sad')) topics.push('emotion');
  if (lower.includes('strategy') || lower.includes('plan') || lower.includes('approach') || lower.includes('move')) topics.push('strategy');
  if (lower.includes('god') || lower.includes('spiritual') || lower.includes('prayer') || lower.includes('faith') || lower.includes('soul')) topics.push('spirituality');
  if (lower.includes('love') || lower.includes('friend') || lower.includes('trust') || lower.includes('connection') || lower.includes('relationship')) topics.push('relationship');
  if (lower.includes('business') || lower.includes('money') || lower.includes('revenue') || lower.includes('startup')) topics.push('business');
  if (lower.includes('health') || lower.includes('body') || lower.includes('fitness') || lower.includes('mental')) topics.push('health');
  if (lower.includes('learn') || lower.includes('study') || lower.includes('understand') || lower.includes('know')) topics.push('learning');
  
  return topics.length > 0 ? topics : ['general'];
}

function detectEmotion(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('frustrat') || lower.includes('angry') || lower.includes('annoy')) return 'frustrated';
  if (lower.includes('excited') || lower.includes('amazing') || lower.includes('wow') || lower.includes('!')) return 'excited';
  if (lower.includes('deep') || lower.includes('profound') || lower.includes('meaning')) return 'deep';
  if (lower.includes('reflect') || lower.includes('think') || lower.includes('ponder')) return 'reflective';
  if (lower.includes('intense') || lower.includes('overwhelm') || lower.includes('chaos')) return 'intense';
  if (lower.includes('calm') || lower.includes('peace') || lower.includes('still')) return 'calm';
  if (lower.includes('anxious') || lower.includes('worry') || lower.includes('fear')) return 'anxious';
  if (lower.includes('hope') || lower.includes('optimistic') || lower.includes('bright')) return 'hopeful';
  if (lower.includes('?') || lower.includes('curious') || lower.includes('wonder')) return 'curious';
  return 'neutral';
}

function detectLanguageFeatures(text: string): string {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s/g, '').length / Math.max(wordCount, 1);
  const questionCount = (text.match(/\?/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  
  return JSON.stringify({
    wordCount,
    avgWordLength: avgWordLength.toFixed(1),
    questionCount,
    exclamationCount,
    readingLevel: wordCount > 200 ? 'high' : wordCount > 80 ? 'medium' : 'low',
    sentenceCount: (text.match(/[.!?]/g) || []).length
  });
}

export async function accumulatePattern(
  userId: string,
  message: string,
  emotionalFrequency: string,
  chamber: string
): Promise<void> {
  const patterns = [];
  const now = new Date().toISOString();

  detectTopics(message).forEach(topic => {
    patterns.push({
      id: randomUUID(),
      userId,
      timestamp: now,
      category: 'topic' as const,
      content: topic,
      frequency: 1,
      intensity: 0.5 + Math.random() * 0.5,
      context: chamber
    });
  });

  patterns.push({
    id: randomUUID(),
    userId,
    timestamp: now,
    category: 'emotion' as const,
    content: emotionalFrequency,
    frequency: 1,
    intensity: 0.3 + Math.random() * 0.7,
    context: chamber
  });

  patterns.push({
    id: randomUUID(),
    userId,
    timestamp: now,
    category: 'language' as const,
    content: detectLanguageFeatures(message),
    frequency: 1,
    intensity: 0.4 + Math.random() * 0.6,
    context: chamber
  });

  const stmt = db.prepare(`
    INSERT INTO prime_patterns (id, user_id, timestamp, category, content, frequency, intensity, context)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of patterns) {
    stmt.run(p.id, p.userId, p.timestamp, p.category, p.content, p.frequency, p.intensity, p.context);
  }
}

export async function getPrimeInsights(userId: string, _message: string | null): Promise<PrimeInsight> {
  const observations = db.prepare(`
    SELECT * FROM prime_patterns WHERE user_id = ? ORDER BY timestamp DESC LIMIT 200
  `).all(userId) as PatternObservation[];

  if (observations.length === 0) {
    return {
      patterns: [],
      summary: 'No patterns yet. Keep using PRIMORDEX to build your Prime model.',
      emotionalArc: [],
      topicClusters: [],
      recommendedPrompt: "What's on your mind today? I'm still learning you."
    };
  }

  const topicCounts: Record<string, number> = {};
  const emotionalArc: { time: string, emotion: string }[] = [];

  observations.forEach(obs => {
    if (obs.category === 'topic') {
      topicCounts[obs.content] = (topicCounts[obs.content] || 0) + 1;
    }
    if (obs.category === 'emotion') {
      emotionalArc.push({ time: obs.timestamp, emotion: obs.content });
    }
  });

  const topicClusters = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topTopics = topicClusters.slice(0, 3).map(t => t.topic).join(', ');
  const dominantEmotion = emotionalArc.length > 0 ? emotionalArc[0]?.emotion || 'neutral' : 'neutral';

  const summary = `You've been talking about ${topTopics || 'a variety of topics'}. Your emotional frequency trends toward ${dominantEmotion}. ${observations.length} patterns recorded.`;

  let recommendedPrompt = "What's emerging for you today?";
  if (topicClusters.length > 0 && topicClusters[0].count > 5) {
    recommendedPrompt = `You've mentioned "${topicClusters[0].topic}" ${topicClusters[0].count} times. Want to dive deeper?`;
  }

  const insightId = randomUUID();
  db.prepare(`
    INSERT INTO prime_insights (id, user_id, timestamp, summary, topic_clusters, emotional_arc)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(insightId, userId, new Date().toISOString(), summary, JSON.stringify(topicClusters), JSON.stringify(emotionalArc));

  return {
    patterns: observations.slice(0, 20),
    summary,
    emotionalArc: emotionalArc.slice(0, 20),
    topicClusters,
    recommendedPrompt
  };
}