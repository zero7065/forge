// The Forge — Main AI Chamber with Streaming Chat, RAG, Web Search, Dark Mode
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Upload, Zap, Settings, X } from 'lucide-react';
import StreamingChat from '../../components/live/StreamingChat';
import { useAuth } from '../../auth/AuthContext';

export const TheForge: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-full flex-col bg-void-black text-ghost-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/10 bg-void-black/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-ghost-white tracking-wider">The Forge</h1>
            <p className="text-xs text-ancient-gold/40">Chamber I — Raw creation & synthesis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg text-ghost-white/40 hover:text-ghost-white hover:bg-void-black/30">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[100px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }} />
        </div>
        <StreamingChat />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-void-black border border-amber-500/20 rounded-2xl p-8 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-cinzel text-ghost-white">Forge Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 text-ghost-white/40 hover:text-ghost-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-ancient-gold/60 uppercase tracking-tighter mb-3">AI Model</h4>
                <div className="flex items-center gap-2 p-3 bg-void-black/30 border border-void-black/30 rounded-lg">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-ghost-white">Groq — openai/gpt-oss-20b (fast)</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-ancient-gold/60 uppercase tracking-tighter mb-3">Personality Modes</h4>
                <div className="space-y-2">
                  {[
                    { id: 'auto', name: 'Auto', desc: 'Adaptive mode based on input' },
                    { id: 'scholar', name: 'Scholar', desc: 'Deep analytical thinking' },
                    { id: 'ghost', name: 'Ghost', desc: 'Minimal, essential responses' },
                    { id: 'alchemist', name: 'Alchemist', desc: 'Creative synthesis' },
                    { id: 'sage', name: 'Sage', desc: 'Communication mastery' },
                    { id: 'shadow', name: 'Shadow', desc: 'Dark psychology, confrontation' },
                    { id: 'oracle', name: 'Oracle', desc: 'Pattern recognition, foresight' },
                    { id: 'jehuCo', name: 'JehuCo', desc: 'Founder voice, legacy-obsessed' }
                  ].map((mode) => (
                    <div key={mode.id} className="flex items-center justify-between p-3 bg-void-black/30 border border-void-black/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-400/60">
                          <Zap className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-sm text-ghost-white">{mode.name}</div>
                          <div className="text-[10px] text-ancient-gold/40">{mode.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-void-black/30">
                <div>
                  <h4 className="text-sm font-medium text-ancient-gold/60 uppercase tracking-tighter mb-1">Version</h4>
                  <p className="text-xs text-ghost-white/50">BEYOND v2.0 — Sovereign AI OS</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-lg text-sm text-amber-400 hover:text-ghost-white hover:bg-void-black/30 transition-colors">Close</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TheForge;
