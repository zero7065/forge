import React, { useState, useEffect } from 'react';
import { Calendar, FileText, RefreshCw } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';
import type { Briefing } from '../../types';

export const BriefingsViewer: React.FC = () => {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selected, setSelected] = useState<Briefing | null>(null);

  useEffect(() => { loadBriefings(); }, []);

  const loadBriefings = async () => {
    try {
      const data = await apiGet('/api/briefings');
      setBriefings(Array.isArray(data) ? data : []);
    } catch { setBriefings([]); }
  };

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Daily Briefings</h3>
        <button onClick={loadBriefings} className="p-1 text-ancient-gold/30 hover:text-ancient-gold"><RefreshCw className="w-3 h-3" /></button>
      </div>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-xs text-ancient-gold/30 hover:text-ancient-gold mb-2">&larr; Back</button>
          <h4 className="text-ghost-white/60 text-xs mb-2">{selected.date}</h4>
          <div className="text-xs text-ghost-white/40 whitespace-pre-wrap max-h-48 overflow-y-auto">{selected.content}</div>
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {briefings.length === 0 && <p className="text-xs text-ancient-gold/20 text-center py-4">No briefings yet</p>}
          {briefings.map(b => (
            <button key={b.id} onClick={() => setSelected(b)}
              className="w-full flex items-center gap-2 p-2 text-xs text-left rounded hover:bg-ancient-gold/5">
              <Calendar className="w-3 h-3 text-ancient-gold/30" />
              <span className="text-ghost-white/50">{b.date}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BriefingsViewer;
