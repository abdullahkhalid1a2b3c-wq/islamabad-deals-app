const isDev = __DEV__;

function sanitizeItem(item: unknown): unknown {
  if (typeof item === 'string') {
    return item.replace(/(token|password|secret|bearer|auth)\s*[:=]\s*[^\s&,]+/gi, '$1=[REDACTED]');
  }
  if (typeof item === 'object' && item !== null) {
    if (Array.isArray(item)) {
      return item.map(sanitizeItem);
    }
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
      if (/token|password|secret|auth|bearer/i.test(key)) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeItem(value);
      }
    }
    return sanitizedObj;
  }
  return item;
}

function sanitize(args: unknown[]): unknown[] {
  return args.map(sanitizeItem);
}

export const logger = {
  debug(...args: unknown[]): void {
    if (isDev) {
      console.log('[DEBUG]', ...sanitize(args));
    }
  },
  info(...args: unknown[]): void {
    console.info('[INFO]', ...sanitize(args));
  },
  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...sanitize(args));
  },
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...sanitize(args));
  },
};
