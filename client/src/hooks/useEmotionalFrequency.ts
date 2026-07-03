import { useState, useCallback } from 'react';

const EMOTION_KEYWORDS: Record<string, string[]> = {
  frustrated: ['frustrated', 'annoyed', 'stuck', 'angry', 'pissed', 'fed up', 'hate', 'broken'],
  anxious: ['anxious', 'worried', 'nervous', 'scared', 'panic', 'dread', 'overwhelmed'],
  excited: ['excited', 'thrilled', 'amazing', 'incredible', 'cant wait', 'love', 'passionate'],
  sad: ['sad', 'depressed', 'lonely', 'empty', 'hurt', 'pain', 'miss', 'lost'],
  determined: ['determined', 'focused', 'committed', 'ready', 'going to', 'will', 'must'],
  reflective: ['reflect', 'think', 'wonder', 'question', 'meaning', 'purpose', 'why'],
  neutral: ['ok', 'fine', 'sure', 'alright', 'normal', 'usual'],
};

export function useEmotionalFrequency() {
  const [frequency, setFrequency] = useState('neutral');
  const [intensity, setIntensity] = useState(0.5);

  const detectFrequency = useCallback(async (text: string): Promise<string> => {
    const lower = text.toLowerCase();
    let detected = 'neutral';
    let maxMatches = 0;

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      const matches = keywords.filter(k => lower.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detected = emotion;
      }
    }

    // Boost intensity based on punctuation and caps
    const exclamations = (text.match(/!/g) || []).length;
    const capsWords = (text.match(/[A-Z]{2,}/g) || []).length;
    const newIntensity = Math.min(1, 0.3 + maxMatches * 0.2 + exclamations * 0.1 + capsWords * 0.1);

    setFrequency(detected);
    setIntensity(newIntensity);
    return detected;
  }, []);

  return { frequency, intensity, detectFrequency };
}
