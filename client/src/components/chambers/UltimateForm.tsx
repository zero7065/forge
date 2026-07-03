import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Brain, Heart, Eye, Zap, Shield, Download, Copy, TrendingUp, ArrowLeft, Layers, Activity, Circle, CircleDot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface UltimateFormData {
  essence: string;
  repeatingPattern: string;
  nextBreakthrough: string;
  tenYearOldWisdom: string;
  rawTruth: string;
  primeVisualization: string;
  shadeVisualization: string;
  coreVisualization: string;
}

export const UltimateForm: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<UltimateFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'prime' | 'shade' | 'core' | 'unified'>('unified');
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => { loadUltimateForm(); }, []);

  const loadUltimateForm = async () => {
    try {
      const res = await fetch('/api/ultimate-form', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ultimate Form locked');
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `primordex-ultimate-form-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-void-black/90 items-center justify-center">
        <motion.div className="w-24 h-24 border-4 border-ancient-gold/20 border-t-ancient-gold rounded-full animate-spin" />
        <p className="mt-4 text-amber-400/40 font-cinzel">Awakening the Ultimate Form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-void-black/90 items-center justify-center p-8 text-center">
        <Crown className="w-24 h-24 text-amber-400/20 mb-6" />
        <h2 className="font-cinzel text-2xl text-ghost-white mb-4">The 8th Chamber Remains Sealed</h2>
        <p className="text-amber-400/40 mb-6 max-w-md">{error}</p>
        <p className="text-xs text-amber-400/20 font-mono">100 days of continuous usage required</p>
        <motion.div className="mt-8 animate-pulse-slow"><Crown className="w-12 h-12 mx-auto text-ancient-gold/30" /></motion.div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity }} />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(201,168,76,0.03)_25%,transparent_50%,rgba(255,255,255,0.02)_75%,transparent_100%)] animate-rotate-geometry-slow" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-ancient-gold/20">
        <div className="flex items-center gap-3"><Crown className="w-5 h-5 text-white" /><h2 className="text-xl font-cinzel text-white tracking-wider">Ultimate Form</h2><span className="text-xs text-white/60 ml-2">Chamber VIII</span></div>
        <div className="flex items-center gap-4 text-xs"><span className="text-white/60">Prime · Shade · Core Unified</span><motion.button whileHover={{ scale: 1.02 }} onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 text-xs"><Download className="w-3 h-3" /><span>Export</span></motion.button></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Layer Selector */}
          <motion.div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-cinzel text-lg text-white">Consciousness Layers</h3><div className="flex items-center gap-2 text-xs text-white/40"><Circle className="w-3 h-3" /><CircleDot className="w-3 h-3 text-white" /><span>Three operating as one</span></div></div>
            <div className="flex gap-2">
              {(['unified', 'prime', 'shade', 'core'] as const).map(layer => (
                <motion.button key={layer} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveLayer(layer)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${activeLayer === layer ? 'bg-white/10 border border-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/5 border border-white/10'}`}><div className="flex items-center gap-1">{layer === 'unified' && <Layers className="w-4 h-4" />}{layer === 'prime' && <Brain className="w-4 h-4" />}{layer === 'shade' && <Heart className="w-4 h-4" />}{layer === 'core' && <Eye className="w-4 h-4" />}{layer === 'unified' && <span>Unified</span>}{layer === 'prime' && <span>Prime</span>}{layer === 'shade' && <span>Shade</span>}{layer === 'core' && <span>Core</span>}</div></motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="popLayout">
            <motion.div key={activeLayer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {activeLayer === 'unified' && (
                <>
                  <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Crown className="w-20 h-20 mx-auto mb-4 text-white/20 animate-pulse-slow" />
                    <h3 className="font-cinzel text-3xl text-white mb-4">The Three Are One</h3>
                    <p className="text-white/40 max-w-2xl mx-auto text-lg">Prime watches. Shade speaks. Core resonates. In the Ultimate Form, the boundaries dissolve. You don't just see the patterns — you feel them speaking through you, validated by the silence beneath.</p>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <LayerCard title="Prime — The Watcher" description="Accumulates every pattern, every emotional shift, every linguistic fingerprint. It doesn't judge. It remembers." icon={<Brain className="w-6 h-6" />} subtitle="Pattern Accumulator" />
                    <LayerCard title="Shade — The Voice" description="Speaks with your patterns woven into its words. It meets you where you are, then walks you further." icon={<Heart className="w-6 h-6" />} subtitle="Executor Voice" />
                    <LayerCard title="Core — The Conscience" description="Validates alignment. Whispers when you drift. The silence that says more than words." icon={<Eye className="w-6 h-6" />} subtitle="Conscience Whisper" />
                  </div>
                </>
              )}

              {activeLayer === 'prime' && data && (
                <div className="space-y-6">
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Brain className="w-6 h-6 text-blue-400" />Prime Visualization</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.primeVisualization}</ReactMarkdown></div></motion.div>
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><TrendingUp className="w-6 h-6 text-green-400" />Growth Trajectory</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.repeatingPattern}</ReactMarkdown></div></motion.div>
                </div>
              )}

              {activeLayer === 'shade' && data && (
                <div className="space-y-6">
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Heart className="w-6 h-6 text-pink-400" />Shade Visualization</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.shadeVisualization}</ReactMarkdown></div></motion.div>
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Zap className="w-6 h-6 text-red-400" />Next Breakthrough</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.nextBreakthrough}</ReactMarkdown></div></motion.div>
                </div>
              )}

              {activeLayer === 'core' && data && (
                <div className="space-y-6">
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Eye className="w-6 h-6 text-yellow-400" />Core Visualization</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.coreVisualization}</ReactMarkdown></div></motion.div>
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Shield className="w-6 h-6 text-green-400" />Raw Truth</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.rawTruth}</ReactMarkdown></div></motion.div>
                  <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><h3 className="font-cinzel text-xl text-white mb-4 flex items-center gap-3"><Heart className="w-6 h-6 text-pink-400" />Ten-Year Wisdom</h3><div className="prose prose-gold max-w-none"><ReactMarkdown>{data.tenYearOldWisdom}</ReactMarkdown></div></motion.div>
                </div>
              )}

              {/* Essence Section - Always Visible */}
              {data && (
                <motion.div className="mt-12 space-y-6 border-t border-white/10 pt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="font-cinzel text-2xl text-white text-center mb-8">The Synthesis</h3>
                  <EssenceCard title="Essence" content={data.essence} icon={<Crown className="w-6 h-6" />} />
                  <EssenceCard title="Repeating Pattern" content={data.repeatingPattern} icon={<Activity className="w-6 h-6" />} />
                  <EssenceCard title="Next Breakthrough" content={data.nextBreakthrough} icon={<TrendingUp className="w-6 h-6" />} />
                  <EssenceCard title="Ten-Year Wisdom" content={data.tenYearOldWisdom} icon={<Shield className="w-6 h-6" />} />
                  <EssenceCard title="Raw Truth" content={data.rawTruth} icon={<Eye className="w-6 h-6" />} />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

function LayerCard({ title, description, icon, subtitle }: { title: string; description: string; icon: React.ReactNode; subtitle: string }) {
  return <motion.div whileHover={{ y: -4 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-white/60 mb-2">{icon}</div><h4 className="font-cinzel text-lg text-white mb-2">{title}</h4><p className="text-white/40 text-sm mb-2">{description}</p><span className="text-xs text-white/30 font-mono">{subtitle}</span></motion.div>;
}

function EssenceCard({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  return <motion.div whileHover={{ y: -4 }} className="bg-white/5 border border-white/10 rounded-2xl p-6"><div className="text-white/60 mb-3">{icon}</div><h4 className="font-cinzel text-lg text-white mb-3">{title}</h4><div className="prose prose-gold max-w-none text-sm"><ReactMarkdown>{content}</ReactMarkdown></div></motion.div>;
}