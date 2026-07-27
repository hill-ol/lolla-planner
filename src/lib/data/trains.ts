import scheduleData from '../../data/trainSchedule.json';
import type { FestivalDay, GoalTrainDirection } from '../../types';

export interface TrainTrip {
  tripId: string;
  direction: GoalTrainDirection;
  departureTime: string;
  arrivalTime: string;
}

type Schedule = Record<FestivalDay, Record<GoalTrainDirection, TrainTrip[]>>;

const schedule = scheduleData as Schedule;

// Real BNSF Union Station <-> LaGrange Road schedule, pulled from Metra's
// public static GTFS feed (see scripts/fetch-metra-schedule.mjs). Re-run that
// script to refresh src/data/trainSchedule.json if Metra republishes updated
// service for these festival dates before the event.
export async function getTrainTrips(day: FestivalDay, direction: GoalTrainDirection): Promise<TrainTrip[]> {
  return schedule[day][direction];
}

export async function getTripById(day: FestivalDay, direction: GoalTrainDirection, tripId: string): Promise<TrainTrip | undefined> {
  const trips = await getTrainTrips(day, direction);
  return trips.find((trip) => trip.tripId === tripId);
}
