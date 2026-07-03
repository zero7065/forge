import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, FlaskConical, ScrollText, TreePine, Target, User, Crown, LayoutDashboard, Grid, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { TheForge } from '../components/chambers/TheForge';
import { DreamState } from '../components/chambers/DreamState';
import { AlchemistLab } from '../components/chambers/AlchemistLab';
import { SageTable } from '../components/chambers/SageTable';
import { ZenGarden } from '../components/chambers/ZenGarden';
import { WarRoom } from '../components/chambers/WarRoom';
import { TheMirror } from '../components/chambers/TheMirror';
import { UltimateForm } from '../components/chambers/UltimateForm';

const CHAMBERS = [
  { id: 'forge', name: 'The Forge', icon: Sparkles, component: TheForge, color: 'amber', desc: 'Raw creation & capture' },
  { id: 'dream', name: 'Dream State', icon: Moon, component: DreamState, color: 'blue', desc: 'Inspiration capture' },
  { id: 'alchemist', name: 'Alchemist Lab', icon: FlaskConical, component: AlchemistLab, color: 'purple', desc: 'Synthesis & imagination' },
  { id: 'sage', name: 'Sage Table', icon: ScrollText, component: SageTable, color: 'green', desc: 'Communication mastery' },
  { id: 'garden', name: 'Zen Garden', icon: TreePine, component: ZenGarden, color: 'emerald', desc: 'Stillness & reflection' },
  { id: 'war', name: 'War Room', icon: Target, component: WarRoom, color: 'red', desc: 'Strategy & execution' },
  { id: 'mirror', name: 'The Mirror', icon: User, component: TheMirror, color: 'gold', desc: 'Prime interface' },
  { id: 'ultimate', name: 'Ultimate Form', icon: Crown, component: UltimateForm, color: 'white', desc: 'Hidden 8th chamber', hidden: true }
];

export const DashboardPage: React.FC<{ chamberId?: string }> = ({ chamberId }) => {
  const { user } = useAuth();
  const [activeChamber, setActiveChamber] = useState<string>(chamberId || 'forge');
  const [showGrid, setShowGrid] = useState(false);

  const chamber = CHAMBERS.find(c => c.id === activeChamber) || CHAMBERS[0];
  const ActiveComponent = chamber.component;

  useEffect(() => {
    if (chamberId) setActiveChamber(chamberId);
  }, [chamberId]);

  return (
    <div className="flex-1 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-void-black/50 backdrop-blur-xl border-b border-amber-500/10">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowGrid(!showGrid)} className="lg:hidden p-2 text-amber-400/50 hover:text-amber-400">{showGrid ? <X className="w-5 h-5" /> : <Grid className="w-5 h-5" />}</motion.button>
          <div className="hidden lg:flex items-center gap-1 bg-void-black/50 border border-amber-500/10 rounded-xl p-1">
            {CHAMBERS.filter(c => !c.hidden).map(c => (
              <motion.button key={c.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveChamber(c.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeChamber === c.id ? `bg-${c.color}-500/20 text-${c.color}-400 border border-${c.color}-500/30` : 'bg-void-black/50 text-amber-400/40 hover:text-ghost-white hover:bg-void-black/30'}`}><c.icon className="w-4 h-4" /><span>{c.name}</span></motion.button>
            ))}
            <motion.div className="w-px h-8 bg-amber-500/10 mx-1" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setShowGrid(true)} className="px-3 py-2 text-amber-400/40 hover:text-ghost-white"><LayoutDashboard className="w-5 h-5" /></motion.button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-void-black/50 border border-amber-500/10 rounded-lg">
            <span className="text-xs text-amber-400/40">Signed in as</span>
            <span className="text-sm text-ghost-white font-medium truncate max-w-[150px]">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Chamber Content */}
      <div className="flex-1 overflow-hidden">
        {showGrid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-void-black/95 backdrop-blur-xl z-50 p-6 overflow-y-auto" onClick={() => setShowGrid(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8"><h2 className="font-cinzel text-2xl text-ghost-white">Chambers</h2><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowGrid(false)} className="p-2 text-amber-400/40 hover:text-amber-400"><X className="w-6 h-6" /></motion.button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHAMBERS.filter(c => !c.hidden).map(c => (
                  <motion.button key={c.id} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => { setActiveChamber(c.id); setShowGrid(false); }} className="p-6 rounded-2xl border transition-all text-left bg-void-black/50 border-amber-500/10 hover:border-amber-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <c.icon className="w-8 h-8 text-ancient-gold" />
                      <div>
                        <h3 className="font-cinzel text-xl text-ghost-white">{c.name}</h3>
                        <span className="text-xs text-amber-400/40">{c.desc}</span>
                      </div>
                    </div>
                    <p className="text-amber-400/40 text-sm">Click to enter chamber</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          <motion.div key={activeChamber} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="h-full">
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};