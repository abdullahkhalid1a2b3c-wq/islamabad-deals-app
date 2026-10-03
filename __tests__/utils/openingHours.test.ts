import { getOpenStatus } from '../../src/utils/openingHours';
import { OpeningHours } from '../../src/types/domain';

describe('openingHours utils', () => {
  const sampleHours: OpeningHours = {
    friday: [{ open: '18:00', close: '02:00' }], // Overnight
    saturday: [{ open: '12:00', close: '23:00' }],
  };

  it('detects open status during daytime slot', () => {
    // Saturday 2:00 PM (14:00) UTC+5 => Saturday 9:00 AM UTC
    const saturdayDay = new Date('2026-10-03T09:00:00Z');
    const status = getOpenStatus(sampleHours, saturdayDay);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe('Open · closes 11:00 PM');
  });

  it('handles overnight shift during late night (Friday 11:00 PM)', () => {
    // Friday 11:00 PM (23:00) UTC+5 => Friday 18:00 UTC
    const fridayNight = new Date('2026-10-02T18:00:00Z');
    const status = getOpenStatus(sampleHours, fridayNight);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe('Open · closes 2:00 AM');
  });

  it('handles overnight shift early morning next day (Saturday 1:00 AM)', () => {
    // Saturday 1:00 AM (01:00) UTC+5 => Friday 20:00 UTC
    const saturdayEarly = new Date('2026-10-02T20:00:00Z');
    const status = getOpenStatus(sampleHours, saturdayEarly);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe('Open · closes 2:00 AM');
  });

  it('shows next opening time when closed', () => {
    // Saturday 9:00 AM (09:00) UTC+5 => Saturday 04:00 UTC
    const saturdayMorning = new Date('2026-10-03T04:00:00Z');
    const status = getOpenStatus(sampleHours, saturdayMorning);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe('Closed · opens 12:00 PM');
  });
});
