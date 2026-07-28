import { describe, expect, it } from 'vitest';
import type { Artist } from '../types';
import { getTodayContext, isArtistLive } from './today';

const eveningArtist: Artist = {
  id: 'test-artist',
  name: 'Test Artist',
  day: 'thursday',
  stageId: 'test-stage',
  startTime: '19:00',
  endTime: '20:00',
};

describe('getTodayContext', () => {
  it('returns the first festival day before the festival begins', () => {
    const now = new Date('2026-07-28T17:00:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'before',
      day: 'thursday',
    });
  });

  it('uses the Chicago date when UTC has advanced to Friday', () => {
    // July 31 at 00:30 UTC is July 30 at 7:30 PM in Chicago.
    const now = new Date('2026-07-31T00:30:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'live',
      day: 'thursday',
    });
  });

  it('changes to Friday at midnight in Chicago', () => {
    // July 31 at 05:00 UTC is midnight CDT in Chicago.
    const now = new Date('2026-07-31T05:00:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'before',
      day: 'friday',
    });
  });

  it('enters the live phase when gates open at noon', () => {
    // July 30 at 17:00 UTC is noon CDT in Chicago.
    const now = new Date('2026-07-30T17:00:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'live',
      day: 'thursday',
    });
  });

  it('enters the after phase at the scheduled end time', () => {
    // July 31 at 03:00 UTC is July 30 at 10 PM in Chicago.
    const now = new Date('2026-07-31T03:00:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'after',
      day: 'thursday',
    });
  });

  it('returns Sunday after the festival has ended', () => {
    const now = new Date('2026-08-03T12:00:00Z');

    expect(getTodayContext(now)).toEqual({
      phase: 'after',
      day: 'sunday',
    });
  });
});

describe('isArtistLive', () => {
  it('returns true at the artist start time', () => {
    // July 30 at 7 PM CDT.
    const now = new Date('2026-07-31T00:00:00Z');

    expect(isArtistLive(eveningArtist, now)).toBe(true);
  });

  it('returns true during the set using Chicago time', () => {
    // Although the UTC date is Friday, it is Thursday at 7:30 PM
    // at the festival.
    const now = new Date('2026-07-31T00:30:00Z');

    expect(isArtistLive(eveningArtist, now)).toBe(true);
  });

  it('returns false at the artist end time', () => {
    // End times are exclusive: the set is no longer live at 8 PM.
    const now = new Date('2026-07-31T01:00:00Z');

    expect(isArtistLive(eveningArtist, now)).toBe(false);
  });

  it('returns false before the artist start time', () => {
    const now = new Date('2026-07-30T23:59:00Z');

    expect(isArtistLive(eveningArtist, now)).toBe(false);
  });
});
