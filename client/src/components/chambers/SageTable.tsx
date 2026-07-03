import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, MessageSquare, Heart, Brain, Zap, Eye, Copy, Download, Settings, SlidersHorizontal, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface WritingPiece {
  id: string;
  title: string;
  content: string;
  mode: 'flirt' | 'persuade' | 'dark' | 'clarity' | 'raw';
  tone: string;
  authenticityScore: number;
  clarityLevel: number;
  emotionalFrequency: string;
  timestamp: Date;
}

const MODES = [
  { id: 'flirt', name: 'Flirt', icon: Heart, description: 'Playful, magnetic, tension-building', color: 'pink' },
  { id: 'persuade', name: 'Persuade', icon: Brain, description: 'Frame control, anchoring, commitment', color: 'blue' },
  { id: 'dark', name: 'Dark Psy', icon: Zap, description: 'Reverse psychology, shadow work', color: 'purple' },
  { id: 'clarity', name: 'Clarity', icon: Eye, description: 'Precision, truth, no fluff', color: 'green' },
  { id: 'raw', name: 'Raw', icon: MessageSquare, description: 'Unfiltered, authentic, vulnerable', color: 'amber' }
];

export const SageTable: React.FC = () => {
  const { token } = useAuth();
  const [writings, setWritings] = useState<WritingPiece[]>([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<'flirt' | 'persuade' | 'dark' | 'clarity' | 'raw'>('raw');
  const [analysis, setAnalysis] = useState<{ tone: string; authenticity: number; clarity: number; frequency: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadWritings(); }, []);

  const loadWritings = async () => {
    try {
      const res = await fetch('/api/sage/writings', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.writings) setWritings(data.writings.map((w: any) => ({ ...w, timestamp: new Date(w.timestamp) })));
    } catch (e) { console.error('Failed to load writings', e); }
  };

  const analyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/sage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: input, mode: selectedMode })
      });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
    } catch (e) { console.error('Analysis failed', e); }
    finally { setIsAnalyzing(false); }
  };

  const saveWriting = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch('/api/sage/writings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: input.slice(0, 50), content: input, mode: selectedMode, analysis })
      });
      if (res.ok) {
        const data = await res.json();
        setWritings(prev => [data, ...prev]);
        setInput('');
        setAnalysis(null);
      }
    } catch (e) { console.error('Save failed', e); }
  };

  const getModeConfig = () => MODES.find(m => m.id === selectedMode)!;

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3"><ScrollText className="w-5 h-5 text-green-400" /><h2 className="text-xl font-cinzel text-ghost-white tracking-wider">Sage Table</h2><span className="text-xs text-green-400/60 ml-2">Chamber IV</span></div>
        <div className="flex items-center gap-4 text-xs"><span className="text-green-400/60">{writings.length} pieces</span><span className="text-green-400/60">Mode: {getModeConfig().name}</span></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Writing Workspace */}
          <motion.div className="lg:col-span-2 bg-void-black/50 border border-green-500/10 rounded-2xl p-6 flex flex-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-green-400" /><h3 className="font-cinzel text-lg text-ghost-white">The Page</h3></div>
              <div className="flex items-center gap-2">
                {MODES.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <motion.button key={mode.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedMode(mode.id as any)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedMode === mode.id ? 'bg-ancient-gold/20 text-ancient-gold border border-ancient-gold/30' : 'bg-void-black/50 text-amber-400/40 hover:text-ghost-white hover:bg-void-black/30'}`}><Icon className="w-3 h-3 mr-1 inline" />{mode.name}</motion.button>
                  );
                })}
              </div>
            </div>

            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Write in ${getModeConfig().name} mode... ${getModeConfig().description}`} className="w-full bg-void-black/50 border border-green-500/10 rounded-xl px-4 py-3 text-ghost-white placeholder-green-400/20 focus:outline-none focus:border-green-500/40 resize-none transition-all font-inter" rows={10} style={{ minHeight: '200px', fontFamily: 'inherit' }} />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-sm">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyze} disabled={!input.trim() || isAnalyzing} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${!input.trim() || isAnalyzing ? 'bg-green-500/5 border border-green-500/10 text-green-400/20 cursor-not-allowed' : 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'}`}><TrendingUp className="w-4 h-4" /><span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span></motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveWriting} disabled={!input.trim()} className={`px-4 py-2 rounded-xl font-medium transition-all ${!input.trim() ? 'bg-ancient-gold/5 border border-ancient-gold/10 text-ancient-gold/20 cursor-not-allowed' : 'bg-ancient-gold/10 border border-ancient-gold/20 text-ancient-gold hover:bg-ancient-gold/20'}`}>Save Piece</motion.button>
              </div>
              <span className="text-xs text-green-400/40">{input.length} chars • {input.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {/* Analysis Results */}
            <AnimatePresence>
              {analysis && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                  <h4 className="font-cinzel text-sm text-green-400/60 mb-3 flex items-center gap-2"><Brain className="w-4 h-4" />Sage Analysis — {getModeConfig().name} Mode</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-green-400/40">Tone:</span> <span className="text-ghost-white ml-2">{analysis.tone}</span></div>
                    <div><span className="text-green-400/40">Emotional Frequency:</span> <span className="text-ghost-white ml-2">⚡ {analysis.frequency}</span></div>
                    <div><span className="text-green-400/40">Authenticity:</span> <span className="text-ghost-white ml-2">{analysis.authenticity}%</span></div>
                    <div><span className="text-green-400/40">Clarity:</span> <span className="text-ghost-white ml-2">{analysis.clarity}%</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* History / Tools */}
          <motion.div className="lg:col-span-1 space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <motion.div className="bg-void-black/50 border border-green-500/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Settings className="w-5 h-5 text-green-400" /><h3 className="font-cinzel text-lg text-ghost-white">Sage Tools</h3></div></div>
              <div className="space-y-2">
                <motion.button whileHover={{ x: 4 }} className="w-full px-3 py-2 border border-green-500/10 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:border-green-500/30 text-left text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /><span>Conversation Simulator</span></motion.button>
                <motion.button whileHover={{ x: 4 }} className="w-full px-3 py-2 border border-green-500/10 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:border-green-500/30 text-left text-sm flex items-center gap-2"><Brain className="w-4 h-4" /><span>Frame Analyzer</span></motion.button>
                <motion.button whileHover={{ x: 4 }} className="w-full px-3 py-2 border border-green-500/10 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:border-green-500/30 text-left text-sm flex items-center gap-2"><Zap className="w-4 h-4" /><span>Dark Psychology Engine</span></motion.button>
                <motion.button whileHover={{ x: 4 }} className="w-full px-3 py-2 border border-green-500/10 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:border-green-500/30 text-left text-sm flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /><span>Tone Calibrator</span></motion.button>
              </div>
            </motion.div>

            {/* History */}
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-void-black/50 border border-green-500/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3"><h3 className="font-cinzel text-lg text-ghost-white">Writing History</h3><motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowHistory(false)} className="text-green-400/40 hover:text-green-400 p-1"><Eye className="w-4 h-4" /></motion.button></div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {writings.length === 0 ? <div className="text-center py-8 text-green-400/20"><ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No writings yet</p></div> : writings.map((w, i) => (
                      <motion.div key={w.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="p-3 bg-void-black/50 border border-green-500/5 rounded-xl">
                        <p className="font-medium text-sm text-ghost-white truncate">{w.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-green-400/40"><span className="capitalize">{w.mode}</span><span>•</span><span>Auth: {w.authenticityScore}%</span><span>•</span><span>Clarity: {w.clarityLevel}%</span></div>
                        <div className="flex items-center gap-2 mt-2"><motion.button whileHover={{ scale: 1.1 }} className="text-green-400/40 hover:text-green-400 p-1"><Copy className="w-4 h-4" /></motion.button><motion.button whileHover={{ scale: 1.1 }} className="text-green-400/40 hover:text-green-400 p-1"><Download className="w-4 h-4" /></motion.button></div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowHistory(!showHistory)} className="w-full px-4 py-2 border border-green-500/20 rounded-xl text-green-400/60 hover:text-green-400 hover:border-green-500/40 text-sm flex items-center justify-center gap-2">{showHistory ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />} <span>{showHistory ? 'Hide' : 'Show'} History ({writings.length})</span></motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};