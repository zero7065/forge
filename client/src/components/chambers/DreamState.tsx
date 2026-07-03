import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, Type, Wand2, Heart, BookOpen, Save, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface DreamEntry {
  id: string;
  content: string;
  timestamp: Date;
  emotion: string;
  tags: string[];
}

export const DreamState: React.FC = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [emotionalFrequency, setEmotionalFrequency] = useState('neutral');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const res = await fetch('/api/dream/entries', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.entries) setEntries(data.entries.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
    } catch (e) { console.error('Failed to load entries', e); }
  };

  const saveEntry = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/dream/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: input })
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(prev => [{ id: data.id, content: input, timestamp: new Date(), emotion: data.emotion, tags: data.tags }, ...prev]);
        setInput('');
        setEmotionalFrequency(data.emotion || 'neutral');
      }
    } catch (e) { console.error('Failed to save', e); }
    finally { setIsLoading(false); }
  };

  const deleteEntry = async (id: string) => {
    try {
      await fetch(`/api/dream/entries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) { console.error('Failed to delete', e); }
  };

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-blue-400" /><h2 className="text-xl font-cinzel text-ghost-white tracking-wider">Dream State</h2><span className="text-xs text-blue-400/60 ml-2">Chamber II</span></div>
        <div className="flex items-center gap-4 text-xs"><span className="text-blue-400/60">Frequency: {emotionalFrequency}</span><span className="text-blue-400/60">{entries.length} captured</span></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Capture Area */}
          <motion.div className="bg-void-black/60 border border-blue-500/10 rounded-2xl p-6 mb-6" whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-cinzel text-lg text-ghost-white">Capture the Fleeting</h3>
            </div>
            <p className="text-blue-400/40 text-sm mb-4">No structure required. No analysis. Pure capture. What visited you in the night? What sparked in the shower? What whispered before sleep?</p>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="The dream remembers what the waking mind forgets..." className="w-full bg-void-black/50 border border-blue-500/10 rounded-xl px-4 py-3 text-ghost-white placeholder-blue-400/20 focus:outline-none focus:border-blue-500/40 resize-none transition-all" rows={3} style={{ minHeight: '100px' }} />
            <div className="flex justify-between mt-4">
              <span className="text-xs text-blue-400/30">{input.length} characters</span>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveEntry} disabled={!input.trim() || isLoading} className={`px-6 py-2 rounded-xl font-medium transition-all ${!input.trim() || isLoading ? 'bg-blue-500/5 border border-blue-500/10 text-blue-400/20 cursor-not-allowed' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'}`}>{isLoading ? 'Capturing...' : 'Capture'}</motion.button>
            </div>
          </motion.div>

          {/* Entries */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-lg text-ghost-white">Captured Fragments</h3>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEntries(!showEntries)} className="text-blue-400/50 hover:text-blue-400 text-sm flex items-center gap-1">{showEntries ? 'Hide' : 'Show'} {entries.length} entries</motion.button>
          </div>

          <AnimatePresence>
            {showEntries && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                {entries.length === 0 ? (
                  <div className="text-center py-12 text-blue-400/20"><Moon className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No dreams captured yet</p><p className="text-xs opacity-50">The void waits</p></div>
                ) : (
                  entries.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="bg-void-black/50 border border-blue-500/5 rounded-xl p-4 group relative">
                      <div className="prose prose-gold max-w-none text-sm"><ReactMarkdown>{entry.content}</ReactMarkdown></div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-500/5">
                        <div className="flex items-center gap-2 text-xs text-blue-400/30">
                          <span>{entry.timestamp.toLocaleDateString()} • {entry.timestamp.toLocaleTimeString()}</span>
                          <span>•</span>
                          <span className="text-blue-400/60">⚡ {entry.emotion}</span>
                          {entry.tags.length > 0 && <span>• {entry.tags.join(', ')}</span>}
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-blue-400/30 hover:text-red-400 transition-opacity p-1"><Trash2 className="w-4 h-4" /></motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};