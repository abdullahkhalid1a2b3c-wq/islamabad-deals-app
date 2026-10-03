import { getOrderAction } from '../../src/features/ordering/getOrderAction';

describe('getOrderAction', () => {
  it('returns external_link when orderingUrl or website is provided', () => {
    const action = getOrderAction({
      orderingUrl: 'https://cheezious.com/order',
      phone: '03001234567',
    });
    expect(action.type).toBe('external_link');
    expect(action.url).toBe('https://cheezious.com/order');
    expect(action.label).toBe('Order Now');
  });

  it('returns whatsapp when orderingUrl is missing but whatsapp number exists', () => {
    const action = getOrderAction(
      { whatsapp: '03001234567' },
      { title: 'Zinger BOGO' },
    );
    expect(action.type).toBe('whatsapp');
    expect(action.url).toContain('https://wa.me/923001234567');
    expect(action.label).toBe('Order on WhatsApp');
  });

  it('returns call when only phone is provided', () => {
    const action = getOrderAction({ phone: '03001234567' });
    expect(action.type).toBe('call');
    expect(action.url).toBe('tel:+923001234567');
    expect(action.label).toBe('Call to Order');
  });

  it('returns coming_soon when no contact info is available', () => {
    const action = getOrderAction({});
    expect(action.type).toBe('coming_soon');
    expect(action.url).toBeNull();
    expect(action.label).toBe('Online ordering coming soon');
  });
});
