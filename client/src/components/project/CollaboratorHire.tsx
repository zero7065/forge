import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Briefcase, DollarSign, Clock, Code, CheckCircle } from 'lucide-react';
import { apiPost, apiGet } from '../../utils/api';
import type { HireSpec } from '../../types';

interface CollaboratorHireProps {
  projectId?: string;
  projectName?: string;
  onClose?: () => void;
  className?: string;
}

export const CollaboratorHire: React.FC<CollaboratorHireProps> = ({ projectId, projectName, onClose, className = '' }) => {
  const [specs, setSpecs] = useState<HireSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [skills, setSkills] = useState('');

  const loadSpecs = async () => {
    try {
      const data = await apiGet('/api/hire/specs');
      setSpecs(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleGenerate = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const spec = await apiPost('/api/hire/generate-spec', {
        projectId,
        budget: Number(budget) || 50000,
        timeline: timeline || '2 weeks',
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSpecs(prev => [spec, ...prev]);
    } catch {} finally { setLoading(false); }
  };

  const handlePost = async (specId: string) => {
    try {
      await apiPost('/api/hire/post', { specId, jobDescription: 'Posted via PRIMORDEX War Room' });
      loadSpecs();
    } catch {}
  };

  return (
    <div className={`bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Collaborator Hiring
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-xs text-ancient-gold/20 hover:text-ancient-gold/50">Close</button>
        )}
      </div>

      {projectId && (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-ancient-gold/30 mb-1 block">Budget (NGN)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="50000"
                className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1.5 text-xs text-ghost-white" />
            </div>
            <div>
              <label className="text-[10px] text-ancient-gold/30 mb-1 block">Timeline</label>
              <input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="2 weeks"
                className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1.5 text-xs text-ghost-white" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-ancient-gold/30 mb-1 block">Required Skills (comma-separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, TypeScript"
              className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1.5 text-xs text-ghost-white" />
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-ancient-gold text-xs hover:bg-ancient-gold/20 disabled:opacity-30">
            {loading ? 'Generating...' : 'AI Generate Job Spec'}
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {specs.map(spec => (
          <motion.div key={spec.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-void-black/40 border border-ancient-gold/5 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-ghost-white text-xs font-medium">{spec.role}</h4>
                <p className="text-[10px] text-ancient-gold/20">{spec.project_name || 'Project'}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                spec.status === 'posted' ? 'bg-emerald-500/10 text-emerald-400/50' :
                spec.status === 'filled' ? 'bg-blue-500/10 text-blue-400/50' :
                'bg-ancient-gold/10 text-ancient-gold/30'
              }`}>{spec.status}</span>
            </div>
            {spec.about_project && <p className="text-[10px] text-ghost-white/30 mb-2 line-clamp-2">{spec.about_project}</p>}
            {spec.required_skills && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(typeof spec.required_skills === 'string' ? JSON.parse(spec.required_skills || '[]') : spec.required_skills || []).slice(0, 4).map((s: string, i: number) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-ancient-gold/5 rounded text-ancient-gold/30">{s}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-[10px] text-ancient-gold/20">
              {spec.rate_range && <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{spec.rate_range}</span>}
              {spec.applicants > 0 && <span>{spec.applicants} applicants</span>}
            </div>
            {spec.status === 'draft' && (
              <button onClick={() => handlePost(spec.id)}
                className="mt-2 w-full py-1.5 bg-ancient-gold/10 border border-ancient-gold/20 rounded text-ancient-gold text-[10px] hover:bg-ancient-gold/20">
                Post to The Table
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorHire;
