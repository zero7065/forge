import { useState, useCallback } from 'react';
import { apiGet } from '../utils/api';
import type { PrimeInsight } from '../types';

export function usePrime() {
  const [insights, setInsights] = useState<PrimeInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const getInsights = useCallback(async (message: string): Promise<PrimeInsight> => {
    try {
      setLoading(true);
      const data = await apiGet('/api/ai/consciousness/prime/me');
      const insight: PrimeInsight = {
        patterns: data?.patterns || [],
        summary: data?.summary || '',
        emotionalArc: data?.emotionalArc || [],
        topicClusters: data?.topicClusters || [],
        recommendedPrompt: data?.recommendedPrompt || '',
      };
      setInsights(insight);
      return insight;
    } catch {
      const fallback: PrimeInsight = { patterns: [], summary: 'Pattern accumulation beginning.', emotionalArc: [], topicClusters: [], recommendedPrompt: "What's emerging?" };
      setInsights(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, getInsights };
}
