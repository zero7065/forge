// Dashboard — Modern Glassmorphic Bento Layout
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Moon, FlaskConical, ScrollText, TreePine, Target, User, Crown, 
  LayoutDashboard, Grid, Menu, X, ChevronRight, Menu as MenuIcon, 
  Brain, Activity, Zap, Shield, FileText, Globe, Clock, Settings
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import StreamingChat from '../components/live/StreamingChat';
import { TheForge } from '../components/chambers/TheForge';
import { DreamState } from '../components/chambers/DreamState';
import { AlchemistLab } from '../components/chambers/AlchemistLab';
import { SageTable } from '../components/chambers/SageTable';
import { ZenGarden } from '../components/chambers/ZenGarden';
import { WarRoom } from '../components/chambers/WarRoom';
import { TheMirror } from '../components/chambers/TheMirror';
import { UltimateForm } from '../components/chambers/UltimateForm';

// Modern bento dashboard widgets
const QuickStats = () => (
  <div className="glass-card rounded-2xl p-6 hover:border-ancient-gold/40 animate-slide-up stagger-1">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xs font-medium text-ancient-gold/50 uppercase tracking-wider">Your Intelligence</h3>
        <p className="text-2xl font-cinzel font-bold text-ghost-white mt-1">87.4%</p>
      </div>
      <Brain className="w-8 h-8 text-amber-400/30" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="p-3 bg-void-black/30 rounded-xl border border-void-black/20">
        <div className="text-[10px] text-ancient-gold/40 uppercase tracking-tighter">Queries Today</div>
        <div className="text-xl font-bold text-ghost-white mt-1">1,247</div>
      </div>
      <div className="p-3 bg-void-black/30 rounded-xl border border-void-black/20">
        <div className="text-[10px] text-emerald-400/40 uppercase tracking-tighter">Knowledge Items</div>
        <div className="text-xl font-bold text-ghost-white mt-1">89</div>
      </div>
      <div className="p-3 bg-void-black/30 rounded-xl border border-void-black/20">
        <div className="text-[10px] text-violet-400/40 uppercase tracking-tighter">Pattern Score</div>
        <div className="text-xl font-bold text-ghost-white mt-1">7200</div>
      </div>
    </div>
  </div>
);

const QuickActions = () => (
  <div className="glass-card rounded-2xl p-6 hover:border-ancient-gold/40 animate-slide-up stagger-2">
    <h3 className="text-xs font-medium text-ancient-gold/50 uppercase tracking-wider mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center gap-3 px-4 py-3 bg-void-black/40 border border-void-black/30 rounded-xl text-left hover:border-ancient-gold/30 hover:bg-ancient-gold/10 transition-all">
        <Globe className="w-5 h-5 text-amber-400" />
        <div>
          <div className="text-sm font-medium text-ghost-white">Live Web Search</div>
          <div className="text-[10px] text-ancient-gold/40">Search the internet</div>
        </div>
      </button>
      <button className="flex items-center gap-3 px-4 py-3 bg-void-black/40 border border-void-black/30 rounded-xl text-left hover:border-ancient-gold/30 hover:bg-ancient-gold/10 transition-all">
        <FileText className="w-5 h-5 text-amber-400" />
        <div>
          <div className="text-sm font-medium text-ghost-white">Ingest Document</div>
          <div className="text-[10px] text-ancient-gold/40">Add to knowledge base</div>
        </div>
      </button>
      <button className="flex items-center gap-3 px-4 py-3 bg-void-black/40 border border-void-black/30 rounded-xl text-left hover:border-ancient-gold/30 hover:bg-ancient-gold/10 transition-all col-span-2">
        <Zap className="w-5 h-5 text-amber-400" />
        <div>
          <div className="text-sm font-medium text-ghost-white">Thinking Mode</div>
          <div className="text-[10px] text-ancient-gold/40">Deep reasoning with gpt-oss-120b</div>
        </div>
      </button>
    </div>
  </div>
);

