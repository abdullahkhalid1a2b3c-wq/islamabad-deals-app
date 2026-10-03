/**
 * Utility functions for validating, normalizing, and formatting external URLs,
 * phone numbers, social media links, maps directions, and WhatsApp links.
 */

/**
 * Normalizes a website URL.
 * Adds 'https://' if missing and rejects unsafe schemes (javascript:, data:, file:, vbscript:).
 */
export function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Reject explicit unsafe protocols
  if (/^(javascript|data|file|vbscript):/i.test(trimmed)) {
    return null;
  }

  // Already has http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Reject if it contains a protocol specified as anything else (e.g. ftp://, mailto:)
  if (/^[a-z0-9+.-]+:\/\//i.test(trimmed)) {
    return null;
  }

  return `https://${trimmed}`;
}

/**
 * Normalizes an Instagram handle or URL to a full Instagram profile URL.
 * Accepts: '@username', 'username', 'https://instagram.com/username', 'http://instagr.am/username'
 */
export function normalizeInstagram(handleOrUrl?: string | null): string | null {
  if (!handleOrUrl) return null;
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return null;

  // Handle URL inputs
  if (trimmed.includes('instagram.com/') || trimmed.includes('instagr.am/')) {
    const normalized = normalizeUrl(trimmed);
    return normalized;
  }

  // Handle username or @username
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/$/, '');
  if (!cleanHandle || !/^[a-zA-Z0-9_.]+$/.test(cleanHandle)) {
    return null;
  }

  return `https://instagram.com/${cleanHandle}`;
}

/**
 * Normalizes a phone number for calling.
 * Formats Pakistani 03XX... numbers to +923XX...
 * Returns a tel: URI or null.
 */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Strip spaces, dashes, parentheses
  let cleaned = trimmed.replace(/[\s\-\(\)]/g, '');

  // Handle Pakistani 03XX local numbers -> +923XX
  if (/^03\d{9}$/.test(cleaned)) {
    cleaned = `+92${cleaned.substring(1)}`;
  } else if (!cleaned.startsWith('+')) {
    // If digits only without +, assume +92 if starts with 92 or add +
    if (/^92\d{10}$/.test(cleaned)) {
      cleaned = `+${cleaned}`;
    }
  }

  if (!/^\+?\d{7,15}$/.test(cleaned)) {
    return null;
  }

  return `tel:${cleaned}`;
}

/**
 * Builds Google Maps directions URL with destination lat, lng and optional name.
 */
export function buildDirectionsUrl(params: { lat: number; lng: number; name?: string }): string {
  const { lat, lng } = params;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Builds a WhatsApp message URL.
 */
export function buildWhatsAppUrl(phone: string, text = 'Hi, I saw your deal on DealPlate!'): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
