import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Heart, Brain, Zap, Crown, Shield, Lightbulb, Target, BookOpen, TreePine, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { SacredGeometry } from '../components/common/SacredGeometry';

const COMMUNITY_POSTS = [
  { author: 'Sarah Chen', role: 'Founder', avatar: 'SC', content: 'Just hired my first collaborator through the War Room hiring engine. The AI generated a perfect job spec in 30 seconds — role, skills, Nigerian market rates, interview questions. Posted to The Table. Got 3 qualified applicants in 2 hours.', chamber: 'VI', reactions: 47, comments: 12, time: '2h ago' },
  { author: 'Marcus Okonkwo', role: 'Builder', avatar: 'MO', content: 'The Mirror showed me a pattern I\'d been repeating for 3 years: I always abandon projects at the "Nascent Soul" realm. Core whispered: "You fear the responsibility of completion." That hit different.', chamber: 'VII', reactions: 89, comments: 23, time: '5h ago' },
  { author: 'Aisha Bello', role: 'Designer', avatar: 'AB', content: 'Used Sage Table\'s dark psychology mode to rewrite my freelance proposal. Frame control + reverse psychology. Client went from "we "this is expensive" to "when can you start?" in one email.', chamber: 'IV', reactions: 156, comments: 34, time: '1d ago' },
  { author: 'David Kim', role: 'Engineer', avatar: 'DK', content: 'Dropped a stale repo into Alchemist Lab. It synthesized 3 unexpected expansions. One became a new product feature. The "Imagination Mind" is real.', chamber: 'III', reactions: 67, comments: 18, time: '1d ago' },
  { author: 'Priya Sharma', role: 'Strategist', avatar: 'PS', content: 'Dream State captured a 3am idea. Two weeks later, Forge connected it to a project I\'d forgotten in War Room. The synthesis happened while I slept.', chamber: 'II', reactions: 34, comments: 8, time: '2d ago' },
];

const CHAMBERS_INFO = [
  { id: 'forge', name: 'The Forge', icon: Sparkles, color: 'amber', desc: 'Raw creation. No structure. Pure capture.', posts: 1247 },
  { id: 'dream', name: 'Dream State', icon: Lightbulb, color: 'blue', desc: 'Inspiration capture. Minimal analysis.', posts: 892 },
  { id: 'alchemist', name: 'Alchemist Lab', icon: Brain, color: 'purple', desc: 'Synthesis. Imagination Mind. 3 expansions.', posts: 567 },
  { id: 'sage', name: 'Sage Table', icon: BookOpen, color: 'green', desc: 'Communication mastery. Dark psychology. Persuasion.', posts: 2341 },
  { id: 'garden', name: 'Zen Garden', icon: TreePine, color: 'emerald', desc: 'Stillness. Reflection. No required input.', posts: 1876 },
  { id: 'war', name: 'War Room', icon: Target, color: 'red', desc: 'Strategy. Projects as organisms. Hiring engine.', posts: 923 },
  { id: 'mirror', name: 'The Mirror', icon: Users, color: 'gold', desc: 'Prime interface. Soul data. No judgment.', posts: 445 },
];

