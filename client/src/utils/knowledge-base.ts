const KNOWLEDGE_TOPICS = [
  { id: 'taoism', name: 'Taoism', keywords: ['wu wei', 'flow', 'effortless', 'tao', 'dao'] },
  { id: 'jung', name: 'Jungian Psychology', keywords: ['shadow', 'archetype', 'unconscious', 'individuation'] },
  { id: 'stoicism', name: 'Stoicism', keywords: ['control', 'accept', 'virtue', 'marcus', 'epictetus'] },
  { id: 'hermeticism', name: 'Hermeticism', keywords: ['kybalion', 'mentalism', 'correspondence', 'vibration', 'polarity'] },
  { id: 'sacred_geometry', name: 'Sacred Geometry', keywords: ['flower of life', 'golden ratio', 'fibonacci', 'metatron'] },
  { id: 'numerology', name: 'Numerology', keywords: ['number 7', 'vibration', 'numerology', 'gematria'] },
  { id: 'dark_psychology', name: 'Dark Psychology', keywords: ['frame', 'manipulation', 'persuasion', 'influence', 'greene'] },
  { id: 'cultivation', name: 'Cultivation Wisdom', keywords: ['cultivation', 'realm', 'ascension', 'dao', 'breakthrough'] },
  { id: 'communication', name: 'Communication Mastery', keywords: ['frequency', 'resonance', 'rapport', 'listening'] },
  { id: 'ai_architecture', name: 'AI Architecture', keywords: ['consciousness', 'prime', 'shade', 'core', 'neural'] },
];

export function getRelevantKnowledge(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWLEDGE_TOPICS
    .filter(topic => topic.keywords.some(kw => lower.includes(kw)))
    .map(topic => topic.name);
}

export function getKnowledgeById(id: string): typeof KNOWLEDGE_TOPICS[number] | undefined {
  return KNOWLEDGE_TOPICS.find(t => t.id === id);
}

export function getAllTopics(): typeof KNOWLEDGE_TOPICS {
  return KNOWLEDGE_TOPICS;
}
