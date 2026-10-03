import { z } from 'zod';

export const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  EXPO_PUBLIC_USE_MOCKS: z
    .string()
    .optional()
    .transform((val) => val === undefined || val === 'true' || val === '1'),
  EXPO_PUBLIC_DEBUG_ERRORS: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse({
    EXPO_PUBLIC_SUPABASE_URL: rawEnv.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: rawEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_USE_MOCKS: rawEnv.EXPO_PUBLIC_USE_MOCKS,
    EXPO_PUBLIC_DEBUG_ERRORS: rawEnv.EXPO_PUBLIC_DEBUG_ERRORS,
  });

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`[DealPlate Env Error] Invalid environment variables:\n${formattedErrors}`);
  }

  return result.data;
}

export const env = parseEnv();
