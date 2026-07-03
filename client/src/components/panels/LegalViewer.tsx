import React, { useState, useEffect } from 'react';
import { Scale, ExternalLink, RefreshCw } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';
import type { LegalFlag } from '../../types';

export const LegalViewer: React.FC = () => {
  const [flags, setFlags] = useState<LegalFlag[]>([]);

  useEffect(() => { loadFlags(); }, []);

  const loadFlags = async () => {
    try {
      const data = await apiGet('/api/legal');
      setFlags(Array.isArray(data) ? data : []);
    } catch { setFlags([]); }
  };

  return (
    <div className="bg-void-black/60 border border-ancient-gold/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-cinzel text-ancient-gold">Legal Flags</h3>
        <button onClick={loadFlags} className="p-1 text-ancient-gold/30 hover:text-ancient-gold"><RefreshCw className="w-3 h-3" /></button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {flags.length === 0 && <p className="text-xs text-ancient-gold/20 text-center py-4">No flags detected</p>}
        {flags.map(flag => (
          <div key={flag.id} className="p-2 bg-void-black/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Scale className="w-3 h-3 text-amber-400/40" />
              <span className="text-xs text-ghost-white/50">{flag.title}</span>
            </div>
            <p className="text-[10px] text-ancient-gold/20 mt-1">{flag.source} &middot; {flag.flagged_at?.slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalViewer;
