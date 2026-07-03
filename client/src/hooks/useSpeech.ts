import { useState, useRef, useCallback } from 'react';
import { apiGet, apiPost } from '../utils/api';

interface UseSpeechOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = options.language || 'en-US';
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [options]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const uploadAudioFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const token = localStorage.getItem('primordex_token');
      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Transcription failed');
      setTranscript(data.text);
      return data.text;
    } catch (err: any) {
      setError(err.message || 'Failed to transcribe audio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { isRecording, transcript, error, loading, startRecording, stopRecording, uploadAudioFile };
}
