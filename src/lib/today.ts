import type { Artist, FestivalDay } from '../types';
import {
  FESTIVAL_DATES,
  FESTIVAL_TIME_ZONE,
  festivalDayTimeToDate,
  getCurrentFestivalDay,
  getFestivalDateIso,
} from './festival-dates';
import { timeToMinutes } from './format';

export type TodayPhase = 'before' | 'live' | 'after';

export interface TodayContext {
  phase: TodayPhase;
  day: FestivalDay;
}

const festivalTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: FESTIVAL_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getFestivalTimeMinutes(now: Date): number {
  const parts = festivalTimeFormatter.formatToParts(now);

  const hourValue = parts.find(
    (part) => part.type === 'hour',
  )?.value;

  const minuteValue = parts.find(
    (part) => part.type === 'minute',
  )?.value;

  if (!hourValue || !minuteValue) {
    throw new Error('Unable to determine the current festival time.');
  }

  return Number(hourValue) * 60 + Number(minuteValue);
}

export function getTodayContext(
  now: Date = new Date(),
): TodayContext {
  const day = getCurrentFestivalDay(now);
  const festivalDate = getFestivalDateIso(now);
  const scheduledDate = FESTIVAL_DATES[day];

  if (festivalDate !== scheduledDate) {
    return {
      phase:
        festivalDate < FESTIVAL_DATES.thursday
          ? 'before'
          : 'after',
      day,
    };
  }

  const dayStart = festivalDayTimeToDate(day, '12:00');
  const dayEnd = festivalDayTimeToDate(day, '22:00');

  if (now < dayStart) {
    return {
      phase: 'before',
      day,
    };
  }

  if (now >= dayEnd) {
    return {
      phase: 'after',
      day,
    };
  }

  return {
    phase: 'live',
    day,
  };
}

export function isArtistLive(
  artist: Artist,
  now: Date,
): boolean {
  const nowMinutes = getFestivalTimeMinutes(now);
  const startMinutes = timeToMinutes(artist.startTime);
  const endMinutes = timeToMinutes(artist.endTime);

  return (
    nowMinutes >= startMinutes &&
    nowMinutes < endMinutes
  );
}
