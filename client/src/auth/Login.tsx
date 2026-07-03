import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { SacredGeometry } from '../components/common/SacredGeometry';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black flex items-center justify-center p-4 relative overflow-hidden">
      <Background />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <SacredGeometry size={48} animate />
          <span className="font-cinzel text-3xl text-ghost-white tracking-wider">PRIMORDEX</span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          className="glass rounded-2xl p-8 border-ancient-gold/10"
        >
          <h1 className="font-cinzel text-2xl text-center text-ghost-white mb-2">Welcome Back</h1>
          <p className="text-center text-amber-400/50 mb-8">Enter the Forge</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Welcome back. Redirecting...</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-amber-400/60 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jehu@jadai.dev"
                  className="w-full bg-void-black/50 border border-ancient-gold/10 rounded-xl pl-10 pr-4 py-3 text-ghost-white placeholder-amber-400/20 focus:outline-none focus:border-ancient-gold/40 focus:ring-1 focus:ring-ancient-gold/20 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-400/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-void-black/50 border border-ancient-gold/10 rounded-xl pl-10 pr-12 py-3 text-ghost-white placeholder-amber-400/20 focus:outline-none focus:border-ancient-gold/40 focus:ring-1 focus:ring-ancient-gold/20 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/30 hover:text-amber-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(201, 168, 76, 0.2)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-ancient-gold/10 border border-ancient-gold/20 text-amber-400/50 cursor-not-allowed'
                  : 'bg-ancient-gold/10 border border-ancient-gold/20 text-amber-400 hover:bg-ancient-gold/20 hover:border-ancient-gold/40'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-ancient-gold/30 border-t-ancient-gold rounded-full animate-spin" />
                  <span>Entering...</span>
                </>
              ) : (
                <>
                  <span>Enter the Forge</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-amber-400/40 text-sm">
            No account?{' '}
            <Link to="/register" className="text-ancient-gold hover:text-amber-400 font-medium transition-colors">
              Build your soul
            </Link>
          </p>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-[11px] text-amber-400/20 font-jetbrains"
        >
          BUILD DIFFERENT · Jadai Studios
        </motion.p>
      </motion.div>
    </div>
  );
};

// Background component inline for login page
const Background: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-gradient-void" />
    <motion.div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-ember-500/5 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
    <motion.div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
    <SacredGeometry size={400} className="absolute top-10 right-10 animate-rotate-geometry-slow opacity-5" />
    <SacredGeometry size={300} className="absolute bottom-20 left-20 animate-rotate-geometry opacity-5" />
  </div>
);