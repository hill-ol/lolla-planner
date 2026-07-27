import type { Artist, GoalTrainDirection } from '../types';
import type { TrainTrip } from './data/trains';
import { timeToMinutes } from './format';

// Union Station is the walk-in gateway to Grant Park; LaGrange is the group's
// home station. "outbound" = LaGrange -> Union Station (heading to the show).
// "return" = Union Station -> LaGrange (heading home).
export const OUTBOUND_WALK_BUFFER_MIN = 18;
export const RETURN_WALK_BUFFER_MIN = 20;

export type GoalTrainReason = 'no-picks' | 'no-train-found' | 'ok';

export interface GoalTrainResult {
  trip: TrainTrip | null;
  reason: GoalTrainReason;
}

export function computeGoalTrain(
  direction: GoalTrainDirection,
  pickedArtists: Artist[],
  trips: TrainTrip[],
): GoalTrainResult {
  if (pickedArtists.length === 0) {
    return { trip: null, reason: 'no-picks' };
  }

  if (direction === 'outbound') {
    const earliestStart = Math.min(...pickedArtists.map((artist) => timeToMinutes(artist.startTime)));
    const targetArrival = earliestStart - OUTBOUND_WALK_BUFFER_MIN;
    const candidates = trips
      .filter((trip) => timeToMinutes(trip.arrivalTime) <= targetArrival)
      .sort((a, b) => timeToMinutes(b.arrivalTime) - timeToMinutes(a.arrivalTime));
    return { trip: candidates[0] ?? null, reason: candidates[0] ? 'ok' : 'no-train-found' };
  }

  const latestEnd = Math.max(...pickedArtists.map((artist) => timeToMinutes(artist.endTime)));
  const targetDeparture = latestEnd + RETURN_WALK_BUFFER_MIN;
  const candidates = trips
    .filter((trip) => timeToMinutes(trip.departureTime) >= targetDeparture)
    .sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime));
  return { trip: candidates[0] ?? null, reason: candidates[0] ? 'ok' : 'no-train-found' };
}
