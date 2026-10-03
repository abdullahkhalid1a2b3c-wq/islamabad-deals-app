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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Formats deal schedule days and daily time window into human-readable string.
 * e.g. [1,2,3,4,5] with 12:00 and 16:00 -> "Mon to Fri · 12:00 PM to 4:00 PM"
 */
export function formatDealSchedule(deal: {
  daysOfWeek?: number[] | null;
  dailyStartTime?: string | null;
  dailyEndTime?: string | null;
}): string | null {
  const { daysOfWeek, dailyStartTime, dailyEndTime } = deal;

  let daysText = '';
  if (daysOfWeek && daysOfWeek.length > 0) {
    if (daysOfWeek.length === 7) {
      daysText = 'All week';
    } else if (daysOfWeek.length === 5 && daysOfWeek.every((d, i) => d === i + 1)) {
      daysText = 'Mon to Fri';
    } else if (daysOfWeek.length === 2 && daysOfWeek.includes(0) && daysOfWeek.includes(6)) {
      daysText = 'Weekends (Sat & Sun)';
    } else {
      daysText = daysOfWeek.map((d) => DAY_NAMES[d] || '').filter(Boolean).join(', ');
    }
  }

  let timeText = '';
  if (dailyStartTime && dailyEndTime) {
    timeText = `${format12HourTime(dailyStartTime)} to ${format12HourTime(dailyEndTime)}`;
  }

  if (daysText && timeText) {
    return `${daysText} · ${timeText}`;
  }
  return daysText || timeText || null;
}