const RecentActivity = () => (
  <div className="glass-card rounded-2xl p-6 hover:border-ancient-gold/40 animate-slide-up stagger-3">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-medium text-ancient-gold/50 uppercase tracking-wider">Recent Activity</h3>
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
    </div>
    <div className="space-y-3">
      {[
        { action: 'Chat with The Forge', time: '2m ago', type: 'chat' },
        { action: 'Document ingested: Market Analysis.pdf', time: '15m ago', type: 'document' },
        { action: 'Alert triggered: Signups low', time: '1h ago', type: 'alert' },
        { action: 'Legal scan completed', time: '3h ago', type: 'legal' },
        { action: 'Daily briefing generated', time: '6h ago', type: 'briefing' }
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-void-black/30 transition-colors">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === 'chat' ? 'bg-amber-500/10 text-amber-400' : item.type === 'document' ? 'bg-violet-500/10 text-violet-400' : item.type === 'alert' ? 'bg-red-500/10 text-red-400' : item.type === 'legal' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {item.type === 'chat' && <MessageCircle className="w-4 h-4" />}
            {item.type === 'document' && <FileText className="w-4 h-4" />}
            {item.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
            {item.type === 'legal' && <Shield className="w-4 h-4" />}
            {item.type === 'briefing' && <Clock className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <div className="text-sm text-ghost-white font-medium">{item.action}</div>
            <div className="text-[10px] text-ancient-gold/30">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

import { MessageCircle } from 'lucide-react';

const DashboardPage: React.FC<{ chamberId?: string }> = ({ chamberId }) => {
  const { user } = useAuth();
  const [activeChamber, setActiveChamber] = useState<string>(chamberId || 'forge');
  const [showGrid, setShowGrid] = useState(false);

  const CHAMBERS = [
    { id: 'forge', name: 'The Forge', icon: Sparkles, component: TheForge, color: 'amber', desc: 'Raw creation & AI synthesis' },
    { id: 'dream', name: 'Dream State', icon: Moon, component: DreamState, color: 'blue', desc: 'Inspiration capture' },
    { id: 'alchemist', name: 'Alchemist Lab', icon: FlaskConical, component: AlchemistLab, color: 'purple', desc: 'Creative synthesis' },
    { id: 'sage', name: 'Sage Table', icon: ScrollText, component: SageTable, color: 'green', desc: 'Communication mastery' },
    { id: 'garden', name: 'Zen Garden', icon: TreePine, component: ZenGarden, color: 'emerald', desc: 'Stillness & reflection' },
    { id: 'war', name: 'War Room', icon: Target, component: WarRoom, color: 'red', desc: 'Strategy & execution' },
    { id: 'mirror', name: 'The Mirror', icon: User, component: TheMirror, color: 'gold', desc: 'Prime interface' },
    { id: 'ultimate', name: 'Ultimate Form', icon: Crown, component: UltimateForm, color: 'white', desc: 'Hidden 8th chamber', hidden: true }
  ];

  const chamber = CHAMBERS.find(c => c.id === activeChamber) || CHAMBERS[0];
  const ActiveComponent = chamber.component;

  useEffect(() => {
    if (chamberId) setActiveChamber(chamberId);
  }, [chamberId]);

  return (
    <div className="flex h-full flex-col bg-void-black text-ghost-white overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-4 h-16 bg-void-black/60 border-b border-white/5 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowGrid(!showGrid)} className="lg:hidden p-2.5 rounded-xl bg-void-black/40 border border-white/5 text-amber-400 hover:text-ghost-white hover:bg-void-black/30 transition-all">
            {showGrid ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-ancient-gold flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-5 h-5 text-void-black" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-ghost-white tracking-tighter">PRIMORDEX</h1>
              <p className="text-[10px] text-ancient-gold/40 font-medium tracking-wider uppercase">Sovereign AI OS v2.0</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {CHAMBERS.filter(c => !c.hidden).map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChamber(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeChamber === c.id 
                  ? `bg-${c.color}-500/20 text-${c.color}-400 border border-${c.color}-500/30 shadow-lg shadow-${c.color}-500/10` 
                  : 'text-ancient-gold/30 hover:text-ghost-white hover:bg-void-black/30 hover:border-white/5 border border-transparent'}`}
              >
                <c.icon className={`w-4 h-4 ${activeChamber === c.id ? 'text-' + c.color + '-400' : 'text-ancient-gold/30'}`} />
                <span>{c.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-void-black/40 border border-white/10 rounded-xl">
            <span className="text-[10px] text-ancient-gold/40 font-medium">Signed in as</span>
            <span className="text-sm text-ghost-white font-medium truncate max-w-[200px]">{user?.email}</span>
          </div>
          <button className="px-4 py-2.5 rounded-xl btn-glass text-sm font-medium">
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full animate-float" />
          <motion.div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-violet-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <motion.div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Chamber Grid (Bento Layout) */}
        <div className="absolute inset-0 p-6 overflow-y-auto px-8">
          <div className="bento-grid max-w-7xl mx-auto">
            {/* Left column - Chat (wide) */}
            <div className="bento-6 animate-slide-up stagger-1">
              <div className="glass-card rounded-2xl p-0 flex flex-col h-full border-none shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-ancient-gold flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Brain className="w-5 h-5 text-void-black" />
                    </div>
                    <div>
                      <h2 className="font-cinzel text-lg font-bold text-ghost-white tracking-tighter">AI Chat</h2>
                      <p className="text-[10px] text-ancient-gold/40">Live reasoning with Shade • Prime • Core</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-void-black/30 border border-white/5 text-[10px] text-ancient-gold/40 hover:text-ghost-white hover:bg-void-black/40 transition-all">
                      New Chat
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <StreamingChat />
                </div>
              </div>
            </div>

            {/* Right column - Stats + Actions */}
            <div className="flex flex-col gap-1">
              <div className="bento-1 animate-slide-up stagger-2">
                <QuickStats />
              </div>
              <div className="bento-1 animate-slide-up stagger-3">
                <QuickActions />
              </div>
              <div className="bento-1 animate-slide-up stagger-4">
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Overlay */}
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-void-black/95 backdrop-blur-xl z-40 p-8 overflow-y-auto"
            onClick={() => setShowGrid(false)}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-cinzer text-2xl font-bold text-ghost-white">Chambers</h2>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowGrid(false)} className="p-2.5 rounded-xl bg-void-black/40 border border-white/10 text-ghost-white hover:text-amber-400">
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHAMBERS.filter(c => !c.hidden).map(c => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActiveChamber(c.id); setShowGrid(false); }}
                    className={`p-8 rounded-2xl border transition-all text-left ${activeChamber === c.id 
                      ? 'bg-white/5 border-white/20' 
                      : 'bg-void-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center ${activeChamber === c.id ? `bg-${c.color}-500 text-void-black` : 'bg-white/5 text-ancient-gold/40'}" shadow="lg">
                        <c.icon className={`w-5 h-5 ${activeChamber === c.id ? 'text-void-black' : 'text-ancient-gold/40'}`} />
                      </div>
                      <div>
                        <h3 className={`font-cinzel text-lg font-bold ${activeChamber === c.id ? 'text-ghost-white' : 'text-ancient-gold/30'}`}>{c.name}</h3>
                        <span className="text-[10px] text-ancient-gold/40">{c.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-3 pt-4">
                      <span className="text-[10px] text-ancient-gold/30">Click to enter chamber</span>
                      <ChevronRight className={`w-4 h-4 ${activeChamber === c.id ? 'text-amber-400' : 'text-white/20'}`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
