import { useState, useCallback } from 'react';
import type { ChamberId } from '../types';

const CHAMBER_STATE: Record<ChamberId, { active: boolean; messages: number }> = {
  forge: { active: false, messages: 0 },
  dream: { active: false, messages: 0 },
  alchemist: { active: false, messages: 0 },
  sage: { active: false, messages: 0 },
  garden: { active: false, messages: 0 },
  war: { active: false, messages: 0 },
  mirror: { active: false, messages: 0 },
  ultimate: { active: false, messages: 0 },
};

export function useChamber() {
  const [activeChamber, setActiveChamber] = useState<ChamberId>('forge');
  const [chambers, setChambers] = useState(CHAMBER_STATE);

  const openChamber = useCallback((id: ChamberId) => {
    setActiveChamber(id);
    setChambers(prev => ({
      ...prev,
      [id]: { ...prev[id], active: true },
    }));
  }, []);

  const incrementMessages = useCallback((id: ChamberId) => {
    setChambers(prev => ({
      ...prev,
      [id]: { ...prev[id], messages: prev[id].messages + 1 },
    }));
  }, []);

  return { activeChamber, chambers, openChamber, incrementMessages };
}
