import React, { useState, useEffect } from 'react';
import { Clock, User, AlertTriangle } from 'lucide-react';
import { apiGet } from '../../utils/api';
import type { AuditEntry } from '../../types';

export const AuditViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [limit, setLimit] = useState(20);

  useEffect(() => { loadLogs(); }, [limit]);

  const loadLogs = async () => {
    try {
      const data = await apiGet(`/api/audit?limit=${limit}`);
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); }
  };

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Audit Log</h3>
        <span className="text-[10px] text-ancient-gold/20">{logs.length} entries</span>
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-2 p-2 text-xs rounded hover:bg-ancient-gold/5">
            <User className="w-3 h-3 text-ancient-gold/30 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-ghost-white/50">{log.action}</span>
              <span className="text-ancient-gold/20 ml-2">{log.created_at?.slice(0, 16)}</span>
              {log.risk_score > 0 && <AlertTriangle className="w-3 h-3 text-amber-400/50 inline ml-1" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditViewer;
