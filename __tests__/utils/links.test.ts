import {
  normalizeUrl,
  normalizeInstagram,
  normalizePhone,
  buildDirectionsUrl,
  buildWhatsAppUrl,
} from '../../src/utils/links';

describe('normalizeUrl', () => {
  it('adds https:// if missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('www.kfc.com.pk')).toBe('https://www.kfc.com.pk');
  });

  it('preserves existing http and https URLs', () => {
    expect(normalizeUrl('https://kfc.com.pk')).toBe('https://kfc.com.pk');
    expect(normalizeUrl('http://cheezious.com')).toBe('http://cheezious.com');
  });

  it('rejects unsafe schemes', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('data:text/html,bad')).toBeNull();
    expect(normalizeUrl('file:///etc/passwd')).toBeNull();
    expect(normalizeUrl('vbscript:msgbox')).toBeNull();
  });

  it('returns null for empty inputs', () => {
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl(null)).toBeNull();
    expect(normalizeUrl(undefined)).toBeNull();
  });
});

describe('normalizeInstagram', () => {
  it('normalizes handles with or without @ symbol', () => {
    expect(normalizeInstagram('@cheeziouspk')).toBe('https://instagram.com/cheeziouspk');
    expect(normalizeInstagram('kfcpakistan')).toBe('https://instagram.com/kfcpakistan');
  });

  it('normalizes full instagram URLs', () => {
    expect(normalizeInstagram('https://instagram.com/cheeziouspk')).toBe('https://instagram.com/cheeziouspk');
    expect(normalizeInstagram('http://instagr.am/kfc')).toBe('http://instagr.am/kfc');
  });

  it('returns null for empty or invalid handles', () => {
    expect(normalizeInstagram('')).toBeNull();
    expect(normalizeInstagram(null)).toBeNull();
    expect(normalizeInstagram('bad handle!#$')).toBeNull();
  });
});

describe('normalizePhone', () => {
  it('formats local Pakistani 03XX numbers to +923XX', () => {
    expect(normalizePhone('03001234567')).toBe('tel:+923001234567');
    expect(normalizePhone('0312 9876543')).toBe('tel:+923129876543');
  });

  it('preserves existing international format', () => {
    expect(normalizePhone('+923001234567')).toBe('tel:+923001234567');
  });

  it('returns null for invalid phone numbers', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe('buildDirectionsUrl', () => {
  it('builds valid Google Maps directions URL', () => {
    const url = buildDirectionsUrl({ lat: 33.7294, lng: 73.0747, name: 'Cheezious F-7' });
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=33.7294,73.0747');
  });
});

describe('buildWhatsAppUrl', () => {
  it('builds valid WhatsApp chat link', () => {
    const url = buildWhatsAppUrl('+923001234567', 'Hello');
    expect(url).toBe('https://wa.me/923001234567?text=Hello');
  });

  it('returns null for invalid inputs', () => {
    expect(buildWhatsAppUrl('')).toBeNull();
  });
});
