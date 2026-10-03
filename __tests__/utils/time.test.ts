import {
  format12HourTime,
  parseHHMMToMinutes,
  getKarachiMinutes,
  getKarachiParts,
  formatDealSchedule,
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

  it('formats deal schedule text correctly', () => {
    expect(
      formatDealSchedule({
        daysOfWeek: [1, 2, 3, 4, 5],
        dailyStartTime: '12:00',
        dailyEndTime: '16:00',
      }),
    ).toBe('Mon to Fri · 12:00 PM to 4:00 PM');

    expect(
      formatDealSchedule({
        daysOfWeek: [0, 6],
        dailyStartTime: '18:00',
        dailyEndTime: '22:00',
      }),
    ).toBe('Weekends (Sat & Sun) · 6:00 PM to 10:00 PM');
  });
});
