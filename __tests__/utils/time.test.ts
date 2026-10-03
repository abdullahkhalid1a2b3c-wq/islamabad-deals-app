import {
  format12HourTime,
  parseHHMMToMinutes,
  getKarachiMinutes,
  getKarachiParts,
} from '../../src/utils/time';

describe('time utils', () => {
  it('parses HH:mm to minutes correctly', () => {
    expect(parseHHMMToMinutes('00:00')).toBe(0);
    expect(parseHHMMToMinutes('14:30')).toBe(870);
    expect(parseHHMMToMinutes('23:59')).toBe(1439);
    expect(parseHHMMToMinutes('')).toBe(0);
  });

  it('formats 24-hr time to 12-hr with AM/PM', () => {
    expect(format12HourTime('00:00')).toBe('12:00 AM');
    expect(format12HourTime('12:00')).toBe('12:00 PM');
    expect(format12HourTime('14:30')).toBe('2:30 PM');
    expect(format12HourTime('23:00')).toBe('11:00 PM');
  });

  it('extracts Karachi time parts accurately', () => {
    // 2026-10-03T15:00:00Z is 2026-10-03 20:00 in Karachi (UTC+5)
    const testDate = new Date('2026-10-03T15:00:00Z');
    const parts = getKarachiParts(testDate);
    expect(parts.hour).toBe(20);
    expect(parts.minute).toBe(0);
    expect(getKarachiMinutes(testDate)).toBe(1200);
  });
});
