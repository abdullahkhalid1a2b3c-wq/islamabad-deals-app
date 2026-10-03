import { normalizeUrl, normalizePhone, buildWhatsAppUrl } from '../../utils/links';

export type OrderActionType = 'external_link' | 'whatsapp' | 'call' | 'coming_soon';

export interface OrderAction {
  type: OrderActionType;
  url: string | null;
  label: string;
}

export interface RestaurantOrderData {
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  orderingUrl?: string | null;
}

export interface DealOrderData {
  title?: string;
  code?: string;
}

/**
 * Determines the single best ordering action for a restaurant/deal combination.
 * Priority order:
 * 1. Valid ordering_url (or website) -> external_link ("Order Now")
 * 2. Valid whatsapp number -> whatsapp ("Order on WhatsApp")
 * 3. Valid phone number -> call ("Call to Order")
 * 4. Fallback -> coming_soon ("Online ordering coming soon")
 */
export function getOrderAction(
  restaurant?: RestaurantOrderData | null,
  deal?: DealOrderData | null,
): OrderAction {
  if (!restaurant) {
    return {
      type: 'coming_soon',
      url: null,
      label: 'Online ordering coming soon',
    };
  }

  // 1. Check for valid ordering URL
  const rawUrl = restaurant.orderingUrl || restaurant.website;
  const validOrderingUrl = normalizeUrl(rawUrl);
  if (validOrderingUrl) {
    return {
      type: 'external_link',
      url: validOrderingUrl,
      label: 'Order Now',
    };
  }

  // 2. Check for WhatsApp
  const rawWhatsApp = restaurant.whatsapp || restaurant.phone;
  if (rawWhatsApp) {
    const defaultMsg = deal?.title
      ? `Hi! I want to order the deal "${deal.title}" from DealPlate.`
      : 'Hi! I would like to place an order from DealPlate.';
    const waUrl = buildWhatsAppUrl(rawWhatsApp, defaultMsg);
    if (waUrl) {
      return {
        type: 'whatsapp',
        url: waUrl,
        label: 'Order on WhatsApp',
      };
    }
  }

  // 3. Check for phone call
  const validPhone = normalizePhone(restaurant.phone);
  if (validPhone) {
    return {
      type: 'call',
      url: validPhone,
      label: 'Call to Order',
    };
  }

  // 4. Fallback: coming soon
  return {
    type: 'coming_soon',
    url: null,
    label: 'Online ordering coming soon',
  };
}
