import type { Artist, FestivalDay } from '../types';
import { FESTIVAL_DATES, festivalDayTimeToDate, getCurrentFestivalDay } from './festival-dates';
import { timeToMinutes } from './format';

export type TodayPhase = 'before' | 'live' | 'after';

export interface TodayContext {
  phase: TodayPhase;
  day: FestivalDay;
}

export function getTodayContext(now: Date = new Date()): TodayContext {
  const day = getCurrentFestivalDay(now);
  const dayStart = festivalDayTimeToDate(day, '12:00');
  const dayEnd = festivalDayTimeToDate(day, '22:00');
  const todayIso = now.toISOString().slice(0, 10);

  if (todayIso !== FESTIVAL_DATES[day]) {
    return { phase: todayIso < FESTIVAL_DATES.thursday ? 'before' : 'after', day };
  }
  if (now < dayStart) return { phase: 'before', day };
  if (now > dayEnd) return { phase: 'after', day };
  return { phase: 'live', day };
}

export function isArtistLive(artist: Artist, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= timeToMinutes(artist.startTime) && nowMinutes < timeToMinutes(artist.endTime);
}
