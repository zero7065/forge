import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';
import type { AuditEntry } from '../../types';

export const ApprovalQueue: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const data = await apiGet('/api/audit?limit=50');
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
  };

  const handleApprove = async (id: string) => {
    try { await apiPost(`/api/audit/${id}/approve`, {}); loadEntries(); } catch {}
  };

  const handleReject = async (id: string) => {
    try { await apiPost(`/api/audit/${id}/reject`, { reason: 'Rejected by admin' }); loadEntries(); } catch {}
  };

  const filtered = entries.filter(e => filter === 'all' || !e.approved_by);

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Approval Queue</h3>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-void-black/50 border border-ancient-gold/10 rounded px-2 py-1 text-xs text-ancient-gold/60">
          <option value="pending">Pending</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.length === 0 && <p className="text-xs text-ancient-gold/20 text-center py-4">No pending items</p>}
        {filtered.map(entry => (
          <div key={entry.id} className="flex items-center justify-between p-2 bg-void-black/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ghost-white/60 truncate">{entry.action}: {typeof entry.input === 'string' ? entry.input.substring(0, 50) : ''}</p>
              <p className="text-[10px] text-ancient-gold/20">{entry.created_at}</p>
            </div>
            <div className="flex gap-1 ml-2">
              <button onClick={() => handleApprove(entry.id)} className="p-1 text-emerald-400/40 hover:text-emerald-400"><CheckCircle className="w-3 h-3" /></button>
              <button onClick={() => handleReject(entry.id)} className="p-1 text-red-400/40 hover:text-red-400"><XCircle className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalQueue;
