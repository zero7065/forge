import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Shield, Crown, Sparkles, ArrowRight, CheckCircle, XCircle, Clock, User, Brain, Heart, Eye } from 'lucide-react';
import { SacredGeometry } from '../components/common/SacredGeometry';

const REQUIREMENTS = [
  { icon: Brain, title: 'Depth of Thought', desc: 'You think in systems, not features. You ask "why" before "how". Your work shows evidence of synthesis across domains.', met: true },
  { icon: Heart, title: 'Emotional Honesty', desc: 'You\'re willing to speak your shadows in The Mirror. You don\'t perform vulnerability — you practice it.', met: true },
  { icon: Eye, title: 'Long-Term Orientation', desc: 'You build for legacy, not likes. Your projects have cultivation realms. You understand the difference between velocity and direction.', met: false },
  { icon: Shield, title: 'Sovereignty Mindset', desc: 'You don\'t need permission to build. You understand that dependence on platforms is a liability. You own your stack.', met: true },
  { icon: Crown, title: 'Contribution over Consumption', desc: 'You give more than you take. The Table is not a content farm. You bring signal, not noise.', met: false },
  { icon: Sparkles, title: 'Builder\'s Portfolio', desc: 'At least one project in War Room with Nascent Soul realm or higher. Proof you\'ve walked the path.', met: true },
];

export const InnerSanctum: React.FC = () => {
  const metCount = REQUIREMENTS.filter(r => r.met).length;
  const totalCount = REQUIREMENTS.length;
  const progress = Math.round((metCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-void" />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
        <SacredGeometry size={600} className="absolute top-10 right-10 animate-rotate-geometry-slow opacity-5" />
        <SacredGeometry size={400} className="absolute bottom-20 left-20 animate-rotate-geometry opacity-5" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div className="flex items-center gap-3"><SacredGeometry size={32} /><span className="font-cinzel text-xl text-ghost-white">PRIMORDEX</span></motion.div>
          <div className="flex items-center gap-8"><a href="/" className="text-amber-400/50 hover:text-ghost-white text-sm">Home</a><a href="/showcase" className="text-amber-400/50 hover:text-ghost-white text-sm">Showcase</a><a href="/transmissions" className="text-amber-400/50 hover:text-ghost-white text-sm">Transmissions</a><a href="/table" className="text-amber-400/50 hover:text-ghost-white text-sm">The Table</a></div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring', damping: 15 }} className="mb-8">
            <motion.div className="w-24 h-24 mx-auto mb-4 rounded-full bg-ancient-gold/10 border border-ancient-gold/20 flex items-center justify-center animate-pulse-slow"><Lock className="w-12 h-12 text-ancient-gold" /></motion.div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-cinzel text-4xl md:text-5xl text-ghost-white mb-4">Inner Sanctum</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-ancient-gold text-xl md:text-2xl font-cinzel tracking-wider mb-4">Application Required</motion.p>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-amber-400/50 mt-4 mb-8 max-w-xl mx-auto">Not everyone belongs at The Table. This is a roundtable for builders who understand that sovereignty is earned, not given.</motion.p>

          {/* Progress */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-12">
            <div className="flex items-center justify-between mb-3"><span className="text-amber-400/40 text-sm">Readiness</span><span className="font-cinzel text-2xl text-ghost-white">{progress}%</span></div>
            <div className="w-full h-2 bg-void-black rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.8, duration: 1, type: 'spring', damping: 20 }} className="h-full rounded-full bg-gradient-gold" style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D86C)' }} /></div>
            <p className="text-amber-400/40 text-sm mt-2">{metCount} of {totalCount} keys turned</p>
          </motion.div>

          {/* Requirements */}
          <div className="space-y-4 text-left max-w-xl mx-auto">
            {REQUIREMENTS.map((req, i) => (
              <motion.article key={req.title} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i + 0.6, duration: 0.5 }} className={`p-6 rounded-2xl border transition-all ${req.met ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-void-black/50 border-amber-500/10'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${req.met ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-void-black/50 text-amber-400/40 border border-amber-500/20'}`}><req.icon className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><h3 className="font-cinzel text-lg text-ghost-white">{req.title}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{req.met ? 'Key Turned' : 'Locked'}</span></div>
                    <p className="text-amber-400/50 text-sm">{req.desc}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} className={`w-8 h-8 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{req.met ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}</motion.div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Apply Button */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-12">
            <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(201, 168, 76, 0.3)' }} whileTap={{ scale: 0.98 }} disabled={metCount < totalCount} className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-medium transition-all ${metCount < totalCount ? 'bg-void-black/50 border border-amber-500/10 text-amber-400/20 cursor-not-allowed' : 'bg-ancient-gold/10 border border-ancient-gold/20 text-amber-400 hover:bg-ancient-gold/20'}`}><span>{metCount < totalCount ? `${totalCount - metCount} keys remaining` : 'Submit Application'}</span><ArrowRight className="w-5 h-5" /></motion.button>
            {metCount < totalCount && <p className="text-amber-400/30 text-sm mt-4">Complete all requirements to unlock application</p>}
          </motion.div>

          {/* Current Members */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-16 pt-8 border-t border-amber-500/10">
            <p className="text-amber-400/40 text-sm mb-4">Current Sanctum Members</p>
            <div className="flex justify-center gap-4">
              {['JH', 'MC', 'AB', 'DK', 'PS'].map((initials, i) => (
                <motion.div key={initials} whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-ancient-gold/10 border border-ancient-gold/20 flex items-center justify-center text-ancient-gold font-medium text-sm" style={{ transitionDelay: `${i * 100}ms` }}>{initials}</motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-void-black/50 border border-amber-500/10 flex items-center justify-center text-amber-400/40 font-medium text-sm">+47</motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};