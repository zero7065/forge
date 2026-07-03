import { useState, useCallback } from 'react';
import { apiPost } from '../utils/api';
import type { ShadeResponse } from '../types';

interface ShadeRequest {
  message: string;
  chamber: string;
  personalityMode: string;
  insights: any;
  whisper: any;
  emotionalFrequency: string;
  files?: File[];
}

export function useShade() {
  const [response, setResponse] = useState<ShadeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (request: ShadeRequest): Promise<ShadeResponse> => {
    try {
      setLoading(true);
      const data = await apiPost('/api/ai/chat', {
        message: request.message,
        chamber: request.chamber,
        personalityMode: request.personalityMode,
        context: { files: request.files?.map(f => f.name) || [] },
      });
      const result: ShadeResponse = {
        content: data.response,
        mode: data.mode || request.personalityMode,
        emotion: data.emotion || request.emotionalFrequency,
        whisper: data.whisper || null,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      setResponse(result);
      return result;
    } catch (error: any) {
      const fallback: ShadeResponse = {
        content: 'Something shifted in the connection. Try again — I\'m here.',
        mode: request.personalityMode,
        emotion: request.emotionalFrequency,
        whisper: null,
        timestamp: new Date().toISOString(),
      };
      setResponse(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShadeResponse = useCallback(async (request: ShadeRequest): Promise<ShadeResponse> => {
    return sendMessage(request);
  }, [sendMessage]);

  return { response, loading, sendMessage, getShadeResponse };
}
