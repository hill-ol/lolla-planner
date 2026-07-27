import { useEffect, useState } from 'react';
import type { Stage } from '../../types';
import { getStages } from '../data/stages';

export function useStages(): Stage[] {
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    let cancelled = false;
    getStages().then((result) => {
      if (!cancelled) setStages(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return stages;
}
