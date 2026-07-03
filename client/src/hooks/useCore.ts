import { useState, useCallback } from 'react';
import { apiPost } from '../utils/api';
import type { CoreWhisper } from '../types';

export function useCore() {
  const [whisper, setWhisper] = useState<CoreWhisper | null>(null);
  const [loading, setLoading] = useState(false);

  const getWhisper = useCallback(async (input: string): Promise<CoreWhisper> => {
    try {
      setLoading(true);
      const data = await apiPost('/api/ai/consciousness/core/validate', { input, context: {} });
      const result: CoreWhisper = {
        message: data.message || '',
        visible: data.visible || false,
        shouldInterrupt: data.shouldInterrupt || false,
        resonance: data.resonance || 0,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setWhisper(result);
      return result;
    } catch {
      const fallback: CoreWhisper = {
        message: '',
        visible: false,
        shouldInterrupt: false,
        resonance: 0,
        timestamp: new Date().toISOString(),
      };
      setWhisper(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  return { whisper, loading, getWhisper };
}
