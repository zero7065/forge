import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, GitBranch, Code, Users, Zap, AlertCircle, CheckCircle, Clock, Plus, Search, UserPlus, Briefcase, ArrowRight, ExternalLink, Archive, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  cultivationLevel: number;
  cultivationRealm: string;
  status: 'active' | 'stalled' | 'needs_help' | 'completed' | 'archived';
  healthScore: number;
  lastCommit: string;
  collaborators: string[];
  githubUrl?: string;
  previewUrl?: string;
  codeVisibility: 'public' | 'private' | 'restricted';
  progress: number;
  nextMilestone: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HireSpec {
  id: string;
  projectId: string;
  role: string;
  requiredSkills: { skill: string; level: string }[];
  responsibilities: string[];
  niceToHave: string[];
  rateRange: string;
  interviewQuestions: string[];
  aboutProject: string;
  status: 'draft' | 'posted' | 'reviewing' | 'filled' | 'closed';
  applicants: number;
  createdAt: Date;
}

const cultivationRealms = [
  { level: 1, name: 'Foundation', color: '#8B6914' },
  { level: 2, name: 'Qi Condensation', color: '#B8860B' },
  { level: 3, name: 'Core Formation', color: '#DAA520' },
  { level: 4, name: 'Nascent Soul', color: '#C9A84C' },
  { level: 5, name: 'Soul Transformation', color: '#E8C84A' },
  { level: 6, name: 'Dao Seeking', color: '#F0D86C' },
  { level: 7, name: 'Dao Understanding', color: '#F0E08C' },
  { level: 8, name: 'Dao Integration', color: '#F0E8AC' },
  { level: 9, name: 'Immortal Ascension', color: '#F0F0CC' },
  { level: 10, name: 'Transcendence', color: '#FFFFFF' }
];

const getStatusConfig = (status: Project['status']) => {
  const configs = {
    active: { icon: Zap, color: 'text-emerald-400', label: 'Active' },
    stalled: { icon: Clock, color: 'text-amber-400', label: 'Stalled' },
    needs_help: { icon: AlertCircle, color: 'text-red-400', label: 'Needs Help' },
    completed: { icon: CheckCircle, color: 'text-cyan-400', label: 'Completed' },
    archived: { icon: Archive, color: 'text-neutral-400', label: 'Archived' }
  };
  return configs[status] || configs.active;
};

const getHealthColor = (score: number) => score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';
const getRealmColor = (level: number) => cultivationRealms.find(r => r.level === level)?.color || '#C9A84C';

