import { formatCountdown } from '../../src/components/deal/CountdownText';

describe('formatCountdown helper', () => {
  it('returns Expired when now is past end time', () => {
    const endMs = 100000;
    const nowMs = 100001;
    const result = formatCountdown(endMs, nowMs);
    expect(result.label).toBe('Expired');
    expect(result.isEndingSoon).toBe(true);
  });

  it('formats days remaining when > 24h', () => {
    const nowMs = 1000000000;
    const endMs = nowMs + 2 * 24 * 60 * 60 * 1000 + 1000; // 2 days
    const result = formatCountdown(endMs, nowMs);
    expect(result.label).toBe('Ends in 2 days');
    expect(result.isEndingSoon).toBe(false);
  });

  it('formats hours and minutes when between 1h and 24h', () => {
    const nowMs = 1000000000;
    const endMs = nowMs + (4 * 60 * 60 + 15 * 60) * 1000; // 4h 15m
    const result = formatCountdown(endMs, nowMs);
    expect(result.label).toBe('Ends in 4h 15m');
    expect(result.isEndingSoon).toBe(true);
  });

  it('formats minutes and seconds when under 1h', () => {
    const nowMs = 1000000000;
    const endMs = nowMs + (28 * 60 + 45) * 1000; // 28m 45s
    const result = formatCountdown(endMs, nowMs);
    expect(result.label).toBe('Ends in 28m 45s');
    expect(result.isEndingSoon).toBe(true);
  });
});
