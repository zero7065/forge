import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, Paperclip, Sparkles, Zap, FileText, Image, Video, Archive, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  whisper?: string;
  mode?: string;
}

export const TheForge: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [emotionalFrequency, setEmotionalFrequency] = useState<string>('neutral');
  const [personalityMode, setPersonalityMode] = useState<string>('auto');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'Uploading files for analysis...',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: currentInput,
          chamber: 'forge',
          personalityMode,
          context: { files: uploadedFiles.map(f => f.name) }
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        emotion: data.emotion,
        whisper: data.whisper,
        mode: data.mode
      };

      setMessages(prev => [...prev, assistantMessage]);
      setUploadedFiles([]);
      setEmotionalFrequency(data.emotion || 'neutral');
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I encountered a problem. Please check your connection and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const quickPrompts = [
    "What's emerging in my creative blind spots right now?",
    "Synthesize my last three ideas into something new.",
    "What patterns am I repeating that I don't see?",
    "Give me the raw version of what I need to hear."
  ];

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-cinzel text-ghost-white tracking-wider">The Forge</h2>
          <span className="text-xs text-amber-400/60 ml-2">Chamber I</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-amber-400/60">Emotion: {emotionalFrequency}</span>
          <span className="text-amber-400/60">Mode: {personalityMode}</span>
          <select value={personalityMode} onChange={e => setPersonalityMode(e.target.value)} className="bg-void-black/50 border border-amber-500/20 rounded px-2 py-1 text-amber-300 text-xs focus:outline-none focus:border-amber-500/50">
            <option value="auto">Auto</option>
            <option value="scholar">Scholar</option>
            <option value="ghost">Ghost</option>
            <option value="alchemist">Alchemist</option>
            <option value="sage">Sage</option>
            <option value="shadow">Shadow</option>
            <option value="oracle">Oracle</option>
            <option value="jehuCo">JehuCo</option>
          </select>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 px-6 py-2 overflow-x-auto border-b border-amber-500/5 scrollbar-hide">
        {quickPrompts.map((prompt, i) => (
          <motion.button key={i} whileHover={{ scale: 1.02, backgroundColor: 'rgba(201, 168, 76, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={() => setInput(prompt)} className="flex-shrink-0 px-3 py-1 text-xs text-amber-400/70 border border-amber-500/10 rounded-full hover:border-amber-500/30 transition-all duration-300">{prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}</motion.button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-amber-400/30">
            <Sparkles className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm font-cinzel tracking-wider">The Forge awaits your first spark</p>
            <p className="text-xs mt-2 opacity-50">Drop files, type ideas, or let the alchemy begin</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-amber-500/10 border border-amber-500/20 text-ghost-white' : 'bg-void-black/80 border border-amber-500/10 backdrop-blur-sm'}`}>
                {msg.role === 'assistant' && msg.emotion && (
                  <div className="text-xs text-amber-400/50 mb-2 flex items-center gap-2">
                    <span>⚡ {msg.emotion}</span>
                    {msg.mode && <span>• {msg.mode}</span>}
                    {msg.whisper && <span className="text-amber-400/30 italic">• "{msg.whisper}"</span>}
                  </div>
                )}
                <div className="prose prose-gold max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                <div className="text-[10px] text-amber-400/30 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-void-black/80 border border-amber-500/10 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-amber-400/60 text-sm">Shade is speaking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="relative z-10 px-6 py-2 border-t border-amber-500/5 flex flex-wrap gap-2">
          {uploadedFiles.map((file, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 rounded-full px-3 py-1.5 text-xs">
              {file.type.startsWith('image/') && <Image className="w-3 h-3 text-amber-400" />}
              {file.type.startsWith('video/') && <Video className="w-3 h-3 text-amber-400" />}
              {file.type.includes('zip') && <Archive className="w-3 h-3 text-amber-400" />}
              <FileText className="w-3 h-3 text-amber-400/50" />
              <span className="text-amber-300 max-w-[100px] truncate">{file.name}</span>
              <span className="text-amber-400/30">{(file.size / 1024).toFixed(0)}KB</span>
              <button onClick={() => removeFile(i)} className="text-amber-400/30 hover:text-amber-400 transition-colors">✕</button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 p-4 border-t border-amber-500/10 bg-void-black/30 backdrop-blur-sm">
        <div className="flex items-end gap-3 max-w-6xl mx-auto">
          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Speak your raw into the forge..." className="w-full bg-void-black/50 border border-amber-500/10 rounded-xl px-4 py-3 text-ghost-white placeholder-amber-400/20 focus:outline-none focus:border-amber-500/40 resize-none transition-all duration-300" rows={1} style={{ minHeight: '50px', maxHeight: '200px' }} />
            <button onClick={() => setShowUploadModal(true)} className="absolute right-3 bottom-3 text-amber-400/30 hover:text-amber-400 transition-colors"><Paperclip className="w-4 h-4" /></button>
          </div>

          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(201, 168, 76, 0.1)' }} whileTap={{ scale: 0.95 }} onClick={sendMessage} disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading} className={`p-3 rounded-xl transition-all duration-300 ${(!input.trim() && uploadedFiles.length === 0) || isLoading ? 'bg-amber-500/5 border border-amber-500/10 text-amber-400/20 cursor-not-allowed' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'}`}><Send className="w-5 h-5" /></motion.button>
        </div>

        <div className="flex justify-between text-[10px] text-amber-400/20 mt-2 px-1">
          <span>⌘+Enter to send</span>
          <span>Drop files anywhere</span>
          <span>• {messages.length} sparks</span>
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowUploadModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-void-black border border-amber-500/20 rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-cinzel text-ghost-white mb-4">Upload to The Forge</h3>
              <p className="text-sm text-amber-400/60 mb-6">Supported: PDF, DOCX, TXT, MD, JPG, PNG, MP4, MOV, ZIP<br />Max 50MB per file</p>
              <div className="border-2 border-dashed border-amber-500/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/40 transition-all duration-300" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
                <p className="text-amber-400/40 text-sm">Click or drag files here</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.jpg,.png,.mp4,.mov,.zip" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => setShowUploadModal(false)} className="mt-6 w-full py-2 text-amber-400/40 hover:text-amber-400 transition-colors">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};