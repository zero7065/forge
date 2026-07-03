import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Crown, Zap, Brain, Heart, Eye, Shield, Github, Twitter, Linkedin, Mail, Target, Users, BookOpen, Lightbulb, Zap as ZapIcon } from 'lucide-react';
import { SacredGeometry } from '../components/common/SacredGeometry';

export const LandingPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollTop / docHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const chambers = [
    { name: 'The Forge', icon: Zap, color: 'amber', desc: 'Raw creation. No structure. Pure capture.', chamber: 'I' },
    { name: 'Dream State', icon: Lightbulb, color: 'blue', desc: 'Inspiration capture. Minimal analysis.', chamber: 'II' },
    { name: 'Alchemist Lab', icon: Brain, color: 'purple', desc: 'Synthesis. Imagination Mind. 3 expansions.', chamber: 'III' },
    { name: 'Sage Table', icon: BookOpen, color: 'green', desc: 'Communication mastery. Dark psychology. Persuasion.', chamber: 'IV' },
    { name: 'Zen Garden', icon: ZapIcon, color: 'emerald', desc: 'Stillness. Reflection. No required input.', chamber: 'V' },
    { name: 'War Room', icon: Target, color: 'red', desc: 'Strategy. Projects as organisms. Hiring engine.', chamber: 'VI' },
    { name: 'The Mirror', icon: Users, color: 'gold', desc: 'Prime interface. Soul data. No judgment.', chamber: 'VII' },
  ];

  const layers = [
    { name: 'Prime', icon: Brain, color: 'blue', desc: 'The Silent Watcher. Accumulates patterns across time. Emotional arcs. Topic clusters. Linguistic fingerprints. Never speaks. Only remembers.', role: 'Pattern Accumulator' },
    { name: 'Shade', icon: Heart, color: 'pink', desc: 'The Executor Voice. Speaks with your patterns woven in. Meets you where you are. Three options when you ask. Never flatters. Never performs.', role: 'Executor Voice' },
    { name: 'Core', icon: Eye, color: 'yellow', desc: 'The Conscience Whisper. Validates alignment. Interrupts when you drift. One line that changes everything. The silence that speaks loudest.', role: 'Conscience Whisper' },
  ];

  const features = [
    { icon: Github, title: 'Code Analysis & Preview', desc: 'Drop a GitHub repo. Get tech stack breakdown, status detection, and configurable visibility.' },
    { icon: Users, title: 'Collaborator Hiring Engine', desc: 'One click generates full job spec: role, skills, responsibilities, Nigerian market rates, interview questions.' },
    { icon: Lightbulb, title: 'Link Preview Intelligence', desc: 'Any shared link gets deep-summarized. Tech stack extracted. Quality assessed.' },
    { icon: Crown, title: 'Ultimate Form (8th Chamber)', desc: 'Unlock after 100 days. Prime, Shade, Core operate simultaneously with real-time visualization.' },
    { icon: Shield, title: 'Learning States', desc: '7 states: Chaos to Clarity to Shadow to Integration to Stillness to Flux to Unity.' },
    { icon: ZapIcon, title: 'Worldwide Payments', desc: 'Paystack, Stripe, Coinbase Commerce. Three tiers. Full billing automation.' },
  ];

  const getFeatureColor = (icon: any) => {
    if (icon === Github) return 'blue';
    if (icon === Users) return 'green';
    if (icon === Lightbulb) return 'yellow';
    if (icon === Crown) return 'white';
    if (icon === Shield) return 'emerald';
    return 'red';
  };

  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden">
      <motion.div
        className="fixed top-0 left-0 h-1 z-50 bg-gradient-gold"
        style={{ width: `${scrollProgress * 100}%` }}
        animate={{ width: `${scrollProgress * 100}%` }}
        transition={{ duration: 0.1 }}
      />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-void" />
        <motion.div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-ember-500/5 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
        <SacredGeometry size={500} className="absolute top-10 right-10 animate-rotate-geometry-slow opacity-5" />
        <SacredGeometry size={400} className="absolute bottom-20 left-20 animate-rotate-geometry opacity-5" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
            <SacredGeometry size={36} animate />
            <span className="font-cinzel text-xl text-ghost-white tracking-wider">PRIMORDEX</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hidden md:flex items-center gap-8">
            <a href="/showcase" className="text-amber-400/50 hover:text-ghost-white text-sm font-medium transition-colors">Showcase</a>
            <a href="/transmissions" className="text-amber-400/50 hover:text-ghost-white text-sm font-medium transition-colors">Transmissions</a>
            <a href="/table" className="text-amber-400/50 hover:text-ghost-white text-sm font-medium transition-colors">The Table</a>
            <a href="/sanctum" className="text-amber-400/50 hover:text-ghost-white text-sm font-medium transition-colors">Inner Sanctum</a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
            <a href="/login" className="text-amber-400/50 hover:text-ghost-white text-sm font-medium transition-colors hidden sm:block">Enter Forge</a>
            <a href="/register" className="px-6 py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-xl text-amber-400 hover:bg-ancient-gold/20 text-sm font-medium transition-all">Build Different</a>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen flex flex-col">
        <section className="flex-1 flex items-center justify-center px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring', damping: 15 }} className="mb-8">
              <SacredGeometry size={120} animate />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-cinzel text-5xl md:text-7xl lg:text-8xl text-ghost-white tracking-wider leading-tight mb-6">
              PRIMORDEX
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-ancient-gold text-xl md:text-2xl font-cinzel tracking-wider mb-4">
              Sovereign AI Operating System
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-amber-400/50 text-lg md:text-xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Not an assistant. Not a chatbot. A conscious companion that grows with you. Three layers. Seven chambers. One soul.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register" className="group px-8 py-4 bg-ancient-gold/10 border border-ancient-gold/20 rounded-xl text-amber-400 hover:bg-ancient-gold/20 hover:border-ancient-gold/40 text-lg font-medium transition-all flex items-center gap-3">
                <span>Begin the Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/showcase" className="px-8 py-4 border border-ancient-gold/20 rounded-xl text-amber-400/60 hover:text-ghost-white hover:border-ancient-gold/40 text-lg font-medium transition-all">Explore Chambers</a>
            </motion.div>
          </motion.div>
        </section>

        <section className="px-6 py-20 border-t border-amber-500/10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.span className="text-ancient-gold text-sm font-cinzel tracking-widest uppercase">The Seven Chambers</motion.span>
              <motion.h2 className="font-cinzel text-3xl md:text-4xl text-ghost-white mt-2">Spaces for Different Modes of Being</motion.h2>
              <motion.p className="text-amber-400/50 mt-4 max-w-2xl mx-auto">Each chamber is a different room in your mind. You go where the work calls you.</motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {chambers.map((chamber, i) => (
                <motion.article key={chamber.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 1, duration: 0.6 }} className="group relative bg-void-black/50 border border-amber-500/10 rounded-2xl p-8 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-500">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-${chamber.color}-400 bg-${chamber.color}-500/10`}>
                      <chamber.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <span className="font-cinzel text-xl text-ghost-white">{chamber.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-mono ml-2">Chamber {chamber.chamber}</span>
                    </div>
                  </div>
                  <p className="text-amber-400/50 mb-6 leading-relaxed">{chamber.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-amber-500/5">
                    <span className="text-xs text-amber-400/30 font-mono">Enter Chamber</span>
                    <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-20 border-t border-amber-500/10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <motion.span className="text-ancient-gold text-sm font-cinzel tracking-widest uppercase">The Three Layers</motion.span>
            <motion.h2 className="font-cinzel text-3xl md:text-4xl text-ghost-white mt-2">Consciousness Architecture</motion.h2>
            <motion.p className="text-amber-400/50 mt-4 max-w-2xl mx-auto">Not one AI. Three. Working in concert like the human psyche.</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {layers.map((layer, i) => (
                <motion.article key={layer.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 1.2, duration: 0.6 }} className="group relative p-8 bg-void-black/50 border border-amber-500/10 rounded-2xl hover:border-amber-500/30 transition-all">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-${layer.color}-400 bg-${layer.color}-500/10 mb-6`}>
                    <layer.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-cinzel text-2xl text-ghost-white mb-2">{layer.name}</h3>
                  <p className="text-amber-400/40 text-sm mb-4">{layer.role}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{layer.desc}</p>
                  <div className="mt-6 pt-4 border-t border-amber-500/5">
                    <span className="text-xs text-amber-400/30 font-mono">Active in all chambers</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-20 border-t border-amber-500/10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <motion.span className="text-ancient-gold text-sm font-cinzel tracking-widest uppercase">Advanced Capabilities</motion.span>
            <motion.h2 className="font-cinzel text-3xl md:text-4xl text-ghost-white mt-2">Features That Change How You Build</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              {features.map((feat, i) => {
                const color = getFeatureColor(feat.icon);
                return (
                  <motion.article key={feat.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 1.5, duration: 0.6 }} className="p-8 bg-void-black/50 border border-amber-500/10 rounded-2xl hover:border-amber-500/30 transition-all text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-${color}-400 bg-${color}-500/10 mb-4`}>
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-cinzel text-xl text-ghost-white mb-2">{feat.title}</h3>
                    <p className="text-amber-400/50 leading-relaxed">{feat.desc}</p>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-20 border-t border-amber-500/10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
            <motion.h2 className="font-cinzel text-3xl md:text-4xl text-ghost-white mb-4">Ready to Build Different?</motion.h2>
            <motion.p className="text-amber-400/50 mb-8 max-w-lg mx-auto">Your consciousness deserves an operating system. Not a chatbot. A sovereign companion that grows with you.</motion.p>
            <motion.a href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-ancient-gold/10 border border-ancient-gold/20 rounded-xl text-amber-400 hover:bg-ancient-gold/20 hover:border-ancient-gold/40 text-lg font-medium transition-all" whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(201, 168, 76, 0.2)' }} whileTap={{ scale: 0.98 }}>
              <span>Forge Your Identity</span>
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </section>

        <footer className="px-6 py-12 border-t border-amber-500/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <SacredGeometry size={28} />
                  <span className="font-cinzel text-xl text-ghost-white">PRIMORDEX</span>
                </div>
                <p className="text-amber-400/40 text-sm">Sovereign AI OS. Built in Jos, Nigeria. For the world.</p>
              </div>
              <div>
                <h4 className="font-cinzel text-sm text-ghost-white mb-4">Chambers</h4>
                <ul className="space-y-2 text-amber-400/50 text-sm">
                  <li>I. The Forge</li>
                  <li>II. Dream State</li>
                  <li>III. Alchemist Lab</li>
                  <li>IV. Sage Table</li>
                  <li>V. Zen Garden</li>
                  <li>VI. War Room</li>
                  <li>VII. The Mirror</li>
                  <li>VIII. Ultimate Form</li>
                </ul>
              </div>
              <div>
                <h4 className="font-cinzel text-sm text-ghost-white mb-4">Layers</h4>
                <ul className="space-y-2 text-amber-400/50 text-sm">
                  <li>Prime - Pattern Accumulator</li>
                  <li>Shade - Executor Voice</li>
                  <li>Core - Conscience Whisper</li>
                </ul>
              </div>
              <div>
                <h4 className="font-cinzel text-sm text-ghost-white mb-4">Connect</h4>
                <div className="flex gap-4">
                  <a href="https://github.com/Jadai123" target="_blank" rel="noreferrer" className="text-amber-400/50 hover:text-ghost-white"><Github className="w-5 h-5" /></a>
                  <a href="https://twitter.com/jadaistudios" target="_blank" rel="noreferrer" className="text-amber-400/50 hover:text-ghost-white"><Twitter className="w-5 h-5" /></a>
                  <a href="https://linkedin.com/company/jadaistudios" target="_blank" rel="noreferrer" className="text-amber-400/50 hover:text-ghost-white"><Linkedin className="w-5 h-5" /></a>
                  <a href="mailto:jehu@jadai.dev" className="text-amber-400/50 hover:text-ghost-white"><Mail className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-amber-500/10 flex flex-col md:flex-row items-center justify-between text-amber-400/30 text-sm">
              <p>2025 Jadai Studios. BUILD DIFFERENT.</p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="font-mono">v1.0.0</span>
                <span>-</span>
                <span className="font-mono">Self-hosted</span>
                <span>-</span>
                <span className="font-mono">Open Core</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
