import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { useWatchlistStore } from '../src/store/watchlistStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 10,
    },
  },
});

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const loadWatchlist = useWatchlistStore((s) => s.loadItems);

  useEffect(() => {
    async function initApp() {
      await initializeAuth();
      await loadWatchlist();

      // Check if user has seen onboarding/welcome
      try {
        const hasSeen = await AsyncStorage.getItem('@has_seen_welcome');
        if (!hasSeen) {
          router.replace('/welcome' as any);
        }
      } catch {}
    }
    initApp();
  }, [initializeAuth, loadWatchlist]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="movie/[id]"
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="tv/[id]"
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="category/[type]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
