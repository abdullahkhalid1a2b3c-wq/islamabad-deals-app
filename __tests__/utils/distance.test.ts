import { formatDistance } from '../../src/utils/distance';

describe('distance utils', () => {
  it('formats distances in meters correctly', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(999)).toBe('999 m');
    expect(formatDistance(0)).toBe('0 m');
  });

  it('formats distances in kilometers correctly', () => {
    expect(formatDistance(2300)).toBe('2.3 km');
    expect(formatDistance(12500)).toBe('13 km');
  });

  it('handles invalid or null inputs safely', () => {
    expect(formatDistance(null)).toBe('0 m');
    expect(formatDistance(-500)).toBe('0 m');
  });
});
