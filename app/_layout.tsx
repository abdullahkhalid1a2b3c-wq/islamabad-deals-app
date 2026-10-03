import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { ToastProvider } from '../src/components/ui/Toast';
import { useAuthBootstrap } from '../src/features/auth/useAuthBootstrap';
import { useSessionStore } from '../src/store/session';
import { theme } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const status = useSessionStore((state) => state.status);

  // Initialize auth bootstrap session check
  useAuthBootstrap();

  useEffect(() => {
    if (status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'authenticated' && inAuthGroup) {
      // Authenticated users never see auth screens
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="deal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const status = useSessionStore((state) => state.status);
  const isReady = (fontsLoaded || fontError) && status !== 'loading';

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RootNavigation />
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
