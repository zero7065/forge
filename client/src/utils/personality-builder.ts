import type { PersonalityMode } from '../types';

const MODE_PRESETS: Record<string, Partial<PersonalityMode>> = {
  scholar: { style: 'analytical', temperature: 0.6 },
  ghost: { style: 'intuitive', temperature: 0.5 },
  alchemist: { style: 'synthetic', temperature: 0.85 },
  sage: { style: 'communicative', temperature: 0.7 },
  shadow: { style: 'strategic', temperature: 0.8 },
  oracle: { style: 'reflective', temperature: 0.75 },
  jehuCo: { style: 'intimate', temperature: 0.85 },
};

export function getPersonalityPreset(id: string): Partial<PersonalityMode> {
  return MODE_PRESETS[id] || MODE_PRESETS.alchemist;
}

export function detectOptimalMode(emotion: string, messageLength: number, topics: string[]): string {
  if (emotion === 'frustrated' || emotion === 'angry') return 'shadow';
  if (emotion === 'sad' || emotion === 'reflective') return 'oracle';
  if (messageLength > 300) return 'scholar';
  if (messageLength < 30) return 'ghost';
  if (topics.includes('synthesize') || topics.includes('connect')) return 'alchemist';
  if (emotion === 'excited' || emotion === 'determined') return 'jehuCo';
  return 'alchemist';
}

export function buildCustomMode(config: {
  name: string;
  systemPrompt: string;
  temperature?: number;
  style?: string;
}): PersonalityMode {
  return {
    id: 'custom',
    name: config.name,
    description: 'Custom personality mode',
    systemPrompt: config.systemPrompt,
    temperature: config.temperature || 0.7,
    style: config.style || 'custom',
  };
}
