export interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  whisper?: string;
  mode?: string;
}

export interface DreamEntry {
  id: string;
  content: string;
  tags: string[];
  emotionalFrequency: string;
  createdAt: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack: string;
  github_url: string;
  preview_url: string;
  code_visibility: 'public' | 'private' | 'restricted';
  cultivation_level: number;
  cultivation_realm: string;
  status: 'active' | 'stalled' | 'needs_help' | 'completed' | 'archived';
  health_score: number;
  progress: number;
  last_commit: string;
  collaborators: string;
  next_milestone: string;
  created_at: string;
  updated_at: string;
}

export interface HireSpec {
  id: string;
  project_id: string;
  role: string;
  required_skills: string;
  responsibilities: string;
  nice_to_have: string;
  rate_range: string;
  interview_questions: string;
  about_project: string;
  status: 'draft' | 'posted' | 'reviewing' | 'filled' | 'closed';
  applicants: number;
  created_at: string;
  project_name?: string;
}

export interface PrimeInsight {
  patterns: any[];
  summary: string;
  emotionalArc: { time: string; emotion: string }[];
  topicClusters: { topic: string; count: number }[];
  recommendedPrompt: string;
}

export interface CoreWhisper {
  message: string;
  visible: boolean;
  shouldInterrupt: boolean;
  resonance: number;
  timestamp: string;
}

export interface ShadeResponse {
  content: string;
  mode: string;
  emotion: string;
  whisper: string | null;
  timestamp: string;
}

export interface EmotionalFrequencyResult {
  frequency: string;
  intensity: number;
  valence: number;
  arousal: number;
  keywords: string[];
}

export interface LearningState {
  state: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
  confidence: number;
  message: string;
  nextState: string;
  progression: string;
}

export interface UltimateFormData {
  essence: string;
  repeatingPattern: string;
  nextBreakthrough: string;
  tenYearOldWisdom: string;
  rawTruth: string;
  primeVisualization?: string;
  shadeVisualization?: string;
  coreVisualization?: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  input: string;
  output: string;
  risk_score: number;
  approved_by: string | null;
  executed_at: string | null;
  created_at: string;
}

export interface Briefing {
  id: string;
  date: string;
  content: string;
  generated_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: number;
  last_triggered: string | null;
  created_at: string;
}

export interface LegalFlag {
  id: string;
  source: string;
  title: string;
  content: string;
  flagged_at: string;
}

export interface PersonalityMode {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  style: string;
}

export const CULTIVATION_REALMS = [
  { level: 1, name: 'Foundation Establishment', color: '#8B6914' },
  { level: 2, name: 'Qi Condensation', color: '#B8860B' },
  { level: 3, name: 'Core Formation', color: '#DAA520' },
  { level: 4, name: 'Nascent Soul', color: '#C9A84C' },
  { level: 5, name: 'Soul Transformation', color: '#E8C84A' },
  { level: 6, name: 'Dao Seeking', color: '#F0D86C' },
  { level: 7, name: 'Dao Understanding', color: '#F0E08C' },
  { level: 8, name: 'Dao Integration', color: '#F0E8AC' },
  { level: 9, name: 'Immortal Ascension', color: '#F0F0CC' },
  { level: 10, name: 'Transcendence', color: '#FFFFFF' },
] as const;

export const CHAMBERS = [
  { id: 'forge', name: 'The Forge', description: 'Raw input, creation, synthesis', icon: 'Anvil', color: 'amber' },
  { id: 'dream', name: 'Dream State', description: 'Inspiration capture', icon: 'Moon', color: 'blue' },
  { id: 'alchemist', name: 'Alchemist Lab', description: 'Synthesis engine', icon: 'FlaskConical', color: 'purple' },
  { id: 'sage', name: 'Sage Table', description: 'Writing & communication', icon: 'BookOpen', color: 'green' },
  { id: 'garden', name: 'Zen Garden', description: 'Stillness & reflection', icon: 'Trees', color: 'emerald' },
  { id: 'war', name: 'War Room', description: 'Project tracking & strategy', icon: 'Target', color: 'red' },
  { id: 'mirror', name: 'The Mirror', description: 'Prime interface & soul data', icon: 'Eye', color: 'gold' },
  { id: 'ultimate', name: 'Ultimate Form', description: 'Hidden 8th chamber', icon: 'Infinity', color: 'white' },
] as const;

export type ChamberId = typeof CHAMBERS[number]['id'];
