import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, GitBranch, Star, GitFork, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { apiPost } from '../../utils/api';

interface AnalysisResult {
  name: string;
  description: string;
  techStack: string[];
  status: string;
  summary: string;
  nextSteps: string[];
  repoUrl: string;
  previewUrl: string;
  canHire: boolean;
}

interface CodeAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  className?: string;
}

export const CodeAnalyzer: React.FC<CodeAnalyzerProps> = ({ onAnalysisComplete, className = '' }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/api/analyze/repo', { repoUrl: repoUrl.trim(), visibility });
      setResult(data);
      onAnalysisComplete?.(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { icon: <Zap className="w-3 h-3" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'completed': return { icon: <CheckCircle className="w-3 h-3" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      case 'stalled': return { icon: <Clock className="w-3 h-3" />, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'needs_help': return { icon: <AlertCircle className="w-3 h-3" />, color: 'text-red-400', bg: 'bg-red-500/10' };
      default: return { icon: <Code className="w-3 h-3" />, color: 'text-ancient-gold', bg: 'bg-ancient-gold/10' };
    }
  };

  return (
    <div className={`bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4 ${className}`}>
      <h3 className="text-sm font-cinzel text-ancient-gold mb-3 flex items-center gap-2">
        <Code className="w-4 h-4" /> Code Analyzer
      </h3>

      <div className="flex gap-2 mb-3">
        <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="flex-1 bg-void-black/50 border border-ancient-gold/10 rounded-lg px-3 py-2 text-sm text-ghost-white placeholder-ancient-gold/20 focus:outline-none focus:border-ancient-gold/30"
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
        <select value={visibility} onChange={e => setVisibility(e.target.value)}
          className="bg-void-black/50 border border-ancient-gold/10 rounded-lg px-2 py-2 text-xs text-ancient-gold/60">
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
        <button onClick={handleAnalyze} disabled={loading || !repoUrl.trim()}
          className="px-4 py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-ancient-gold text-sm hover:bg-ancient-gold/20 disabled:opacity-30">
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-xs text-red-400/60 mb-3">{error}</p>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-void-black/40 border border-ancient-gold/5 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-ghost-white text-sm font-medium">{result.name}</h4>
              <p className="text-xs text-ghost-white/40 mt-1">{result.description}</p>
            </div>
            {(() => { const cfg = getStatusConfig(result.status); return (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.icon} {result.status}
              </span>
            ); })()}
          </div>

          {result.techStack && result.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.techStack.map((tech, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-ancient-gold/5 border border-ancient-gold/10 rounded-full text-ancient-gold/40">{tech}</span>
              ))}
            </div>
          )}

          {result.summary && (
            <div className="bg-void-black/30 rounded p-3">
              <p className="text-xs text-ancient-gold/40 mb-1 font-cinzel">Summary</p>
              <p className="text-xs text-ghost-white/50">{result.summary}</p>
            </div>
          )}

          {result.canHire && (
            <div className="flex items-center gap-2 text-xs text-amber-400/50 bg-amber-500/5 rounded p-2">
              <AlertCircle className="w-3 h-3" />
              This project needs collaborators
            </div>
          )}

          <div className="flex gap-2">
            <a href={result.repoUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2 text-center bg-void-black/30 border border-ancient-gold/10 rounded-lg text-xs text-ancient-gold/40 hover:text-ancient-gold/70">
              <GitBranch className="w-3 h-3 inline mr-1" /> Repository
            </a>
            {result.previewUrl && (
              <a href={result.previewUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2 text-center bg-void-black/30 border border-ancient-gold/10 rounded-lg text-xs text-ancient-gold/40 hover:text-ancient-gold/70">
                Preview
              </a>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CodeAnalyzer;
