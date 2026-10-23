// Streaming Chat Interface — Claude-level UX with SSE, RAG, web search, dark mode
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  FileText, 
  Globe, 
  Brain, 
  ShieldAlert, 
  LayoutDashboard,
  Settings,
  MessageCircle,
  Users,
  Upload,
  ArrowRight,
  ChevronRight,
  X,
  Copy,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';

const STREAM_CHUNK_DELAY = 10;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotion?: string;
  whisper?: string;
  mode?: string;
  sources?: any[];
  webResults?: any[];
  hasRag?: boolean;
  hasWeb?: boolean;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  error: string | null;
}

export const StreamingChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [useRag, setUseRag] = useState(false);
  [, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setError(null);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('primordex_token')}`
        },
        body: JSON.stringify({
          message: input,
          chamber: 'forge',
          personalityMode: 'auto',
          useWeb,
          useRag,
          thinking: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';
      let assistantContent = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'token') {
                assistantContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                ));
              } else if (currentEvent === 'start') {
                setMessages(prev => prev.map(m => 
                  m.id === assistantId ? { 
                    ...m, 
                    emotion: data.emotion,
                    whisper: data.whisper,
                    mode: data.mode,
                    hasRag: data.hasRag,
                    hasWeb: data.hasWeb,
                    ragSources: data.ragSources,
                    webResults: data.webResults
                  } : m
                ));
              } else if (currentEvent === 'complete') {
                setMessages(prev => prev.map(m => 
                  m.id === assistantId ? { 
                    ...m, 
                    isStreaming: false,
                    ...data
                  } : m
                ));
                setIsStreaming(false);
              } else if (currentEvent === 'error') {
                setError(data.message);
                setIsStreaming(false);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      setIsStreaming(false);
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, isStreaming: false, content: m.content || 'Error generating response.' } : m
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-full flex-col bg-void-black text-ghost-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-void-black/80 border-b border-amber-500/10 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-cinzer text-xl font-bold text-ghost-white">PRIMORDEX</h1>
            <p className="text-xs text-ancient-gold/40">Sovereign AI • Shade • Prime • Core</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseWeb(!useWeb)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${useWeb ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-void-black/50 text-ghost-white/40 hover:bg-void-black/30 border border-void-black/20'}`}
            title="Live Web Search"
          >
            <Globe className="w-4 h-4" />
            <span className="ml-1">Web</span>
          </button>
          <button
            onClick={() => setUseRag(!useRag)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${useRag ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-void-black/50 text-ghost-white/40 hover:bg-void-black/30 border border-void-black/20'}`}
            title="RAG Knowledge Base"
          >
            <FileText className="w-4 h-4" />
            <span className="ml-1">Knowledge</span>
          </button>
          <button onClick={clearChat} className="p-2 text-ghost-white/40 hover:text-ghost-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={messagesEndRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-ghost-white/20">
            <MessageCircle className="w-16 h-16 mb-4" />
            <p className="text-sm">Start a conversation. I can search the web, search your knowledge base, and think deeply.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-amber-500/20 text-ghost-white border border-amber-500/30'
                : 'bg-void-black/50 text-ghost-white border border-void-black/30'
            }`}>
              <div className="flex items-start gap-2">
                {msg.role === 'user' ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] text-ancient-gold/40 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-void-black">
                      <Send className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-void-black/80 flex items-center justify-center text-amber-400 border border-void-black/30">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      {msg.mode && (
                        <span className="text-[10px] text-amber-400/60 font-mono uppercase tracking-tighter">
                          {msg.mode.toUpperCase()}
                        </span>
                      )}
                      <div className="flex flex-col gap-1">
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.whisper && (
                          <p className="text-[11px] text-ancient-gold/30 italic mt-1">"*...and yet, {msg.whisper.toLowerCase()}*</p>
                        )}
                        <p className="text-[10px] text-ghost-white/40 mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {msg.role === 'assistant' && msg.isStreaming && (
                <div className="flex items-center gap-1 mt-2 animate-pulse">
                  <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                  <span className="w-1 h-1 bg-amber-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1 h-1 bg-amber-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}
              
              {(msg.hasRag || msg.hasWeb) && msg.role === 'assistant' && !msg.isStreaming && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.webResults?.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="px-2 py-1 bg-void-black/30 border border-ancient-gold/10 rounded text-[10px] text-ancient-gold/50">
                      <Globe className="w-3 h-3 mr-1" />
                      {r.title}
                    </div>
                  ))}
                  {msg.hasRag && (
                    <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400/60">
                      <FileText className="w-3 h-3 mr-1" />
                      Knowledge Base
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-void-black/80 border-t border-amber-500/10 backdrop-blur-xl z-10">
        <div className="flex items-end gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              rows={1}
              maxRows={4}
              className="w-full bg-void-black/50 border border-void-black/30 rounded-xl px-4 py-3 text-ghost-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
              disabled={isStreaming}
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                onClick={() => setUseWeb(!useWeb)}
                className={`p-1.5 rounded-md text-xs transition-all ${useWeb ? 'bg-amber-500/20 text-amber-400' : 'text-ghost-white/40 hover:text-ghost-white'}`}
                title="Web Search"
              >
                <Globe className="w-3 h-3" />
              </button>
              <button
                onClick={() => setUseRag(!useRag)}
                className={`p-1.5 rounded-md text-xs transition-all ${useRag ? 'bg-purple-500/20 text-purple-400' : 'text-ghost-white/40 hover:text-ghost-white'}`}
                title="Knowledge Base"
              >
                <FileText className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className={`px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
              !input.trim() || isStreaming
                ? 'bg-void-black/30 text-ghost-white/30 border border-void-black/20'
                : 'bg-amber-500 text-void-black hover:bg-amber-400'
            }`}
          >
            {isStreaming ? (
              <>
                <span className="flex items-center gap-1 animate-pulse">
                  <span className="w-1 h-1 bg-void-black rounded-full"></span>
                  <span className="w-1 h-1 bg-void-black rounded-full" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1 h-1 bg-void-black rounded-full" style={{ animationDelay: '0.4s' }}></span>
                </span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="ml-1">Send</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;
