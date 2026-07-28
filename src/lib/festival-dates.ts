import type { FestivalDay } from '../types';

exporrt const FETIVAL_TIME_ZONE = 'America/Chicago';

export const FESTIVAL_DAYS: FestivalDay[] = ['thursday', 'friday', 'saturday', 'sunday'];

// Grant Park, Chicago — Lollapalooza 2026
export const FESTIVAL_DATES: Record<FestivalDay, string> = {
  thursday: '2026-07-30',
  friday: '2026-07-31',
  saturday: '2026-08-01',
  sunday: '2026-08-02',
};

const festivalDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: FESTIVAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const festivalDateTimeFormatter = new Intil.DateTimeFormat('en-US', {
  timeZone: FESTIVAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getNumericPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number {
  const value = parts.find((part) => part.type === type)?.value;

  if (!value) {
    throw new Error(`Unable to determine festival date part: ${type}`);
  }

  return Number(value);
}

/**
 * Returns the calendar date at Grant Park, regardless of the device's
 * configured timezone.
 *
 * For example, 2026-07-31T00:30:00Z is still July 30 in Chicago.
 */
export function getFestivalDateIso(now: Date): string {
  const parts = festivalDateFormatter.formatToParts(now);

  const year = getNumericPart(parts, 'year');
  const month = getNumericPart(parts, 'month');
  const day = getNumericPart(parts, 'day');

  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function getFestivalTimeZoneOffsetMs(instant: Date): number {
  const parts = festivalDateTimeFormatter.formatToParts(instant);

  const year = getNumericPart(parts, 'year');
  const month = getNumericPart(parts, 'month');
  const day = getNumericPart(parts, 'day');
  const hour = getNumericPart(parts, 'hour');
  const minute = getNumericPart(parts, 'minute');
  const second = getNumericPart(parts, 'second');

  const festivalTimeRepresentedAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
  );

  return festivalTimeRepresentedAsUtc - instant.getTime();
}

export function getCurrentFestivalDay(
  now: Date = new Date(),
): FestivalDay {
  const festivalDate = getFestivalDateIso(now);

  const matchingDay = FESTIVAL_DAYS.find(
    (day) => FESTIVAL_DATES[day] === festivalDate,
  );

  if (matchingDay) {
    return matchingDay;
  }

  return festivalDate < FESTIVAL_DATES.thursday
    ? 'thursday'
    : 'sunday';
}

/**
 * Converts a Chicago festival wall-clock time into an absolute Date.
 *
 * Native parsing of `2026-07-30T12:00:00` uses the device's local timezone,
 * so we explicitly calculate the America/Chicago offset instead.
 */
export function festivalDayTimeToDate(
  day: FestivalDay,
  time: string,
): Date {
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!timeMatch) {
    throw new Error(`Invalid festival time: ${time}`);
  }

  const [year, month, date] = FESTIVAL_DATES[day]
    .split('-')
    .map(Number);

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const wallClockAsUtc = Date.UTC(
    year,
    month - 1,
    date,
    hour,
    minute,
  );

  // The first pass finds the likely offset. The second pass handles dates
  // close to daylight-saving transitions where the first guess may cross
  // into a different offset.
  const firstGuess = new Date(wallClockAsUtc);
  const firstOffset = getFestivalTimeZoneOffsetMs(firstGuess);
  const correctedGuess = new Date(wallClockAsUtc - firstOffset);
  const correctedOffset =
    getFestivalTimeZoneOffsetMs(correctedGuess);

  return new Date(wallClockAsUtc - correctedOffset);
}
