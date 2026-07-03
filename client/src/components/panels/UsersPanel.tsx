import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Shield, Eye } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
  is_active: number;
}

export const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await apiGet('/api/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await apiPost('/api/users/invite', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setShowInvite(false);
      loadUsers();
    } catch {}
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-ancient-gold" />;
      case 'admin': return <Shield className="w-3 h-3 text-blue-400" />;
      default: return <Eye className="w-3 h-3 text-ghost-white/30" />;
    }
  };

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Users</h3>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1 text-[10px] px-2 py-1 bg-ancient-gold/10 border border-ancient-gold/20 rounded text-ancient-gold/50 hover:text-ancient-gold">
          <UserPlus className="w-3 h-3" /> Invite
        </button>
      </div>

      {showInvite && (
        <div className="flex gap-2 mb-3">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email"
            className="flex-1 bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1 text-xs text-ghost-white" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            className="bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1 text-xs text-ancient-gold/60">
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleInvite} className="px-2 py-1 bg-ancient-gold/10 rounded text-xs text-ancient-gold/50">Send</button>
        </div>
      )}

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-2 p-2 rounded hover:bg-ancient-gold/5">
            {getRoleIcon(user.role)}
            <span className="text-xs text-ghost-white/50 flex-1">{user.email}</span>
            <span className="text-[10px] text-ancient-gold/20">{user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPanel;