export const WarRoom: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireSpecs, setHireSpecs] = useState<HireSpec[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadProjects(); loadHireSpecs(); }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/war/projects', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.projects) setProjects(data.projects.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })));
    } catch (e) { console.error('Failed to load projects', e); }
  };

  const loadHireSpecs = async () => {
    try {
      const res = await fetch('/api/war/hire-specs', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.specs) setHireSpecs(data.specs.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
    } catch (e) { console.error('Failed to load hire specs', e); }
  };

  const handleHire = async (projectId: string) => {
    try {
      const res = await fetch('/api/war/hire/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ projectId })
      });
      const spec = await res.json();
      setHireSpecs(prev => [...prev, spec]);
      setShowHireModal(true);
    } catch (e) { console.error('Failed to generate hire spec', e); }
  };

  const handlePostHire = async (specId: string) => {
    try {
      await fetch('/api/war/hire/post', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ specId }) });
      loadHireSpecs();
      setShowHireModal(false);
    } catch (e) { console.error('Failed to post hire', e); }
  };

  const filteredProjects = projects.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-void-black/90 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/3 rounded-full blur-3xl" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-cinzel text-ghost-white tracking-wider">War Room</h2>
          <span className="text-xs text-amber-400/60 ml-2">Chamber VI</span>
          <span className="text-xs text-amber-400/30 ml-4">{projects.filter(p => p.status === 'active').length} active</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/20" />
            <input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-void-black/50 border border-amber-500/10 rounded-lg px-8 py-1.5 text-sm text-ghost-white placeholder-amber-400/20 focus:outline-none focus:border-amber-500/40" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-void-black/50 border border-amber-500/10 rounded-lg px-3 py-1.5 text-sm text-amber-300 focus:outline-none focus:border-amber-500/40">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="stalled">Stalled</option>
            <option value="needs_help">Needs Help</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-1.5 text-amber-400 hover:bg-amber-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Project</span>
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <motion.div key={project.id} whileHover={{ scale: 1.01, borderColor: 'rgba(201, 168, 76, 0.3)' }} className="bg-void-black/60 border border-amber-500/10 rounded-xl p-5 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer" onClick={() => setSelectedProject(project)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(getStatusConfig(project.status).icon, { className: `w-4 h-4 ${getStatusConfig(project.status).color}` })}
                  <h3 className="text-ghost-white font-medium">{project.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ backgroundColor: getRealmColor(project.cultivationLevel) + '20', color: getRealmColor(project.cultivationLevel) }} className="text-xs px-2 py-0.5 rounded-full">{project.cultivationRealm}</span>
                  <span className="text-xs text-amber-400/30">Lv.{project.cultivationLevel}</span>
                </div>
              </div>
              <p className="text-sm text-amber-400/50 line-clamp-2 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.techStack.slice(0, 4).map((tech, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-full text-amber-400/40">{tech}</span>)}
                {project.techStack.length > 4 && <span className="text-[10px] text-amber-400/20">+{project.techStack.length - 4}</span>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400/30">Health</span>
                  <span className={getHealthColor(project.healthScore)}>{project.healthScore}%</span>
                </div>
                <div className="w-full h-1 bg-void-black rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${project.healthScore}%` }} className="h-full rounded-full" style={{ backgroundColor: getRealmColor(project.cultivationLevel) }} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/5">
                <div className="flex items-center gap-2 text-xs text-amber-400/30">
                  <GitBranch className="w-3 h-3" />
                  <span>{project.lastCommit}</span>
                </div>
                <div className="flex items-center gap-2">
                  {project.status === 'needs_help' && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={e => { e.stopPropagation(); handleHire(project.id); }} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 hover:bg-red-500/20 transition-colors">
                      <UserPlus className="w-3 h-3" />Hire Help
                    </motion.button>
                  )}
                  <span className="text-xs text-amber-400/20">{project.progress}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-amber-400/20">
            <Target className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm font-cinzel">No projects in this view</p>
            <p className="text-xs mt-1 opacity-50">Adjust filters or create new project</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHireModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowHireModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-void-black border border-amber-500/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-cinzel text-ghost-white">Collaborator Hiring</h3>
                </div>
                <button onClick={() => setShowHireModal(false)} className="text-amber-400/30 hover:text-amber-400"><X className="w-5 h-5" /></button>
              </div>
              {hireSpecs.filter(s => s.status === 'draft').length === 0 && (
                <div className="text-center py-8 text-amber-400/30">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No draft hire specs. Generate one from a project.</p>
                </div>
              )}
              {hireSpecs.filter(s => s.status === 'draft').map(spec => (
                <div key={spec.id} className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-ghost-white font-medium">{spec.role}</h4>
                      <p className="text-sm text-amber-400/50">{spec.aboutProject}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 text-sm">{spec.rateRange}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spec.requiredSkills.map((skill, i) => <span key={i} className="text-xs px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-full text-amber-400/40">{skill.skill} ({skill.level})</span>)}
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handlePostHire(spec.id)} className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors">Post to The Table</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowHireModal(false)} className="px-4 py-2 border border-amber-500/10 rounded-lg text-amber-400/30 hover:text-amber-400/60 transition-colors">Close</motion.button>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-void-black border-l border-amber-500/10 shadow-2xl z-40 overflow-y-auto">
            <div className="p-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedProject(null)} className="mb-6 text-amber-400/30 hover:text-amber-400 transition-colors flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" /><span>Back</span>
              </motion.button>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    {React.createElement(getStatusConfig(selectedProject.status).icon, { className: `w-5 h-5 ${getStatusConfig(selectedProject.status).color}` })}
                    <h2 className="text-2xl font-cinzel text-ghost-white">{selectedProject.name}</h2>
                  </div>
                  <p className="text-amber-400/50 mt-2">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <span className="text-xs text-amber-400/30">Cultivation Realm</span>
                    <p style={{ color: getRealmColor(selectedProject.cultivationLevel) }}>{selectedProject.cultivationRealm}</p>
                  </div>
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <span className="text-xs text-amber-400/30">Health Score</span>
                    <p className={getHealthColor(selectedProject.healthScore)}>{selectedProject.healthScore}%</p>
                  </div>
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <span className="text-xs text-amber-400/30">Progress</span>
                    <p className="text-amber-400">{selectedProject.progress}%</p>
                  </div>
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <span className="text-xs text-amber-400/30">Collaborators</span>
                    <p className="text-amber-400">{selectedProject.collaborators.length}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-amber-400/30 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech, i) => <span key={i} className="px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-sm text-amber-400/60">{tech}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-amber-400/30 mb-2">Next Milestone</h4>
                  <p className="text-ghost-white">{selectedProject.nextMilestone}</p>
                </div>
                {selectedProject.githubUrl && (
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400/60"><GitBranch className="w-4 h-4" /><span className="text-sm truncate">{selectedProject.githubUrl}</span></div>
                    <button onClick={() => window.open(selectedProject.githubUrl, '_blank')} className="mt-2 text-xs text-amber-400/30 hover:text-amber-400 flex items-center gap-1">View Repository <ExternalLink className="w-3 h-3" /></button>
                  </div>
                )}
                {selectedProject.previewUrl && (
                  <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400/60"><Code className="w-4 h-4" /><span className="text-sm truncate">{selectedProject.previewUrl}</span></div>
                    <button onClick={() => window.open(selectedProject.previewUrl, '_blank')} className="mt-2 text-xs text-amber-400/30 hover:text-amber-400 flex items-center gap-1">Open Preview <ExternalLink className="w-3 h-3" /></button>
                  </div>
                )}
                {selectedProject.status === 'needs_help' && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleHire(selectedProject.id)} className="w-full py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />Hire Collaborator
                  </motion.button>
                )}
                <div className="text-xs text-amber-400/20 flex justify-between pt-4 border-t border-amber-500/5">
                  <span>Created: {selectedProject.createdAt.toLocaleDateString()}</span>
                  <span>Updated: {selectedProject.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
