import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, FolderGit2, Code, GitBranch, RefreshCw, X } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';

export const GitHubConnect: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const data = await apiGet('/api/github/oauth/status');
      if (data.connected) {
        setConnected(true);
        setUsername(data.username);
        setAvatar(data.avatar);
        await loadRepos();
      }
    } catch { /* not connected */ }
    setLoading(false);
  };

  const connectGitHub = () => { window.location.href = '/api/github/oauth/auth'; };

  const disconnectGitHub = async () => {
    await apiPost('/api/github/oauth/disconnect', {});
    setConnected(false); setUsername(''); setAvatar(''); setRepos([]);
  };

  const loadRepos = async () => {
    try {
      const data = await apiGet('/api/github/repos');
      setRepos(data);
    } catch (e) { console.error('Failed to load repos:', e); }
  };

  const loadRepoContents = async (repo: string, path: string = '') => {
    try {
      const data = await apiGet(`/api/github/repos/${repo}/contents?path=${path}`);
      setFiles(data); setSelectedRepo(repo); setCurrentPath(path);
    } catch (e) { console.error('Failed to load contents:', e); }
  };

  const readFileContent = async (repo: string, path: string) => {
    try {
      const data = await apiGet(`/api/github/repos/${repo}/file?path=${path}`);
      setFileContent(data.content); setEditingFile(path);
    } catch (e) { console.error('Failed to read file:', e); }
  };

  const saveFile = async () => {
    if (!selectedRepo || !editingFile) return;
    try {
      await apiPost(`/api/github/repos/${selectedRepo}/file`, {
        path: editingFile, content: fileContent,
        message: commitMessage || `Update ${editingFile}`, branch: 'main'
      });
      setEditingFile(null); setCommitMessage('');
      await loadRepoContents(selectedRepo, currentPath);
    } catch (e) { console.error('Failed to save file:', e); }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><RefreshCw className="w-6 h-6 text-amber-400 animate-spin" /></div>;

  if (!connected) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-void-black/50 border border-amber-500/10 rounded-xl p-8 text-center">
        <Github className="w-16 h-16 text-amber-400/20 mx-auto mb-4" />
        <h3 className="text-xl font-cinzel text-ghost-white mb-2">Connect GitHub</h3>
        <p className="text-amber-400/40 text-sm mb-6">Link your GitHub account to manage repositories directly from PRIMORDEX.</p>
        <button onClick={connectGitHub} className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-2 mx-auto">
          <Github className="w-5 h-5" /> Connect GitHub
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          {avatar && <img src={avatar} alt={username} className="w-10 h-10 rounded-full" />}
          <div>
            <p className="text-ghost-white font-medium">{username}</p>
            <p className="text-xs text-amber-400/40">Connected to GitHub</p>
          </div>
        </div>
        <button onClick={disconnectGitHub} className="text-xs text-red-400/40 hover:text-red-400 transition-colors">Disconnect</button>
      </div>

      <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
        <h4 className="text-sm text-amber-400/40 mb-3 flex items-center gap-2"><FolderGit2 className="w-4 h-4" /> Repositories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {repos.map((repo) => (
            <button key={repo.id} onClick={() => loadRepoContents(repo.full_name)} className="w-full text-left px-3 py-2 hover:bg-amber-500/5 rounded-lg transition-colors flex items-center justify-between group">
              <span className="text-ghost-white text-sm">{repo.name}</span>
              <span className="text-xs text-amber-400/20 group-hover:text-amber-400/40">{repo.private ? 'Private' : 'Public'}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedRepo && (
        <div className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm text-amber-400/40 flex items-center gap-2"><Code className="w-4 h-4" /> {selectedRepo} / {currentPath || 'root'}</h4>
            <button onClick={() => loadRepoContents(selectedRepo, '')} className="text-xs text-amber-400/30 hover:text-amber-400/60">Refresh</button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {files.map((item: any) => (
              <div key={item.path} className="flex items-center justify-between px-3 py-1.5 hover:bg-amber-500/5 rounded-lg transition-colors">
                <button onClick={() => item.type === 'dir' ? loadRepoContents(selectedRepo, item.path) : readFileContent(selectedRepo, item.path)} className="flex items-center gap-2 text-sm text-ghost-white/70 hover:text-ghost-white">
                  {item.type === 'dir' ? 'Folder' : 'File'} {item.name}
                </button>
                <span className="text-xs text-amber-400/20">{item.size ? `${(item.size / 1024).toFixed(1)}KB` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingFile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-void-black/50 border border-amber-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-amber-400/40">Editing: {editingFile}</span>
            <div className="flex gap-2">
              <input type="text" placeholder="Commit message..." value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} className="bg-void-black border border-amber-500/10 rounded px-3 py-1 text-sm text-ghost-white placeholder-amber-400/20 focus:outline-none focus:border-amber-500/40" />
              <button onClick={saveFile} className="px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 text-sm"><GitBranch className="w-4 h-4 inline mr-1" />Commit</button>
              <button onClick={() => setEditingFile(null)} className="px-4 py-1 border border-amber-500/10 rounded-lg text-amber-400/30 hover:text-amber-400/60 text-sm"><X className="w-4 h-4 inline" /></button>
            </div>
          </div>
          <textarea value={fileContent} onChange={(e) => setFileContent(e.target.value)} className="w-full h-64 bg-void-black border border-amber-500/10 rounded-lg p-3 text-ghost-white font-jetbrains text-sm focus:outline-none focus:border-amber-500/40 resize-none" spellCheck={false} />
        </motion.div>
      )}
    </motion.div>
  );
};
