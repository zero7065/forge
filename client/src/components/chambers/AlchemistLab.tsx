import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Zap, Lightbulb, Brain, Sparkles, ArrowRight, Plus, Minus, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface Fragment {
  id: string;
  content: string;
  source: 'forge' | 'dream' | 'manual';
  timestamp: Date;
  tags: string[];
}

interface Synthesis {
  id: string;
  fragments: string[];
  result: string;
  timestamp: Date;
}

export const AlchemistLab: React.FC = () => {
  const { token } = useAuth();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [syntheses, setSyntheses] = useState<Synthesis[]>([]);
  const [selectedFragments, setSelectedFragments] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [imaginationMind, setImaginationMind] = useState<string[]>([]);
  const [showImagination, setShowImagination] = useState(false);

  useEffect(() => { loadFragments(); }, []);

  const loadFragments = async () => {
    try {
      const res = await fetch('/api/alchemist/fragments', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.fragments) setFragments(data.fragments.map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) })));
    } catch (e) { console.error('Failed to load fragments', e); }
  };

  const toggleFragment = (id: string) => {
    setSelectedFragments(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const synthesize = async () => {
    if (selectedFragments.length < 2) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/alchemist/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fragmentIds: selectedFragments })
      });
      const data = await res.json();
      if (res.ok) {
        setSyntheses(prev => [{ id: data.id, fragments: selectedFragments, result: data.result, timestamp: new Date() }, ...prev]);
        setImaginationMind(data.imaginationMind || []);
        setShowImagination(true);
        setSelectedFragments([]);
      }
    } catch (e) { console.error('Synthesis failed', e); }
    finally { setIsSynthesizing(false); }
  };

  const getSelected = () => fragments.filter(f => selectedFragments.includes(f.id));

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3"><FlaskConical className="w-5 h-5 text-purple-400" /><h2 className="text-xl font-cinzel text-ghost-white tracking-wider">Alchemist Lab</h2><span className="text-xs text-purple-400/60 ml-2">Chamber III</span></div>
        <div className="flex items-center gap-4 text-xs"><span className="text-purple-400/60">{fragments.length} fragments</span><span className="text-purple-400/60">{syntheses.length} syntheses</span><span className={`px-2 py-0.5 rounded-full text-xs ${isSynthesizing ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-void-black/50 text-purple-400/40'}`}>{isSynthesizing ? 'Transmuting...' : 'Ready'}</span></div>
      </div>

      <div className="relative z-10 flex-1 overflow-hidden px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Fragment Library */}
          <motion.div className="lg:col-span-1 bg-void-black/50 border border-purple-500/10 rounded-2xl p-4 flex flex-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /><h3 className="font-cinzel text-lg text-ghost-white">Fragments</h3></div><span className="text-xs text-purple-400/40">{fragments.length} stored</span></div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {fragments.length === 0 ? (
                <div className="text-center py-12 text-purple-400/20"><Brain className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No fragments yet</p><p className="text-xs opacity-50">Forge sparks, capture dreams, or add manually</p></div>
              ) : (
                fragments.map(fragment => (
                  <motion.div key={fragment.id} whileHover={{ x: 4 }} className={`p-3 rounded-xl border transition-all ${selectedFragments.includes(fragment.id) ? 'border-purple-500/50 bg-purple-500/10' : 'border-purple-500/5 hover:border-purple-500/20'} cursor-pointer`} onClick={() => toggleFragment(fragment.id)}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${selectedFragments.includes(fragment.id) ? 'bg-purple-400' : 'bg-purple-500/30'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ghost-white line-clamp-2">{fragment.content}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <span className="text-purple-400/40 capitalize">{fragment.source}</span>
                          <span className="text-purple-500/30">•</span>
                          <span className="text-purple-400/30">{fragment.timestamp.toLocaleDateString()}</span>
                          {fragment.tags.length > 0 && <span className="text-purple-400/30">• {fragment.tags.join(', ')}</span>}
                        </div>
                      </div>
                      {selectedFragments.includes(fragment.id) && <Zap className="w-4 h-4 text-purple-400" />}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 px-3 py-2 border border-purple-500/20 rounded-xl text-purple-400/60 hover:text-purple-400 hover:border-purple-500/40 text-sm flex items-center justify-center gap-1"><Plus className="w-4 h-4" /><span>Add Fragment</span></motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={selectedFragments.length < 2} className={`px-6 py-2 rounded-xl font-medium flex items-center justify-center gap-2 ${selectedFragments.length < 2 ? 'bg-purple-500/5 border border-purple-500/10 text-purple-400/20 cursor-not-allowed' : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'}`} onClick={synthesize}><Zap className="w-4 h-4" /><span>Synthesize ({selectedFragments.length})</span></motion.button>
            </div>
          </motion.div>

          {/* Synthesis Workspace */}
          <motion.div className="lg:col-span-2 bg-void-black/50 border border-purple-500/10 rounded-2xl p-6 flex flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-purple-400" /><h3 className="font-cinzel text-lg text-ghost-white">Synthesis</h3></div><span className="text-xs text-purple-400/40">{selectedFragments.length} fragments selected</span></div>

            {getSelected().length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {getSelected().map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                    <p className="text-sm text-ghost-white">{f.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-purple-400/40"><span>#{i + 1}</span><span className="capitalize">{f.source}</span></div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-purple-400/20"><div className="text-center"><Zap className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-sm">Select 2+ fragments to begin transmutation</p><p className="text-xs opacity-50 mt-1">The alchemist combines what the fool separates</p></div></div>
            )}

            <div className="border-t border-purple-500/5 pt-4">
              <h4 className="font-cinzel text-sm text-purple-400/60 mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Imagination Mind — 3 Unexpected Expansions</h4>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowImagination(!showImagination)} className="w-full px-4 py-2 border border-purple-500/20 rounded-xl text-purple-400/60 hover:text-purple-400 hover:border-purple-500/40 text-sm flex items-center justify-center gap-2">{showImagination ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />} <span>{showImagination ? 'Hide' : 'Reveal'} Imagination Mind</span></motion.button>
            <AnimatePresence>
              {showImagination && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-2">
                  {imaginationMind.length > 0 ? imaginationMind.map((expansion, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                      <div className="flex items-start gap-3"><span className="text-purple-400 font-mono text-sm">#{i + 1}</span><div className="flex-1 prose prose-gold max-w-none text-sm"><ReactMarkdown>{expansion}</ReactMarkdown></div></div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-purple-400/30"><Sparkles className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">Synthesize fragments to awaken the Imagination Mind</p></div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>

          {/* Synthesis History */}
          <motion.div className="lg:col-span-3 bg-void-black/50 border border-purple-500/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /><h3 className="font-cinzel text-lg text-ghost-white">Synthesis History</h3></div><span className="text-xs text-purple-400/40">{syntheses.length} transmutations</span></div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {syntheses.length === 0 ? (
                <div className="text-center py-8 text-purple-400/20"><Zap className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No syntheses yet</p><p className="text-xs opacity-50">The crucible awaits</p></div>
              ) : (
                syntheses.map((synthesis, i) => (
                  <motion.div key={synthesis.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-void-black/50 border border-purple-500/5 rounded-xl p-4">
                    <div className="prose prose-gold max-w-none text-sm"><ReactMarkdown>{synthesis.result}</ReactMarkdown></div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/5">
                      <span className="text-xs text-purple-400/30">{synthesis.timestamp.toLocaleString()}</span>
                      <div className="flex items-center gap-2"><motion.button whileHover={{ scale: 1.1 }} className="text-purple-400/40 hover:text-purple-400 p-1"><Copy className="w-4 h-4" /></motion.button><motion.button whileHover={{ scale: 1.1 }} className="text-purple-400/40 hover:text-purple-400 p-1"><Download className="w-4 h-4" /></motion.button></div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};