import { useCallback, useEffect, useState } from 'react';
import type { SchedulePick } from '../../types';
import { getSchedulePicks, subscribeSchedulePicks } from '../data/schedulePicks';

export function useSchedulePicks() {
  const [picks, setPicks] = useState<SchedulePick[]>([]);

  const refresh = useCallback(() => {
    getSchedulePicks().then(setPicks);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeSchedulePicks(refresh);
  }, [refresh]);

  return { picks };
}
