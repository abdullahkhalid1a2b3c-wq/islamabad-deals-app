export interface AppErrorOptions {
  code?: string;
  message: string;
  userMessage: string;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.userMessage = options.userMessage;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const rawMessage =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

  const rawStatus =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status: unknown }).status)
      : 0;

  const msgLower = rawMessage.toLowerCase();

  // Network / Offline errors
  if (
    msgLower.includes('network') ||
    msgLower.includes('fetch') ||
    msgLower.includes('failed to fetch') ||
    msgLower.includes('offline')
  ) {
    return new AppError({
      code: 'NETWORK_ERROR',
      message: rawMessage,
      userMessage: 'No internet connection. Please check your network and try again.',
      cause: error,
    });
  }

  // Invalid login credentials
  if (msgLower.includes('invalid login credentials') || msgLower.includes('invalid_credentials')) {
    return new AppError({
      code: 'INVALID_CREDENTIALS',
      message: rawMessage,
      userMessage: 'Incorrect email or password.',
      cause: error,
    });
  }

  // Email unconfirmed
  if (msgLower.includes('email not confirmed')) {
    return new AppError({
      code: 'EMAIL_NOT_CONFIRMED',
      message: rawMessage,
      userMessage: 'Please check your inbox and verify your email before signing in.',
      cause: error,
    });
  }

  // Already registered
  if (msgLower.includes('user already registered') || msgLower.includes('already exists')) {
    return new AppError({
      code: 'USER_EXISTS',
      message: rawMessage,
      userMessage: 'An account with this email address already exists.',
      cause: error,
    });
  }

  // Rate limit
  if (
    rawStatus === 429 ||
    msgLower.includes('rate limit') ||
    msgLower.includes('too many requests')
  ) {
    return new AppError({
      code: 'RATE_LIMITED',
      message: rawMessage,
      userMessage: 'Too many attempts. Please wait a few minutes and try again.',
      cause: error,
    });
  }

  // Default fallback (generic, never leaks sensitive backend tokens or internal DB details)
  return new AppError({
    code: 'AUTH_ERROR',
    message: rawMessage,
    userMessage: 'An authentication error occurred. Please try again.',
    cause: error,
  });
}
