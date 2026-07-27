export const DAY_START_MINUTES = 12 * 60; // 12:00 PM
export const DAY_END_MINUTES = 22 * 60; // 10:00 PM
export const PX_PER_MINUTE = 1.7;
export const STAGE_COLUMN_WIDTH = 132;
export const TIME_AXIS_WIDTH = 40;
export const HEADER_HEIGHT = 40;

export const TOTAL_TIME_HEIGHT = (DAY_END_MINUTES - DAY_START_MINUTES) * PX_PER_MINUTE;

export function minutesToY(minutes: number): number {
  return (minutes - DAY_START_MINUTES) * PX_PER_MINUTE;
}
