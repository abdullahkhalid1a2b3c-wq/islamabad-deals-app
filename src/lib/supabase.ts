import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform, AppState } from 'react-native';
import { env } from './env';
import { logger } from './logger';

const CHUNK_SIZE = 1900; // SecureStore max per key is 2048 bytes

const LargeSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }

    try {
      const countStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
      if (!countStr) {
        return await SecureStore.getItemAsync(key);
      }

      const count = parseInt(countStr, 10);
      const chunks: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (!chunk) return null;
        chunks.push(chunk);
      }
      return chunks.join('');
    } catch (err) {
      logger.warn('[SecureStoreAdapter] Failed to getItem:', err);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }

    try {
      // Clear previous chunks
      await LargeSecureStoreAdapter.removeItem(key);

      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
      } else {
        const chunks = Math.ceil(value.length / CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}_chunk_count`, String(chunks));
        for (let i = 0; i < chunks; i++) {
          const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
        }
      }
    } catch (err) {
      logger.warn('[SecureStoreAdapter] Failed to setItem:', err);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }

    try {
      const countStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_chunk_count`);
      }
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      logger.warn('[SecureStoreAdapter] Failed to removeItem:', err);
    }
  },
};

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: LargeSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Wire AppState so token refresh starts/stops with foreground/background
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
