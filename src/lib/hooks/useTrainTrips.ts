import { useEffect, useState } from 'react';
import type { FestivalDay, GoalTrainDirection } from '../../types';
import { getTrainTrips, type TrainTrip } from '../data/trains';

export function useTrainTrips(day: FestivalDay, direction: GoalTrainDirection): TrainTrip[] {
  const [trips, setTrips] = useState<TrainTrip[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTrainTrips(day, direction).then((result) => {
      if (!cancelled) setTrips(result);
    });
    return () => {
      cancelled = true;
    };
  }, [day, direction]);

  return trips;
}
