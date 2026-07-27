export function formatTime(hhmm: string): string {
  const [hourStr, minuteStr] = hhmm.split(':');
  const hour = Number(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minuteStr === '00' ? `${displayHour} ${period}` : `${displayHour}:${minuteStr} ${period}`;
}

export function timeToMinutes(hhmm: string): number {
  const [hourStr, minuteStr] = hhmm.split(':');
  return Number(hourStr) * 60 + Number(minuteStr);
}

const DAY_LABELS: Record<string, string> = {
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function dayLabel(day: string): string {
  return DAY_LABELS[day] ?? day;
}

export function formatFestivalDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