export const TablePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-void-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-void" />
        <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
        <SacredGeometry size={500} className="absolute top-10 right-10 animate-rotate-geometry-slow opacity-5" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div className="flex items-center gap-3"><SacredGeometry size={32} /><span className="font-cinzel text-xl text-ghost-white">PRIMORDEX</span></motion.div>
          <div className="flex items-center gap-8"><a href="/" className="text-amber-400/50 hover:text-ghost-white text-sm">Home</a><a href="/showcase" className="text-amber-400/50 hover:text-ghost-white text-sm">Showcase</a><a href="/transmissions" className="text-amber-400/50 hover:text-ghost-white text-sm">Transmissions</a><a href="/sanctum" className="text-amber-400/50 hover:text-ghost-white text-sm">Sanctum</a></div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.span className="text-ancient-gold text-sm font-cinzel tracking-widest uppercase">The Table</motion.span>
              <motion.h1 className="font-cinzel text-4xl md:text-5xl text-ghost-white mt-2">Where Builders Gather</motion.h1>
              <motion.p className="text-amber-400/50 mt-4 max-w-2xl">Not a forum. A roundtable. No performative posts. Only signals from the chambers.</motion.p>
            </div>
            <div className="flex items-center gap-4"><motion.span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono">Live</motion.span><span className="text-amber-400/40 text-sm font-mono">847 builders online</span></div>
          </div>

          {/* Chamber Tabs */}
          <div className="mb-12 overflow-x-auto scrollbar-hide">
            <motion.div className="flex gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {CHAMBERS_INFO.map(chamber => (
                <motion.button key={chamber.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${chamber.id === 'sage' ? `bg-${chamber.color}-500/20 text-${chamber.color}-400 border-${chamber.color}-500/30` : 'bg-void-black/50 text-amber-400/40 hover:text-ghost-white hover:bg-void-black/30 border-amber-500/10'}`}><chamber.icon className={`w-4 h-4 mr-2 text-${chamber.color}-400`} /><span>{chamber.name}</span><span className="ml-2 px-2 py-0.5 bg-void-black/50 rounded-full text-xs text-amber-400/40">{chamber.posts.toLocaleString()}</span></motion.button>
              ))}
            </motion.div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {COMMUNITY_POSTS.map((post, i) => (
              <motion.article key={post.author} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.6 }} className="bg-void-black/50 border border-amber-500/10 rounded-2xl p-8 hover:border-amber-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-medium text-lg">{post.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2"><span className="font-medium text-ghost-white">{post.author}</span><span className="text-xs px-2 py-0.5 bg-void-black/50 rounded-full text-amber-400/40">{post.role}</span></div>
                      <div className="flex items-center gap-2 text-xs"><span className="text-amber-400/40">{post.time}</span><span className="mx-1 text-amber-500/30">·</span><span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-mono">Chamber {post.chamber}</span></div>
                    </div>
                  </div>
                  <span className="text-amber-400/30 text-sm font-mono">{post.reactions} ⚡ {post.comments} 💬</span>
                </div>
                <p className="text-ghost-white/90 leading-relaxed mb-6">{post.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-amber-500/5">
                  <div className="flex items-center gap-4 text-amber-400/40"><button className="flex items-center gap-1 hover:text-amber-400 transition-colors"><Heart className="w-4 h-4" /><span>{post.reactions}</span></button><button className="flex items-center gap-1 hover:text-amber-400 transition-colors"><MessageSquare className="w-4 h-4" /><span>{post.comments}</span></button></div>
                  <button className="px-3 py-1.5 border border-amber-500/20 rounded-xl text-amber-400/60 hover:text-amber-400 hover:border-amber-500/40 text-sm">Engage</button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Chamber Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHAMBERS_INFO.map(chamber => (
              <motion.div key={chamber.id} whileHover={{ y: -4 }} className="p-6 bg-void-black/50 border border-amber-500/10 rounded-2xl"><div className="flex items-center gap-3 mb-3"><chamber.icon className={`w-6 h-6 text-${chamber.color}-400`} /><h3 className="font-cinzel text-lg text-ghost-white">{chamber.name}</h3></div><p className="text-amber-400/40 text-sm mb-4">{chamber.desc}</p><div className="flex items-center justify-between"><span className="text-3xl font-cinzel text-ghost-white">{chamber.posts.toLocaleString()}</span><span className="text-xs text-amber-400/40">signals</span></div></motion.div>
            ))}
          </motion.div>

          {/* Join CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center p-8 bg-void-black/50 border border-amber-500/10 rounded-2xl">
            <h2 className="font-cinzel text-2xl text-ghost-white mb-3">Pull Up a Seat</h2>
            <p className="text-amber-400/50 mb-6 max-w-xl mx-auto">The Table isn't open to everyone. Application required. But if you're building something that matters, there's a place for you.</p>
            <motion.a href="/sanctum" className="inline-flex items-center gap-2 px-6 py-3 bg-ancient-gold/10 border border-ancient-gold/20 rounded-xl text-amber-400 hover:bg-ancient-gold/20 text-lg font-medium transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><ArrowRight className="w-5 h-5" /><span>Apply to The Table</span></motion.a>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};