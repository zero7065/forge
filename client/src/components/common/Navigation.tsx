import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Moon, FlaskConical, ScrollText, 
  TreePine, Target, User, LayoutDashboard, 
  ChevronRight, X, Menu, Settings, HelpCircle,
  BookOpen, Shield, Crown, Zap as ZapIcon
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { SacredGeometry } from './SacredGeometry';

const CHAMBERS = [
  { id: 'forge', name: 'The Forge', icon: Sparkles, description: 'Raw creation & capture', color: 'amber' },
  { id: 'dream', name: 'Dream State', icon: Moon, description: 'Inspiration capture', color: 'blue' },
  { id: 'alchemist', name: 'Alchemist Lab', icon: FlaskConical, description: 'Synthesis & imagination', color: 'purple' },
  { id: 'sage', name: 'Sage Table', icon: ScrollText, description: 'Communication mastery', color: 'green' },
  { id: 'garden', name: 'Zen Garden', icon: TreePine, description: 'Stillness & reflection', color: 'emerald' },
  { id: 'war', name: 'War Room', icon: Target, description: 'Strategy & execution', color: 'red' },
  { id: 'mirror', name: 'The Mirror', icon: User, description: 'Prime interface', color: 'gold' },
  { id: 'ultimate', name: 'Ultimate Form', icon: Crown, description: 'Hidden 8th chamber', color: 'white', hidden: true }
];

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeChamber, setActiveChamber] = useState<string>('forge');

  const getChamberColor = (color: string) => {
    const colors: Record<string, string> = {
      amber: 'text-amber-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      green: 'text-green-400',
      emerald: 'text-emerald-400',
      red: 'text-red-400',
      gold: 'text-yellow-400',
      white: 'text-white'
    };
    return colors[color] || 'text-amber-400';
  };

  return (
    <motion.aside
      initial={{ x: collapsed ? -256 : 0 }}
      animate={{ x: collapsed ? -256 : 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed left-0 top-0 h-screen bg-void-black/95 backdrop-blur-xl border-r border-ancient-gold/10 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-ancient-gold/10">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <SacredGeometry size={32} animate />
            <span className="font-cinzel text-xl text-ghost-white tracking-wider">PRIMORDEX</span>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-amber-400/50 hover:text-amber-400 hover:bg-ancient-gold/10 transition-colors"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Chamber Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <motion.div
              key="chambers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="px-3 py-2 text-xs font-cinzel text-ancient-gold/40 tracking-wider uppercase">CHAMBERS</p>
              
              {CHAMBERS.filter(c => !c.hidden).map((chamber) => (
                <motion.button
                  key={chamber.id}
                  whileHover={{ x: 4, backgroundColor: 'rgba(201, 168, 76, 0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveChamber(chamber.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeChamber === chamber.id
                      ? 'bg-ancient-gold/10 border-l-2 border-ancient-gold text-ghost-white'
                      : 'text-amber-400/50 hover:text-ghost-white hover:bg-void-black/50'
                  }`}
                >
                  <chamber.icon className={`w-5 h-5 ${getChamberColor(chamber.color)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chamber.name}</p>
                    <p className="text-xs text-amber-400/30 truncate">{chamber.description}</p>
                  </div>
                  {activeChamber === chamber.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-ancient-gold rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            {CHAMBERS.filter(c => !c.hidden).map((chamber) => (
              <motion.button
                key={chamber.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveChamber(chamber.id)}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  activeChamber === chamber.id
                    ? 'bg-ancient-gold/20 text-ghost-white'
                    : 'text-amber-400/50 hover:text-ghost-white hover:bg-void-black/30'
                }`}
                title={chamber.name}
              >
                <chamber.icon className={`w-5 h-5 ${getChamberColor(chamber.color)}`} />
              </motion.button>
            ))}
          </div>
        )}
      </nav>

      {/* User & Actions */}
      <div className="p-4 border-t border-ancient-gold/10">
        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-3 p-3 bg-void-black/50 rounded-xl border border-ancient-gold/5">
                <div className="w-10 h-10 rounded-full bg-ancient-gold/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-ancient-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ghost-white truncate">{user?.email}</p>
                  <p className="text-xs text-ancient-gold/50 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:bg-void-black/50 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ghost-white/70 hover:text-ghost-white hover:bg-void-black/50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            <motion.button whileHover={{ scale: 1.15 }} className="p-2.5 rounded-xl text-amber-400/50 hover:text-ghost-white hover:bg-void-black/30" title="Dashboard"><LayoutDashboard className="w-5 h-5" /></motion.button>
            <motion.button whileHover={{ scale: 1.15 }} className="p-2.5 rounded-xl text-amber-400/50 hover:text-ghost-white hover:bg-void-black/30" title="Settings"><Settings className="w-5 h-5" /></motion.button>
            <motion.button whileHover={{ scale: 1.15 }} onClick={logout} className="p-2.5 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-500/10" title="Logout"><Shield className="w-5 h-5" /></motion.button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};