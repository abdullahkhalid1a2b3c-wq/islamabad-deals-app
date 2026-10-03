import { parseEnv } from '../src/lib/env';

describe('Environment Variables Validation', () => {
  it('should parse valid environment configuration with defaults', () => {
    const rawEnv = {
      EXPO_PUBLIC_USE_MOCKS: 'true',
      EXPO_PUBLIC_DEBUG_ERRORS: 'false',
    };

    const parsed = parseEnv(rawEnv);
    expect(parsed.EXPO_PUBLIC_USE_MOCKS).toBe(true);
    expect(parsed.EXPO_PUBLIC_DEBUG_ERRORS).toBe(false);
  });

  it('should allow optional Supabase variables', () => {
    const rawEnv = {
      EXPO_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };

    const parsed = parseEnv(rawEnv);
    expect(parsed.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co');
    expect(parsed.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });

  it('should throw error for invalid URL', () => {
    const rawEnv = {
      EXPO_PUBLIC_SUPABASE_URL: 'not-a-url',
    };

    expect(() => parseEnv(rawEnv)).toThrow('[DealPlate Env Error]');
  });
});
