import React, { useState, useEffect } from 'react';
import { Bell, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';
import type { AlertRule } from '../../types';

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      const data = await apiGet('/api/alerts');
      setAlerts(Array.isArray(data) ? data : []);
    } catch { setAlerts([]); }
  };

  const runChecks = async () => {
    try { await apiPost('/api/alerts/run', {}); loadAlerts(); } catch {}
  };

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Alert Rules</h3>
        <button onClick={runChecks} className="text-[10px] px-2 py-1 bg-ancient-gold/10 border border-ancient-gold/20 rounded text-ancient-gold/50 hover:text-ancient-gold">Run Now</button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.length === 0 && <p className="text-xs text-ancient-gold/20 text-center py-4">No alert rules</p>}
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between p-2 bg-void-black/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-3 h-3 text-ancient-gold/30" />
              <span className="text-xs text-ghost-white/50">{alert.name}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${alert.enabled ? 'bg-emerald-500/10 text-emerald-400/50' : 'bg-red-500/10 text-red-400/30'}`}>
              {alert.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
