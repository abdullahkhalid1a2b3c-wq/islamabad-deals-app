import { Weekday } from '../types/domain';

export const KARACHI_TIMEZONE = 'Asia/Karachi';

/**
 * Returns current Date or parses given input safely.
 */
export function getKarachiNow(overrideDate?: Date | string): Date {
  if (overrideDate) {
    return new Date(overrideDate);
  }
  return new Date();
}

/**
 * Formats a Date object to parts in Asia/Karachi timezone.
 */
export function getKarachiParts(date: Date = getKarachiNow()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: KARACHI_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') {
      map[p.type] = p.value;
    }
  }

  return {
    weekday: map.weekday.toLowerCase() as Weekday,
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour === '24' ? '0' : map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/**
 * Gets minutes from midnight (0..1439) in Asia/Karachi timezone.
 */
export function getKarachiMinutes(date: Date = getKarachiNow()): number {
  const parts = getKarachiParts(date);
  return parts.hour * 60 + parts.minute;
}

/**
 * Parses "HH:mm" into minutes since midnight (0..1439).
 */
export function parseHHMMToMinutes(hhmm: string): number {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  return h * 60 + m;
}

/**
 * Formats "HH:mm" (24-hr) to 12-hour format with AM/PM e.g. "23:00" -> "11:00 PM".
 */
export function format12HourTime(hhmm: string): string {
  if (!hhmm) return '';
  const minutes = parseHHMMToMinutes(hhmm);
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsFormatted = mins < 10 ? `0${mins}` : `${mins}`;

  return `${hours12}:${minsFormatted} ${period}`;
}
