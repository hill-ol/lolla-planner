import type { Artist, GoalTrainDirection } from '../types';
import type { TrainTrip } from './data/trains';
import { timeToMinutes } from './format';

// Union Station is the walk-in gateway to Grant Park; LaGrange is the group's
// home station. "outbound" = LaGrange -> Union Station (heading to the show).
// "return" = Union Station -> LaGrange (heading home).
export const OUTBOUND_WALK_BUFFER_MIN = 18;
export const RETURN_WALK_BUFFER_MIN = 20;

const SERVICE_DAY_ROLLEROVER_MINUTES = 3 * 60;

export type GoalTrainReason = 'no-picks' | 'no-train-found' | 'ok';

export interface GoalTrainResult {
  trip: TrainTrip | null;
  reason: GoalTrainReason;
}

function serviceDayTimeToMinutes(time: string): number {
  const minutes = timeToMinutes(time);

  return minutes < SERVICE_DAY_ROLLOVER_MINUTES
    ? minutes + 24 * 60
    : minutes;
}

export function computeGoalTrain(
  direction: GoalTrainDirection,
  pickedArtists: Artist[],
  trips: TrainTrip[],
): GoalTrainResult {
  if (pickedArtists.length === 0) {
    return { trip: null, reason: 'no-picks' };
  }

  const directionTrips = trips.filter(
    (trip) => trip.direction === direction,
  );

  if (direction === 'outbound') {
    const earliestStart = Math.min(...pickedArtists.map((artist) => timeToMinutes(artist.startTime)));
    const targetArrival = earliestStart - OUTBOUND_WALK_BUFFER_MIN;
    const candidates = trips
      .filter((trip) => timeToMinutes(trip.arrivalTime) <= targetArrival)
      .sort((first, second) => timeToMinutes(first.arrivalTime) - timeToMinutes(second.arrivalTime));

    const selectedTrip = candidates[0]
    
    return { trip: selectedTrip ?? null, reason: selectedTrip ? 'ok' : 'no-train-found' };
  }

  const latestEnd = Math.max(...pickedArtists.map((artist) => serviceDayTimeToMinutes(artist.endTime)));
  const targetDeparture = latestEnd + RETURN_WALK_BUFFER_MIN;
  const candidates = directionTrips
    .filter(
      (trip) =>
        serviceDayTimeToMinutes(trip.departureTime) >= targetDeparture,
    )
    .sort(
      (first, second) =>
        serviceDayTimeToMinutes(first.departureTime) - serviceDayTimeToMinutes(seconds.departureTime),
    );

  const selectedTrip = candidates[0];
  
  return { trip: selectedTrip ?? null, reason: selectedTrip ? 'ok' : 'no-train-found' };
}
