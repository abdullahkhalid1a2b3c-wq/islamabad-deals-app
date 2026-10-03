import { OpeningHours, Weekday } from '../types/domain';
import { format12HourTime, getKarachiMinutes, getKarachiParts, parseHHMMToMinutes } from './time';

const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export interface OpenStatusResult {
  isOpen: boolean;
  label: string;
}

export function getOpenStatus(
  hours?: OpeningHours | null,
  nowDate: Date = new Date(),
): OpenStatusResult {
  if (!hours || Object.keys(hours).length === 0) {
    return { isOpen: false, label: 'Closed' };
  }

  const parts = getKarachiParts(nowDate);
  const currentDayIndex = WEEKDAYS.indexOf(parts.weekday);
  const nowMinutes = getKarachiMinutes(nowDate);

  // 1. Check if open right now from current day's slots
  const todaySlots = hours[parts.weekday];
  if (todaySlots && todaySlots.length > 0) {
    for (const slot of todaySlots) {
      const openM = parseHHMMToMinutes(slot.open);
      let closeM = parseHHMMToMinutes(slot.close);

      if (closeM <= openM) {
        // Overnight slot e.g. 18:00 to 02:00
        closeM += 1440;
      }

      if (nowMinutes >= openM && nowMinutes < closeM) {
        return {
          isOpen: true,
          label: `Open · closes ${format12HourTime(slot.close)}`,
        };
      }
    }
  }

  // 2. Check if open right now from yesterday's overnight slot
  const prevDayIndex = (currentDayIndex + 6) % 7;
  const prevWeekday = WEEKDAYS[prevDayIndex];
  const prevSlots = hours[prevWeekday];
  if (prevSlots && prevSlots.length > 0) {
    for (const slot of prevSlots) {
      const openM = parseHHMMToMinutes(slot.open);
      const closeM = parseHHMMToMinutes(slot.close);

      if (closeM <= openM) {
        // Overnight slot extending into today's early morning (00:00 to closeM)
        if (nowMinutes < closeM) {
          return {
            isOpen: true,
            label: `Open · closes ${format12HourTime(slot.close)}`,
          };
        }
      }
    }
  }

  // 3. Restaurant is currently closed. Find the next opening slot today or in future days.
  // Check remaining slots today first
  if (todaySlots && todaySlots.length > 0) {
    for (const slot of todaySlots) {
      const openM = parseHHMMToMinutes(slot.open);
      if (openM > nowMinutes) {
        return {
          isOpen: false,
          label: `Closed · opens ${format12HourTime(slot.open)}`,
        };
      }
    }
  }

  // Check upcoming days (up to 7 days)
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextWeekday = WEEKDAYS[nextDayIndex];
    const nextSlots = hours[nextWeekday];
    if (nextSlots && nextSlots.length > 0) {
      const firstSlot = nextSlots[0];
      const dayName = i === 1 ? 'tomorrow' : nextWeekday.slice(0, 3);
      return {
        isOpen: false,
        label: `Closed · opens ${dayName} ${format12HourTime(firstSlot.open)}`,
      };
    }
  }

  return { isOpen: false, label: 'Closed' };
}
