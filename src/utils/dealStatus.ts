import { DealSummary } from '../types/domain';
import { getKarachiMinutes, getKarachiParts, getKarachiNow, parseHHMMToMinutes } from './time';

export type DealExpiryState = 'expired' | 'ending_today' | 'ending_soon' | 'active';

export interface DealExpiryResult {
  state: DealExpiryState;
  label: string;
}

export function isDealActiveNow(deal: DealSummary, nowDate: Date = getKarachiNow()): boolean {
  const nowMs = nowDate.getTime();
  const startMs = new Date(deal.startDate).getTime();
  const endMs = new Date(deal.endDate).getTime();

  if (nowMs < startMs || nowMs > endMs) {
    return false;
  }

  const parts = getKarachiParts(nowDate);

  if (deal.daysOfWeek && deal.daysOfWeek.length > 0) {
    if (!deal.daysOfWeek.includes(parts.weekday)) {
      return false;
    }
  }

  if (deal.dailyStartTime && deal.dailyEndTime) {
    const nowM = getKarachiMinutes(nowDate);
    const startM = parseHHMMToMinutes(deal.dailyStartTime);
    let endM = parseHHMMToMinutes(deal.dailyEndTime);

    if (endM <= startM) {
      endM += 1440;
    }

    if (nowM < startM || nowM >= endM) {
      return false;
    }
  }

  return true;
}

export function getDealExpiry(
  deal: DealSummary,
  nowDate: Date = getKarachiNow(),
): DealExpiryResult {
  const nowMs = nowDate.getTime();
  const endMs = new Date(deal.endDate).getTime();
  const diffMs = endMs - nowMs;

  if (diffMs <= 0) {
    return { state: 'expired', label: 'Expired' };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  if (days >= 1) {
    return {
      state: 'active',
      label: `Ends in ${days} ${days === 1 ? 'day' : 'days'}`,
    };
  }

  const hours = totalHours;
  const mins = totalMinutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (hours < 6) {
    return {
      state: 'ending_soon',
      label: `Ends in ${timeLabel}`,
    };
  }

  return {
    state: 'ending_today',
    label: `Ends in ${timeLabel}`,
  };
}
