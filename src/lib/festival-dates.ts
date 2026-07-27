import type { FestivalDay } from '../types';

export const FESTIVAL_DAYS: FestivalDay[] = ['thursday', 'friday', 'saturday', 'sunday'];

// Grant Park, Chicago — Lollapalooza 2026
export const FESTIVAL_DATES: Record<FestivalDay, string> = {
  thursday: '2026-07-30',
  friday: '2026-07-31',
  saturday: '2026-08-01',
  sunday: '2026-08-02',
};

export function getCurrentFestivalDay(now: Date = new Date()): FestivalDay {
  const todayIso = now.toISOString().slice(0, 10);
  const match = FESTIVAL_DAYS.find((day) => FESTIVAL_DATES[day] === todayIso);
  if (match) return match;
  return todayIso < FESTIVAL_DATES.thursday ? 'thursday' : 'sunday';
}

export function festivalDayTimeToDate(day: FestivalDay, time: string): Date {
  return new Date(`${FESTIVAL_DATES[day]}T${time}:00`);
}
