import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Brain, Eye, Heart, TrendingUp, Download, Copy, Settings, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../auth/AuthContext';

interface MirrorInsight {
  id: string;
  category: 'patterns' | 'emotions' | 'language' | 'growth' | 'shadow';
  title: string;
  content: string;
  resonance: number;
  timestamp: Date;
}

export const TheMirror: React.FC = () => {
  const { token } = useAuth();
  const [insights, setInsights] = useState<MirrorInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSoulData, setShowSoulData] = useState(false);
  const [soulData, setSoulData] = useState<any>(null);

  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    try {
      const res = await fetch('/api/mirror/insights', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.insights) setInsights(data.insights.map((i: any) => ({ ...i, timestamp: new Date(i.timestamp) })));
    } catch (e) { console.error('Failed to load insights', e); }
    finally { setLoading(false); }
  };

  const downloadSoulData = async () => {
    try {
      const res = await fetch('/api/mirror/soul-data', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setSoulData(data);
      setShowSoulData(true);
    } catch (e) { console.error('Failed to download soul data', e); }
  };

  const categories = ['all', 'patterns', 'emotions', 'language', 'growth', 'shadow'];
  const filteredInsights = selectedCategory === 'all' ? insights : insights.filter(i => i.category === selectedCategory);

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(201,168,76,0.02)_100%)]" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-cinzel text-ghost-white tracking-wider">The Mirror</h2>
          <span className="text-xs text-yellow-400/60 ml-2">Chamber VII</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-yellow-400/60">{insights.length} reflections</span>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={downloadSoulData} className="flex items-center gap-1 px-3 py-1.5 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-ancient-gold hover:bg-ancient-gold/20 text-xs">
            <Download className="w-3 h-3" /><span>Soul Data</span>
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div className="w-24 h-24 mx-auto mb-4 rounded-full bg-ancient-gold/10 border border-ancient-gold/20 flex items-center justify-center animate-pulse-slow">
              <User className="w-12 h-12 text-ancient-gold" />
            </motion.div>
            <h3 className="font-cinzel text-2xl text-ghost-white mb-2">The Mirror Shows What You Cannot See</h3>
            <p className="text-amber-400/40">Prime has been watching. These are the patterns it found.</p>
            <p className="text-xs text-amber-400/20 mt-2 font-mono">No judgment. Pure signal.</p>
          </motion.div>

          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <motion.button key={cat} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-ancient-gold/20 text-ancient-gold border border-ancient-gold/30' : 'bg-void-black/50 text-amber-400/40 hover:text-ghost-white hover:bg-void-black/30 border border-amber-500/10'}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-ancient-gold/20 border-t-ancient-gold" />
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-12 text-amber-400/20">
              <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-cinzel">The mirror is still forming</p>
              <p className="text-xs opacity-50 mt-1">Keep using PRIMORDEX to build your reflection</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div key={selectedCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                {filteredInsights.map((insight, i) => (
                  <motion.div key={insight.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="bg-void-black/50 border border-amber-500/5 rounded-2xl p-6 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(insight.category)}`}>
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-cinzel text-lg text-ghost-white">{insight.title}</h4>
                          <span className="text-xs text-amber-400/30 font-mono">Resonance: {Math.round(insight.resonance * 100)}%</span>
                        </div>
                        <div className="prose prose-gold max-w-none text-sm"><ReactMarkdown>{insight.content}</ReactMarkdown></div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-500/5">
                          <span className="text-xs text-amber-400/30">{insight.timestamp.toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} className="text-amber-400/40 hover:text-amber-400 p-1"><Copy className="w-4 h-4" /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} className="text-amber-400/40 hover:text-amber-400 p-1"><Download className="w-4 h-4" /></motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          <motion.div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StatCard label="Total Patterns" value={insights.length} icon={<Sparkles className="w-5 h-5" />} />
            <StatCard label="Emotional Range" value={new Set(insights.filter(i => i.category === 'emotions').map(i => i.content)).size} icon={<Heart className="w-5 h-5" />} />
            <StatCard label="Growth Markers" value={insights.filter(i => i.category === 'growth').length} icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard label="Shadow Work" value={insights.filter(i => i.category === 'shadow').length} icon={<Zap className="w-5 h-5" />} />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSoulData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSoulData(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-void-black border border-ancient-gold/20 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-cinzel text-ghost-white">Your Soul Data</h3>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowSoulData(false)} className="text-ancient-gold/40 hover:text-ancient-gold p-1">
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="prose prose-gold max-w-none"><ReactMarkdown>{JSON.stringify(soulData, null, 2)}</ReactMarkdown></div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSoulData(false)} className="mt-6 w-full px-4 py-2 border border-ancient-gold/20 rounded-xl text-ancient-gold hover:bg-ancient-gold/10">
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-void-black/50 border border-amber-500/10 rounded-2xl p-4 text-center">
      <div className="text-amber-400/40 mb-2">{icon}</div>
      <div className="text-3xl font-cinzel text-ghost-white">{value}</div>
      <div className="text-xs text-amber-400/40 mt-1">{label}</div>
    </motion.div>
  );
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    patterns: 'bg-blue-500/20 text-blue-400',
    emotions: 'bg-pink-500/20 text-pink-400',
    language: 'bg-purple-500/20 text-purple-400',
    growth: 'bg-green-500/20 text-green-400',
    shadow: 'bg-red-500/20 text-red-400'
  };
  return colors[category] || 'bg-amber-500/20 text-amber-400';
}

function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    patterns: <Brain className="w-6 h-6" />,
    emotions: <Heart className="w-6 h-6" />,
    language: <Settings className="w-6 h-6" />,
    growth: <TrendingUp className="w-6 h-6" />,
    shadow: <Zap className="w-6 h-6" />
  };
  return icons[category] || <Sparkles className="w-6 h-6" />;
}
