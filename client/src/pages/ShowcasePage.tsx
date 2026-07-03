import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Star, Code, Zap, Brain, Heart, Eye, Shield, Crown, Zap as ZapIcon, Lightbulb, Target, Users, BookOpen, TreePine, Sparkles } from 'lucide-react';
import { SacredGeometry } from '../components/common/SacredGeometry';

const PROJECTS = [
  { name: 'PRIMORDEX', repo: 'https://github.com/Jadai123/primordex', description: 'Sovereign AI Operating System with consciousness layers', tech: ['React', 'Node.js', 'TypeScript', 'SQLite', 'ChromaDB'], stars: 247, status: 'active', chamber: 'I' },
  { name: 'Synthesis Forge', repo: 'https://github.com/Jadai123/synthesis-forge', description: 'The original local LLM cockpit with Memory Vault', tech: ['React', 'Ollama', 'Tailwind', 'Framer Motion'], stars: 89, status: 'completed', chamber: 'II' },
  { name: 'Jadai Studios Site', repo: 'https://github.com/Jadai123/jadai-studios', description: 'Studio portfolio with sacred geometry animations', tech: ['Next.js', 'GSAP', 'Three.js'], stars: 156, status: 'active', chamber: 'III' },
  { name: 'Consciousness Layers', repo: 'https://github.com/Jadai123/consciousness', description: 'Prime/Shade/Core implementation as standalone library', tech: ['TypeScript', 'AI SDK', 'SQLite'], stars: 67, status: 'in_progress', chamber: 'IV' },
];

export const ShowcasePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-void" />
        <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-ember-500/5 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <SacredGeometry size={500} className="absolute top-10 right-10 animate-rotate-geometry-slow opacity-5" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div className="flex items-center gap-3"><SacredGeometry size={32} /><span className="font-cinzel text-xl text-ghost-white">PRIMORDEX</span></motion.div>
          <div className="flex items-center gap-8"><a href="/" className="text-amber-400/50 hover:text-ghost-white text-sm">Home</a><a href="/transmissions" className="text-amber-400/50 hover:text-ghost-white text-sm">Transmissions</a><a href="/table" className="text-amber-400/50 hover:text-ghost-white text-sm">The Table</a><a href="/sanctum" className="text-amber-400/50 hover:text-ghost-white text-sm">Sanctum</a></div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-ancient-gold text-sm font-cinzel tracking-widest uppercase">Showcase</motion.span>
            <motion.h1 className="font-cinzel text-4xl md:text-5xl text-ghost-white mt-2">Projects as Living Organisms</motion.h1>
            <motion.p className="text-amber-400/50 mt-4 max-w-2xl mx-auto">Each project has a cultivation realm. A health score. A next milestone. They're not repos — they're beings you're growing.</motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {PROJECTS.map((project, i) => (
              <motion.article key={project.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.6 }} className="group relative bg-void-black/50 border border-amber-500/10 rounded-2xl p-8 hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(201,168,76,0.1)] transition-all duration-500">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Github className="w-6 h-6 text-amber-400" /></div>
                    <div>
                      <h3 className="font-cinzel text-xl text-ghost-white">{project.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-mono">Chamber {project.chamber}</span>
                    </div>
                  </div>
                  <a href={project.repo} target="_blank" rel="noopener noreferrer" className="text-amber-400/40 hover:text-amber-400 p-2"><ExternalLink className="w-5 h-5" /></a>
                </div>

                <p className="text-amber-400/50 mb-6 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-void-black/50 border border-amber-500/10 rounded-full text-xs text-amber-400/60">{tech}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-amber-500/5">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-amber-400/40"><Star className="w-4 h-4" />{project.stars}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : project.status === 'completed' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>{project.status}</span>
                  </div>
                  <a href={project.repo} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-amber-500/20 rounded-xl text-amber-400/60 hover:text-amber-400 hover:border-amber-500/40 text-sm flex items-center gap-2"><Github className="w-4 h-4" /><span>View Code</span></a>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <motion.p className="text-amber-400/40 mb-4">More organisms growing in the dark</motion.p>
            <motion.a href="https://github.com/Jadai123" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 border border-amber-500/20 rounded-xl text-amber-400 hover:bg-amber-500/10 text-lg font-medium transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Github className="w-5 h-5" /><span>View All on GitHub</span></motion.a>
          </div>
        </motion.div>
      </main>
    </div>
  );
};