import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Sparkles, Clock, BookOpen, Heart, Leaf, Sun, Moon, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface Reflection {
  id: string;
  content: string;
  timestamp: Date;
  type: 'morning' | 'evening' | 'free';
  emotionalState: string;
  insight?: string;
}

export const ZenGarden: React.FC = () => {
  const { token } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'morning' | 'evening' | 'free'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  useEffect(() => {
    loadReflections();
    const hour = new Date().getHours();
    if (hour < 6) setTimeOfDay('night');
    else if (hour < 12) setTimeOfDay('dawn');
    else if (hour < 18) setTimeOfDay('day');
    else setTimeOfDay('dusk');
  }, []);

  const loadReflections = async () => {
    try {
      const res = await fetch('/api/garden/reflections', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.reflections) setReflections(data.reflections.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })));
    } catch (e) { console.error('Failed to load reflections', e); }
  };

  const submitReflection = async () => {
    if (!input.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/garden/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: input, type: inputType })
      });
      if (res.ok) {
        const data = await res.json();
        setReflections(prev => [{ id: data.id, content: input, timestamp: new Date(), type: inputType, emotionalState: data.emotionalState, insight: data.insight }, ...prev]);
        setInput('');
        setShowInput(false);
      }
    } catch (e) { console.error('Failed to submit', e); }
    finally { setIsSubmitting(false); }
  };

  const toggleBreathing = () => setBreathing(!breathing);

  const getTimeGreeting = () => {
    switch (timeOfDay) {
      case 'dawn': return 'The garden awakens with you';
      case 'day': return 'Light moves through the leaves';
      case 'dusk': return 'Shadows lengthen, wisdom deepens';
      case 'night': return 'The garden sleeps. You watch.';
    }
  };

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity }} />
        {timeOfDay === 'dawn' && <motion.div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-amber-500/5 to-transparent" />}
        {timeOfDay === 'dusk' && <motion.div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-500/5 to-transparent" />}
        {timeOfDay === 'night' && <motion.div className="absolute inset-0 bg-black/20" />}
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3"><TreePine className="w-5 h-5 text-emerald-400" /><h2 className="text-xl font-cinzel text-ghost-white tracking-wider">Zen Garden</h2><span className="text-xs text-emerald-400/60 ml-2">Chamber V</span></div>
        <div className="flex items-center gap-4 text-xs"><span className="text-emerald-400/60">{reflections.length} reflections</span><span className="text-emerald-400/60">{getTimeGreeting()}</span></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Breathing Exercise */}
          <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`relative w-48 h-48 mx-auto mb-6 ${breathing ? 'animate-breathe' : ''}`}>
              <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-400/30" animate={breathing ? { scale: [1, 1.15, 1] } : {}} transition={breathing ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {}} />
              <motion.div className="absolute inset-4 rounded-full border-2 border-emerald-400/20" animate={breathing ? { scale: [1, 1.1, 1] } : {}} transition={breathing ? { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } : {}} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button whileTap={{ scale: 0.95 }} onClick={toggleBreathing} className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-emerald-400" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-emerald-400/60 font-mono">{breathing ? 'Release' : 'Breathe'}</span>
                </motion.button>
              </div>
            </div>
            <p className="text-emerald-400/40 text-sm font-mono">{breathing ? '4s in · 4s hold · 4s out · 4s hold' : 'Click to begin box breathing'}</p>
          </motion.div>

          {/* Time-based Prompt */}
          <motion.div className="mb-8 p-6 bg-void-black/50 border border-emerald-500/10 rounded-2xl text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-emerald-400/40 text-sm mb-2 font-mono">{timeOfDay.toUpperCase()}</p>
            <p className="text-ghost-white text-lg font-cinzel">{getTimeGreeting()}</p>
            <p className="text-emerald-400/30 text-sm mt-2">No required input. Just presence.</p>
          </motion.div>

          {/* Reflection Input */}
          <AnimatePresence>
            {!showInput && (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowInput(true)} className="w-full px-6 py-4 border border-emerald-500/10 rounded-2xl text-emerald-400/60 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Sparkles className="w-5 h-5 mx-auto mb-2" />
                <p className="font-medium">Offer a reflection to the garden</p>
                <p className="text-sm text-emerald-400/30 mt-1">Morning pages · Evening review · Free capture</p>
              </motion.button>
            )}

            {showInput && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-void-black/50 border border-emerald-500/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between"><h3 className="font-cinzel text-lg text-ghost-white">Plant a Seed</h3><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowInput(false)} className="text-emerald-400/40 hover:text-emerald-400 p-1"><Sun className="w-5 h-5" /></motion.button></div>
                <div className="flex gap-2">
                  {(['morning', 'evening', 'free'] as const).map(type => (
                    <motion.button key={type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setInputType(type)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${inputType === type ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-void-black/50 text-emerald-400/40 hover:text-ghost-white hover:bg-void-black/30 border border-emerald-500/10'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</motion.button>
                  ))}
                </div>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="What does the garden need to hear today?" className="w-full bg-void-black/50 border border-emerald-500/10 rounded-xl px-4 py-3 text-ghost-white placeholder-emerald-400/20 focus:outline-none focus:border-emerald-500/40 resize-none" rows={4} />
                <div className="flex justify-end gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowInput(false)} className="px-6 py-2 border border-emerald-500/10 rounded-xl text-emerald-400/60 hover:text-emerald-400 hover:border-emerald-500/30">Release</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submitReflection} disabled={!input.trim() || isSubmitting} className={`px-6 py-2 rounded-xl font-medium ${!input.trim() || isSubmitting ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/20 cursor-not-allowed' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}>{isSubmitting ? 'Planting...' : 'Plant'}</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reflections */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-cinzel text-lg text-ghost-white">Garden Memories</h3><span className="text-xs text-emerald-400/40">{reflections.length} seeds planted</span></div>
            <AnimatePresence>
              {selectedReflection && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-void-black border border-emerald-500/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4"><h3 className="font-cinzel text-xl text-ghost-white">Reflection</h3><motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelectedReflection(null)} className="text-emerald-400/40 hover:text-emerald-400 p-1"><Sun className="w-5 h-5" /></motion.button></div>
                    <div className="prose prose-gold max-w-none"><ReactMarkdown>{selectedReflection.content}</ReactMarkdown></div>
                    <div className="mt-4 pt-4 border-t border-emerald-500/5 flex items-center justify-between text-sm">
                      <span className="text-emerald-400/40 capitalize">{selectedReflection.type}</span>
                      <div className="flex items-center gap-3"><span className="text-emerald-400/40">{selectedReflection.timestamp.toLocaleString()}</span>{selectedReflection.insight && <span className="text-emerald-400/60">⚡ {selectedReflection.insight}</span>}</div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {reflections.length === 0 ? (
                <div className="text-center py-12 text-emerald-400/20"><TreePine className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-sm">The garden is bare</p><p className="text-xs opacity-50 mt-1">Plant your first seed</p></div>
              ) : (
                reflections.map((reflection, i) => (
                  <motion.div key={reflection.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} onClick={() => setSelectedReflection(reflection)} className="p-4 bg-void-black/50 border border-emerald-500/5 rounded-xl cursor-pointer hover:border-emerald-500/20 transition-colors group">
                    <p className="text-sm text-ghost-white line-clamp-2">{reflection.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-500/5">
                      <div className="flex items-center gap-2 text-xs text-emerald-400/30"><span className="capitalize">{reflection.type}</span><span>•</span><span>{reflection.timestamp.toLocaleDateString()}</span><span>•</span><span>⚡ {reflection.emotionalState}</span></div>
                      <Heart className="w-4 h-4 text-emerald-400/30 group-hover:text-emerald-400/60 transition-colors" />
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