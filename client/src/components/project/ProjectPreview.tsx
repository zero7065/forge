import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Code, ExternalLink, Tag, Shield, Eye, EyeOff } from 'lucide-react';
import { apiPost, apiGet } from '../../utils/api';

interface PreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  summary: string;
  techStack: string[];
  quality: string;
  topics: string[];
}

interface ProjectPreviewProps {
  className?: string;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ className = '' }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/api/link-preview', { url: url.trim() });
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4 ${className}`}>
      <h3 className="text-sm font-cinzel text-ancient-gold mb-3 flex items-center gap-2">
        <Globe className="w-4 h-4" /> Link Preview Intelligence
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a URL to analyze..."
          className="flex-1 bg-void-black/50 border border-ancient-gold/10 rounded-lg px-3 py-2 text-sm text-ghost-white placeholder-ancient-gold/20 focus:outline-none focus:border-ancient-gold/30"
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="px-4 py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-ancient-gold text-sm hover:bg-ancient-gold/20 disabled:opacity-30"
        >
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-xs text-red-400/60 mb-3">{error}</p>}

      {preview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-void-black/40 border border-ancient-gold/5 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-ghost-white text-sm font-medium">{preview.title || 'Untitled'}</h4>
              <p className="text-ancient-gold/30 text-xs mt-1">{preview.url}</p>
            </div>
            <a href={preview.url} target="_blank" rel="noopener noreferrer"
              className="text-ancient-gold/20 hover:text-ancient-gold">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {preview.description && (
            <p className="text-xs text-ghost-white/40 leading-relaxed">{preview.description}</p>
          )}

          {preview.summary && (
            <div className="bg-void-black/30 rounded p-3">
              <p className="text-xs text-ancient-gold/40 mb-1 font-cinzel">AI Analysis</p>
              <p className="text-xs text-ghost-white/50 leading-relaxed">{preview.summary}</p>
            </div>
          )}

          {preview.techStack && preview.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {preview.techStack.map((tech, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-ancient-gold/5 border border-ancient-gold/10 rounded-full text-ancient-gold/40">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {preview.topics && preview.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {preview.topics.map((topic, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded-full text-blue-400/40">
                  <Tag className="w-2 h-2 inline mr-1" />{topic}
                </span>
              ))}
            </div>
          )}

          {preview.quality && (
            <div className="flex items-center gap-2 text-[10px] text-ancient-gold/20">
              <Shield className="w-3 h-3" /> Quality: {preview.quality}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProjectPreview;
