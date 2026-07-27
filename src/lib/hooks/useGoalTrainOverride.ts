import { useCallback, useEffect, useState } from 'react';
import type { GoalTrainDirection, GoalTrainOverride } from '../../types';
import { getOverrideForDay, subscribeGoalTrainOverrides } from '../data/goalTrainOverrides';

export function useGoalTrainOverride(day: string, direction: GoalTrainDirection) {
  const [override, setOverride] = useState<GoalTrainOverride | undefined>(undefined);

  const refresh = useCallback(() => {
    getOverrideForDay(day, direction).then(setOverride);
  }, [day, direction]);

  useEffect(() => {
    refresh();
    return subscribeGoalTrainOverrides(refresh);
  }, [refresh]);

  return override;
}
