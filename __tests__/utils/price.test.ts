import { formatPKR, calcDiscountPercent, calcSavings } from '../../src/utils/price';

describe('price utils', () => {
  it('formats PKR numbers to string', () => {
    expect(formatPKR(999)).toBe('Rs. 999');
    expect(formatPKR(1500)).toBe('Rs. 1,500');
    expect(formatPKR(0)).toBe('Rs. 0');
    expect(formatPKR(null)).toBe('Rs. 0');
  });

  it('calculates discount percentage accurately', () => {
    expect(calcDiscountPercent(1000, 700)).toBe(30);
    expect(calcDiscountPercent(1000, 1000)).toBe(0);
    expect(calcDiscountPercent(0, 100)).toBe(0);
  });

  it('calculates PKR savings', () => {
    expect(calcSavings(1500, 1000)).toBe(500);
    expect(calcSavings(500, 500)).toBe(0);
  });
});
