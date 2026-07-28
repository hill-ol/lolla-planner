import { describe, expect, it } from 'vitest';
import type { Artist } from '../types';
import type { TrainTrip } from './data/trains';
import { computeGoalTrain } from './goal-train';

function createArtist(
  overrides: Partial<Artist> = {},
): Artist {
  return {
    id: 'artist-1',
    name: 'Test Artist',
    day: 'thursday',
    stageId: 'test-stage',
    startTime: '19:00',
    endTime: '20:00',
    ...overrides,
  };
}

function createTrip(
  tripId: string,
  direction: TrainTrip['direction'],
  departureTime: string,
  arrivalTime: string,
): TrainTrip {
  return {
    tripId,
    direction,
    departureTime,
    arrivalTime,
  };
}

describe('computeGoalTrain', () => {
  it('returns no-picks when the schedule is empty', () => {
    const result = computeGoalTrain(
      'outbound',
      [],
      [],
    );

    expect(result).toEqual({
      trip: null,
      reason: 'no-picks',
    });
  });

  it('chooses the latest outbound train that arrives before the first pick', () => {
    const artist = createArtist({
      startTime: '19:00',
    });

    const trips = [
      createTrip(
        'early',
        'outbound',
        '17:30',
        '18:10',
      ),
      createTrip(
        'best',
        'outbound',
        '18:00',
        '18:40',
      ),
      createTrip(
        'too-late',
        'outbound',
        '18:15',
        '18:50',
      ),
    ];

    const result = computeGoalTrain(
      'outbound',
      [artist],
      trips,
    );

    expect(result).toEqual({
      trip: trips[1],
      reason: 'ok',
    });
  });

  it('returns no-train-found when no outbound train arrives early enough', () => {
    const artist = createArtist({
      startTime: '12:00',
    });

    const trips = [
      createTrip(
        'too-late',
        'outbound',
        '11:40',
        '11:50',
      ),
    ];

    const result = computeGoalTrain(
      'outbound',
      [artist],
      trips,
    );

    expect(result).toEqual({
      trip: null,
      reason: 'no-train-found',
    });
  });

  it('uses the latest picked set when choosing the return train', () => {
    const earlyArtist = createArtist({
      id: 'early-artist',
      endTime: '20:00',
    });

    const lateArtist = createArtist({
      id: 'late-artist',
      endTime: '21:00',
    });

    const trips = [
      createTrip(
        'too-early',
        'return',
        '21:10',
        '21:40',
      ),
      createTrip(
        'best',
        'return',
        '21:33',
        '22:05',
      ),
      createTrip(
        'later',
        'return',
        '22:00',
        '22:32',
      ),
    ];

    const result = computeGoalTrain(
      'return',
      [earlyArtist, lateArtist],
      trips,
    );

    expect(result).toEqual({
      trip: trips[1],
      reason: 'ok',
    });
  });

  it('returns no-train-found when no return train leaves late enough', () => {
    const artist = createArtist({
      endTime: '22:00',
    });

    const trips = [
      createTrip(
        'too-early',
        'return',
        '22:10',
        '22:42',
      ),
    ];

    const result = computeGoalTrain(
      'return',
      [artist],
      trips,
    );

    expect(result).toEqual({
      trip: null,
      reason: 'no-train-found',
    });
  });

  it('treats post-midnight trains as part of the previous festival service day', () => {
    const artist = createArtist({
      endTime: '23:45',
    });

    const trips = [
      createTrip(
        'before-midnight',
        'return',
        '23:55',
        '00:25',
      ),
      createTrip(
        'after-midnight',
        'return',
        '00:33',
        '01:05',
      ),
    ];

    const result = computeGoalTrain(
      'return',
      [artist],
      trips,
    );

    expect(result).toEqual({
      trip: trips[1],
      reason: 'ok',
    });
  });
});
