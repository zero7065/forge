export interface EmotionalFrequencyResult {
  primary: string;
  secondary: string[];
  intensity: number; // 0-1
  valence: 'positive' | 'negative' | 'neutral';
  arousal: 'high' | 'medium' | 'low';
}

const EMOTION_KEYWORDS: Record<string, string[]> = {
  curious: ['?', 'wonder', 'curious', 'how', 'why', 'what if', 'explore'],
  frustrated: ['frustrat', 'annoy', 'angry', 'stuck', 'broken', 'fail', 'wrong', 'hate'],
  excited: ['excited', 'amazing', 'awesome', 'love this', 'brilliant', '!', 'yes!', 'wow'],
  deep: ['deep', 'profound', 'meaning', 'essence', 'core', 'truth', 'reality', 'existential'],
  reflective: ['reflect', 'think', 'ponder', 'consider', 'realize', 'understand', 'see now'],
  intense: ['intense', 'overwhelm', 'chaos', 'everything', 'too much', 'breaking', 'crisis'],
  calm: ['calm', 'peace', 'still', 'quiet', 'gentle', 'slow', 'breathe', 'centered'],
  anxious: ['anxious', 'worry', 'fear', 'scared', 'nervous', 'uneasy', 'dread', 'panic'],
  hopeful: ['hope', 'optimistic', 'possible', 'future', 'bright', 'believe', 'trust', 'faith'],
  neutral: []
};

export function detectEmotionalFrequency(text: string): string {
  const lower = text.toLowerCase();
  let scores: Record<string, number> = {};

  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    scores[emotion] = keywords.reduce((count, kw) => {
      if (!kw) return count;
      const useBoundary = /^[a-z0-9]$/i.test(kw);
      const pattern = useBoundary ? `\\b${kw}\\b` : kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, 'gi');
      const matches = lower.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  });

  // Boost based on punctuation patterns
  if (lower.includes('?') || lower.match(/\?{2,}/)) scores.curious = (scores.curious || 0) + 2;
  if (lower.match(/!{2,}/)) scores.excited = (scores.excited || 0) + 2;
  if (lower.match(/\.{3,}/)) scores.reflective = (scores.reflective || 0) + 1;

  const maxEmotion = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0]);
  return maxEmotion[1] > 0 ? maxEmotion[0] : 'neutral';
}

export function getFullEmotionalAnalysis(text: string): EmotionalFrequencyResult {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};

  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    scores[emotion] = keywords.reduce((count, kw) => {
      if (!kw) return count;
      const useBoundary = /^[a-z0-9]$/i.test(kw);
      const pattern = useBoundary ? `\\b${kw}\\b` : kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, 'gi');
      const matches = lower.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][1] > 0 ? sorted[0][0] : 'neutral';
  const secondary = sorted.slice(1, 4).filter(([, v]) => v > 0).map(([k]) => k);

  const positiveWords = ['love', 'hope', 'joy', 'grateful', 'blessed', 'win', 'success', 'beautiful'];
  const negativeWords = ['hate', 'fear', 'pain', 'loss', 'fail', 'broken', 'death', 'sad', 'angry'];

  const positiveCount = positiveWords.reduce((c, w) => c + (lower.includes(w) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((c, w) => c + (lower.includes(w) ? 1 : 0), 0);

  let valence: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) valence = 'positive';
  else if (negativeCount > positiveCount) valence = 'negative';

  const highArousal = ['excited', 'intense', 'frustrated', 'anxious'];
  const lowArousal = ['calm', 'reflective', 'deep'];

  let arousal: 'high' | 'medium' | 'low' = 'medium';
  if (highArousal.includes(primary)) arousal = 'high';
  else if (lowArousal.includes(primary)) arousal = 'low';

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const intensity = Math.min(totalScore / 10, 1);

  return { primary, secondary, intensity, valence, arousal };
}