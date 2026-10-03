import { getDealExpiry, isDealActiveNow } from '../../src/utils/dealStatus';
import { DealSummary } from '../../src/types/domain';

describe('dealStatus utils', () => {
  const baseDeal: DealSummary = {
    id: 'd1',
    title: '50% Off Pizza',
    description: 'Great pizza deal',
    dealType: 'percent_off',
    discountValue: 50,
    originalPricePKR: 1000,
    dealPricePKR: 500,
    imageUrl: 'https://example.com/pizza.jpg',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-10-10T23:59:59Z',
    restaurant: {
      id: 'r1',
      name: 'Pizza Palace',
      logoUrl: 'https://example.com/logo.jpg',
      areaName: 'F-7',
    },
  };

  it('determines active deal correctly within date range', () => {
    const nowDate = new Date('2026-10-03T12:00:00Z');
    expect(isDealActiveNow(baseDeal, nowDate)).toBe(true);
  });

  it('rejects expired deal or deal before start date', () => {
    const pastDate = new Date('2026-09-30T12:00:00Z');
    const futureDate = new Date('2026-10-15T12:00:00Z');
    expect(isDealActiveNow(baseDeal, pastDate)).toBe(false);
    expect(isDealActiveNow(baseDeal, futureDate)).toBe(false);
  });

  it('calculates deal expiry state and label for active days', () => {
    const nowDate = new Date('2026-10-03T12:00:00Z');
    const result = getDealExpiry(baseDeal, nowDate);
    expect(result.state).toBe('active');
    expect(result.label).toContain('Ends in');
  });

  it('calculates ending soon state when under 6 hours remain', () => {
    const nowDate = new Date('2026-10-10T20:00:00Z'); // 3h 59m remaining
    const result = getDealExpiry(baseDeal, nowDate);
    expect(result.state).toBe('ending_soon');
    expect(result.label).toContain('Ends in');
  });
});
